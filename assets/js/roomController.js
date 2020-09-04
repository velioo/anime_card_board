var roomController = function(generalClient) {
	baseController.call(this, generalClient);

	this.initConstants();
	this.initElements();
	this.initListeners();
	this.initIntervals();
};

roomController.prototype = Object.create(baseController.prototype);

Object.defineProperty(roomController.prototype, 'constructor', {
    value: roomController,
    enumerable: false,
    writable: true,
});

roomController.prototype.initConstants = function() {
	this.CREATE_ROOM_FORM_ID = '#anime-cb-form-create-room';
	this.MATCHMAKING_FORM_ID = '#anime-cb-form-matchmaking';

	this.CREATE_ROOM_SUBMIT_BTN_ID = '#anime-cb-submit-create-room';
	this.RESET_CREATE_ROOM_BTN_ID = '#anime-cb-reset-create-room';
	this.LEAVE_ROOM_BTN_ID = '#anime-cb-leave-room';
	this.START_GAME_BTN_ID = '#anime-cb-start-game';
	this.SURRENDER_BTN_ID = '#anime-cb-surrender';
	this.MATCHMAKING_SUBMIT_BTN_ID = '#anime-cb-submit-matchmaking';

	this.LOBBY_ROOM_NAME_CLASS = '.anime-cb-title-lobby';
	this.LOBBY_ROOM_PLAYERS_CLASS = '.anime-cb-players-lobby';
	this.LOBBY_ROOM_BOARD_CLASS = '.anime-cb-board-lobby';
	this.LOBBY_ROOM_WAITING_PLAYERS_CLASS = '.anime-cb-waiting-players.lobby';
	this.BROWSE_ROOMS_TABLE_CLASS = '.browse-rooms-table';
	this.JOIN_ROOM_BTN_CLASS = '.anime-cb-join-room';
	this.MATCHMAKING_WAITING_PLAYERS_CLASS = '.anime-cb-waiting-players.matchmaking';
	this.MATCHMAKING_PLAYERS_CLASS = '.anime-cb-players-matchmaking';
	this.MATCHMAKING_MATCH_FOUND = '.anime-cb-matchmaking-match-found';
	this.MATCHMAKING_COUNTDOWN_CLASS = '.anime-cb-matchmaking-countdown';
};

roomController.prototype.initElements = function() {
	this.$createRoomInputs = $(this.CREATE_ROOM_FORM_ID).find('input, select');
	this.$matchmakingInputs = $(this.MATCHMAKING_FORM_ID).find('input, select');
	this._roomId = null;
	this._connectingToRoom = false;
	this._creatingRoom = false;
	this._inGame = false;
	this._user2Id = null;
	this._matchmaking = null;
	this._matchFound = false;
};

