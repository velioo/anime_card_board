var _isBaseControllerStateInited = false;
var _isBaseControllerListenersInited = false;
var _lastHistoryState = history.state;

var _lastScreenClass = null;
if (_lastHistoryState) {
	_lastScreenClass = history.state.screenClass;
}

var baseController = function(client) {
	var _self = this;

	_self.client = client;

	_self._initConstants();
	_self._initElements();

	if (!_isBaseControllerListenersInited) {
		_self._initListeners();
		_isBaseControllerListenersInited = true;
	}

	logger.info('History state: ', JSON.stringify(history.state));
};

baseController.prototype._initConstants = function() {
	var _self = this;

	_self.FORM_CLASS = '.anime-cb-form';
	_self.MAIN_WRAPPER_ID = '#acb-main-wrapper';
	_self.SUBMAIN_WRAPPER_ID = '#acb-submain-wrapper'
	_self.INFO_HEADER_ID = '#acb-info-header';
	_self.CHAT_WRAPPER_ID = '#acb-chat-wrapper';

	_self.CHANGE_SCREEN_BTNS_CLASS = '.anime-cb-button, .anime-cb-button-no-style';

	_self.SCREEN_CLASS_PREFIX = '.anime-cb-screen-';
	_self.SCREENS_CLASS = '.anime-cb-screen';
	_self.SCREEN_BTN_PREFIX = 'anime-cb-btn-';
	_self.MAIN_MENU_SCREEN_CLASS = '.anime-cb-screen-main-menu';
	_self.LOGIN_SCREEN_CLASS = '.anime-cb-screen-login';
	_self.SIGN_UP_SCREEN_CLASS = '.anime-cb-screen-sign-up';
	_self.SIGN_UP_SUCCESS_SCREEN_CLASS = '.anime-cb-screen-sign-up-success';
	_self.CREATE_ROOM_SCREEN_CLASS = '.anime-cb-screen-create-room';
	_self.BROWSE_ROOMS_SCREEN_CLASS = '.anime-cb-screen-browse-rooms';
	_self.LOBBY_SCREEN_CLASS = '.anime-cb-screen-lobby';
	_self.GAME_SCREEN_CLASS = '.anime-cb-screen-game';
	_self.MATCHMAKING_SCREEN_CLASS = '.anime-cb-screen-matchmaking';
	_self.SETTINGS_SCREEN_CLASS = '.anime-cb-screen-settings';
	_self.PLAY_SCREEN_CLASS = '.anime-cb-screen-play';
	_self.INFO_SCREEN_CLASS = '.anime-cb-screen-info';
	_self.RULES_SCREEN_CLASS = '.anime-cb-screen-rules';
	_self.CARDS_SCREEN_CLASS = '.anime-cb-screen-cards';
	_self.CHARACTERS_SCREEN_CLASS = '.anime-cb-screen-characters';
	_self.ABOUT_SCREEN_CLASS = '.anime-cb-screen-about';

	_self.USER_MESSAGE_CLASS = '.user-message';
	_self.CHARACTER_CHOOSE_CLASS = '.anime-cb-character-choose';
	_self.SPINNER_CLASS = '.spinner';
	_self.MAIN_SPINNER_CLASS = '.main.spinner';
	_self.PRE_SCREEN_SPINNER_CLASS = '.pre-screen-spinner';
	_self.SCREEN_FOOTER_CLASS = '.anime-cb-screen_footer';
	_self.INPUT_ERRORS_CLASS = '.errors';

	_self.LOGGED_IN_BLACKLISTED_SCREENS = [
		_self.LOGIN_SCREEN_CLASS,
		_self.SIGN_UP_SCREEN_CLASS,
		_self.SIGN_UP_SUCCESS_SCREEN_CLASS,
	];

	_self.LOGGED_OUT_WHITELISTED_SCREENS = [
		_self.MAIN_MENU_SCREEN_CLASS,
		_self.LOGIN_SCREEN_CLASS,
		_self.SIGN_UP_SCREEN_CLASS,
		_self.SIGN_UP_SUCCESS_SCREEN_CLASS,
		_self.INFO_SCREEN_CLASS,
		_self.RULES_SCREEN_CLASS,
		_self.CARDS_SCREEN_CLASS,
		_self.ABOUT_SCREEN_CLASS,
	];

	_self.IGNORE_SCREENS = [
		_self.LOBBY_SCREEN_CLASS,
		_self.GAME_SCREEN_CLASS,
	];
};

