var generalClient = function() {
	this.logInSignUpController = new logInSignUpController(this);
	this.roomController = new roomController(this);
	this.clientConnectToServer();
};

generalClient.prototype.clientConnectToServer = function() {
	this.socket = io.connect();

  //When we connect, we are not 'connected' until we have a server id
  //and are placed in a game by the server. The server sends us a message for that.

  // this.socket.on('connect', function(){
  //     this.players.self.state = 'connecting';
  // }.bind(this));

	// this.socket.on('signUp', this.processSignUpResponse.bind(this));
	// this.socket.on('login', this.processLoginResponse.bind(this));
 	this.socket.on('serverError', this.processServerSocketError.bind(this));

  //Sent when we are disconnected (network, server down, etc)
  this.socket.on('disconnect', this.processDisconnect.bind(this));
  this.socket.on('leaveRoom', this.processLeaveRoom.bind(this));
  this.socket.on('joinRoom', this.processJoinRoom.bind(this));
      //Sent each tick of the server simulation. This is our authoritive update
  // this.socket.on('onserverupdate', this.client_onserverupdate_recieved.bind(this));
      //Handle when we connect to the server, showing state and storing id's.
  // this.socket.on('onconnected', this.client_onconnected.bind(this));
      //On error we just show that we are not connected for now. Can print the data.
  // this.socket.on('error', this.client_ondisconnect.bind(this));
      //On message from the server, we parse the commands and send it to the handlers
  // this.socket.on('message', this.client_onnetmessage.bind(this));


	// this.socket.emit('signUp', { username: "velioo", password: "12345678", email: "velioocs@mail.bg", conf_password: "12345678" });
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

	var _self = this;

  _self.roomController._roomId = null;
  _self.roomController._user2Id = null;
  _self.roomController._inGame = false;

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
  console.log('JOIN ROOM EMIT RESPOSNE');

  var _self = this;

  if (_data.result.id && _self.roomController._roomId
    && _data.result.id == _self.roomController._roomId) {
    _self.roomController.processGetCurrentRoomDataResponse(_data);
  }
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

	var _self = this;
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

    _self.roomController.processChangeScreen(_self.roomController.MAIN_MENU_SCREEN_CLASS);
    window.alert('There was a problem while processing your request. Please try again later.');
  }

  _self.logInSignUpController.enableAllElements();
  _self.logInSignUpController.hideAllSpinner();

  logger.info('Response Text: ' +
    xhr.responseText + '\n Ready State: ' +
    xhr.readyState + '\n Status Code: ' + xhr.status);
};