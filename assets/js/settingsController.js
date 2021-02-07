var settingsController = function(generalClient) {
	var _self = this;

	baseController.call(_self, generalClient);

	_self.initConstants();
	_self.initElements();
	_self.initListeners();
	_self.initIntervals();
};

settingsController.prototype = Object.create(baseController.prototype);

Object.defineProperty(settingsController.prototype, 'constructor', {
    value: settingsController,
    enumerable: false,
    writable: true,
});

settingsController.prototype.initConstants = function() {
	var _self = this;

	_self.SETTINGS_FORM_ID = '#anime-cb-form-settings';

	_self.SETTINGS_SUBMIT_BTN_ID = '#anime-cb-submit-settings';
	_self.SETTINGS_VOLUME_LABEL_ID = '#anime-cb-setting-volume-label';
	_self.SETTINGS_VOLUME_INPUT_ID = '#anime-cb-setting-volume';
	_self.SETTINGS_CHARACTER_IMG_CLASS = '.anime-cb-character-img';
};

settingsController.prototype.initElements = function() {
	var _self = this;

	_self.$settingsInputs = $(_self.SETTINGS_FORM_ID).find('input, select');
	_self._settings = {};
};

settingsController.prototype.initListeners = function() {
	var _self = this;

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
};

settingsController.prototype.initIntervals = function() {
	var _self = this;
};

settingsController.prototype.processSettingsResponse = function(data) {
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

settingsController.prototype.reEnableSettingsSubmit = function () {
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

settingsController.prototype.renderSettingsErrors = function(data) {
	logger.info('renderSettingsErrors');

	var _self = this;

	_self.clearSettingsErrors();
	_self.hideSettingsErrors();

	$(_self.SETTINGS_SCREEN_CLASS).find(_self.INPUT_ERRORS_CLASS).append('<span>' + data.userMessage + '</span>');

	$(_self.SETTINGS_SCREEN_CLASS).find(_self.INPUT_ERRORS_CLASS).show();
	_self.enableElement(_self.SETTINGS_SUBMIT_BTN_ID);
	_self.hideAllSpinner();
};

settingsController.prototype.showSettingsSuccess = function(data) {
	var _self = this;

	_self.clearSettingsErrors();
	_self.hideSettingsErrors();
	_self.enableElement(_self.SETTINGS_SUBMIT_BTN_ID);

	$(_self.USER_MESSAGE_CLASS).html('<span>' + data.userMessage + '</span>');
};

settingsController.prototype.updateSettingsStatus = function (settings) {
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

settingsController.prototype.preSwitchScreenHookSettingsController = function (screenClass) {
	var _self = this;

	if (screenClass === _self.SETTINGS_SCREEN_CLASS) {
		_self.updateSettingsStatus(_self._settings);
	}
};

settingsController.prototype.showSettingsSpinner = function () {
	$(this.SETTINGS_FORM_ID).find(this.SPINNER_CLASS).show();
};

settingsController.prototype.clearSettingsErrors = function() {
	$(this.SETTINGS_SCREEN_CLASS).find(this.INPUT_ERRORS_CLASS).html('');
};

settingsController.prototype.hideSettingsErrors = function() {
	$(this.SETTINGS_SCREEN_CLASS).find(this.INPUT_ERRORS_CLASS).hide();
};