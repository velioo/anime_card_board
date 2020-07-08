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

	this.CREATE_ROOM_SUBMIT_BTN_ID = '#anime-cb-submit-create-room';
	this.RESET_CREATE_ROOM_BTN_ID = '#anime-cb-reset-create-room';
	this.LEAVE_ROOM_BTN_ID = '#anime-cb-leave-room';
	this.START_GAME_BTN_ID = '#anime-cb-start-game';
	this.SURRENDER_BTN_ID = '#anime-cb-surrender';

	this.LOBBY_ROOM_NAME_CLASS = '.anime-cb-title-lobby';
	this.LOBBY_ROOM_PLAYERS_CLASS = '.anime-cb-players-lobby';
	this.LOBBY_ROOM_WAITING_PLAYERS_CLASS = '.anime-cb-waiting-players-lobby';
	this.BROWSE_ROOMS_TABLE_CLASS = '.browse-rooms-table';
	this.JOIN_ROOM_BTN_CLASS = '.anime-cb-join-room';
};

roomController.prototype.initElements = function() {
	this.$createRoomInputs = $(this.CREATE_ROOM_FORM_ID).find('input');
	this._roomId = null;
	this._connectingToRoom = false;
	this._inGame = false;
};

roomController.prototype.initListeners = function() {
	var _self = this;

	$(_self.LOBBY_SCREEN_CLASS).on('click', _self.START_GAME_BTN_ID, function(e) {
		logger.info('Staring game...');
	});

	$(_self.GAME_SCREEN_CLASS).on('click', _self.SURRENDER_BTN_ID, function(e) {
		logger.info('Surrendering...');
		console.log('LEAVE ROOM SURRENDER');
		// Other things ...
		//_self.client.sendLeaveRoomRequest();
	});

	$(_self.CREATE_ROOM_SUBMIT_BTN_ID).on('click', function(e) {
		e.preventDefault();

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

	logger.info('Settings browse rooms interval...');

	setInterval(function() {
		if ($(_self.BROWSE_ROOMS_SCREEN_CLASS).find('tr').length == 0) {
			_self.showBrowseRoomsSpinner();
		}
		if ($(_self.BROWSE_ROOMS_SCREEN_CLASS).is(':visible') && !_self._connectingToRoom) {
			_self.client.getBrowseRoomsData();
		}

		if (_self._roomId !== null && _self._roomId !== undefined
			&& $(_self.LOBBY_SCREEN_CLASS).is(':visible')) {
			_self.client.getCurrentRoomData({ roomId: _self._roomId });
		}

		if (!$(_self.LOBBY_SCREEN_CLASS).is(':visible') && !_self._inGame) {
			_self.client.sendLeaveRoomRequest();
		}
	}, 3000);
};

roomController.prototype.processGetCurrentRoomDataResponse = function (data) {
	logger.info('processGetCurrentRoomDataResponse');
	console.log('Room data: ', data);

	var _self = this;

	assert(ajv.validate(getCurrentRoomDataResponse, data), 'getCurrentRoomDataResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		if (!data.result.id) {
			_self._roomId = null;
			window.alert("The host has left the room.");
			_self.processChangeScreen(this.MAIN_MENU_SCREEN_CLASS);
			return;
		}

		if (data.isUserLoggedIn === true) {
			_self.updateRoomState(data);
		} else {
			_self.client.logInSignUpController.processSessionExpired();
		}
	} else {
		assert(data.errors.length > 0);
		logger.info('Server returned errors');
		_self.renderCurrentRoomErrors(data);
	}

	_self.hideAllSpinner();
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
		logger.info('Server returned errors');
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
	var players = data.result.player2Name ? data.result.player1Name + ', ' + data.result.player2Name : data.result.player1Name;

	$(_self.LOBBY_ROOM_PLAYERS_CLASS).text('Players: ' + players);

	console.log('data: ', data);
	console.log('userId: ', _self.client.logInSignUpController._userId);

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

roomController.prototype.processCreateRoomResponse = function(data) {
	logger.info('processCreateRoomResponse');
	logger.info('To validate: ', JSON.stringify(data));

	var _self = this;

  assert(ajv.validate(createRoomResponse, data), 'createRoomResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		logger.info('Data is valid');

		if (data.isUserLoggedIn === true) {
			_self._roomId = data.result.roomId;
			_self.showCreateRoomSuccess(data);
		}  else {
			_self.client.logInSignUpController.processSessionExpired();
		}
	} else {
		assert(data.errors.length > 0);
		logger.info('There are validation errors');
		_self.renderCreateRoomErrors(data);
	}

	_self.enableElement(_self.CREATE_ROOM_SUBMIT_BTN_ID);
};

roomController.prototype.processLeaveRoomResponse = function(data) {
	logger.info('processLeaveRoomResponse');
	logger.info('To validate: ', JSON.stringify(data));

  assert(ajv.validate(leaveRoomResponse, data), 'leaveRoomResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		logger.info('There are validation errors');

		assert(data.errors.length > 0);

		this.showAlertError(data.errors[0].message);
	}
};

roomController.prototype.processJoinRoomResponse = function(data) {
	logger.info('processJoinRoomResponse');
	logger.info('To validate: ', JSON.stringify(data));

	var _self = this;
	_self._connectingToRoom = false;

	assert(ajv.validate(joinRoomResponse, data), 'joinRoomResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		if (!data.result.id) {
			window.alert("This room no longer exists, you will be returned to the Main Menu.......");
			_self.processChangeScreen(this.MAIN_MENU_SCREEN_CLASS);
			return;
		}

		if (data.isUserLoggedIn === true) {
			_self._roomId = data.result.id;
			_self.showJoinRoomSuccess(data);
		}  else {
			_self.client.logInSignUpController.processSessionExpired();
		}
	} else {
		assert(data.errors.length > 0);
		logger.info('There are validation errors');
		_self.renderBrowseRoomsErrors(data);
	}

	_self.enableElement(_self.JOIN_ROOM_BTN_CLASS);
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

roomController.prototype.showCreateRoomSuccess = function(data) {
	logger.info('showCreateRoomSuccess');
	var _self = this;

	$(_self.LOBBY_ROOM_NAME_CLASS).text('Room: ' + data.result.roomName);
	$(_self.LOBBY_ROOM_PLAYERS_CLASS).text('Players: ' + data.result.player1Name);
	$(_self.LOBBY_SCREEN_CLASS).find(_self.SCREEN_FOOTER_CLASS)
		.html('<button disabled id="anime-cb-start-game" type="button" class="btn btn-primary anime-cb-button anime-cb-btn-game">Start Game</button>\
			<button id="anime-cb-leave-room" type="button" class="btn btn-primary anime-cb-button anime-cb-btn-main-menu">Leave</button>');
	$(_self.LOBBY_ROOM_WAITING_PLAYERS_CLASS).show();

	_self.processChangeScreen(_self.LOBBY_SCREEN_CLASS);
};

roomController.prototype.showJoinRoomSuccess = function(data) {
	logger.info('showJoinRoomSuccess');
	var _self = this;

	$(_self.LOBBY_ROOM_NAME_CLASS).text('Room: ' + data.result.name);
	$(_self.LOBBY_ROOM_PLAYERS_CLASS).text('Players: ' + data.result.player1Name + ', ' + data.result.player2Name);
	$(_self.LOBBY_SCREEN_CLASS).find(_self.SCREEN_FOOTER_CLASS)
		.html('<button id="anime-cb-leave-room" type="button" class="btn btn-primary anime-cb-button anime-cb-btn-main-menu">Leave</button>');
	$(_self.LOBBY_ROOM_WAITING_PLAYERS_CLASS).hide();

	_self.processChangeScreen(_self.LOBBY_SCREEN_CLASS);
};

roomController.prototype.preSwitchScreenHook = function (screenClass) {
	var _self = this;

	console.log('_lastHistoryState: ', _lastHistoryState);
	console.log('history.state: ', history.state);
	console.log('screenClass: ', screenClass);

	//if(_lastHistoryState && history.state && _lastHistoryState.screenClass !== history.state.screenClass
	//	&& (_lastHistoryState.screenClass === _self.LOBBY_SCREEN_CLASS || _lastHistoryState.screenClass === _self.GAME_SCREEN_CLASS)
	//	&& screenClass !== _self.GAME_SCREEN_CLASS) {
	//	console.log('LEAVE ROOM');
	//	_self.client.sendLeaveRoomRequest();
	//}
	if (screenClass !== _self.LOBBY_SCREEN_CLASS && screenClass !== _self.GAME_SCREEN_CLASS) {
		console.log('Leave Room');
		_self.client.sendLeaveRoomRequest();
	}

	if (screenClass === _self.BROWSE_ROOMS_SCREEN_CLASS) {
		_self.clearBrowseRoomsTable();
		_self.showBrowseRoomsSpinner();
		_self.client.getBrowseRoomsData();
	}

	if (screenClass === _self.GAME_SCREEN_CLASS) {
		_self._inGame = true;
	} else {
		_self._inGame = false;
	}
};

roomController.prototype.postSwitchScreenHook = function (screenClass) {
	var _self = this;

	if (screenClass !== _self.BROWSE_ROOMS_SCREEN_CLASS) {
		_self._connectingToRoom = false;
	}
};

roomController.prototype.clearCreateRoomInputs = function() {
	this.$createRoomInputs.val('');
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