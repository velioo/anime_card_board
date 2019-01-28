var logInSignUpController = function(generalClient) {
	this.client = generalClient;
	this.initConstants();
	this.initElements();
	this.initListeners();
};

logInSignUpController.prototype.initConstants = function() {
	this.FORM = '.anime-cb-form';
	this.SIGN_UP_FORM = '#anime-cb-signup-form';
	this.LOGIN_FORM = '#anime-cb-login-form';

	this.SIGN_UP_SUBMIT_BTN = '#anime-cb-submit-sign-up';
	this.RESET_SIGN_UP_BTN = '#anime-cb-reset-sign-up';
	this.LOGIN_SUBMIT_BTN = '#anime-cb-submit-login';
	this.RESET_LOGIN_BTN = '#anime-cb-reset-login';
	this.SIGN_OUT_BTN = '.logout-btn';
	this.CHANGE_SCREEN_BTNS = '.anime-cb-button';

	this.CHANGE_TO_MAIN_MENU_SCREEN_BTN = '.main-menu-btn';
	this.CHANGE_TO_LOGIN_SCREEN_BTN = '.login-btn';
	this.CHANGE_TO_SIGNUP_SCREEN_BTN = '.signup-btn';

	this.SCREENS = '.anime-cb-screen';
	this.MAIN_MENU_SCREEN = '.anime-cb-main-menu';
	this.LOGIN_SCREEN = '.anime-cb-login';
	this.SIGN_UP_SCREEN = '.anime-cb-sign-up';
	this.SIGN_UP_SUCCESS_SCREEN = '.anime-cb-sign-up-success';

	this.SPINNER = '.spinner';
	this.PRE_SCREEN_SPINNER = '.pre-screen-spinner';
};

logInSignUpController.prototype.initElements = function() {
	this.$signUpInputs = $(this.SIGN_UP_FORM).find('input');
	this.$loginInputs = $(this.LOGIN_FORM).find('input');
	this.$allInputs = $(this.FORM).find('input');
};

logInSignUpController.prototype.initListeners = function() {
	var _self = this;

	$(this.CHANGE_TO_MAIN_MENU_SCREEN_BTN).on('click', function(e) {
		_self.switchToMainMenuScreen();
	});

	$(this.CHANGE_TO_SIGNUP_SCREEN_BTN).on('click', function(e) {
		_self.switchToSignUpScreen();
	});

	$(this.CHANGE_TO_LOGIN_SCREEN_BTN).on('click', function(e) {
		_self.switchToLoginScreen();
	});

	$(this.SIGN_OUT_BTN).on('click', function(e) {
		console.log('Trying to logout...');

	  _self.showLogOutSpinner();

	  _self.client.sendLogOutRequest();
	});

	$(this.CHANGE_SCREEN_BTNS).on('click', function(e) {
		_self.processChangeScreen(this);
	});

	$(this.SIGN_UP_SUBMIT_BTN).on('click', function(e) {
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

	$(this.LOGIN_SUBMIT_BTN).on('click', function(e) {
		e.preventDefault();

	  var values = {};
	  _self.$loginInputs.each(function() {
	      values[this.name] = $(this).val();
	  });

	  console.log('Form login values: ', values);

	  _self.showLoginSpinner();

	  _self.client.sendLoginData(values);
	});

	$(this.RESET_SIGN_UP_BTN).on('click', function(e) {
		e.preventDefault();
	  _self.clearSignUpInputs();
	  _self.clearSignUpErrors();
	  _self.hideSignUpErrors();
	});

	$(this.RESET_LOGIN_BTN).on('click', function(e) {
		e.preventDefault();
		_self.clearLoginInputs();
	  _self.clearLoginErrors();
	  _self.hideLoginErrors();
	});
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
		this.showLogOutSuccess(data);
	} else {
		assert(data.errors.length > 0);
		console.log('There are validation errors: ', data.errors);
		this.showAlertError();
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

	$('.user-message').html('<span>' + data.userMessage + '</span>');
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
};

logInSignUpController.prototype.showLogOutSuccess = function(data) {
	console.log('showLogOutSuccess');
	console.log('Data: ', data);

	this.hideAllPreSpinner();
	this.switchMainMenuToLoggedOut();
	this.switchToMainMenuScreen();
};

logInSignUpController.prototype.switchToMainMenuScreen = function() {
	this.hideScreens();
	this.resetAllScreens();
	this.showMainMenuScreen();
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

logInSignUpController.prototype.resetAllScreens = function() {
	this.clearAllInputs();
	this.clearAllErrors();
	this.hideAllErrors();
	this.clearAllUserMessages();
	this.hideAllSpinner();
};

logInSignUpController.prototype.switchMainMenuToLoggedIn = function() {
	$(this.MAIN_MENU_SCREEN).find('.logged-out').hide();
	$(this.MAIN_MENU_SCREEN).find('.logged-in').show();
};

logInSignUpController.prototype.switchMainMenuToLoggedOut = function() {
	$(this.MAIN_MENU_SCREEN).find('.logged-in').hide();
	$(this.MAIN_MENU_SCREEN).find('.logged-out').show();
};

logInSignUpController.prototype.showMainMenuScreen = function() {
	$(this.MAIN_MENU_SCREEN).show();
};

logInSignUpController.prototype.showLoginScreen = function() {
	$(this.LOGIN_SCREEN).show();
};

logInSignUpController.prototype.showSignUpScreen = function() {
	$(this.SIGN_UP_SCREEN).show();
};

logInSignUpController.prototype.showSignUpSuccessScreen = function() {
	$(this.SIGN_UP_SUCCESS_SCREEN).show();
};

logInSignUpController.prototype.clearAllInputs = function() {
	this.$allInputs.val('');
};

logInSignUpController.prototype.clearAllErrors = function() {
	this.$allInputs.parent().find('.errors').html('');
};

logInSignUpController.prototype.hideAllErrors = function() {
	this.$allInputs.parent().find('.errors').hide();
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

logInSignUpController.prototype.hideScreens = function() {
	$(this.SCREENS).hide();
};

logInSignUpController.prototype.showLoginSpinner = function() {
	$(this.LOGIN_FORM).find(this.SPINNER).show();
};

logInSignUpController.prototype.showSignUpSpinner = function() {
	$(this.SIGN_UP_FORM).find(this.SPINNER).show();
};

logInSignUpController.prototype.showLogOutSpinner = function() {
	$(this.MAIN_MENU_SCREEN).find(this.PRE_SCREEN_SPINNER).show();
};

logInSignUpController.prototype.showAllSpinner = function() {
	$(this.SPINNER).show();
};

logInSignUpController.prototype.hideAllSpinner = function() {
	$(this.SPINNER).hide();
};

logInSignUpController.prototype.hideAllPreSpinner = function() {
	$(this.PRE_SCREEN_SPINNER).hide();
};

logInSignUpController.prototype.clearAllUserMessages = function() {
	$('.user-message').html('');
};

logInSignUpController.prototype.showAlertError = function(msg) {
	msg = msg || 'There was a problem while processing your request. Please try again later.';
	window.alert(msg);
};

logInSignUpController.prototype.processChangeScreen = function(btn) {
	this.resetAllScreens();
	history.replaceState(null, null, '/');
};