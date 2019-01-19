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
const { routes, allowedMethods } = require('./routes');
const dirs = {};

const Koa = require('koa');
const app = new Koa();
const Session = require('koa-session');
const StaticCache = require('koa-static-cache');
const Validate = require('koa-validate');
const Views = require('koa-views');
const path = require('path');
const Http = require('http');
const server = Http.createServer(app.callback());
const IO = require( 'koa-socket.io' );
const io = new IO({ namespace: '/' });

io.start(server);

app.use(globalErrHandler);

app.use(new StaticCache('./assets', {
  maxAge: MAX_ASSETS_AGE
}, dirs));
app.use(new StaticCache('./uploads', {
  maxAge: MAX_UPLOADS_AGE
}, dirs));
app.use(new StaticCache('./node_modules'));

app.keys = ['dca23e28c111808d1f9e6230849ee19e '];

app.use(new Session(app));
app.use(async (ctx, next) => {
  ctx.state.FRONTEND_LOGGER_INTERVAL = FRONTEND_LOGGER_INTERVAL
  ctx.state.session = ctx.session
  ctx.session.isUserLoggedIn = ctx.session.isUserLoggedIn || false;

  await next();
});

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

app.use( async (ctx) => {
  if (ctx.status !== 404) {
    return;
  }

  if (ctx.request.url.startsWith('/imgs')) {
    ctx.redirect(ROOT + 'imgs/no_image.png');
  } else {
    ctx.status = 404;
    await ctx.render('./views/404.hbs');
  }
});

// io.use(async (ctx, next) => {
//   console.log('middleware invoke begin: %s, %s', ctx.event, ctx.id);

//   console.log('middleware invoke end: %s, %s', ctx.event, ctx.id);
// });

io.on('connect', async (ctx, next) => {
  try {
    await socketRouter.routeRequest(ctx, next);
  } catch (err) {
    logger.error('IO Errors: %o', err);
  }
});

server.listen(PORT, () => {
  console.log('Server running on port: ' + PORT);
  logger.info('Server started on port: ' + PORT);
});