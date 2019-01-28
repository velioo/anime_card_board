const {
  renderHomeScreen,
  confirmAccount,
  frontendLogger,
} = require('../controllers/indexController');
const {
	logIn,
	signUp,
	logOut,
} = require('../controllers/usersController');

const Router = require('koa-router');
const KoaBody = require('koa-body');

const router = new Router();

router
	.get('/', renderHomeScreen)
	.post('/log_in', new KoaBody(), logIn)
	.post('/sign_up', new KoaBody(), signUp)
	.post('/log_out', new KoaBody(), logOut)
	.get('/confirm_account/:code', confirmAccount)
	.post('/frontend_logger', new KoaBody(), frontendLogger);

exports.routes = router.routes();
exports.allowedMethods = router.allowedMethods();