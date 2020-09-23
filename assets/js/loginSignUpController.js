var logInSignUpController = function(generalClient) {
	var _self = this;

	baseController.call(_self, generalClient);

	_self._isUserLoggedIn = false;
	_self.initConstants();
	_self.initElements();
	_self.initListeners();
	_self.initIntervals();
	_self.checkIsUserLoggedIn();
};

logInSignUpController.prototype = Object.create(baseController.prototype);

Object.defineProperty(logInSignUpController.prototype, 'constructor', {
    value: logInSignUpController,
    enumerable: false,
    writable: true,
});

logInSignUpController.prototype.initConstants = function() {
	var _self = this;

	_self.SIGN_UP_FORM_ID = '#anime-cb-form-sign-up';
	_self.LOGIN_FORM_ID = '#anime-cb-form-login';
	_self.SETTINGS_FORM_ID = '#anime-cb-form-settings';
	_self.CONTACT_FORM_ID = '#anime-cb-form-contact';

	_self.SIGN_UP_SUBMIT_BTN_ID = '#anime-cb-submit-sign-up';
	_self.RESET_SIGN_UP_BTN_ID = '#anime-cb-reset-sign-up';
	_self.LOGIN_SUBMIT_BTN_ID = '#anime-cb-submit-login';
	_self.RESET_LOGIN_BTN_ID = '#anime-cb-reset-login';
	_self.SIGN_OUT_BTN_ID = '#anime-cb-logout-btn';
	_self.SETTINGS_SUBMIT_BTN_ID = '#anime-cb-submit-settings';
	_self.SETTINGS_VOLUME_LABEL_ID = '#anime-cb-setting-volume-label';
	_self.SETTINGS_VOLUME_INPUT_ID = '#anime-cb-setting-volume';
	_self.SETTINGS_CHARACTER_IMG_CLASS = '.anime-cb-character-img';
	_self.CONTACT_SUBMIT_BTN_ID = '#anime-cb-submit-contact';

	_self.USER_INFO_HEADER_WRAPPER_CLASS = '.anime-cb-user-info-wrapper';
	_self.USER_INFO_HEADER_USERNAME_CLASS = '.anime-cb-user-info-username';
	_self.USER_INFO_HEADER_LEVEL_CLASS = '.anime-cb-user-info-level';
	_self.USER_INFO_HEADER_WINS_CLASS = '.anime-cb-user-info-wins';
	_self.USER_INFO_HEADER_LOSES_CLASS = '.anime-cb-user-info-loses';
	_self.USER_INFO_HEADER_XP_PROGRESS_BAR_WRAPPER_CLASS = '.anime-cb-level-progress-bar-wrapper';
	_self.USER_INFO_HEADER_XP_PROGRESS_BAR_CLASS = '.anime-cb-level-progress-bar';
	_self.USER_INFO_HEADER_XP_PROGRESS_BAR_TEXT_CLASS = '.anime-cb-user-info-level-xp';

	_self.CHAT_BOX_CLASS = '.anime-cb-chat-box';
	_self.CHAT_INPUT_ID = '#anime-cb-chat-input';
	_self.CHAT_MSG_CLASS = '.anime-cb-chat-msg';
};

logInSignUpController.prototype.initElements = function() {
	var _self = this;

	_self.$signUpInputs = $(_self.SIGN_UP_FORM_ID).find('input');
	_self.$loginInputs = $(_self.LOGIN_FORM_ID).find('input');
	_self.$settingsInputs = $(_self.SETTINGS_FORM_ID).find('input, select');
	_self.$contactInputs = $(_self.CONTACT_FORM_ID).find('input, textarea');
	_self._userId = null;
	_self._username = null;
	_self._settings = {};
	_self._scrollToBottom = true;
};

