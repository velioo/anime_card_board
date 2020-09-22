var gameClient = function() {
	this.gameController = new gameController(this);
};

gameClient.prototype.initSocket = function() {
	this.socket = this.generalClient.socket;
	this.initGameSocket(this.socket);
};

gameClient.prototype.initGameSocket = function(socket) {
	socket.on('startGame', this.processStartGame.bind(this));
	socket.on('drawCard', this.processDrawCard.bind(this));
	socket.on('drawCardYou', this.processDrawCardYou.bind(this));
	socket.on('drawPhase', this.processDrawPhase.bind(this));
	socket.on('standByPhase', this.processStandByPhase.bind(this));
	socket.on('mainPhase', this.processMainPhase.bind(this));
	socket.on('summonCard', this.processSummonCard.bind(this));
	socket.on('drawCardFromEnemyHand', this.processDrawCardFromEnemyHand.bind(this));
	socket.on('destroyCardFromEnemyField', this.processDestroyCardFromEnemyField.bind(this));
	socket.on('takeCardFromGraveyard', this.processTakeCardFromGraveyard.bind(this));
	socket.on('rollPhase', this.processRollPhase.bind(this));
	socket.on('rollDiceBoard', this.processRollDiceBoard.bind(this));
	socket.on('endPhase', this.processEndPhase.bind(this));
	socket.on('discardCard', this.processDiscardCard.bind(this));
	socket.on('finishCardEffect', this.processFinishCardEffect.bind(this));
	socket.on('timerValues', this.processTimerValues.bind(this));
	socket.on('winGame', this.processWinGame.bind(this));
	socket.on('activateCardEffect', this.processActivateCardEffect.bind(this));
	socket.on('finishCardEffectContinuous', this.processFinishCardEffectContinuous.bind(this));
	socket.on('finishChainEffect', this.processFinishChainEffect.bind(this));
	socket.on('winGameFormally', this.processWinGameFormally.bind(this));
};

gameClient.prototype.processStartGame = function(_data) {
	logger.info('processStartGame');
	console.log('START DATA: ', _data);

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processStartGameResponse(_data);
	}
};

gameClient.prototype.drawCard = function (_data) {
	logger.info('drawCard');
	var _self = this;

	_self.socket.emit('drawCard', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('drawCard', _data);
	}, 2000);
};

gameClient.prototype.processDrawCard = function (_data) {
	logger.info('processDrawCard');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processDrawCard(_data);
	}
};

gameClient.prototype.processDrawCardYou = function (_data) {
	logger.info('processDrawCardYou');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processDrawCardYou(_data);
	}
};

gameClient.prototype.drawPhase = function (_data) {
	logger.info('drawPhase');

	var _self = this;

	_self.socket.emit('drawPhase', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('drawPhase', _data);
	}, 2000);
};

gameClient.prototype.processDrawPhase = function (_data) {
	logger.info('processDrawPhase');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processDrawPhase(_data);
	}
};

gameClient.prototype.standByPhase = function (_data) {
	logger.info('standByPhase');

	var _self = this;

	_self.socket.emit('standByPhase', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('standByPhase', _data);
	}, 2000);
};

gameClient.prototype.processStandByPhase = function (_data) {
	logger.info('processStandByPhase');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processStandByPhase(_data);
	}
};

gameClient.prototype.mainPhase = function (_data) {
	logger.info('mainPhase');

	var _self = this;

	_self.socket.emit('mainPhase', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('mainPhase', _data);
	}, 2000);
};

gameClient.prototype.processMainPhase = function (_data) {
	logger.info('processMainPhase');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processMainPhase(_data);
	}
};

gameClient.prototype.summonCard = function (_data) {
	logger.info('summonCard');

	var _self = this;

	_self.socket.emit('summonCard', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('summonCard', _data);
	}, 2000);
};

gameClient.prototype.processSummonCard = function (_data) {
	logger.info('processSummonCard');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processSummonCard(_data);
	}
};

gameClient.prototype.drawCardFromEnemyHand = function (_data) {
	logger.info('drawCardFromEnemyHand');

	var _self = this;

	_self.socket.emit('drawCardFromEnemyHand', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('drawCardFromEnemyHand', _data);
	}, 2000);
};

gameClient.prototype.processDrawCardFromEnemyHand = function (_data) {
	logger.info('processDrawCardFromEnemyHand');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processDrawCardFromEnemyHand(_data);
	}
};

gameClient.prototype.destroyCardFromEnemyField = function (_data) {
	logger.info('destroyCardFromEnemyField');

	var _self = this;

	_self.socket.emit('destroyCardFromEnemyField', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('destroyCardFromEnemyField', _data);
	}, 2000);
};

