var logInSignUpController = function(generalClient) {
	baseController.call(this, generalClient);

	this.isUserLoggedIn = false;
	this.initConstants();
	this.initElements();
	this.initListeners();
	this.initPolls();
	this.checkIsUserLoggedIn();
};

logInSignUpController.prototype = Object.create(baseController.prototype);

Object.defineProperty(logInSignUpController.prototype, 'constructor', {
    value: logInSignUpController,
    enumerable: false,
    writable: true,
});

logInSignUpController.prototype.initConstants = function() {
	this.SIGN_UP_FORM_CLASS = '#anime-cb-form-sign-up';
	this.LOGIN_FORM_CLASS = '#anime-cb-form-login';

	this.SIGN_UP_SUBMIT_BTN_ID = '#anime-cb-submit-sign-up';
	this.RESET_SIGN_UP_BTN_ID = '#anime-cb-reset-sign-up';
	this.LOGIN_SUBMIT_BTN_ID = '#anime-cb-submit-login';
	this.RESET_LOGIN_BTN_ID = '#anime-cb-reset-login';
	this.SIGN_OUT_BTN_ID = '#anime-cb-logout-btn';

	this.CHANGE_TO_MAIN_MENU_SCREEN_BTN_CLASS = '.anime-cb-btn-main-menu';
	this.CHANGE_TO_LOGIN_SCREEN_CLASS_BTN_CLASS = '.anime-cb-btn-login';
	this.CHANGE_TO_SIGNUP_SCREEN_BTN_CLASS = '.anime-cb-btn-sign-up';

	this.LOGIN_SCREEN_CLASS = '.anime-cb-screen-login';
	this.SIGN_UP_SCREEN_CLASS = '.anime-cb-screen-sign-up';
	this.SIGN_UP_SUCCESS_SCREEN_CLASS = '.anime-cb-screen-sign-up-success';

	this.CHECK_IF_USER_LOGGED_IN_INTERVAL_MS = 5000;
};

logInSignUpController.prototype.initElements = function() {
	this.$signUpInputs = $(this.SIGN_UP_FORM_CLASS).find('input');
	this.$loginInputs = $(this.LOGIN_FORM_CLASS).find('input');
};