baseController.prototype._initElements = function() {
	this.$allInputs = $(this.FORM_CLASS).find('input, textarea');
};

baseController.prototype._initListeners = function() {
	var _self = this;

	$(_self.SCREENS_CLASS).on('click', _self.CHANGE_SCREEN_BTNS_CLASS , function(e) {
		_self.processChangeScreen(this);
	});

	window.addEventListener('popstate', function(e) {
	  var stateObj = e.state;

	  if (_lastHistoryState) {
	  	_lastScreenClass = _lastHistoryState.screenClass;
	  }

	  if ((stateObj === null) || (_self.IGNORE_SCREENS.includes(stateObj.screenClass))) {
	  	_self.switchToScreen(_self.MAIN_MENU_SCREEN_CLASS);
	  } else {
		  _self.switchToScreen(stateObj.screenClass);
		}
	});
};

baseController.prototype._initState = function() {
  var stateObj = history.state;
  var _self = this;

	if (stateObj !== null) {
		if (!_self.IGNORE_SCREENS.includes(stateObj.screenClass)) {
	  	_self.switchToScreen(stateObj.screenClass);
		}
	}

	$(_self.SUBMAIN_WRAPPER_ID).show();

	_isBaseControllerStateInited = true;
};

baseController.prototype.switchToScreen = function(screenClass) {
	assert(screenClass.charAt(0) === '.',
		'screenClass must be a valid css selector: ' + screenClass);

	logger.info('Switching to screen: ', screenClass);
	var _self = this;

	_self.preSwitchScreenHook(screenClass);

  _self.hideScreens();
	_self.resetAllScreens();

	console.log('switchToScreen: ', screenClass);

	if (_self.client.logInSignUpController.isUserLoggedIn()) {
		if (_self.LOGGED_IN_BLACKLISTED_SCREENS.includes(screenClass)) {
			$(_self.MAIN_MENU_SCREEN_CLASS).show();
		} else {
			$(screenClass).show();
		}
	} else {
		if (_self.LOGGED_OUT_WHITELISTED_SCREENS.includes(screenClass)) {
			$(screenClass).show();
		} else {
			$(_self.MAIN_MENU_SCREEN_CLASS).show();
		}
	}

	_self.postSwitchScreenHook(screenClass);
};

baseController.prototype.preSwitchScreenHook = function(screenClass) {
	var _self = this;

	if (screenClass == _self.GAME_SCREEN_CLASS || !_self.client.logInSignUpController.isUserLoggedIn()) {
		$(_self.INFO_HEADER_ID).hide();
		$(_self.CHAT_WRAPPER_ID).hide();
	} else {
		$(_self.INFO_HEADER_ID).show();
		$(_self.CHAT_WRAPPER_ID).show();
	}

	if (screenClass == _self.GAME_SCREEN_CLASS) {
		$(_self.VIDEO_BACKGROUND_WRAPPER_ID).hide();
	} else if (_self.client.logInSignUpController._settings.videoBackground) {
		$(_self.VIDEO_BACKGROUND_WRAPPER_ID).show();
	}

	if (typeof _self.client.roomController.preSwitchScreenHookRoomController === "function") {
		_self.client.roomController.preSwitchScreenHookRoomController(screenClass);
	}

	if (typeof _self.client.logInSignUpController.preSwitchScreenHookLogInSignUpController === "function") {
		_self.client.logInSignUpController.preSwitchScreenHookLogInSignUpController(screenClass);
	}
};

baseController.prototype.postSwitchScreenHook = function(screenClass) {
	logger.info('postSwitchScreenHook');
	console.log('postSwitchScreenHook');

	var _self = this;

	if (typeof _self.client.roomController.postSwitchScreenHookRoomController === "function") {
		_self.client.roomController.postSwitchScreenHookRoomController(screenClass);
	}

	window.removeEventListener("beforeunload", _self.client.gameController.beforeUnload);
	if (screenClass != _self.GAME_SCREEN_CLASS) {
		_self.client.gameController.resetGameState();
	}

	$('html').scrollTop(0);
};

baseController.prototype.resetAllScreens = function() {
	var _self = this;

	_self.clearAllInputs();
	_self.clearAllErrors();
	_self.hideAllErrors();
	_self.clearAllUserMessages();
	_self.hideAllSpinner();
};

