var loginSignUpController = function(generalClient) {
	this.client = generalClient;
	this.initConstants();
	this.initElements();
	this.initListeners();
};

loginSignUpController.prototype.initConstants = function() {
	this.SIGN_UP_FORM = '#anime-cb-signup-form';
	this.SIGN_UP_SUBMIT_BTN = '#anime-cb-submit-sign-up';
	this.RESET_SIGN_UP_BTN = '#anime-cb-reset-sign-up';
	this.LOGIN_SUBMIT_BTN = '#anime-cb-submit-login';
	this.LOGIN_FORM = '#anime-cb-login-form';
	this.RESET_LOGIN_BTN = '#anime-cb-reset-login';
	this.SCREENS = '.anime-cb-screen';
	this.CHANGE_SCREEN_BTNS = '.anime-cb-button';
};

loginSignUpController.prototype.initElements = function() {
	this.$signUpInputs = $(this.SIGN_UP_FORM).find('input');
	this.$loginInputs = $(this.LOGIN_FORM).find('input');
};

loginSignUpController.prototype.initListeners = function() {
	var _self = this;

	$('.main-menu-btn').on('click', function(e) {
		_self.hideScreens();
		$('.anime-cb-main-menu').show();
	});

	$('.signup-btn').on('click', function(e) {
		_self.hideScreens();
		$('.anime-cb-sign-up').show();
	});

	$('.login-btn').on('click', function(e) {
		_self.hideScreens();
		$('.anime-cb-login').show();
	});

	$(this.CHANGE_SCREEN_BTNS).on('click', function(e) {
		_self.clearAllUserMessages();
		history.replaceState(null, null, '/');
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

	  console.log('Form loign values: ', values);

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

loginSignUpController.prototype.processSignUpResponse = function(data) {
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

loginSignUpController.prototype.processLoginResponse = function(data) {
	console.log('processLoginResponse');
	console.log('To validate: ', data);

  assert(ajv.validate(loginResponse, data), 'LoginResponse is invalid' +
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

loginSignUpController.prototype.renderSignUpErrors = function(data) {
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

loginSignUpController.prototype.showSignUpSuccess = function(data) {
	console.log('showSignUpSuccess');
	console.log('Data: ', data);

	this.hideScreens();
	$('.anime-cb-sign-up-success').show();
	this.clearSignUpInputs();
	this.clearSignUpErrors();
	this.hideSignUpErrors();
	this.clearLoginInputs();
	this.clearLoginErrors();
	this.hideLoginErrors();
	this.hideAllSpinner();

	$('.user-message').html('<span>' + data.userMessage + '</span>');
};

loginSignUpController.prototype.renderLoginErrors = function(data) {
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

loginSignUpController.prototype.showLoginSuccess = function(data) {
	console.log('showLoginSuccess');
	console.log('Data: ', data);

	this.clearSignUpInputs();
	this.clearSignUpErrors();
	this.hideSignUpErrors();
	this.clearLoginInputs();
	this.clearLoginErrors();
	this.hideLoginErrors();
	this.hideAllSpinner();

	// TODO Not like that
	$('.user-message').html('<span>' + data.userMessage + '</span>');
};

loginSignUpController.prototype.clearSignUpInputs = function() {
	this.$signUpInputs.val('');
};

loginSignUpController.prototype.clearLoginInputs = function() {
	this.$loginInputs.val('');
};

loginSignUpController.prototype.clearSignUpErrors = function() {
	this.$signUpInputs.parent().find('.errors').html('');
};

loginSignUpController.prototype.showSignUpErrors = function() {
	this.$signUpInputs.parent().find('.errors').show();
};

loginSignUpController.prototype.hideSignUpErrors = function() {
	this.$signUpInputs.parent().find('.errors').hide();
};

loginSignUpController.prototype.clearLoginErrors = function() {
	this.$loginInputs.parent().find('.errors').html('');
};

loginSignUpController.prototype.showLoginErrors = function() {
	this.$loginInputs.parent().find('.errors').show();
};

loginSignUpController.prototype.hideLoginErrors = function() {
	this.$loginInputs.parent().find('.errors').hide();
};

loginSignUpController.prototype.hideScreens = function() {
	$(this.SCREENS).hide();
};

loginSignUpController.prototype.showLoginSpinner = function() {
	$(this.LOGIN_FORM).find('.spinner').show();
};

loginSignUpController.prototype.showSignUpSpinner = function() {
	$(this.SIGN_UP_FORM).find('.spinner').show();
};

loginSignUpController.prototype.showAllSpinner = function() {
	$('.spinner').show();
};

loginSignUpController.prototype.hideAllSpinner = function() {
	$('.spinner').hide();
};

loginSignUpController.prototype.clearAllUserMessages = function() {
	$('.user-message').html('');
};