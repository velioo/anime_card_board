var generalClient = function() {
	this.loginSignUpController = new logInSignUpController(this);
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
  // this.socket.on('disconnect', this.client_ondisconnect.bind(this));
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
	console.log('sendSignUpData');
	console.log('Sending data to signup: ', data);

  $.post('/sign_up', { data: data }, function (data, status) {
    _self.loginSignUpController.processSignUpResponse(data);
  }).fail(_self.failHandler);
};

generalClient.prototype.sendLoginData = function(data) {
	var _self = this;
	console.log('sendLoginData');
	console.log('Sending data to login: ', data);

  $.post('/log_in', { data: data }, function (data, status) {
    _self.loginSignUpController.processLoginResponse(data);
  }).fail(_self.failHandler);
};

generalClient.prototype.sendLogOutRequest = function(data) {
	var _self = this;
	console.log('sendLogOutRequest');

  $.post('/log_out', {}, function (data, status) {
    _self.loginSignUpController.processLogoutResponse(data);
  }).fail(_self.failHandler);
};

generalClient.prototype.checkIfUserIsLoggedIn = function() {
	var _self = this;
	console.log('checkIfUserIsLoggedIn');

  $.post('/is_user_logged_in', {}, function (data, status) {
    _self.loginSignUpController.processIsUserLoggedInResponse(data);
  }).fail(_self.failHandler);
};

generalClient.prototype.processServerSocketError = function(data) {
	console.log('ServerError err: ', data);
	window.alert(`There was a problem while processing your request. Please try again later.`);
};

generalClient.prototype.failHandler = function (xhr, status, errorThrown) {
  if (status === `timeout`) {
    logger.info(`Request timed out`);

    window.alert(`Request timed out`);
  } else {
    if (xhr.readyState === 0) {
      logger.info(`Internet connection is off or server is not responding`);

      window.alert(`Internet connection is off or server is not responding`);
    } else if (xhr.readyState === 1) {
    } else if (xhr.readyState === 2) {
    } else if (xhr.readyState === 3) {
    } else {
      if (xhr.status === 200) {
        logger.info(`Error parsing JSON data`);
      } else if (xhr.status === 404) {
        logger.info(`The resource at the requested location
          could not be found`);
      } else if (xhr.status === 403) {
        if (xhr.responseText === 'login') {
          return window.location.href = redirectUrl;
        }
        logger.info(`You don\`t have permission to access this data`);
      } else if (xhr.status === 500) {
        logger.info(`Internal sever error`);
      }
    }
    window.alert(`There was a problem while processing your request. Please try again later.`);
  }

  logger.info(`Response Text: ` +
    xhr.responseText + `\n Ready State: ` +
    xhr.readyState + `\n Status Code: ` + xhr.status);

  $(`.spinner`).hide();
};