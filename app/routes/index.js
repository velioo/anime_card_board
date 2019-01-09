const {
  notFound
} = require('../controllers/indexController');

const Router = require('koa-router');
const KoaBody = require('koa-body');

const router = new Router();

router.get('/hello', async (ctx) => {
  ctx.state = { user: { name: "World" } };
  await ctx.render('./views/test.hbs');
});

// router.get('/not_found', notFound);

exports.routes = router.routes();
exports.allowedMethods = router.allowedMethods();