baseController.prototype.clearAllUserMessages = function() {
	$(this.USER_MESSAGE_CLASS).html('');
};

baseController.prototype.clearAllInputs = function() {
	this.$allInputs.val('');
};

baseController.prototype.clearAllErrors = function() {
	this.$allInputs.parent().find(this.INPUT_ERRORS_CLASS).html('');
	$(this.SCREENS_CLASS).find('.errors').html('');
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
	this.$allInputs.parent().find(this.INPUT_ERRORS_CLASS).hide();
};

baseController.prototype.disableElement = function(elSelector) {
	$(elSelector).prop('disabled', true);
};

baseController.prototype.enableElement = function(elSelector) {
	$(elSelector).prop('disabled', false);
};

baseController.prototype.enableAllElements = function() {
	$(this.FORM_CLASS).find('input, button').prop('disabled', false);
};

baseController.prototype.showAlertError = function(msg) {
	msg = msg || 'There was a problem while processing your request. Please try again later.';
	window.alert(msg);
};

baseController.prototype.showElement = function (el) {
	console.log('show elements: ', el);
	$(el).show();
};

baseController.prototype.hideElement = function (el) {
	$(el).hide();
};
// Gets the closest screen class relatively from an element 'el' beneath it
// baseController.prototype.extractScreenClass = function(el) {
// 	var screenClass = null;

// 	var classes = el.classList;

//   for (var i = 0; i < classes.length; i++) {
//   	if (classes[i].startsWith(this.SCREEN_CLASS_PREFIX.substr(1))) {
// 			screenClass = '.' + classes[i];
// 			break;
// 		}
//   }

// 	return screenClass;
// };

baseController.prototype.extractBaseScreenClass = function(btn) {
	var _self = this;
	var btnScreenClass = null;
	var classes = btn.classList;

  for (var i = 0; i < classes.length; i++) {
  	if (classes[i].startsWith(_self.SCREEN_BTN_PREFIX)) {
			btnScreenClass = classes[i];
			break;
		}
  }

  if (btnScreenClass === null) {
  	return null;
  }

  var splittedClass = btnScreenClass.split(_self.SCREEN_BTN_PREFIX);
  assert(splittedClass.length > 1, 'Screen btn class name is invalid: ' + splittedClass[0]);

  var baseScreenClass = splittedClass[1];

	return baseScreenClass;
};

baseController.prototype.createUrlFromScreenClass = function(screenClass) {
	var _self = this;
	var splittedClass = screenClass.split(_self.SCREEN_CLASS_PREFIX);

	assert(splittedClass.length > 1, 'Screen class name is invalid: ' + splittedClass[0]);

	var url = splittedClass[1];

	return url;
};

/*
1) If input is a button with a class 'anime-cb-btn-main-menu' then 'main-menu' will be
extracted as baseClass and added to SCREEN_CLASS_PREFIX to create the screenClass.
Then url will be assigned to baseClass.

2) If input is a string '.anime-cb-screen-sign-up' then screenClass will be
assigned to it and 'sign-up' will be assgiend to the url of the page.
*/
baseController.prototype.processChangeScreen = function(input) {
	var _self = this;

	_self.resetAllScreens();

	var screenClass = null;
	var baseScreenClass = null;

	if (typeof input === 'object') {
		baseScreenClass = _self.extractBaseScreenClass(input);

		assert(baseScreenClass !== null, 'Failed to get base screen class');

		screenClass = _self.SCREEN_CLASS_PREFIX + baseScreenClass;
	} else if (typeof input === 'string') {
		screenClass = input;
	} else {
		assert(0, 'Cannot process changeScreen event, bad input: ', input);
	}

	logger.info('Pushing to history screen class: ', screenClass);

	var url = baseScreenClass !== null ? baseScreenClass : _self.createUrlFromScreenClass(screenClass);
	var stateObj = { screenClass: screenClass };

	if (history.state) {
		_lastScreenClass = history.state.screenClass;
		console.log('History state: ', history.state.screenClass);
	}

	history.pushState(stateObj, null, url);

	_lastHistoryState = history.state;

	_self.switchToScreen(screenClass);
};

var getRandomInt = function (min, max) {
	min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var getKeyByValue = function (object, value) {
	return Object.keys(object).find(key => object[key] === value);
};