logInSignUpController.prototype.initListeners = function() {
	var _self = this;

	$(_self.SIGN_OUT_BTN_ID).on('click', function(e) {
		logger.info('Trying to logout...');

	  _self.showLogOutSpinner();

	  _self.client.sendLogOutRequest();
	});

	$(_self.SIGN_UP_SUBMIT_BTN_ID).on('click', function(e) {
		e.preventDefault();

	  var values = {};
	  _self.$signUpInputs.each(function() {
	    values[this.name] = $(this).val();
	  });

	  _self.showSignUpSpinner();
	  _self.disableElement(_self.SIGN_UP_SUBMIT_BTN_ID);

	  _self.client.sendSignUpData(values);
	});

	$(_self.LOGIN_SUBMIT_BTN_ID).on('click', function(e) {
		e.preventDefault();

	  var values = {};
	  _self.$loginInputs.each(function() {
	    values[this.name] = $(this).val();
	  });

	  _self.showLoginSpinner();
	  _self.disableElement(_self.LOGIN_SUBMIT_BTN_ID);

	  _self.client.sendLoginData(values);
	});

	$(_self.CONTACT_SUBMIT_BTN_ID).on('click', function(e) {
		e.preventDefault();

	  var values = {};
	  _self.$contactInputs.each(function() {
	    values[this.name] = $(this).val();
	  });

	  _self.showContactSpinner();
	  _self.disableElement(_self.CONTACT_SUBMIT_BTN_ID);

	  _self.client.sendContactData(values);
	});

	$(_self.RESET_SIGN_UP_BTN_ID).on('click', function(e) {
		e.preventDefault();
	  _self.clearSignUpInputs();
	  _self.clearSignUpErrors();
	  _self.hideSignUpErrors();
	});

	$(_self.RESET_LOGIN_BTN_ID).on('click', function(e) {
		e.preventDefault();
		_self.clearLoginInputs();
	  _self.clearLoginErrors();
	  _self.hideLoginErrors();
	});

	$(_self.SETTINGS_VOLUME_INPUT_ID).slider({
		min: 1,
		max: 100,
		range: "min",
		slide: function (event, ui) {
			$(_self.SETTINGS_VOLUME_LABEL_ID).text(ui.value);
		},
	});

	_self.reEnableSettingsSubmit();

	$(_self.MAIN_WRAPPER_ID).on('change', _self.CHARACTER_CHOOSE_CLASS, function() {
		var $characterSelected = $(this).find('option:selected');
		$(this).parent().find(_self.SETTINGS_CHARACTER_IMG_CLASS)
			.attr("src", "/imgs/player_pieces/" + $characterSelected.data("characterImage"));
	});

	$(_self.CHARACTER_CHOOSE_CLASS).val(1);

	$(_self.CHAT_INPUT_ID).on('keypress', function (e) {
		var key = e.which;

		if (key == 13 && $(_self.CHAT_INPUT_ID).val()) {
			_self.client.sendChatMsg({ msg: $(_self.CHAT_INPUT_ID).val() })
			$(_self.CHAT_INPUT_ID).val("");
		}
	});

  $(_self.CHAT_BOX_CLASS).on('scroll', function() {
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
    	_self._scrollToBottom = true;
    } else {
    	_self._scrollToBottom = false;
    }
	})
};

logInSignUpController.prototype.initIntervals = function() {
	var _self = this;

	// _self.logInInterval = setInterval(_self.logInIntervalFunc.bind(_self), 5000);
};

logInSignUpController.prototype.logInIntervalFunc = function() {
	var _self = this;

	_self.checkIsUserLoggedIn();
};

logInSignUpController.prototype.checkIsUserLoggedIn = function() {
	this.client.checkIfUserIsLoggedIn();
};

logInSignUpController.prototype.setIsUserLoggedIn = function(flag) {
	this._isUserLoggedIn = flag;
};

logInSignUpController.prototype.isUserLoggedIn = function() {
	return this._isUserLoggedIn;
};

logInSignUpController.prototype.processSignUpResponse = function(data) {
	logger.info('To validate: ', JSON.stringify(data));

	var _self = this;

  assert(ajv.validate(signUpResponse, data), 'SignUpResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		assert(typeof data.userMessage !== 'undefined');
		_self.showSignUpSuccess(data);
	} else {
		assert(data.errors.length > 0);
		_self.renderSignUpErrors(data);
	}

	_self.enableElement(_self.SIGN_UP_SUBMIT_BTN_ID);
};

logInSignUpController.prototype.processLoginResponse = function(data) {
	logger.info('To validate: ', JSON.stringify(data));

	var _self = this;

	if (data.isSuccessful) {
  	assert(ajv.validate(logInResponse, data), 'LogInResponse is invalid' +
  		JSON.stringify(ajv.errors, null, 2));
		_self.setIsUserLoggedIn(true);
		_self._userId = data.userId;
		_self._username = data.username;
		_self.showLoginSuccess(data);
		_self.updateSettingsStatus(data.settings);
		_self.updateUserInfoStatus(data);
	} else {
		assert(data.errors.length > 0);
		_self.renderLoginErrors(data);
	}

	_self.enableElement(_self.LOGIN_SUBMIT_BTN_ID);
};

