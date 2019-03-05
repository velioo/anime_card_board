var roomController = function(generalClient) {
	baseController.call(this, generalClient);

	this.initConstants();
	this.initElements();
	this.initListeners();
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
	this.DESTROY_ROOM_BTN_ID = '#anime-cb-destroy-room';

	this.LOBBY_ROOM_NAME_CLASS = '.anime-cb-title-lobby';
};

roomController.prototype.initElements = function() {
	this.$createRoomInputs = $(this.CREATE_ROOM_FORM_ID).find('input');
};

roomController.prototype.initListeners = function() {
	var _self = this;

	$(this.DESTROY_ROOM_BTN_ID).on('click', function(e) {
			logger.info('Destroying room...');

			_self.client.sendDestroyRoomRequest();
	});

	$(this.CREATE_ROOM_SUBMIT_BTN_ID).on('click', function(e) {
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

	$(this.RESET_CREATE_ROOM_BTN_ID).on('click', function(e) {
		e.preventDefault();
	  _self.clearCreateRoomInputs();
	  _self.clearCreateRoomErrors();
	  _self.hideCreateRoomErrors();
	});
};

roomController.prototype.processCreateRoomResponse = function(data) {
	logger.info('processCreateRoomResponse');
	logger.info('To validate: ', JSON.stringify(data));

  assert(ajv.validate(createRoomResponse, data), 'createRoomResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		logger.info('Data is valid');

		if (data.isUserLoggedIn === true) {
			this.showCreateRoomSuccess(data);
		}  else {
			this.client.logInSignUpController.processSessionExpired();
		}
	} else {
		assert(data.errors.length > 0);
		logger.info('There are validation errors');
		this.renderCreateRoomErrors(data);
	}

	this.enableElement(this.CREATE_ROOM_SUBMIT_BTN_ID);
};

roomController.prototype.processDestroyRoomResponse = function(data) {
	logger.info('processDestroyRoomResponse');
	logger.info('To validate: ', JSON.stringify(data));

  assert(ajv.validate(destroyRoomResponse, data), 'destroyRoomResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		logger.info('There are validation errors');

		assert(data.errors.length > 0);

		this.showAlertError(data.errors[0].message);
	}
};

roomController.prototype.renderCreateRoomErrors = function(data) {
	logger.info('renderCreateRoomErrors');
	var _self = this;

	this.clearCreateRoomErrors();
	this.hideCreateRoomErrors();

	this.$createRoomInputs.each(function(idx, input) {
		data.errors.forEach(function (el) {
			var elName = el.dataPath.split('/')[1];

			if (input.name === elName) {
				$(input).parent().find(_self.INPUT_ERRORS_CLASS).html('<span>' + el.message + '</span>');
				$(input).parent().find(_self.INPUT_ERRORS_CLASS).show();
			}
		});
	 });

	this.hideAllSpinner();
};

roomController.prototype.showCreateRoomSuccess = function(data) {
	logger.info('showCreateRoomSuccess');

	$(this.LOBBY_ROOM_NAME_CLASS).text(data.result.roomName);
	this.processChangeScreen(this.LOBBY_SCREEN_CLASS);
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