roomController.prototype.initListeners = function() {
	var _self = this;

	$(_self.LOBBY_SCREEN_CLASS).on('click', _self.START_GAME_BTN_ID, function(e) {
		logger.info('Starting game...');
		_self.disableElement(_self.START_GAME_BTN_ID);
		_self.showStartGameSpinner();
		_self.startGame();
	});

	$(_self.LOBBY_SCREEN_CLASS).on('click', _self.LEAVE_ROOM_BTN_ID, function(e) {
		_self.client.sendLeaveRoomRequest({ roomId: _self._roomId });
	});

	$(_self.MATCHMAKING_SUBMIT_BTN_ID).on('click', function(e) {
		e.preventDefault();

		_self._matchmaking = true;

		var values = {};
	  _self.$matchmakingInputs.each(function() {
	  	values[this.name] = $(this).val();
	  });

	  logger.info('Form matchmaking values: ', JSON.stringify(values));

	  $(_self.MATCHMAKING_WAITING_PLAYERS_CLASS).show();

	  _self.disableElement(_self.MATCHMAKING_SUBMIT_BTN_ID);
	  _self.$matchmakingInputs.each(function() {
	  	_self.disableElement(this);
	  });

	  _self.client.matchmake(values);
	});

	$(_self.CREATE_ROOM_SUBMIT_BTN_ID).on('click', function(e) {
		e.preventDefault();

	  _self._creatingRoom = true;

	  var values = {};
	  _self.$createRoomInputs.each(function() {
	      values[this.name] = $(this).val();
	  });

	  logger.info('Form create_room values: ', JSON.stringify(values));

	  _self.showCreateRoomSpinner();
	  _self.disableElement(_self.CREATE_ROOM_SUBMIT_BTN_ID);

	  _self.client.sendCreateRoomData(values);
	});

	$(_self.BROWSE_ROOMS_TABLE_CLASS).on('click', _self.JOIN_ROOM_BTN_CLASS, function() {
		logger.info('Joining room...');

		_self._connectingToRoom = true;
		_self.disableElement(_self.JOIN_ROOM_BTN_CLASS);
		_self.showElement($(this).parent().find('.spinner'));
		var _roomId = $(this).attr('data-room-id');

		_self.client.joinRoom({ roomId: _roomId });
	});

	$(_self.RESET_CREATE_ROOM_BTN_ID).on('click', function(e) {
		e.preventDefault();
	  _self.clearCreateRoomInputs();
	  _self.clearCreateRoomErrors();
	  _self.hideCreateRoomErrors();
	});
};

roomController.prototype.initIntervals = function() {
	var _self = this;

	if ($(_self.BROWSE_ROOMS_SCREEN_CLASS).find('tr').length == 0) {
		_self.showBrowseRoomsSpinner();
	}

	_self.roomsInterval = setInterval(_self.roomsIntervalFunc.bind(_self), 3000);
};

roomController.prototype.roomsIntervalFunc = function() {
	var _self = this;

	if ($(_self.BROWSE_ROOMS_SCREEN_CLASS).is(':visible') && !_self._connectingToRoom) {
		_self.client.getBrowseRoomsData();
	}

	if (_self._roomId && ($(_self.LOBBY_SCREEN_CLASS).is(':visible')
		|| ($(_self.GAME_SCREEN_CLASS).is(':visible') && _self._inGame)
		|| ($(_self.MATCHMAKING_SCREEN_CLASS).is(':visible')))) {
		_self.client.getCurrentRoomData({ roomId: _self._roomId });
	}

	if (_self._roomId && (!$(_self.LOBBY_SCREEN_CLASS).is(':visible')) && (!_self._inGame) && (!_self._creatingRoom)
		&& (!_self._connectingToRoom) && (!_self._matchmaking)) {
		console.log('Leave room from interval');
		_self.client.sendLeaveRoomRequest({ roomId: _self._roomId });
	}
};

