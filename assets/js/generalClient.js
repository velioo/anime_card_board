var generalClient = function() {
	this.controller = new loginSignUpController(this);
	this.clientConnectToServer();
};

generalClient.prototype.clientConnectToServer = function() {
	this.socket = io.connect();

  //When we connect, we are not 'connected' until we have a server id
  //and are placed in a game by the server. The server sends us a message for that.

  // this.socket.on('connect', function(){
  //     this.players.self.state = 'connecting';
  // }.bind(this));

	this.socket.on('signUp', this.processSignUpResponse.bind(this));
	this.socket.on('login', this.processLoginResponse.bind(this));
 	this.socket.on('serverError', this.processServerError.bind(this));

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
	console.log('sendSignUpData');
	this.socket.emit('signUp', data);
};

generalClient.prototype.processSignUpResponse = function(data) {
	console.log('processSignUpResponse');
	this.controller.processSignUpResponse(data);
};

generalClient.prototype.sendLoginData = function(data) {
	console.log('sendLoginData');
	this.socket.emit('login', data);
};

generalClient.prototype.processLoginResponse = function(data) {
	console.log('processLoginResponse');
	this.controller.processLoginResponse(data);
};

generalClient.prototype.processServerError = function(data) {
	console.log('ServerError err: ', data);
};