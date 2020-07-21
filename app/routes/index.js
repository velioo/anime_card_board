const {
  renderHomeScreen,
  renderTestGame,
  confirmAccount,
  frontendLogger,
} = require('../controllers/indexController');
const {
	logIn,
	signUp,
	logOut,
	isUserLoggedIn,
} = require('../controllers/usersController');
const {
	createRoom,
	browseRooms,
	getRoomData,
	joinRoom,
} = require('../controllers/roomController');

const Router = require('koa-router');
const KoaBody = require('koa-body');

const router = new Router();

router
	.get('/', renderHomeScreen)
	.get('/test-game', renderTestGame)
	.get('/main-menu', renderHomeScreen)
	.get('/login', renderHomeScreen)
	.get('/sign-up', renderHomeScreen)
	.get('/sign-up-success', renderHomeScreen)
	.get('/create-room', renderHomeScreen)
	.get('/browse-rooms', renderHomeScreen)
	.get('/lobby', renderHomeScreen)
	.get('/game', renderHomeScreen)
	.post('/log_in', new KoaBody(), logIn)
	.post('/sign_up', new KoaBody(), signUp)
	.post('/log_out', new KoaBody(), logOut)
	.post('/is_user_logged_in', isUserLoggedIn)
	.post('/create_room', new KoaBody(), createRoom)
	.post('/browse_rooms', new KoaBody(), browseRooms)
	.post('/room_data', new KoaBody(), getRoomData)
	.post('/join_room', new KoaBody(), joinRoom)
	.get('/confirm_account/:code', confirmAccount)
	.post('/frontend_logger', new KoaBody(), frontendLogger);

exports.routes = router.routes();
exports.allowedMethods = router.allowedMethods();