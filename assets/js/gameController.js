var gameController = function(client) {
	console.log('INIT GAME CONTROLLER');
	baseController.call(this, client);

	this.initConstants();
	this.initElements();
	this.initListeners();
	this.initIntervals();
};

gameController.prototype = Object.create(baseController.prototype);

Object.defineProperty(gameController.prototype, 'constructor', {
    value: gameController,
    enumerable: false,
    writable: true,
});

gameController.prototype.initConstants = function() {
	this.START_GAME_BTN_ID = '#anime-cb-start-game';
	this.SURRENDER_BTN_ID = '#anime-cb-surrender';
};

gameController.prototype.initElements = function() {
	this._gameData = null;
};

gameController.prototype.initListeners = function() {
	var _self = this;

	$(_self.LOBBY_SCREEN_CLASS).on('click', _self.START_GAME_BTN_ID, function(e) {
		logger.info('Starting game...');
		console.log('START GAME BTN CLICK');

		_self.showStartGameSpinner();
		_self.startGame();
	});

	$(_self.GAME_SCREEN_CLASS).on('click', _self.SURRENDER_BTN_ID, function(e) {
		logger.info('Surrendering...');
		console.log('LEAVE ROOM SURRENDER');

		if (confirm('Are you sure you want to surrender ?')) {
		  _self.processChangeScreen(_self.MAIN_MENU_SCREEN_CLASS);
		}
	});
};

gameController.prototype.initIntervals = function() {

};

gameController.prototype.resetGameState = function () {
	var _self = this;

	_self._gameData = null;
};

gameController.prototype.showStartGameSpinner = function () {
	$(this.LOBBY_SCREEN_CLASS).find(this.MAIN_SPINNER_CLASS).show();
};

gameController.prototype.processStartGameResponse = function (data) {
	logger.info('processStartGameResponse');
	console.log('processStartGameResponse');
	console.log('data: ', data);

	var _self = this;

	assert(ajv.validate(startGameResponse, data), 'startGameResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		_self.startGame();
		return;
	}

	_self.initGameData(data);
	_self.renderBoard();
	_self.processChangeScreen(_self.GAME_SCREEN_CLASS);
	_self.hideAllSpinner();
};

gameController.prototype.initGameData = function (data) {
	logger.info('initGameData');
	console.log('initGameData');
	console.log('Data: ', data);

	var _self = this;

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;

	_self.validatePlayers();
};

gameController.prototype.validatePlayers = function () {
	var _self = this;

	assert(_self.client.generalClient.roomController._roomId == _self._roomData.id);
	assert(_self.client.generalClient.logInSignUpController._userId == _self._roomData.player1Id
		|| _self.client.generalClient.logInSignUpController._userId == _self._roomData.player2Id);
};

gameController.prototype.renderBoard = function () {
	logger.info('renderBoard');

	var _self = this;
};

gameController.prototype.processWinGameFormallyResponse = function (data) {
	logger.info('processWinGameFormallyResponse');
	console.log('processWinGameFormallyResponse');
	console.log('data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
	}

	_self.processChangeScreen(_self.MAIN_MENU_SCREEN_CLASS);
};

gameController.prototype.startGame = function () {
	var _self = this;

	var data = {
		player1Id: _self.client.generalClient.logInSignUpController._userId,
		player2Id: _self.client.generalClient.roomController._user2Id,
		roomId: _self.client.generalClient.roomController._roomId,
	};

	console.log('Starting game, player1Id: ', data.player1Id, ', player2Id: ', data.player2Id, ' roomId: ', data.roomId);

	assert(data.player1Id && data.player2Id && data.roomId);

	_self.client.startGame(data);
};