roomController.prototype.processGetCurrentRoomDataResponse = function (data) {
	// logger.info('processGetCurrentRoomDataResponse');
	// console.log('Room data: ', data);

	var _self = this;

	assert(ajv.validate(getCurrentRoomDataResponse, data), 'getCurrentRoomDataResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		if (data.isUserLoggedIn === true) {
			if (!data.result.id) {
				if (_self._inGame) {
					_self._inGame = false;
					console.log('Room no longer exists, host has left the game, winGameFormally', data);
					logger.info('Room no longer exists, host has left the game, winGameFormally: %o', data);
					_self.client.gameClient.winGameFormally({ roomId: _self._roomId });
				} else if ($(_self.LOBBY_SCREEN_CLASS).is(':visible')) {
					window.alert("The host has left the room.");
					_self.processChangeScreen(this.MAIN_MENU_SCREEN_CLASS);
				} else if ($(_self.MATCHMAKING_SCREEN_CLASS).is(':visible') && _self._matchmaking) {
					window.alert('The other player left matchmaking, please matchmake again.');
					_self.processChangeScreen(this.MAIN_MENU_SCREEN_CLASS);
				}

				return;
			}

			// if the player is not the host but is still in lobby screen for some reason despite not being in the room
			if (data.result.player1Id != _self.client.logInSignUpController._userId
				&& !data.result.player2Id && !_self._inGame) {
				_self.processChangeScreen(this.MAIN_MENU_SCREEN_CLASS);
				return;
			}

			_self._roomId = data.result.id;
			_self._user2Id = data.result.player2Id;

			// if the player is the host and there is no player 2
			if (data.result.player1Id == _self.client.logInSignUpController._userId && !data.result.player2Id) {
				if (_self._inGame) {
					logger.info('Player 2 is no longer in the room, winGameFormally: %o', data);
					_self._inGame = false;
					_self.client.gameClient.winGameFormally({ roomId: _self._roomId });
				} else if (!_self._inGame && $(_self.MATCHMAKING_SCREEN_CLASS).is(':visible') && _self._matchmaking) {
					window.alert('The other player left matchmaking, please matchmake again.');
					_self.processChangeScreen(this.MAIN_MENU_SCREEN_CLASS);
				} else if (!_self._inGame && $(_self.LOBBY_SCREEN_CLASS).is(':visible')) {
					_self.updateRoomState(data);
				}
			} else if (!_self._inGame && $(_self.LOBBY_SCREEN_CLASS).is(':visible')) {
				_self.updateRoomState(data);
			}
		} else {
			_self.client.logInSignUpController.processSessionExpired();
		}
	} else {
		assert(data.errors.length > 0);
		logger.info('Server returned errors');
		_self.renderCurrentRoomErrors(data);
	}
};

roomController.prototype.processBrowseRoomsResponse = function(data) {
	var _self = this;

	assert(ajv.validate(browseRoomsResponse, data), 'browseRoomsResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		if (data.isUserLoggedIn === true) {
			_self.populateBrowseRoomsData(data);
		} else {
			_self.client.logInSignUpController.processSessionExpired();
		}
	} else {
		assert(data.errors.length > 0);
		_self.renderBrowseRoomsErrors(data);
	}

	_self.hideBrowseRoomsSpinner();
};

roomController.prototype.populateBrowseRoomsData = function(data) {
	var _self = this;

	_self.clearBrowseRoomsTable();

	$(_self.BROWSE_ROOMS_TABLE_CLASS).append('<th>Room name</th><th>Players</th><th>Join</th>');

	data.result.roomsData.forEach(function (el) {
		let playersCount = el.player2_id ? 2 : 1;
		$(_self.BROWSE_ROOMS_TABLE_CLASS).append('<tr><td>' + el.name + '</td><td>' + playersCount
			+ '/2</td><td><button id=anime-cb-join-room-btn-id-' + el.id + ' data-room-id="' + el.id
			+ '" class="anime-cb-join-room" class="btn btn-default">Join</button><img class="spinner" src="/imgs/spinner.gif"></td></tr>');

		var joinRoomBtnIdSelector = '#anime-cb-join-room-btn-id-' + el.id;

		if (playersCount >= 2) {
			_self.disableElement(joinRoomBtnIdSelector);
		} else {
			_self.enableElement(joinRoomBtnIdSelector);
		}
	});
};

roomController.prototype.updateRoomState = function(data) {
	logger.info('updateRoomState');

	var _self = this;

	var players = data.result.player1Name
		+ ' <img class="anime-cb-character-img game-found" src="/imgs/player_pieces/' + data.result.roomSettings.player1Character.image + '">';

	if (data.result.player2Name) {
		players += ', ' + data.result.player2Name
		+ ' <img class="anime-cb-character-img game-found" src="/imgs/player_pieces/' + data.result.roomSettings.player2Character.image + '">'
	}

	$(_self.LOBBY_ROOM_PLAYERS_CLASS).html('Players: ' + players);

	if (data.result.player1Id === _self.client.logInSignUpController._userId) {
		if (data.result.player1Id && data.result.player2Id) {
			_self.enableElement(_self.START_GAME_BTN_ID);
			$(_self.LOBBY_ROOM_WAITING_PLAYERS_CLASS).hide();
		} else {
			_self.disableElement(_self.START_GAME_BTN_ID);
			$(_self.LOBBY_ROOM_WAITING_PLAYERS_CLASS).show();
		}
	}
};

