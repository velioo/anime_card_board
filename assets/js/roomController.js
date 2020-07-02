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
	this.DESTROY_ROOM_BTN_ID = '#anime-cb-destroy-room';
	this.JOIN_ROOM_BTN_ID = '#anime-cb-join-room';

	this.LOBBY_ROOM_NAME_CLASS = '.anime-cb-title-lobby';
	this.BROWSE_ROOMS_TABLE_CLASS = '.browse-rooms-table';
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

roomController.prototype.initIntervals = function() {
	var _self = this;

	logger.info('Settings browse rooms interval...');

	setInterval(function() {
		if ($(_self.BROWSE_ROOMS_SCREEN_CLASS).find('tr').length == 0) {
			_self.showBrowseRoomSpinner();
		}
		if ($(_self.BROWSE_ROOMS_SCREEN_CLASS).is(':visible')) {
			console.log('browse rooms is visible');

			_self.client.getBrowseRoomsData();
		}
	}, 1000);
};

roomController.prototype.processBrowseRoomsResponse = function(data) {
	logger.info('populateBrowseRooms');
	logger.info('Rooms data: ', data);

	var _self = this;

	if (data.isSuccessful) {
		logger.info('Data is valid');

		if (data.isUserLoggedIn === true) {
			_self.populateBrowseRoomsData(data);
		} else {
			this.client.logInSignUpController.processSessionExpired();
		}
	} else {
		assert(data.errors.length > 0);
		logger.info('There are validation errors');
		this.renderBrowseRoomsErrors(data);
	}

	_self.hideAllSpinner();
};

roomController.prototype.populateBrowseRoomsData = function(data) {
	logger.info('populateBrowseRoomsData');

	var _self = this;

	_self.clearBrowseRoomsTable();

	$(_self.BROWSE_ROOMS_TABLE_CLASS).append('<th>Room name</th><th>Players</th><th>Join</th>');

	data.result.roomsData.forEach(function (el) {
		let playersCount = el.player2_id ? 2 : 1;
		$(_self.BROWSE_ROOMS_TABLE_CLASS).append('<tr><td>' + el.name + '</td><td>' + playersCount
			+ '/2</td><td><button id="' + _self.JOIN_ROOM_BTN_ID + '" class="btn btn-default">Join</button></td></tr>');

		if (playersCount >= 2) {
			_self.disableElement(_self.JOIN_ROOM_BTN_ID);
		}
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

roomController.prototype.renderBrowseRoomsErrors = function(data) {
	logger.info('renderBrowseRoomsErrors');
	var _self = this;

	this.clearBrowseRoomsErrors();
	this.hideBrowseRoomsErrors();

	data.errors.forEach(function (el) {
		$(this.BROWSE_ROOMS_SCREEN_CLASS).find(this.INPUT_ERRORS_CLASS).append('<span>' + el.message + '</span>');
	});
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

roomController.prototype.showBrowseRoomSpinner = function() {
	$(this.BROWSE_ROOMS_SCREEN_CLASS).find(this.SPINNER_CLASS).show();
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