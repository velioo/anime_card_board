const PORT = +process.argv[2] || 8882;

const {
  MAX_ASSETS_AGE,
  MAX_UPLOADS_AGE,
  RECORDS_PER_PAGE,
  MAX_RECORDS_PER_PAGE,
  FRONTEND_LOGGER_INTERVAL
} = require('./constants/constants');

const logger = require('./helpers/logger');
const globalErrHandler = require('./middlewares/errorHandler');
const { routes, allowedMethods } = require('./routes');
const dirs = {};

const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const Session = require('koa-session');
const StaticCache = require('koa-static-cache');
const Validate = require('koa-validate');

app.use(globalErrHandler);

app.use(new StaticCache('./assets', {
  maxAge: MAX_ASSETS_AGE
}, dirs));
app.use(new StaticCache('./uploads', {
  maxAge: MAX_UPLOADS_AGE
}, dirs));

app.keys = ['Shh, its a secret!!!'];

app.use(new Session(app));
app.use(async (ctx, next) => {
  ctx.session.isUserLoggedIn = ctx.session.isUserLoggedIn || false;

  await next();
});

Validate(app);

app.use(routes);
app.use(allowedMethods);

app.use((ctx) => {
  if (ctx.status !== 404) {
    return;
  }

  if (ctx.request.url.startsWith('/imgs')) {
    ctx.redirect('http://localhost:8883/imgs/no_image.png');
  } else {
    ctx.status = 404;
    ctx.body = ctx.body || 'NOT FOUND 404';
  }
});

app.listen(PORT, () => {
  console.log('Server running on port: ' + PORT);
  logger.info('Server started on port: ' + PORT);
});