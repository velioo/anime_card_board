const {
  renderHomeScreen,
  frontendLogger,
} = require('../controllers/indexController');

const Router = require('koa-router');
const KoaBody = require('koa-body');

const router = new Router();

router
	.get('/', renderHomeScreen)
	.post('/frontend_logger', new KoaBody(), frontendLogger);

// router.get('/not_found', notFound);

exports.routes = router.routes();
exports.allowedMethods = router.allowedMethods();