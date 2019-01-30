var baseController = function(generalClient) {
	this.client = generalClient;
	this._initConstants();
	this._initElements();
	this._initListeners();
	this.isStateInited = false;
	// this._initState();

	console.log('History state: ', history.state);
};

baseController.prototype._initConstants = function() {
	this.FORM_CLASS = '.anime-cb-form';
	this.MAIN_WRAPPER_ID = '#acb-main-wrapper';
	this.SUBMAIN_WRAPPER_ID = '#acb-submain-wrapper'

	this.CHANGE_SCREEN_BTNS_CLASS = '.anime-cb-button';

	this.SCREEN_CLASS_PREFIX = 'anime-cb-screen-';
	this.SCREENS_CLASS = '.anime-cb-screen';
	this.MAIN_MENU_SCREEN_CLASS = '.anime-cb-screen-main-menu';
	this.SCREEN_BTN_PREFIX = 'anime-cb-btn-';

	this.USER_MESSAGE_CLASS = '.user-message';
	this.SPINNER_CLASS = '.spinner';
	this.PRE_SCREEN_SPINNER_CLASS = '.pre-screen-spinner';
};

baseController.prototype._initElements = function() {
	this.$allInputs = $(this.FORM_CLASS).find('input');
};

baseController.prototype._initListeners = function() {
	var _self = this;

	$(this.CHANGE_SCREEN_BTNS_CLASS).on('click', function(e) {
		console.log(_self.isUserLoggedIn);
		_self.processChangeScreen(this);
	});

	window.addEventListener('popstate', function(e) {
	  var stateObj = e.state;

	  if (stateObj === null) {
	  	_self.switchToMainMenuScreen();
	  } else {
		  var screenClass = '.' + stateObj.screenClass;
		  _self.switchToScreen(screenClass);
		}
	});
};

baseController.prototype._initState = function() {
  var stateObj = history.state;

	if (stateObj !== null) {
	  var screenClass = '.' + stateObj.screenClass;
	  this.switchToScreen(screenClass);
	}

	$(this.SUBMAIN_WRAPPER_ID).show();

	this.isStateInited = true;
};

baseController.prototype.switchToScreen = function(screenClass) {
  this.hideScreens();
	this.resetAllScreens();

	if (screenClass === this.LOGIN_SCREEN_CLASS && this.isUserLoggedIn === true) {
		$(this.MAIN_MENU_SCREEN_CLASS).show();
	} else if(screenClass === this.SIGN_UP_SCREEN_CLASS && this.isUserLoggedIn === true) {
		$(this.MAIN_MENU_SCREEN_CLASS).show();
	} else {
		$(screenClass).show();
	}
};

baseController.prototype.switchToMainMenuScreen = function() {
	this.hideScreens();
	this.resetAllScreens();
	this.showMainMenuScreen();
};

baseController.prototype.resetAllScreens = function() {
	this.clearAllInputs();
	this.clearAllErrors();
	this.hideAllErrors();
	this.clearAllUserMessages();
	this.hideAllSpinner();
};

baseController.prototype.clearAllUserMessages = function() {
	$(this.USER_MESSAGE_CLASS).html('');
};

baseController.prototype.clearAllInputs = function() {
	this.$allInputs.val('');
};

baseController.prototype.clearAllErrors = function() {
	this.$allInputs.parent().find('.errors').html('');
};

baseController.prototype.showMainMenuScreen = function() {
	$(this.MAIN_MENU_SCREEN_CLASS).show();
};

baseController.prototype.showAllSpinner = function() {
	$(this.SPINNER_CLASS).show();
};

baseController.prototype.hideScreens = function() {
	$(this.SCREENS_CLASS).hide();
};

baseController.prototype.hideAllSpinner = function() {
	$(this.SPINNER_CLASS).hide();
};

baseController.prototype.hideAllPreSpinner = function() {
	$(this.PRE_SCREEN_SPINNER_CLASS).hide();
};

baseController.prototype.hideAllErrors = function() {
	this.$allInputs.parent().find('.errors').hide();
};

baseController.prototype.showAlertError = function(msg) {
	msg = msg || 'There was a problem while processing your request. Please try again later.';
	window.alert(msg);
};

// Gets the closest screen class relatively from an element 'el' beneath it
// baseController.prototype.extractScreenClass = function(el) {
// 	var screenClass = null;

// 	var classes = el.classList;

//   for (var i = 0; i < classes.length; i++) {
//   	if (classes[i].startsWith(this.SCREEN_CLASS_PREFIX)) {
// 			screenClass = classes[i];
// 			break;
// 		}
//   }

// 	return screenClass;
// };

baseController.prototype.extractBaseScreenClass = function(btn) {
	var btnScreenClass = null;

	var classes = btn.classList;

  for (var i = 0; i < classes.length; i++) {
  	if (classes[i].startsWith(this.SCREEN_BTN_PREFIX)) {
			btnScreenClass = classes[i];
			break;
		}
  }

  if (btnScreenClass === null) {
  	return null;
  }

  var splittedClass = btnScreenClass.split(this.SCREEN_BTN_PREFIX);

  assert(splittedClass.length > 1, 'Screen btn class name is invalid: ' + splittedClass[0]);

  var baseScreenClass = splittedClass[1];

	return baseScreenClass;
};

baseController.prototype.createUrlFromScreenClass = function(screenClass) {
	var splittedClass = screenClass.split(this.SCREEN_CLASS_PREFIX);

	assert(splittedClass.length > 1, 'Screen class name is invalid: ' + splittedClass[0]);

	var url = splittedClass[1];

	return url;
};

/*
1) If input is a btn with a class 'anime-cb-btn-main-menu' then 'main-menu' will be
extracted as baseClass and added to SCREEN_CLASS_PREFIX to create the screenClass.
Then url will be assigned to baseClass.

2) If input is a string 'anime-cb-screen-sign-up' then screenClass will be
assigned to it and 'sign-up' will be assgiend to the url of the page.
*/
baseController.prototype.processChangeScreen = function(input) {
	this.resetAllScreens();

	var screenClass = null;
	var baseScreenClass = null;

	if (typeof input === 'object') {
		baseScreenClass = this.extractBaseScreenClass(input);

		assert(baseScreenClass !== null, 'Failed to get base screen class');

		screenClass = this.SCREEN_CLASS_PREFIX + baseScreenClass;
	} else if (typeof input === 'string') {
		// Assuming input is something like '.anime-cb-btn-login'
		screenClass = input.substring(1);
	} else {
		assert(0, 'Cannot process changeScreen event, bad input: ', input);
	}

	logger.info('Screen class: ', screenClass);
	console.log('Screen class: ', screenClass);

	var url = baseScreenClass !== null ? baseScreenClass : this.createUrlFromScreenClass(screenClass);
	var stateObj = { screenClass: screenClass };

	history.pushState(stateObj, null, url);
};