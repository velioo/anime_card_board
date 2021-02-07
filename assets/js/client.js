var _generalClient = {};
var _gameClient = {};

window.onload = function() {
	_generalClient = new generalClient();
	_gameClient = new gameClient();
	_generalClient.gameClient = _gameClient;
	_gameClient.generalClient = _generalClient;
	_gameClient.logInSignUpController = _generalClient.logInSignUpController;
	_gameClient.roomController = _generalClient.roomController;
	_gameClient.cardsInfoController = _generalClient.cardsInfoController;
	_gameClient.chatController = _generalClient.chatController;
	_gameClient.settingsController = _generalClient.settingsController;
	_generalClient.gameController = _gameClient.gameController;
	_gameClient.initSocket();
};