logInSignUpController.prototype.initListeners = function() {
	var _self = this;

	$(this.CHANGE_TO_MAIN_MENU_SCREEN_BTN_CLASS).on('click', function(e) {
		_self.switchToMainMenuScreen();
	});

	$(this.CHANGE_TO_SIGNUP_SCREEN_BTN_CLASS).on('click', function(e) {
		_self.switchToSignUpScreen();
	});

	$(this.CHANGE_TO_LOGIN_SCREEN_CLASS_BTN_CLASS).on('click', function(e) {
		_self.switchToLoginScreen();
	});

	$(this.SIGN_OUT_BTN_ID).on('click', function(e) {
		console.log('Trying to logout...');

	  _self.showLogOutSpinner();

	  _self.client.sendLogOutRequest();
	});

	$(this.SIGN_UP_SUBMIT_BTN_ID).on('click', function(e) {
		e.preventDefault();

	  var values = {};
	  console.log('SignUpInputs: ', _self.$signUpInputs);
	  _self.$signUpInputs.each(function() {
	      values[this.name] = $(this).val();
	  });

	  console.log('Form signup values: ', values);

	  _self.showSignUpSpinner();

	  _self.client.sendSignUpData(values);
	});

	$(this.LOGIN_SUBMIT_BTN_ID).on('click', function(e) {
		e.preventDefault();

	  var values = {};
	  _self.$loginInputs.each(function() {
	      values[this.name] = $(this).val();
	  });

	  console.log('Form login values: ', values);

	  _self.showLoginSpinner();

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

logInSignUpController.prototype.initPolls = function() {
};

logInSignUpController.prototype.checkIsUserLoggedIn = function() {
	console.log('checkIsUserLoggedIn');
	this.client.checkIfUserIsLoggedIn();
};

logInSignUpController.prototype.processSignUpResponse = function(data) {
	console.log('processSignUpResponse');
	console.log('To validate: ', data);

  assert(ajv.validate(signUpResponse, data), 'SignUpResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		console.log('Data is valid: ', data);
		assert(typeof data.userMessage !== 'undefined');
		this.showSignUpSuccess(data);
	} else {
		assert(data.errors.length > 0);
		console.log('There are validation errors: ', data.errors);
		this.renderSignUpErrors(data);
	}
};

logInSignUpController.prototype.processLoginResponse = function(data) {
	console.log('processLoginResponse');
	console.log('To validate: ', data);

  assert(ajv.validate(logInResponse, data), 'LogInResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		console.log('Data is valid: ', data);
		this.isUserLoggedIn = true;
		this.showLoginSuccess(data);
	} else {
		assert(data.errors.length > 0);
		console.log('There are validation errors: ', data.errors);
		this.renderLoginErrors(data);
	}
};

logInSignUpController.prototype.processLogoutResponse = function(data) {
	console.log('processLogoutResponse');
	console.log('To validate: ', data);

  assert(ajv.validate(logOutResponse, data), 'LogOutResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		console.log('Data is valid: ', data);
		this.isUserLoggedIn = false;
		this.showLogOutSuccess(data);
	} else {
		assert(data.errors.length > 0);
		console.log('There are validation errors: ', data.errors);
		this.showAlertError();
	}
};

logInSignUpController.prototype.processIsUserLoggedInResponse = function(data) {
	console.log('processIsUserLoggedInResponse');
	console.log('To validate: ', data);

  assert(ajv.validate(isUserLoggedInResponse, data), 'isUserLoggedInResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (data.isSuccessful) {
		console.log('Data is valid: ', data);
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
	console.log('showSignUpErrors');
	console.log('Data: ', data);

	this.clearSignUpErrors();
	this.hideSignUpErrors();

	this.$signUpInputs.each(function(idx, input) {
		data.errors.forEach(function (el) {
			var elName = el.dataPath.split('/')[1];

			if (input.name === elName) {
				$(input).parent().find('.errors').html('<span>' + el.message + '</span>');
				$(input).parent().find('.errors').show();
			}
		});
	 });

	this.hideAllSpinner();
};

logInSignUpController.prototype.showSignUpSuccess = function(data) {
	console.log('showSignUpSuccess');
	console.log('Data: ', data);

	this.switchToSignUpSuccessScreen();
	this.processChangeScreen(this.SIGN_UP_SUCCESS_SCREEN_CLASS);

	$(this.USER_MESSAGE_CLASS).html('<span>' + data.userMessage + '</span>');
};

logInSignUpController.prototype.renderLoginErrors = function(data) {
	console.log('showLoginErrors');
	console.log('Data: ', data);

	this.clearLoginErrors();
	this.hideLoginErrors();

	this.$loginInputs.each(function(idx, input) {
		data.errors.forEach(function (el) {
			var elName = el.dataPath.split('/')[1];

			if (input.name === elName) {
				$(input).parent().find('.errors').html('<span>' + el.message + '</span>');
				$(input).parent().find('.errors').show();
			}
		});
	 });

	this.hideAllSpinner();
};

logInSignUpController.prototype.showLoginSuccess = function(data) {
	console.log('showLoginSuccess');
	console.log('Data: ', data);

	this.switchMainMenuToLoggedIn();
	this.switchToMainMenuScreen();
	this.processChangeScreen(this.MAIN_MENU_SCREEN_CLASS);
};

logInSignUpController.prototype.showLogOutSuccess = function(data) {
	console.log('showLogOutSuccess');
	console.log('Data: ', data);

	this.hideAllPreSpinner();
	this.switchMainMenuToLoggedOut();
	this.switchToMainMenuScreen();
};

logInSignUpController.prototype.switchToSignUpScreen = function() {
	this.hideScreens();
	this.resetAllScreens();
	this.showSignUpScreen();
};

logInSignUpController.prototype.switchToSignUpSuccessScreen = function() {
	this.hideScreens();
	this.resetAllScreens();
	this.showSignUpSuccessScreen();
};

logInSignUpController.prototype.switchToLoginScreen = function() {
	this.hideScreens();
	this.resetAllScreens();
	this.showLoginScreen();
};

logInSignUpController.prototype.switchMainMenuToLoggedIn = function() {
	$(this.MAIN_MENU_SCREEN_CLASS).find('.logged-out').hide();
	$(this.MAIN_MENU_SCREEN_CLASS).find('.logged-in').show();
};

logInSignUpController.prototype.switchMainMenuToLoggedOut = function() {
	$(this.MAIN_MENU_SCREEN_CLASS).find('.logged-in').hide();
	$(this.MAIN_MENU_SCREEN_CLASS).find('.logged-out').show();
};

logInSignUpController.prototype.showLoginScreen = function() {
	$(this.LOGIN_SCREEN_CLASS).show();
};

logInSignUpController.prototype.showSignUpScreen = function() {
	$(this.SIGN_UP_SCREEN_CLASS).show();
};

logInSignUpController.prototype.showSignUpSuccessScreen = function() {
	$(this.SIGN_UP_SUCCESS_SCREEN_CLASS).show();
};

logInSignUpController.prototype.clearSignUpInputs = function() {
	this.$signUpInputs.val('');
};

logInSignUpController.prototype.clearLoginInputs = function() {
	this.$loginInputs.val('');
};

logInSignUpController.prototype.clearSignUpErrors = function() {
	this.$signUpInputs.parent().find('.errors').html('');
};

logInSignUpController.prototype.showSignUpErrors = function() {
	this.$signUpInputs.parent().find('.errors').show();
};

logInSignUpController.prototype.hideSignUpErrors = function() {
	this.$signUpInputs.parent().find('.errors').hide();
};

logInSignUpController.prototype.clearLoginErrors = function() {
	this.$loginInputs.parent().find('.errors').html('');
};

logInSignUpController.prototype.showLoginErrors = function() {
	this.$loginInputs.parent().find('.errors').show();
};

logInSignUpController.prototype.hideLoginErrors = function() {
	this.$loginInputs.parent().find('.errors').hide();
};

logInSignUpController.prototype.showLoginSpinner = function() {
	$(this.LOGIN_FORM_CLASS).find(this.SPINNER_CLASS).show();
};

logInSignUpController.prototype.showSignUpSpinner = function() {
	$(this.SIGN_UP_FORM_CLASS).find(this.SPINNER_CLASS).show();
};

logInSignUpController.prototype.showLogOutSpinner = function() {
	$(this.MAIN_MENU_SCREEN_CLASS).find(this.PRE_SCREEN_SPINNER_CLASS).show();
};