logInSignUpController.prototype.processContactData = function(data) {
	logger.info('To validate: ', JSON.stringify(data));

	var _self = this;

	_self.enableElement(_self.CONTACT_SUBMIT_BTN_ID);
	_self.hideAllSpinner();

	if (data.isSuccessful) {
  	assert(ajv.validate(contactResponse, data), 'ContactResponse is invalid' +
  		JSON.stringify(ajv.errors, null, 2));
		_self.showContactSuccess(data);
	} else {
		assert(data.errors.length > 0);
		_self.renderContactErrors(data);
	}
};

logInSignUpController.prototype.processLogoutResponse = function(data) {
	logger.info('To validate: ', JSON.stringify(data));

	var _self = this;

  assert(ajv.validate(logOutResponse, data), 'LogOutResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		_self.resetSessionState();
		_self.showLogOutSuccess(data);
		$(_self.INFO_HEADER_ID).hide();
		$(_self.CHAT_WRAPPER_ID).hide();
		window.removeEventListener("beforeunload", _self.client.gameController.beforeUnload);
	} else {
		assert(data.errors.length > 0);
		_self.showAlertError();
	}
};

logInSignUpController.prototype.processSettingsResponse = function(data) {
	logger.info('To validate: ', JSON.stringify(data));

	var _self = this;

	_self.reEnableSettingsSubmit();
	_self.enableElement(_self.SETTINGS_SUBMIT_BTN_ID);
	_self.hideAllSpinner();

  assert(ajv.validate(settingsResponse, data), 'settingsResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		_self.showSettingsSuccess(data);
		_self.updateSettingsStatus(data.settings);
		_self.client.cardsInfoController.switchCardsImgs(data.settings.cardAnimations);
	} else {
		assert(data.errors.length > 0);
		_self.renderSettingsErrors(data);
	}
};

logInSignUpController.prototype.processIsUserLoggedInResponse = function(data) {
	var _self = this;

  assert(ajv.validate(isUserLoggedInResponse, data), 'isUserLoggedInResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		if (data.isUserLoggedIn === true) {
			_self.setIsUserLoggedIn(true);
			_self._userId = data.userId;
			_self._username = data.username;
			_self.updateSettingsStatus(data.settings);
			_self.updateUserInfoStatus(data);
		} else {
			// _self.processSessionExpired();
		}

		if (_isBaseControllerStateInited === false) {
			_self._initState();
		}
	} else {
		assert(0, 'There was a problem with isUserLoggedIn request');
	}
};

logInSignUpController.prototype.processSessionExpired = function(data) {
	var _self = this;

	_self.showLogOutSuccess();
	_self.resetSessionState();
	_self.processChangeScreen(_self.MAIN_MENU_SCREEN_CLASS);
};

logInSignUpController.prototype.processChatMsg = function (data) {
	var _self = this;

	if (data.isSuccessful) {
		_self.showChatMsg(data);
	}
};

logInSignUpController.prototype.showChatMsg = function (data) {
	var _self = this;

	$(_self.CHAT_BOX_CLASS).append('<span class="anime-cb-chat-msg">' + data.time + ' ' + data.username + ': ' + data.msg + '</span><br>');

	if (_self._scrollToBottom) {
		$(_self.CHAT_BOX_CLASS).scrollTop($(_self.CHAT_BOX_CLASS)[0].scrollHeight);
	}
};

logInSignUpController.prototype.resetSessionState = function () {
	var _self = this;

	_self.resetUserState();

	if (typeof _self.client.roomController.resetRoomState === "function") {
		_self.client.roomController.resetRoomState();
	}

	if (typeof _self.client.gameController.resetGameState === "function") {
		_self.client.gameController.resetGameState();
	}
};

logInSignUpController.prototype.resetUserState = function () {
	var _self = this;

	_self.setIsUserLoggedIn(false);
	_self._userId = null;
	_self._username = null;
};

logInSignUpController.prototype.reEnableSettingsSubmit = function () {
	var _self = this;

	$(_self.SETTINGS_SUBMIT_BTN_ID).one('click', function(e) {
		e.preventDefault();

	  var values = {};
	  _self.$settingsInputs.each(function() {
	  	if ($(this).attr("type") == "checkbox") {
	  		values[this.name] = $(this).is(':checked');
	  	} else {
	      values[this.name] = $(this).val();
	  	}
	  });

	  values["soundVolume"] = $(_self.SETTINGS_VOLUME_INPUT_ID).slider("value");

	  logger.info('Form settings values: ', JSON.stringify(values));

	  _self.showSettingsSpinner();
	  _self.disableElement(_self.SETTINGS_SUBMIT_BTN_ID);

	  _self.client.sendSettingsData(values);
	});
};