roomController.prototype.resetRoomState = function () {
	var _self = this;

	_self._roomId = null;
	_self._connectingToRoom = false;
	_self._creatingRoom = false;
	_self._inGame = false;
	_self._user2Id = null;
	_self._matchmaking = false;
	_self._matchFound = false;
	_self._hostId = null;
};

roomController.prototype.processCreateRoomResponse = function(data) {
	logger.info('processCreateRoomResponse');
	logger.info('To validate: ', JSON.stringify(data));
	console.log('processCreateRoomResponse, data: ', data);

	var _self = this;


	if (data.isSuccessful) {
  	assert(ajv.validate(createRoomResponse, data), 'createRoomResponse is invalid' +
  		JSON.stringify(ajv.errors, null, 2));

		if (data.isUserLoggedIn === true) {
			_self._roomId = data.result.roomId;
			_self.showCreateRoomSuccess(data);
		}  else {
			_self.client.logInSignUpController.processSessionExpired();
		}
	} else {
		assert(data.errors.length > 0);
		_self.renderCreateRoomErrors(data);
	}

	_self.enableElement(_self.CREATE_ROOM_SUBMIT_BTN_ID);
};

roomController.prototype.processLeaveRoomResponse = function(data) {
	logger.info('processLeaveRoomResponse');
	logger.info('To validate: ', JSON.stringify(data));

	var _self = this;

  if (_self._roomId && _self._roomId == data.roomId) {
  	_self.resetRoomsInterval();
  	_self.client.getCurrentRoomData({ roomId: _self._roomId });
  }
};

roomController.prototype.resetRoomsInterval = function () {
	var _self = this;

	clearInterval(_self.roomsInterval);
	_self.roomsInterval = setInterval(_self.roomsIntervalFunc.bind(_self), 3000);
};

roomController.prototype.processJoinRoomResponse = function(data) {
	logger.info('processJoinRoomResponse');
	logger.info('To validate: ', JSON.stringify(data));

	var _self = this;

	assert(ajv.validate(joinRoomResponse, data), 'joinRoomResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		if (!data.result.id) {
			window.alert("This room no longer exists, you will be returned to the Main Menu...");
			_self.processChangeScreen(this.MAIN_MENU_SCREEN_CLASS);
			return false;
		}

		if (data.isUserLoggedIn === true) {
			_self._roomId = data.result.id;
			_self.showJoinRoomSuccess(data);
		}  else {
			_self.client.logInSignUpController.processSessionExpired();
			return false;
		}
	} else {
		assert(data.errors.length > 0);
		_self.renderBrowseRoomsErrors(data);
		return false;
	}

	_self.enableElement(_self.JOIN_ROOM_BTN_CLASS);
	_self.hideAllSpinner();

	return true;
};

roomController.prototype.processMatchmake = function (data) {
	logger.info('processMatchmake');
	logger.info('To validate: ', JSON.stringify(data));
	console.log('processMatchmake, data: ', data);

	var _self = this;

	if (data.isSuccessful) {
  	assert(ajv.validate(matchmakeResponse, data), 'matchmakeResponse is invalid' +
  		JSON.stringify(ajv.errors, null, 2));

		if (data.isUserLoggedIn === true) {
			_self._roomId = data.result.roomId;
			_self.showMatchmakingSuccess(data);
		}  else {
			_self.client.logInSignUpController.processSessionExpired();
		}
	} else {
		assert(data.errors.length > 0);
		_self.showAlertError(data.errors[0].message);
		return;
	}
};

