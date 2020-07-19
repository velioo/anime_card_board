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
	socket.on('drawCard', this.processDrawCard.bind(this));
	socket.on('drawCardYou', this.processDrawCardYou.bind(this));
	socket.on('drawPhase', this.processDrawPhase.bind(this));
	socket.on('standByPhase', this.processStandByPhase.bind(this));
	socket.on('mainPhase', this.processMainPhase.bind(this));
	socket.on('summonCard', this.processSummonCard.bind(this));
	socket.on('winGameFormally', this.processWinGameFormally.bind(this));
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

gameClient.prototype.drawCard = function (_data) {
	logger.info('drawCard');

	var _self = this;

	_self.socket.emit('drawCard', _data);
};

gameClient.prototype.processDrawCard = function (_data) {
	logger.info('processDrawCard');

	var _self = this;

	if (_self.generalClient.roomController._roomId
		&& _self.generalClient.roomController._roomId == _data.roomData.id) {
		_self.gameController.processDrawCard(_data);
	}
};

gameClient.prototype.processDrawCardYou = function (_data) {
	logger.info('processDrawCardYou');

	var _self = this;

	if (_self.generalClient.roomController._roomId
		&& _self.generalClient.roomController._roomId == _data.roomData.id) {
		_self.gameController.processDrawCardYou(_data);
	}
};

gameClient.prototype.drawPhase = function (_data) {
	logger.info('drawPhase');

	var _self = this;

	_self.socket.emit('drawPhase', _data);
};

gameClient.prototype.processDrawPhase = function (_data) {
	logger.info('processDrawPhase');

	var _self = this;

	if (_self.generalClient.roomController._roomId
		&& _self.generalClient.roomController._roomId == _data.roomData.id) {
		_self.gameController.processDrawPhase(_data);
	}
};

gameClient.prototype.standByPhase = function (_data) {
	logger.info('standByPhase');

	var _self = this;

	_self.socket.emit('standByPhase', _data);
};

gameClient.prototype.processStandByPhase = function (_data) {
	logger.info('processStandByPhase');

	var _self = this;

	if (_self.generalClient.roomController._roomId
		&& _self.generalClient.roomController._roomId == _data.roomData.id) {
		_self.gameController.processStandByPhase(_data);
	}
};

gameClient.prototype.mainPhase = function (_data) {
	logger.info('mainPhase');

	var _self = this;

	_self.socket.emit('mainPhase', _data);
};

gameClient.prototype.processMainPhase = function (_data) {
	logger.info('processMainPhase');

	var _self = this;

	if (_self.generalClient.roomController._roomId
		&& _self.generalClient.roomController._roomId == _data.roomData.id) {
		_self.gameController.processMainPhase(_data);
	}
};

gameClient.prototype.summonCard = function (_data) {
	logger.info('summonCard');

	var _self = this;

	_self.socket.emit('summonCard', _data);
};

gameClient.prototype.processSummonCard = function (_data) {
	logger.info('processSummonCard');

	var _self = this;

	if (_self.generalClient.roomController._roomId
		&& _self.generalClient.roomController._roomId == _data.roomData.id) {
		_self.gameController.processSummonCard(_data);
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