logInSignUpController.prototype.renderSignUpErrors = function(data) {
	logger.info('renderSignUpErrors');
	var _self = this;

	_self.clearSignUpErrors();
	_self.hideSignUpErrors();

	_self.$signUpInputs.each(function(idx, input) {
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

logInSignUpController.prototype.renderLoginErrors = function(data) {
	logger.info('renderLoginErrors');
	var _self = this;

	_self.clearLoginErrors();
	_self.hideLoginErrors();

	_self.$loginInputs.each(function(idx, input) {
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

logInSignUpController.prototype.renderSettingsErrors = function(data) {
	logger.info('renderSettingsErrors');

	var _self = this;

	_self.clearSettingsErrors();
	_self.hideSettingsErrors();

	$(_self.SETTINGS_SCREEN_CLASS).find(_self.INPUT_ERRORS_CLASS).append('<span>' + data.userMessage + '</span>');

	$(_self.SETTINGS_SCREEN_CLASS).find(_self.INPUT_ERRORS_CLASS).show();
	_self.enableElement(_self.SETTINGS_SUBMIT_BTN_ID);
	_self.hideAllSpinner();
};

logInSignUpController.prototype.renderContactErrors = function(data) {
	logger.info('renderContactErrors');

	var _self = this;

	_self.clearContactErrors();
	_self.hideContactErrors();

	_self.$contactInputs.each(function(idx, input) {
		data.errors.forEach(function (el) {
			var elName = el.dataPath.split('/')[1];

			if (input.name === elName) {
				$(input).parent().find(_self.INPUT_ERRORS_CLASS).html('<span>' + el.message + '</span>');
				$(input).parent().find(_self.INPUT_ERRORS_CLASS).show();
			}
		});
	 });
};

logInSignUpController.prototype.showSignUpSuccess = function(data) {
	logger.info('showSignUpSuccess');

	this.processChangeScreen(this.SIGN_UP_SUCCESS_SCREEN_CLASS);

	$(this.USER_MESSAGE_CLASS).html('<span>' + data.userMessage + '</span>');
};

logInSignUpController.prototype.showLoginSuccess = function(data) {
	logger.info('showLoginSuccess');

	this.switchMainMenuToLoggedIn();
	this.processChangeScreen(this.MAIN_MENU_SCREEN_CLASS);
	window.location.reload();
};

logInSignUpController.prototype.showContactSuccess = function(data) {
	logger.info('showContactSuccess');

	var _self = this;

	_self.clearContactErrors();
	_self.hideContactErrors();

	$(_self.USER_MESSAGE_CLASS).html('<span>' + data.userMessage + '</span>');
};

logInSignUpController.prototype.showLogOutSuccess = function(data) {
	logger.info('showLogOutSuccess');

	this.hideAllPreSpinner();
	this.switchMainMenuToLoggedOut();
};

logInSignUpController.prototype.showSettingsSuccess = function(data) {
	var _self = this;

	_self.clearSettingsErrors();
	_self.hideSettingsErrors();
	_self.enableElement(_self.SETTINGS_SUBMIT_BTN_ID);

	$(_self.USER_MESSAGE_CLASS).html('<span>' + data.userMessage + '</span>');
};

logInSignUpController.prototype.updateSettingsStatus = function (settings) {
	var _self = this;

	if (!settings || _.isEqual(_self._settings, settings)) {
		return;
	}

	for (setting in settings) {
		_self._settings[setting] = settings[setting];

		var $input = $(_self.SETTINGS_FORM_ID).find('input[name="' + setting + '"]');

		if ($input.attr("type") != "checkbox") {
			$input.val(settings[setting]);
		} else {
			$input.prop("checked", settings[setting]);
		}

		if (setting == "soundVolume") {
			$(_self.SETTINGS_VOLUME_INPUT_ID).slider("value", settings[setting]);
			$(_self.SETTINGS_VOLUME_LABEL_ID).text(settings[setting]);
		}

		if (setting == "defaultCharacter") {
			$(_self.CHARACTER_CHOOSE_CLASS).val(settings[setting] || 1);
			$(_self.CHARACTER_CHOOSE_CLASS).trigger('change');
		}
	}
};

logInSignUpController.prototype.updateUserInfoStatus = function (data) {
	var _self = this;

	$(_self.INFO_HEADER_ID).show();
	$(_self.CHAT_WRAPPER_ID).show();

	_self.USER_INFO_HEADER_WRAPPER_CLASS = '.anime-cb-user-info-wrapper';
	_self.USER_INFO_HEADER_USERNAME_CLASS = '.anime-cb-user-info-username';
	_self.USER_INFO_HEADER_LEVEL_CLASS = '.anime-cb-user-info-level';
	_self.USER_INFO_HEADER_WINS_CLASS = '.anime-cb-user-info-wins';
	_self.USER_INFO_HEADER_LOSES_CLASS = '.anime-cb-user-info-loses';
	_self.USER_INFO_HEADER_LEVEL_XP_CLASS = '.anime-cb-user-info-level-xp';

	$(_self.USER_INFO_HEADER_USERNAME_CLASS).text(data.username + ",");
	$(_self.USER_INFO_HEADER_LEVEL_CLASS).text("Level " + data.level + ",");
	$(_self.USER_INFO_HEADER_WINS_CLASS).text("Wins: " + data.winsCount + ",");
	$(_self.USER_INFO_HEADER_LOSES_CLASS).text("Loses: " + data.losesCount);

	var xpPercentage = Math.floor((data.currentLevelXp / data.maxLevelXp) * 100);

	$(_self.USER_INFO_HEADER_XP_PROGRESS_BAR_TEXT_CLASS).text(xpPercentage + "%");
	$(_self.USER_INFO_HEADER_XP_PROGRESS_BAR_CLASS).css("width", xpPercentage + "%");
};

logInSignUpController.prototype.preSwitchScreenHookLogInSignUpController = function (screenClass) {
	var _self = this;

	if (screenClass === _self.SETTINGS_SCREEN_CLASS) {
		_self.updateSettingsStatus(_self._settings);
	}
};

logInSignUpController.prototype.switchMainMenuToLoggedIn = function() {
	$(this.MAIN_MENU_SCREEN_CLASS).find('.logged-out').hide();
	$(this.MAIN_MENU_SCREEN_CLASS).find('.logged-in').show();
};

logInSignUpController.prototype.switchMainMenuToLoggedOut = function() {
	$(this.MAIN_MENU_SCREEN_CLASS).find('.logged-in').hide();
	$(this.MAIN_MENU_SCREEN_CLASS).find('.logged-out').show();
};

logInSignUpController.prototype.clearSignUpInputs = function() {
	this.$signUpInputs.val('');
};

logInSignUpController.prototype.clearLoginInputs = function() {
	this.$loginInputs.val('');
};

logInSignUpController.prototype.clearSignUpErrors = function() {
	this.$signUpInputs.parent().find(this.INPUT_ERRORS_CLASS).html('');
};

logInSignUpController.prototype.showSignUpErrors = function() {
	this.$signUpInputs.parent().find(this.INPUT_ERRORS_CLASS).show();
};

logInSignUpController.prototype.hideSignUpErrors = function() {
	this.$signUpInputs.parent().find(this.INPUT_ERRORS_CLASS).hide();
};

logInSignUpController.prototype.clearLoginErrors = function() {
	this.$loginInputs.parent().find(this.INPUT_ERRORS_CLASS).html('');
};

logInSignUpController.prototype.showLoginErrors = function() {
	this.$loginInputs.parent().find(this.INPUT_ERRORS_CLASS).show();
};

logInSignUpController.prototype.hideLoginErrors = function() {
	this.$loginInputs.parent().find(this.INPUT_ERRORS_CLASS).hide();
};

logInSignUpController.prototype.showLoginSpinner = function() {
	$(this.LOGIN_FORM_ID).find(this.SPINNER_CLASS).show();
};

logInSignUpController.prototype.showContactSpinner = function() {
	$(this.CONTACT_FORM_ID).find(this.SPINNER_CLASS).show();
};

logInSignUpController.prototype.showSignUpSpinner = function() {
	$(this.SIGN_UP_FORM_ID).find(this.SPINNER_CLASS).show();
};

logInSignUpController.prototype.showLogOutSpinner = function() {
	$(this.MAIN_MENU_SCREEN_CLASS).find(this.PRE_SCREEN_SPINNER_CLASS).show();
};

logInSignUpController.prototype.showSettingsSpinner = function () {
	$(this.SETTINGS_FORM_ID).find(this.SPINNER_CLASS).show();
};

logInSignUpController.prototype.clearSettingsErrors = function() {
	$(this.SETTINGS_SCREEN_CLASS).find(this.INPUT_ERRORS_CLASS).html('');
};

logInSignUpController.prototype.hideSettingsErrors = function() {
	$(this.SETTINGS_SCREEN_CLASS).find(this.INPUT_ERRORS_CLASS).hide();
};

logInSignUpController.prototype.clearContactErrors = function() {
	$(this.ABOUT_SCREEN_CLASS).find(this.INPUT_ERRORS_CLASS).html('');
};

logInSignUpController.prototype.hideContactErrors = function() {
	$(this.ABOUT_SCREEN_CLASS).find(this.INPUT_ERRORS_CLASS).hide();
};