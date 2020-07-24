const PORT = +process.argv[2] || 8882;
const ROOT = 'http://localhost:' + PORT + '/';

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
const authenticate = require('./middlewares/authenticate');
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
const IO = require( 'koa-socket.io' );
const KoaSocketSession = require('koa-socket-session');
const io = new IO({ namespace: '/' });

app.use(globalErrHandler);

app.use(new StaticCache('./assets', {
  maxAge: MAX_ASSETS_AGE
}, dirs));
app.use(new StaticCache('./uploads', {
  maxAge: MAX_UPLOADS_AGE
}, dirs));
app.use(new StaticCache('./node_modules'));

app.keys = ['dca23e28c111808d1f9e6230849ee19e '];

const SESSION_CONFIG = {
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    maxAge: 365 * 24 * 60 * 60, /** (number) maxAge in ms (default is 1 days) */
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

  await next();
});

io.start(server);
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

// io.use(async (ctx, next) => {
//   console.log('middleware invoke begin: %s, %s', ctx.event, ctx.id);

//   console.log('middleware invoke end: %s, %s', ctx.event, ctx.id);
// });

io.on('connect', async (ctx, next) => {
  try {
    ctx.io = io;
    await socketRouter.routeRequest(ctx, next);
  } catch (err) {
    logger.error('IO Errors: %o', err);
  }
});

server.listen(PORT, () => {
  console.log('Server running on port: ' + PORT);
  logger.info('Server started on port: ' + PORT);
});