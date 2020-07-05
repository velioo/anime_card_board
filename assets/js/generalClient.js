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

generalClient.prototype.sendSignUpData = function(data) {
	var _self = this;
	logger.info('sendSignUpData');
	logger.info('Sending data to signup: ', JSON.stringify(data));

  $.post('/sign_up', { data: data }, function (data, status) {
    _self.logInSignUpController.processSignUpResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.sendLoginData = function(data) {
	var _self = this;
	logger.info('sendLoginData');
	logger.info('Sending data to login: ', JSON.stringify(data));

  $.post('/log_in', { data: data }, function (data, status) {
    _self.logInSignUpController.processLoginResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.sendLogOutRequest = function() {
	var _self = this;
	logger.info('sendLogOutRequest');

  $.post('/log_out', {}, function (data, status) {
    _self.logInSignUpController.processLogoutResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.checkIfUserIsLoggedIn = function() {
	var _self = this;
	logger.info('checkIfUserIsLoggedIn');

  $.post('/is_user_logged_in', {}, function (data, status) {
    _self.logInSignUpController.processIsUserLoggedInResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.sendCreateRoomData = function(data) {
	var _self = this;
	logger.info('sendCreateRoomData');

  $.post('/create_room', { data: data }, function (data, status) {
    _self.roomController.processCreateRoomResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.sendLeaveRoomRequest = function(data) {
	var _self = this;
	logger.info('sendLeaveRoomRequest');

  _self.roomController._roomId = null;
	this.socket.emit('leaveRoom');
};

generalClient.prototype.getBrowseRoomsData = function() {
  var _self = this;
  logger.info('getBrowseRoomsData');

  $.post('/browse_rooms', {}, function (data, status) {
    _self.roomController.processBrowseRoomsResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.getCurrentRoomData = function(data) {
  var _self = this;
  logger.info('getCurrentRoomData');

  $.post('/room_data', { data: data }, function (data, status) {
    _self.roomController.processGetCurrentRoomDataResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.joinRoom = function(data) {
  var _self = this;
  logger.info('joinRoom');

  $.post('/join_room', { data: data }, function (data, status) {
    _self.roomController.processJoinRoomResponse(data);
  }).fail(_self.failHandler.bind(_self));
};

generalClient.prototype.processServerSocketError = function(data) {
	logger.info('ServerError err: ', JSON.stringify(data));
	window.alert('There was a problem while processing your request. Please try again later.');
};

generalClient.prototype.processDisconnect = function(data) {
	var _self = this;
	logger.info('processDisconnect');
};

generalClient.prototype.processLeaveRoom = function(data) {
	var _self = this;
	logger.info('processLeaveRoom');

	 _self.roomController.processLeaveRoomResponse(data);
};

generalClient.prototype.failHandler = function (xhr, status, errorThrown) {
  console.log('XHR: ', xhr);
	console.log('STATUS: ', status);
	console.log('ERROR_THROWN: ', errorThrown);

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
    window.alert('There was a problem while processing your request. Please try again later.');
  }

  this.logInSignUpController.enableAllElements();
  this.logInSignUpController.hideAllSpinner();

  logger.info('Response Text: ' +
    xhr.responseText + '\n Ready State: ' +
    xhr.readyState + '\n Status Code: ' + xhr.status);
};