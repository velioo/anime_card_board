var generalClient = function() {
	this.logInSignUpController = new logInSignUpController(this);
	this.roomController = new roomController(this);
  this.cardsInfoController = new cardsInfoController(this);
	this.clientConnectToServer();
};

generalClient.prototype.clientConnectToServer = function() {
	this.socket = io.connect('/', {
    "reconnection": true,
    "reconnectionDelay": 1000,
    "reconnectionDelayMax" : 1500,
    "reconnectionAttempts": Infinity,
    "forceNew":true,
  });

  this.socket.on('matchmake', this.processMatchmake.bind(this));
  this.socket.on('joinRoom', this.processJoinRoom.bind(this));
  this.socket.on('leaveRoom', this.processLeaveRoom.bind(this));
  this.socket.on('reconnect', this.sendServerReconnect.bind(this));
  this.socket.on('disconnect', this.processDisconnect.bind(this));
 	this.socket.on('serverError', this.processServerSocketError.bind(this));
};

generalClient.prototype.sendServerReconnect = function () {
  var _self = this;

  _self.socket.emit('player-reconnect');
};

generalClient.prototype.sendSignUpData = function(_data) {
	logger.info('sendSignUpData');
	logger.info('Sending data to signup: ', JSON.stringify(_data));

	var _self = this;

  $.post('/sign_up', { data: _data }, function (data, status) {
    _self.logInSignUpController.processSignUpResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.sendLoginData = function(_data) {
	logger.info('sendLoginData');
	logger.info('Sending data to login: ', JSON.stringify(_data));

	var _self = this;

  $.post('/log_in', { data: _data }, function (data, status) {
    _self.logInSignUpController.processLoginResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.sendLogOutRequest = function() {
	logger.info('sendLogOutRequest');

	var _self = this;

  $.post('/log_out', {}, function (data, status) {
    _self.logInSignUpController.processLogoutResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.sendSettingsData = function (_data) {
  logger.info('sendSettingsData');

  var _self = this;

  $.post('/settings', { data: _data }, function (data, status) {
    _self.logInSignUpController.processSettingsResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.checkIfUserIsLoggedIn = function() {
	//logger.info('checkIfUserIsLoggedIn');

	var _self = this;

  $.post('/is_user_logged_in', {}, function (data, status) {
    _self.logInSignUpController.processIsUserLoggedInResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.sendCreateRoomData = function(_data) {
	logger.info('sendCreateRoomData');

	var _self = this;

  $.post('/create_room', { data: _data }, function (data, status) {
    _self.roomController.processCreateRoomResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.sendLeaveRoomRequest = function(_data) {
	//logger.info('sendLeaveRoomRequest');
  console.log('sendLeaveRoomRequest, data: ', _data);

	var _self = this;

  _self.roomController._roomId = null;
  _self.roomController._user2Id = null;
  _self.roomController._inGame = false;
  _self.roomController._matchmaking = false;
  clearInterval(_self.roomController.matchmakingStartGameCountdownInterval);

	this.socket.emit('leaveRoom', _data);
};

generalClient.prototype.getBrowseRoomsData = function() {
  logger.info('getBrowseRoomsData');

  var _self = this;

  $.post('/browse_rooms', {}, function (data, status) {
    _self.roomController.processBrowseRoomsResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.getCurrentRoomData = function(_data) {
  //logger.info('getCurrentRoomData');

  var _self = this;

  $.post('/room_data', { data: _data }, function (data, status) {
    _self.roomController.processGetCurrentRoomDataResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.joinRoom = function(_data) {
  logger.info('joinRoom');

  var _self = this;

  $.post('/join_room', { data: _data }, function (data, status) {
    var successfullyJoinedRoom = _self.roomController.processJoinRoomResponse(data);

    if (successfullyJoinedRoom) {
      _self.socket.emit('joinRoom', data);
    }
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.processJoinRoom = function (_data) {
  logger.info('processJoinRoom');

  var _self = this;

  if (_data.result && _data.result.id && _self.roomController._roomId
    && _data.result.id == _self.roomController._roomId) {
    _self.roomController.processGetCurrentRoomDataResponse(_data);
  }
};

generalClient.prototype.matchmake = function (_data) {
 logger.info('matchmake');

  var _self = this;

  _self.socket.emit('matchmake', _data);
};

generalClient.prototype.processMatchmake = function (_data) {
 logger.info('processMatchmake');

  var _self = this;

  _self.roomController.processMatchmake(_data);
};

generalClient.prototype.removeFromMatchmaking = function () {
 logger.info('removeFromMatchmaking');

  var _self = this;

  _self.socket.emit('removeFromMatchmaking');
};

generalClient.prototype.startGame = function(_data) {
  logger.info('startGame');
  console.log('START GAME');

  var _self = this;

  _self.socket.emit('startGame', _data);
};

generalClient.prototype.processServerSocketError = function(_data) {
	logger.info('ServerError err: ', JSON.stringify(_data));
	window.alert('There was a problem while processing your request. Please try again later.');
};

generalClient.prototype.processDisconnect = function(_data) {
	logger.info('processDisconnect');
  console.log('DISCONNECT');

	var _self = this;

  _self.socket.open();
  _self.socket.emit('player-reconnect');

  if (_self.roomController._matchmaking && !_self.roomController._matchFound) {
    var values = {};
    _self.roomController.$matchmakingInputs.each(function() {
        values[this.name] = $(this).val();
    });

    _self.matchmake(values);
  }
};

generalClient.prototype.processLeaveRoom = function(_data) {
	logger.info('processLeaveRoom');

	var _self = this;

	 _self.roomController.processLeaveRoomResponse(_data);
};

generalClient.prototype.failHandler = function (xhr, status, errorThrown) {
  console.log('XHR: ', xhr);
	console.log('STATUS: ', status);
	console.log('ERROR_THROWN: ', errorThrown);

  var _self = this;

  if (status === 'timeout') {
    logger.info('Request timed out');

    window.alert('Request timed out');
  } else {
    if (xhr.readyState === 0) {
      logger.info('Internet connection is off or server is not responding');

      window.alert('Internet connection is off or server is not responding');
    } else if (xhr.readyState === 1) {
    } else if (xhr.readyState === 2) {
    } else if (xhr.readyState === 3) {
    } else {
      if (xhr.status === 200) {
      	if (xhr.responseText === 'login') {

        }
        logger.info('Error parsing JSON data');
      } else if (xhr.status === 404) {
        logger.info('The resource at the requested location could not be found');
      } else if (xhr.status === 403) {
      	if (xhr.responseText === 'login') {

        }
        logger.info('You don\'t have permission to access this data');
      } else if (xhr.status === 500) {
        logger.info('Internal sever error');
      }
    }

    // _self.roomController.processChangeScreen(_self.roomController.MAIN_MENU_SCREEN_CLASS);
    window.alert('There was a problem while processing your request. Please try again later.');
  }

  _self.logInSignUpController.enableAllElements();
  _self.logInSignUpController.hideAllSpinner();

  logger.info('Response Text: ' +
    xhr.responseText + '\n Ready State: ' +
    xhr.readyState + '\n Status Code: ' + xhr.status);
};