const PORT = process.env.PORT || 8882;
const prod_url = 'https://anime-card-board.herokuapp.com/';
const dev_url = 'http://localhost:' + PORT + '/';
const ROOT = (process.env.NODE_ENV ? prod_url : dev_url);

exports.PORT = PORT;
exports.ROOT = ROOT;

const {
  MAX_ASSETS_AGE,
  MAX_UPLOADS_AGE,
  FRONTEND_LOGGER_INTERVAL
} = require('./constants/constants');

const logger = require('./helpers/logger');
const globalErrHandler = require('./middlewares/errorHandler');
const hbaHelpers = require('./helpers/handlebars/helpers');
const hbaPartials = require('./helpers/handlebars/partials');
const socketRouter = require('./socket/socketRouter.js');
const roomController = require('./controllers/roomController.js');
const authenticate = require('./middlewares/authenticate');
const _ = require('lodash/lang');
const { routes, allowedMethods } = require('./routes');
const dirs = {};

const Koa = require('koa');
const app = new Koa();
const KoaSession = require('koa-session');
const StaticCache = require('koa-static-cache');
const Validate = require('koa-validate');
const Views = require('koa-views');
const path = require('path');
const Http = require('http');
const server = Http.createServer(app.callback());
const IO = require( './socket/koa-socket.io/lib/index.js' );
const KoaSocketSession = require('koa-socket-session');
const io = new IO({ namespace: '/' });
let sessions;

app.use(globalErrHandler);

app.use(new StaticCache('./assets', {
  maxAge: MAX_ASSETS_AGE,
  // maxAge: 1,
}, dirs));
app.use(new StaticCache('./uploads', {
  maxAge: MAX_UPLOADS_AGE
}, dirs));
app.use(new StaticCache('./node_modules'));

app.keys = ['dca23e28c111808d1f9e6230849ee19e'];

const SESSION_CONFIG = {
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    maxAge: 315569259747, /** (number) maxAge in ms (default is 1 days) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
};

const session = new KoaSession(SESSION_CONFIG, app);
app.use(session);

app.use(async (ctx, next) => {
  ctx.state.FRONTEND_LOGGER_INTERVAL = FRONTEND_LOGGER_INTERVAL;
  ctx.state.session = ctx.session;
  ctx.session.isUserLoggedIn = ctx.session.isUserLoggedIn || false;
  ctx.sessions = sessions;

  await next();
});

io.start(server,{
  pingInterval: 6000,
  pingTimeout: 3000,
});
io.use(KoaSocketSession(app, session));

Validate(app);

app.use(new Views(path.resolve(__dirname, 'render'), {
  map: {
    hbs: 'handlebars'
  },
  options: {
    helpers: hbaHelpers,
    partials: hbaPartials,
  }
}));

app.use(routes);
app.use(allowedMethods);
app.use(authenticate);

app.use( async (ctx) => {
  if (ctx.status !== 404) {
    return;
  }

  if (ctx.request.url.startsWith('/imgs')) {
    ctx.redirect(ROOT + 'imgs/no_image.png');
  } else {
    ctx.status = 404;
    ctx.state = {
      userMessage: 'ERROR 404! Sorry the server couldn\'t find this resource :)',
      httpCode: 404,
    }
    await ctx.render('./views/400.hbs');
  }
});

io.on('connect', async (ctx, next) => {
  try {
    ctx.io = io;

    if (ctx.session.userData && ctx.session.userData.userId) {
      if (!sessions[ctx.session.userData.userId]) {
        sessions[ctx.session.userData.userId] = {
          turnInterval: null,
          pausedTimer: true,
          timerValue: null,
          disconnected: false,
          roomId: null,
          socketId: ctx.socket.id,
        };
      } else {
        sessions[ctx.session.userData.userId].disconnected = false;
        sessions[ctx.session.userData.userId].socketId = ctx.socket.id;
      }
    }

    ctx.sessions = sessions;
    await socketRouter.routeRequest(ctx, next);
  } catch (err) {
    logger.error('IO Errors: %o', err);
  }
});

server.listen(PORT, () => {
  console.log('Server running on port: ' + PORT);
  logger.info('Server started on port: ' + PORT);
  sessions = {};
});

setTimeout(async () => {
  ctx = {};
  ctx.io = io;
  ctx.sessions = sessions;
  await roomController.matchmake(ctx);
}, 1000);