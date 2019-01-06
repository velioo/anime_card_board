const {
  notFound
} = require('../controllers/indexController');

const Router = require('koa-router');
const KoaBody = require('koa-body');

const router = new Router();

router.get('/hello', async (ctx) => {
    ctx.body = 'Hello World!';
});

// router.get('/not_found', notFound);

exports.routes = router.routes();
exports.allowedMethods = router.allowedMethods();