gameClient.prototype.processDestroyCardFromEnemyField = function (_data) {
	logger.info('processDestroyCardFromEnemyField');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processDestroyCardFromEnemyField(_data);
	}
};

gameClient.prototype.takeCardFromGraveyard = function (_data) {
	logger.info('takeCardFromGraveyard');

	var _self = this;

	_self.socket.emit('takeCardFromGraveyard', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('takeCardFromGraveyard', _data);
	}, 2000);
};

gameClient.prototype.processTakeCardFromGraveyard = function (_data) {
	logger.info('processTakeCardFromGraveyard');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processTakeCardFromGraveyard(_data);
	}
};

gameClient.prototype.rollPhase = function (_data) {
	logger.info('rollPhase');

	var _self = this;

	_self.socket.emit('rollPhase', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('rollPhase', _data);
	}, 2000);
};

gameClient.prototype.processRollPhase = function (_data) {
	logger.info('processRollPhase');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processRollPhase(_data);
	}
};

gameClient.prototype.rollDiceBoard = function (_data) {
	logger.info('rollDiceBoard');

	var _self = this;

	_self.socket.emit('rollDiceBoard', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('rollDiceBoard', _data);
	}, 2000);
};

gameClient.prototype.processRollDiceBoard = function (_data) {
	logger.info('processRollDiceBoard');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId &&_data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processRollDiceBoard(_data);
	}
};

gameClient.prototype.endPhase = function (_data) {
	logger.info('endPhase');

	var _self = this;

	_self.socket.emit('endPhase', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('endPhase', _data);
	}, 2000);
};

gameClient.prototype.processEndPhase = function (_data) {
	logger.info('processEndPhase');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processEndPhase(_data);
	}
};

gameClient.prototype.discardCard = function (_data) {
	logger.info('discardCard');

	var _self = this;

	_self.socket.emit('discardCard', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('discardCard', _data);
	}, 2000);
};

gameClient.prototype.processDiscardCard = function (_data) {
	logger.info('processDiscardCard');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processDiscardCard(_data);
	}
};

gameClient.prototype.finishCardEffect = function (_data) {
	logger.info('finishCardEffect');

	var _self = this;

	_self.socket.emit('finishCardEffect', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('finishCardEffect', _data);
	}, 2000);
};

gameClient.prototype.processFinishCardEffect = function (_data) {
	logger.info('processFinishCardEffect');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processFinishCardEffect(_data);
	}
};

gameClient.prototype.activateCardEffect = function (_data) {
	logger.info('activateCardEffect');

	var _self = this;

	_self.socket.emit('activateCardEffect', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('activateCardEffect', _data);
	}, 2000);
};

gameClient.prototype.processActivateCardEffect = function (_data) {
	logger.info('processActivateCardEffect');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processActivateCardEffect(_data);
	}
};

gameClient.prototype.finishCardEffectContinuous = function (_data) {
	logger.info('finishCardEffectContinuous');

	var _self = this;

	_self.socket.emit('finishCardEffectContinuous', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('finishCardEffectContinuous', _data);
	}, 2000);
};

gameClient.prototype.processFinishCardEffectContinuous = function (_data) {
	logger.info('processFinishCardEffectContinuous');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processFinishCardEffectContinuous(_data);
	}
};

gameClient.prototype.finishChainEffect = function (_data) {
	logger.info('finishChainEffect');

	var _self = this;

	_self.socket.emit('finishChainEffect', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('finishChainEffect', _data);
	}, 2000);
};

gameClient.prototype.processFinishChainEffect = function (_data) {
	logger.info('processFinishChainEffect');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processFinishChainEffect(_data);
	}
};

gameClient.prototype.winGameFormally = function(_data) {
	logger.info('winGameFormally');

	var _self = this;

	_self.socket.emit('winGameFormally', _data);

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.retryLastCommandInterval = setInterval(function() {
		_self.socket.emit('winGameFormally', _data);
	}, 2000);
};

gameClient.prototype.processTimerValues = function(_data) {
	var _self = this;

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processTimerValues(_data);
	}
};

gameClient.prototype.processWinGameFormally = function(_data) {
	logger.info('processWinGameFormally');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	_self.gameController.processWinGameFormallyResponse(_data);
};

gameClient.prototype.processWinGame = function(_data) {
	logger.info('processWinGame');

	var _self = this;

	clearInterval(_self.gameController.retryLastCommandInterval);

	if (_self.generalClient.roomController._roomId && _data.roomId
		&& _self.generalClient.roomController._roomId == _data.roomId) {
		_self.gameController.processWinGame(_data);
	}
};