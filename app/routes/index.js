const {
  renderHomeScreen,
  confirmAccount,
  frontendLogger,
} = require('../controllers/indexController');
const {
	logIn,
	signUp,
	logOut,
	isUserLoggedIn,
} = require('../controllers/usersController');

const Router = require('koa-router');
const KoaBody = require('koa-body');

const router = new Router();

router
	.get('/', renderHomeScreen)
	.get('/main-menu', renderHomeScreen)
	.get('/login', renderHomeScreen)
	.get('/sign-up', renderHomeScreen)
	.get('/sign-up-success', renderHomeScreen)
	.post('/log_in', new KoaBody(), logIn)
	.post('/sign_up', new KoaBody(), signUp)
	.post('/log_out', new KoaBody(), logOut)
	.post('/is_user_logged_in', isUserLoggedIn)
	.get('/confirm_account/:code', confirmAccount)
	.post('/frontend_logger', new KoaBody(), frontendLogger);

exports.routes = router.routes();
exports.allowedMethods = router.allowedMethods();