roomController.prototype.startGame = function () {
	var _self = this;

	var data = {
		player1Id: _self.client.logInSignUpController._userId,
		player2Id: _self.client.roomController._user2Id,
		roomId: _self.client.roomController._roomId,
	};

	console.log('Starting game, player1Id: ', data.player1Id, ', player2Id: ', data.player2Id, ' roomId: ', data.roomId);

	assert(data.player1Id && data.player2Id && data.roomId);

	_self.client.startGame(data);
};

roomController.prototype.renderCreateRoomErrors = function(data) {
	logger.info('renderCreateRoomErrors');
	var _self = this;

	_self.clearCreateRoomErrors();
	_self.hideCreateRoomErrors();

	_self.$createRoomInputs.each(function(idx, input) {
		data.errors.forEach(function (el) {
			var elName = el.dataPath.split('/')[1];

			if (input.name === elName) {
				$(input).parent().find(_self.INPUT_ERRORS_CLASS).html('<span>' + el.message + '</span>');
				$(input).parent().find(_self.INPUT_ERRORS_CLASS).show();
			}
		});
	 });

	_self.hideAllSpinner();
};

roomController.prototype.renderBrowseRoomsErrors = function(data) {
	logger.info('renderBrowseRoomsErrors');
	var _self = this;

	_self.clearBrowseRoomsErrors();
	_self.hideBrowseRoomsErrors();

	data.errors.forEach(function (el) {
		$(_self.BROWSE_ROOMS_SCREEN_CLASS).find(_self.INPUT_ERRORS_CLASS).append('<span>' + el.message + '</span>');
	});

	$(_self.BROWSE_ROOMS_SCREEN_CLASS).find(_self.INPUT_ERRORS_CLASS).show();
	_self.enableElement(_self.JOIN_ROOM_BTN_CLASS);
	_self.hideAllSpinner();
	_self._connectingToRoom = false;
};

roomController.prototype.renderCurrentRoomErrors = function(data) {
	logger.info('renderCurrentRoomErrors');
	var _self = this;

	_self.clearCurrentRoomErrors();
	_self.hideCurrentRoomErrors();

	data.errors.forEach(function (el) {
		$(_self.LOBBY_SCREEN_CLASS).find(_self.INPUT_ERRORS_CLASS).append('<span>' + el.message + '</span>');
	});

	$(_self.LOBBY_SCREEN_CLASS).find(_self.INPUT_ERRORS_CLASS).show();
};

roomController.prototype.showMatchmakingSuccess = function(data) {
	logger.info('showMatchmakingSuccess');
	var _self = this;

	var startGameData = {
		player1Id: data.result.player1Id,
		player2Id: data.result.player2Id,
		roomId: data.result.roomId,
	};

	assert(startGameData.player1Id && startGameData.player2Id && startGameData.roomId);

	$(_self.MATCHMAKING_PLAYERS_CLASS).html('Players: ' + data.result.player1Name
		+ ' <img class="anime-cb-character-img game-found" src="/imgs/player_pieces/' + data.result.roomSettings.player1Character.image + '">'
		+ ', ' + data.result.player2Name
		+ ' <img class="anime-cb-character-img game-found" src="/imgs/player_pieces/' + data.result.roomSettings.player2Character.image + '">');

	$(_self.MATCHMAKING_PLAYERS_CLASS).show();
	$(_self.MATCHMAKING_WAITING_PLAYERS_CLASS).hide();

	_self.matchmakingCountdownValue = 5;
	$(_self.MATCHMAKING_COUNTDOWN_CLASS).text(_self.matchmakingCountdownValue);
	$(_self.MATCHMAKING_MATCH_FOUND).show();
	_self._matchFound = true;

	_self.matchmakingStartGameCountdownInterval = setInterval(function() {
		_self.matchmakingCountdownValue--;

		$(_self.MATCHMAKING_COUNTDOWN_CLASS).text(_self.matchmakingCountdownValue);

		if (_self.matchmakingCountdownValue <= 0) {
			if (_self.client.logInSignUpController._userId == startGameData.player1Id) {
				_self.client.startGame(startGameData);
			}
			clearInterval(_self.matchmakingStartGameCountdownInterval);
			return;
		}
	}, 1000)
};

