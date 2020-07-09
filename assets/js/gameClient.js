var gameClient = function() {
	this.gameController = new gameController(this);
};

gameClient.prototype.initSocket = function() {
	console.log('Init Socket');

	this.socket = this.generalClient.socket;
	this.initGameSocket(this.socket);
};

gameClient.prototype.initGameSocket = function(socket) {
	console.log('SOCKET: ', socket);

	socket.on('startGame', this.processStartGame.bind(this));
	socket.on('winGameFormally', this.processWinGameFormally.bind(this));
};

gameClient.prototype.startGame = function(_data) {
	logger.info('startGame');
	console.log('START GAME');

	var _self = this;

	_self.socket.emit('startGame', _data);
};

gameClient.prototype.processStartGame = function(_data) {
	logger.info('processStartGame');
	console.log('START DATA: ', _data);

	var _self = this;

	if (_self.generalClient.roomController._roomId
		&& _self.generalClient.roomController._roomId == _data.roomData.id) {
		_self.gameController.processStartGameResponse(_data);
	}
};

gameClient.prototype.winGameFormally = function(_data) {
	logger.info('winGameFormally');
	console.log('winGameFormally');

	var _self = this;

	_self.socket.emit('winGameFormally', _data);
};

gameClient.prototype.processWinGameFormally = function(_data) {
	logger.info('processWinGameFormally');
	console.log('processWinGameFormally');

	var _self = this;

	_self.gameController.processWinGameFormallyResponse(_data);
};