var logInSignUpController = function(generalClient) {
	baseController.call(this, generalClient);

	this.initConstants();
	this.initElements();
	this.initListeners();
	this.checkIsUserLoggedIn();
};

logInSignUpController.prototype = Object.create(baseController.prototype);

Object.defineProperty(logInSignUpController.prototype, 'constructor', {
    value: logInSignUpController,
    enumerable: false,
    writable: true,
});

logInSignUpController.prototype.initConstants = function() {
	this.SIGN_UP_FORM_ID = '#anime-cb-form-sign-up';
	this.LOGIN_FORM_ID = '#anime-cb-form-login';

	this.SIGN_UP_SUBMIT_BTN_ID = '#anime-cb-submit-sign-up';
	this.RESET_SIGN_UP_BTN_ID = '#anime-cb-reset-sign-up';
	this.LOGIN_SUBMIT_BTN_ID = '#anime-cb-submit-login';
	this.RESET_LOGIN_BTN_ID = '#anime-cb-reset-login';
	this.SIGN_OUT_BTN_ID = '#anime-cb-logout-btn';
};

logInSignUpController.prototype.initElements = function() {
	this.$signUpInputs = $(this.SIGN_UP_FORM_ID).find('input');
	this.$loginInputs = $(this.LOGIN_FORM_ID).find('input');
};

logInSignUpController.prototype.initListeners = function() {
	var _self = this;

	$(this.SIGN_OUT_BTN_ID).on('click', function(e) {
		logger.info('Trying to logout...');

	  _self.showLogOutSpinner();

	  _self.client.sendLogOutRequest();
	});

	$(this.SIGN_UP_SUBMIT_BTN_ID).on('click', function(e) {
		e.preventDefault();

	  var values = {};
	  _self.$signUpInputs.each(function() {
	      values[this.name] = $(this).val();
	  });

	  logger.info('Form signup values: ', JSON.stringify(values));

	  _self.showSignUpSpinner();
	  _self.disableElement(_self.SIGN_UP_SUBMIT_BTN_ID);

	  _self.client.sendSignUpData(values);
	});

	$(this.LOGIN_SUBMIT_BTN_ID).on('click', function(e) {
		e.preventDefault();

	  var values = {};
	  _self.$loginInputs.each(function() {
	      values[this.name] = $(this).val();
	  });

	  logger.info('Form login values: ', JSON.stringify(values));

	  _self.showLoginSpinner();
	  _self.disableElement(_self.LOGIN_SUBMIT_BTN_ID);

	  _self.client.sendLoginData(values);
	});

	$(this.RESET_SIGN_UP_BTN_ID).on('click', function(e) {
		e.preventDefault();
	  _self.clearSignUpInputs();
	  _self.clearSignUpErrors();
	  _self.hideSignUpErrors();
	});

	$(this.RESET_LOGIN_BTN_ID).on('click', function(e) {
		e.preventDefault();
		_self.clearLoginInputs();
	  _self.clearLoginErrors();
	  _self.hideLoginErrors();
	});
};

logInSignUpController.prototype.checkIsUserLoggedIn = function() {
	logger.info('checkIsUserLoggedIn');
	this.client.checkIfUserIsLoggedIn();
};

logInSignUpController.prototype.processSignUpResponse = function(data) {
	logger.info('processSignUpResponse');
	logger.info('To validate: ', JSON.stringify(data));

  assert(ajv.validate(signUpResponse, data), 'SignUpResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		logger.info('Data is valid');
		assert(typeof data.userMessage !== 'undefined');
		this.showSignUpSuccess(data);
	} else {
		assert(data.errors.length > 0);
		logger.info('There are validation errors');
		this.renderSignUpErrors(data);
	}

	this.enableElement(this.SIGN_UP_SUBMIT_BTN_ID);
};

logInSignUpController.prototype.processLoginResponse = function(data) {
	logger.info('processLoginResponse');
	logger.info('To validate: ', JSON.stringify(data));

  assert(ajv.validate(logInResponse, data), 'LogInResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		logger.info('Data is valid');
		this.isUserLoggedIn = true;
		this.showLoginSuccess(data);
	} else {
		assert(data.errors.length > 0);
		logger.info('There are validation errors');
		this.renderLoginErrors(data);
	}

	this.enableElement(this.LOGIN_SUBMIT_BTN_ID);
};

logInSignUpController.prototype.processLogoutResponse = function(data) {
	logger.info('processLogoutResponse');
	logger.info('To validate: ', JSON.stringify(data));

  assert(ajv.validate(logOutResponse, data), 'LogOutResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		logger.info('Data is valid');
		this.isUserLoggedIn = false;
		this.showLogOutSuccess(data);
	} else {
		assert(data.errors.length > 0);
		logger.info('There are validation errors');
		this.showAlertError();
	}
};

logInSignUpController.prototype.processIsUserLoggedInResponse = function(data) {
	logger.info('processIsUserLoggedInResponse');
	logger.info('To validate: ', JSON.stringify(data));

  assert(ajv.validate(isUserLoggedInResponse, data), 'isUserLoggedInResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		logger.info('Data is valid');
		if (data.isUserLoggedIn === true) {
			this.isUserLoggedIn = true;
		}

		if (this.isStateInited === false) {
			this._initState();
		}
	} else {
		assert(0, 'There was a problem with isUserLoggedIn request');
	}
};

logInSignUpController.prototype.renderSignUpErrors = function(data) {
	logger.info('renderSignUpErrors');
	var _self = this;

	this.clearSignUpErrors();
	this.hideSignUpErrors();

	this.$signUpInputs.each(function(idx, input) {
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

logInSignUpController.prototype.renderLoginErrors = function(data) {
	logger.info('renderLoginErrors');
	var _self = this;

	this.clearLoginErrors();
	this.hideLoginErrors();

	this.$loginInputs.each(function(idx, input) {
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

logInSignUpController.prototype.showSignUpSuccess = function(data) {
	logger.info('showSignUpSuccess');

	this.processChangeScreen(this.SIGN_UP_SUCCESS_SCREEN_CLASS);

	$(this.USER_MESSAGE_CLASS).html('<span>' + data.userMessage + '</span>');
};

logInSignUpController.prototype.showLoginSuccess = function(data) {
	logger.info('showLoginSuccess');

	this.switchMainMenuToLoggedIn();
	this.processChangeScreen(this.MAIN_MENU_SCREEN_CLASS);
};

logInSignUpController.prototype.showLogOutSuccess = function(data) {
	logger.info('showLogOutSuccess');

	this.hideAllPreSpinner();
	this.switchMainMenuToLoggedOut();
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

logInSignUpController.prototype.showSignUpSpinner = function() {
	$(this.SIGN_UP_FORM_ID).find(this.SPINNER_CLASS).show();
};

logInSignUpController.prototype.showLogOutSpinner = function() {
	$(this.MAIN_MENU_SCREEN_CLASS).find(this.PRE_SCREEN_SPINNER_CLASS).show();
};