roomController.prototype.showCreateRoomSuccess = function(data) {
	logger.info('showCreateRoomSuccess');
	var _self = this;

	_self._hostId = _self.client.logInSignUpController._userId;

	$(_self.LOBBY_ROOM_NAME_CLASS).text('Room: ' + data.result.roomName);
	$(_self.LOBBY_ROOM_PLAYERS_CLASS).html('Players: ' + data.result.player1Name
		+ ' <img class="anime-cb-character-img game-found" src="/imgs/player_pieces/' + data.result.roomSettings.player1Character.image + '">');
	$(_self.LOBBY_ROOM_BOARD_CLASS).text('Board: ' + data.result.roomSettings.boardName);
	$(_self.LOBBY_SCREEN_CLASS).find(_self.SCREEN_FOOTER_CLASS)
		.html('<button disabled id="anime-cb-start-game" type="button" class="btn btn-primary anime-cb-button-stateless anime-cb-btn-game">Start Game</button>\
			<button id="anime-cb-leave-room" type="button" class="btn btn-primary anime-cb-button anime-cb-btn-main-menu">Leave</button>');
	$(_self.LOBBY_ROOM_WAITING_PLAYERS_CLASS).show();

	_self.processChangeScreen(_self.LOBBY_SCREEN_CLASS);
	_self._creatingRoom = false;
};

roomController.prototype.showJoinRoomSuccess = function(data) {
	logger.info('showJoinRoomSuccess');
	var _self = this;

	_self._hostId = null;

	$(_self.LOBBY_ROOM_NAME_CLASS).text('Room: ' + data.result.name);
	$(_self.MATCHMAKING_PLAYERS_CLASS).html('Players: ' + data.result.player1Name
		+ ' <img class="anime-cb-character-img game-found" src="/imgs/player_pieces/' + data.result.roomSettings.player1Character.image + '">'
		+ ', ' + data.result.player2Name
		+ ' <img class="anime-cb-character-img game-found" src="/imgs/player_pieces/' + data.result.roomSettings.player2Character.image + '">');
	$(_self.LOBBY_ROOM_BOARD_CLASS).text('Board: ' + data.result.roomSettings.boardName);
	$(_self.LOBBY_SCREEN_CLASS).find(_self.SCREEN_FOOTER_CLASS)
		.html('<button id="anime-cb-leave-room" type="button" class="btn btn-primary anime-cb-button anime-cb-btn-main-menu">Leave</button>');
	$(_self.LOBBY_ROOM_WAITING_PLAYERS_CLASS).hide();

	_self.processChangeScreen(_self.LOBBY_SCREEN_CLASS);
	_self._connectingToRoom = false;
};

roomController.prototype.preSwitchScreenHookRoomController = function (screenClass) {
	var _self = this;

	console.log('_lastScreenClass: ', _lastScreenClass);

	if (_self._roomId && ((_lastScreenClass == _self.GAME_SCREEN_CLASS)
		|| (_lastScreenClass == _self.MATCHMAKING_SCREEN_CLASS && screenClass != _self.GAME_SCREEN_CLASS))) {
		_self.client.sendLeaveRoomRequest({ roomId: _self._roomId, userId: _self.client.logInSignUpController._userId });
	}

	if (_lastScreenClass == _self.GAME_SCREEN_CLASS) {
		setTimeout(function() {
			_self.client.logInSignUpController.checkIsUserLoggedIn();
		}, 1000);
	}

	if (screenClass == _self.BROWSE_ROOMS_SCREEN_CLASS) {
		_self.clearBrowseRoomsTable();
		_self.showBrowseRoomsSpinner();
		_self.client.getBrowseRoomsData();
	}

	if (screenClass == _self.GAME_SCREEN_CLASS) {
		_self._inGame = true;
	} else {
		_self._inGame = false;
	}

	if (screenClass == _self.MATCHMAKING_SCREEN_CLASS) {
		$(_self.MATCHMAKING_WAITING_PLAYERS_CLASS).hide();
		_self.enableElement(_self.MATCHMAKING_SUBMIT_BTN_ID);
	  _self.$matchmakingInputs.each(function() {
	  	_self.enableElement(this);
	  });
	}

	if (screenClass == _self.CREATE_ROOM_SCREEN_CLASS) {
		_self.enableElement(_self.CREATE_ROOM_SUBMIT_BTN_ID);
	  _self.$createRoomInputs.each(function() {
	  	_self.enableElement(this);
	  });
	}
};

roomController.prototype.postSwitchScreenHookRoomController = function (screenClass) {
	var _self = this;

	if (screenClass !== _self.BROWSE_ROOMS_SCREEN_CLASS) {
		_self._connectingToRoom = false;
		_self._creatingRoom = false;
	}

	if (screenClass !== _self.GAME_SCREEN_CLASS) {
		_self._matchmaking = false;
		_self._matchFound = false;
		_self.client.removeFromMatchmaking();
	}

	clearInterval(_self.matchmakingStartGameCountdownInterval);
	$(_self.MATCHMAKING_MATCH_FOUND).hide();
	$(_self.MATCHMAKING_PLAYERS_CLASS).hide();
};

roomController.prototype.clearCreateRoomInputs = function() {
	var _self = this;

	_self.$createRoomInputs.each(function() {
		if ($(this).prop("nodeName").toLowerCase() == "select") {
			$(this).val($(this).find("option:first").val());
		} else {
			$(this).val('');
		}
	});
};

roomController.prototype.clearCreateRoomErrors = function() {
	this.$createRoomInputs.parent().find(this.INPUT_ERRORS_CLASS).html('');
};

roomController.prototype.hideCreateRoomErrors = function() {
	this.$createRoomInputs.parent().find(this.INPUT_ERRORS_CLASS).hide();
};

roomController.prototype.showCreateRoomSpinner = function() {
	$(this.CREATE_ROOM_FORM_ID).find(this.SPINNER_CLASS).show();
};

roomController.prototype.showBrowseRoomsSpinner = function() {
	$(this.BROWSE_ROOMS_SCREEN_CLASS).find(this.MAIN_SPINNER_CLASS).show();
};

roomController.prototype.hideBrowseRoomsSpinner = function() {
	$(this.BROWSE_ROOMS_SCREEN_CLASS).find(this.MAIN_SPINNER_CLASS).hide();
};

roomController.prototype.clearBrowseRoomsErrors = function() {
	$(this.BROWSE_ROOMS_SCREEN_CLASS).find(this.INPUT_ERRORS_CLASS).html('');
};

roomController.prototype.hideBrowseRoomsErrors = function() {
	$(this.BROWSE_ROOMS_SCREEN_CLASS).find(this.INPUT_ERRORS_CLASS).hide();
};

roomController.prototype.clearBrowseRoomsTable = function() {
	$(this.BROWSE_ROOMS_TABLE_CLASS).html('');
};

roomController.prototype.hideCurrentRoomErrors = function() {
	$(this.LOBBY_SCREEN_CLASS).find(this.INPUT_ERRORS_CLASS).hide();
};

roomController.prototype.clearCurrentRoomErrors = function() {
	$(this.LOBBY_SCREEN_CLASS).find(this.INPUT_ERRORS_CLASS).html('');
};

roomController.prototype.showStartGameSpinner = function () {
	$(this.LOBBY_SCREEN_CLASS).find(this.MAIN_SPINNER_CLASS).show();
};