var gameController = function(client) {
	var _self = this;

	console.log('INIT GAME CONTROLLER');
	baseController.call(_self, client);

	_self.initConstants();
	_self.initElements();
	_self.initListeners();
	_self.initIntervals();
};

gameController.prototype = Object.create(baseController.prototype);

Object.defineProperty(gameController.prototype, 'constructor', {
    value: gameController,
    enumerable: false,
    writable: true,
});

gameController.prototype.initConstants = function() {
	var _self = this;

	_self.START_GAME_BTN_ID = '#anime-cb-start-game';
	_self.SURRENDER_BTN_ID = '#anime-cb-surrender';

	_self.PLAYER_YOU_CLASS = '.player-you';
	_self.PLAYER_ENEMY_CLASS = '.player-enemy';
	_self.ROOM_NAME_ID = '#anime-cb-title-page-game-room-name';
	_self.PLAYER_NAME_CLASS = '.anime-cb-board-player-label';
	_self.TIMER_CLASS = '.anime-cb-turn-timer-text';

	_self.BOARD_ID = '#anime-cb-board';
	_self.BOARD_ROW_CLASS = '.anime-cb-board-row';
	_self.BOARD_COLUMN_CLASS = '.anime-cb-column';
	_self.BOARD_PLAYER_YOU_ID = '#anime-cb-player-you-position';
	_self.BOARD_PLAYER_ENEMY_ID = '#anime-cb-player-enemy-position';
	_self.BOARD_PLAYER_CLASS = '.anime-cb-board-img';
	_self.DICE_THROW_CONTAINER_PLAYER_YOU_ID = '#anime-cb-dice-wrapper-player-you';
	_self.DICE_THROW_CONTAINER_PLAYER_ENEMY_ID = '#anime-cb-dice-wrapper-player-enemy';
	_self.BOARD_IMG_CLASS = '.anime-cb-board-img';

	_self.CARD_INFO_IMG_ID = '#anime-cb-card-info-card';
	_self.CARD_INFO_NAME_ID = '#anime-cb-card-info-card-name';
	_self.CARD_INFO_TEXT_ID = '#anime-cb-card-info-text';
	_self.CARD_ON_FIELD_CLASS = '.anime-cb-card-onfield';
	_self.CARD_CLASS = '.anime-cb-card';
	_self.CARDS_IN_HAND_WRAPPER_CLASS = '.anime-cb-cards-in-hand-wrapper';
	_self.CARDS_IN_HAND_CLASS = '.anime-cb-cards-in-hand';
	_self.CARD_FIELD_CLASS = '.anime-cb-card-field';

	_self.PHASE_DRAW_ID = '#anime-cb-phase-draw';
	_self.PHASE_STANDBY_ID = '#anime-cb-phase-standby';
	_self.PHASE_MAIN_ID = '#anime-cb-phase-main';
	_self.PHASE_ROLL_ID = '#anime-cb-phase-roll';
	_self.PHASE_END_ID = '#anime-cb-phase-end';
	_self.PHASE_COLUMN_CLASS = '.anime-cb-phase-column';

	_self.EVENTS_INFO_ID = '#anime-cb-game-events-info';
	_self.EVENTS_INFO_TEXT_ID = '#anime-cb-game-events-info-text';

	_self.DECK_GLOBAL_ID = '#anime-cb-card-global-deck';
	_self.DECK_GRAVEYARD_CLASS = '.anime-cb-card-graveyard-deck';
	_self.DECK_GRAVEYARD_WRAPPER_CLASS = '.anime-cb-card-graveyard-wrapper';
	_self.MODAL_GRAVEYARD_CLASS = '.graveyard-modal';
	_self.FOOTER_CLASS = '.anime-cb-screen_footer-game';

	_self.GAME_STATUS_CONTENT_CLASS = '.anime-cb-player-status-content';
	_self.ENERGY_POINTS_TEXT_CLASS = '.anime-cb-energy-points-text';
	_self.CARD_FIELD_CHARGES_WRAPPER_CLASS = '.anime-cb-card-field-charges-status-wrapper';
	_self.CARD_FIELD_CHARGES_CLASS = '.anime-cb-card-field-charges-status';
	_self.CHOOSE_CARD_EFFECT_CLASS = '.anime-cb-choose-card-effect';
	_self.CHOOSE_CARD_EFFECT_CHOICE_CLASS = '.anime-cb-choose-card-effect-choice';
	_self.CHOOSE_CARD_EFFECT_TITLE_CLASS = '.anime-cb-choose-card-effect-title';
	_self.ENERGY_REGEN_CLASS = '.anime-cb-energy-points-regen';
	_self.QUICK_GAME_INFO_CLASS = '.anime-cb-quick-game-info';
	_self.CHANGE_CHAIN_DECISION_CLASS = '.anime-cb-change-chain-decision';
	_self.ROLL_DIE_CLASS = '.anime-cb-roll-die';
};

gameController.prototype.initElements = function() {
	var _self = this;

	_self.TURN_PHASES = {
	  DRAW: 1,
	  STANDBY: 2,
	  MAIN: 3,
	  ROLL: 4,
	  END: 5,
	};

	_self.CARD_RARITIES = {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
	};

	_self.BOARD_FIELDS = {
	  NORMAL: 1,
	  ROLL_AGAIN_1: 2,
	  ROLL_AGAIN_2: 3,
	  ROLL_AGAIN_3: 4,
	  ROLL_AGAIN_BACKWARDS_1: 5,
	  CARD_DRAW_1: 6,
	  CARD_DRAW_2: 7,
	  CARD_DRAW_3: 8,
	  CARD_DISCARD_1: 9,
	  CARD_DISCARD_2: 10,
	  CARD_DISCARD_3: 11,
	  RANDOM_1: 12,
	  RANDOM_2: 13,
	  RANDOM_3: 14,
	  ROLL_AGAIN_BACKWARDS_2: 15,
  	ROLL_AGAIN_BACKWARDS_3: 16,
	};

	_self.BOARD_FIELDS_IMGS = {
	  NORMAL: "",
	  ROLL_AGAIN_1: "roll_again_1.png",
	  ROLL_AGAIN_2: "roll_again_2.png",
	  ROLL_AGAIN_3: "roll_again_3.png",
	  ROLL_AGAIN_BACKWARDS_1: "roll_again_back_1.png",
	  CARD_DRAW_1: "card_draw_1.png",
	  CARD_DRAW_2: "card_draw_2.png",
	  CARD_DRAW_3: "card_draw_3.png",
	  CARD_DISCARD_1: "card_discard_1.png",
	  CARD_DISCARD_2: "card_discard_2.png",
	  CARD_DISCARD_3: "card_discard_3.png",
	  RANDOM_1: "random_1.png",
	  RANDOM_2: "random_2.png",
	  RANDOM_3: "random_3.png",
	  ROLL_AGAIN_BACKWARDS_2: "roll_again_back_2.png",
  	ROLL_AGAIN_BACKWARDS_3: "roll_again_back_3.png",
	};

	_self.CARD_ATTRIBUTES = ["field", "cards", "energy"];
	_self.CARD_ATTRUBUTES_IMGS = {
		"field": "field_attr.png",
		"cards": "cards_attr.png",
		"energy": "energy_attr.png",
	};
};

gameController.prototype.initListeners = function() {
	var _self = this;

	$(_self.GAME_SCREEN_CLASS).on('click', _self.SURRENDER_BTN_ID, function(e) {
		if (confirm('Are you sure you want to surrender ?')) {
		  _self.processChangeScreen(_self.MAIN_MENU_SCREEN_CLASS);
		  window.removeEventListener("beforeunload", _self.beforeUnload);
		}
	});

	$(_self.GAME_SCREEN_CLASS).on('mousemove mouseover', _self.CARD_ON_FIELD_CLASS + ", " + _self.DECK_GRAVEYARD_CLASS, function(e) {
 		_self.fillInfoCard(this);
	});

	$(_self.GAME_SCREEN_CLASS).on('mousemove mouseover', _self.CARD_CLASS, function (e) {
		_self.handleCardHover.call(_self, e, this);
	});

	$(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
	  $(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
	  // $(_self.CARDS_IN_HAND_WRAPPER_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "hidden");
	});

	$(_self.GAME_SCREEN_CLASS).on('mousedown', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(0.9) rotateX(0) rotateY(0)");
	});

	$(_self.GAME_SCREEN_CLASS).on('mouseup', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(1.1) rotateX(0) rotateY(0)");
	});

	$(_self.CARDS_IN_HAND_CLASS).on('DOMMouseScroll mousewheel', _self.noScrollOnCardHover);

	$(_self.GAME_SCREEN_CLASS).on("click", _self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS, function() {
		_self.populateGraveyard(_self._yourUserId, _self.PLAYER_YOU_CLASS);
  	$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS).show();
	});

	$(_self.GAME_SCREEN_CLASS).on("click", _self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + ' .close', function() {
	  $(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS).hide();
	});

	$(_self.GAME_SCREEN_CLASS).on("click", _self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS, function() {
		_self.populateGraveyard(_self._enemyUserId, _self.PLAYER_ENEMY_CLASS);
	  $(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS).show();
	});

	$(_self.GAME_SCREEN_CLASS).on("click", _self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + ' .close', function() {
	  $(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS).hide();
	});

	$(window).on("click", function(e) {
	  if (e.target == $(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS)[0]) {
	    $(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS).hide();
	  } else if (e.target == $(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS)[0]) {
	  	$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS).hide();
	  }
	});
};

gameController.prototype.initIntervals = function() {

};

gameController.prototype.resetGameState = function () {
	var _self = this;

	console.log('RESET GAME STATE');

	if (_self._backgroundMusic) {
		_self._backgroundMusic.pause();
	}

	_self._gameplayData = null;
	_self._roomData = null;
	_self._cardsInHandArr = [];
	_self._yourName = null;
	_self._enemyName = null;
	_self._enemyUserId = null;
	_self._yourUserId = null;
	$(_self.GAME_SCREEN_CLASS + "*").off();
	clearInterval(_self.checkForCardYou);
	clearInterval(_self.checkForCardEnemy);
	_self.checkForCardYouIntervalEnabled = false;
	_self.checkForCardEnemyIntervalEnabled = false;
	_self._cardsDrawnYou = [];
	_self._cardsDrawnEnemy = 0;
	_self.drawCardAnimationsFinishedYou = true;
	_self.drawCardAnimationsFinishedEnemy = true;
	clearInterval(_self.animationsFinishedPollInterval);
	_self.drawCardInteractive = false;
	_self.enableScroll();
	$(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).off("click");
	$(_self.DECK_GLOBAL_ID).off("click");
	$(_self.PHASE_ROLL_ID + ', ' + _self.PHASE_END_ID).off("click");
	clearTimeout(_self.hideEventsInfoTimeout);
	clearTimeout(_self.summonCardTimeout);
	clearTimeout(_self.switchPhaseTimeout);
	clearTimeout(_self.moveCharacterTimeout);
	clearTimeout(_self.drawCardYouAnimationTimeout);
	clearTimeout(_self.drawCardEnemyAnimationTimeout);
	clearTimeout(_self.discardCardTimeout);
	$(_self.BOARD_COLUMN_CLASS).off("click");
	$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-you");
	$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-enemy");
	clearTimeout(_self._startDrawCardAnimationsFinishedFlushTimeout);
	_self._forceFinish = false;
	_self._lastClientData = null;
	clearTimeout(_self.retryTimeout);
	_self._postDestroyCard = null;
	_self._enableGraveyardPopulationOnClick = true;
	clearTimeout(_self.moveSpacesTimeout);
	clearTimeout(_self.destroyCardTimeout);
	clearTimeout(_self.takeCardTimeout);
	clearTimeout(_self.showCardTimeout);
	clearTimeout(_self.shuffleTimeout);
	clearTimeout(_self.shuffleTimeout2);
	clearTimeout(_self.specialSpaceTimeout);
	clearTimeout(_self.showEnergyTimeout);
	_self.quickGameInfoEnabled = true;
	clearTimeout(_self.quickGameInfoShowSwitchTimeout);
	clearTimeout(_self.quickGameInfoRemoveElementTimeout);
	_self.quickGameInfoMsg = "";
	clearTimeout(_self.waitForMsgTimeout);

	_self._postGame = true;
	setTimeout(function() {
		_self._postGame = false;
	}, 500);
};

gameController.prototype.setLeaveButton = function (playerIdWinGame) {
	var _self = this;

	var yourUserId = _self._yourUserId;
	var enemyUserId = _self._enemyUserId;
	var roomData = _self._roomData;
	var gameState = _self._gameplayData.gameState;
	var playerState = gameState.playersState[yourUserId];

	_self.populateGraveyard(_self._yourUserId, _self.PLAYER_YOU_CLASS);
	_self.populateGraveyard(_self._enemyUserId, _self.PLAYER_ENEMY_CLASS);
	_self.resetGameState();
	_self.initListeners();

	$(_self.GAME_SCREEN_CLASS).off("click", _self.SURRENDER_BTN_ID);
	$(_self.SURRENDER_BTN_ID).text("Return to Menu");
	$(_self.GAME_SCREEN_CLASS).on('click', _self.SURRENDER_BTN_ID, function(e) {
	 	_self.processChangeScreen(_self.MAIN_MENU_SCREEN_CLASS);
	});

	_self.client.roomController.resetRoomsInterval.call(_self.client.roomController);
	_self.client.generalClient.sendLeaveRoomRequest.call(_self.client.generalClient,
		{ roomId: _self.client.roomController._roomId });

	setTimeout(function() {
		_self.hideEventsInfo(null, 0);

		var xpPercentage;
		var xpGain;
		var xpGainTurns;
		var xpGainSpaces;
		var xpGainCardsUsed;
		var xpGainGameResult;
		var playerStatusRow;
		var oldLevel;
		var spacesMoved;

		if (yourUserId == roomData.player1Id) {
			xpPercentage = Math.floor((roomData.player1CurrLevelXp / roomData.player1MaxLevelXp) * 100) + "%";
			xpGain = roomData.player1XpGain;
			playerStatusRow = roomData.player1StatusRow;
			oldLevel = roomData.player1Level;
			xpGainTurns = roomData.player1XpGainTurns;
			xpGainSpaces = roomData.player1XpGainSpaces;
			spacesMoved = roomData.player1SpacesMoved;
			xpGainCardsUsed = roomData.player1XpGainCardsUsed;
			xpGainGameResult = roomData.player1XpGainGameResult;
		} else {
			xpPercentage = Math.floor((roomData.player2CurrLevelXp / roomData.player2MaxLevelXp) * 100) + "%";
			xpGain = roomData.player2XpGain;
			playerStatusRow = roomData.player2StatusRow;
			oldLevel = roomData.player2Level;
			xpGainTurns = roomData.player2XpGainTurns;
			xpGainSpaces = roomData.player2XpGainSpaces;
			spacesMoved = roomData.player2SpacesMoved;
			xpGainCardsUsed = roomData.player2XpGainCardsUsed;
			xpGainGameResult = roomData.player2XpGainGameResult;
		}

		var screenTitle = playerIdWinGame == yourUserId ? "VICTORY" : "DEFEAT";
		$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').html("");
		$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child')
			.append('<div class="anime-cb-choose-card-effect-title">' + screenTitle + '</div>');
		$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').append('<div class="anime-cb-end-screen-xp-gain">+ '
			+ xpGain + 'XP -> ' + playerStatusRow.current_level_xp + ' / ' + playerStatusRow.max_level_xp + ' XP</div>');
		$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').append('<span class="anime-cb-end-screen-xp">XP:\
			</span><div class="progress anime-cb-level-progress-bar-wrapper">\
		  <div class="progress-bar progress-bar-striped progress-bar-info active anime-cb-level-progress-bar" role="progressbar"\
		  style="width:' + xpPercentage + ';">\
		  <div class="anime-cb-level-progress-bar-text anime-cb-user-info-level-xp">' + xpPercentage + '</div>\
		  </div>\
		</div>');
		$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child')
			.append('<div class="anime-cb-end-screen-level-status">Level '
				+ playerStatusRow.level + (oldLevel < playerStatusRow.level ? ", Level Up!" : "") + '</div>');
		$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').append('<div class="anime-cb-end-screen-stats-wrapper">\
			<div class="anime-cb-end-screen-stats-title">Stats</div>\
			<div class="anime-cb-end-screen-stat">' + (playerIdWinGame == yourUserId ? "Game won" : "Game lost") + ': (+' + xpGainGameResult + 'XP)</div>\
			<div class="anime-cb-end-screen-stat">Total turns made: ' + playerState.totalTurns + ' (+' + xpGainTurns + 'XP)</div>\
			<div class="anime-cb-end-screen-stat">Total board spaces traveled: ' + spacesMoved + ' (+' + xpGainSpaces + 'XP)</div>\
			<div class="anime-cb-end-screen-stat">Total cards used: ' + playerState.totalCardsUsed + ' (+' + xpGainCardsUsed + 'XP)</div>'
			+ '</div>');

		$(_self.CHOOSE_CARD_EFFECT_CLASS).addClass('fade-in-custom');
		$(_self.CHOOSE_CARD_EFFECT_CLASS).css("opacity", 1);
		$(_self.CHOOSE_CARD_EFFECT_CLASS).css("z-index", 21);
		$(_self.DECK_GRAVEYARD_WRAPPER_CLASS).css("z-index", 22);
		$(_self.FOOTER_CLASS).css("z-index", 22);

		setTimeout(function() {
			_self.client.logInSignUpController.checkIsUserLoggedIn();
		}, 1000);
	}, 1000);
};

gameController.prototype.processWinGameFormallyResponse = function (data) {
	logger.info('processWinGameFormallyResponse');
	console.log('processWinGameFormallyResponse');
	console.log('data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	if (!_self._gameplayData) {
		return;
	}

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;

	_self.showEventsInfo("YOU WIN !!!");
	_self.setLeaveButton(_self._yourUserId);
};

gameController.prototype.processWinGame = function (data) {
	logger.info('processWinGame');
	console.log('processWinGame');
	console.log('data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	if (!_self._gameplayData) {
		return;
	}

	if (data.playerIdWinGame == _self._yourUserId) {
		_self.showEventsInfo("YOU WIN !!!");
	} else  {
		_self.showEventsInfo("YOU LOSE !!!");
	}

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;

	_self.setLeaveButton(data.playerIdWinGame);
};

gameController.prototype.processStartGameResponse = function (data) {
	console.log('processStartGameResponse');
	console.log('data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self.client.roomController._hostId) {
				_self.client.roomController.startGame();
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(startGameResponse, data), 'startGameResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self.disableScroll();
	_self.resetGameState();
	_self.startBackgroundMusic();
	_self.initListeners();
	_self.renderGameField();
	_self.initGameData(data);
	_self.setRoomName();
	_self.setPlayerNames();
	_self.renderBoard();

	setTimeout(function() {
		if (_self._gameplayData)
		{
			_self.updateTimers();
			_self.processChangeScreen(_self.GAME_SCREEN_CLASS);
			_self.showEventsInfo("Game Start");
			_self.hideAllSpinner();
			_self.hideEventsInfo(null, 2000);
			_self.drawStartCards();
			_self.client.roomController._matchmaking = false;
			window.addEventListener("beforeunload", _self.beforeUnload);
		}
	}, 500);

	_self.updateGameStatusInfo();
};

gameController.prototype.startBackgroundMusic = function () {
	var _self = this;

	if (!_self.client.logInSignUpController._settings.sound
		|| !_self.client.logInSignUpController._settings.backgroundSound) {
		return;
	}

	_self._backgroundMusicFile = "background.mp3";
	_self._backgroundMusic = new Audio("/sounds/" + _self._backgroundMusicFile);
 	_self._backgroundMusic.volume = (_self.client.logInSignUpController._settings.soundVolume || 0) / 1000;
 	_self._backgroundMusic.loop = true;
  _self._backgroundMusic.play();
};

gameController.prototype.beforeUnload = function(event) {
	event.preventDefault();
	event.returnValue = 'You will lose, if you reload the page. Are you sure you want to leave ?';
	return 'You will lose, if you reload the page. Are you sure you want to leave ?';
};

gameController.prototype.hideEventsInfo = function (callback, seconds = 1000) {
	var _self = this;

	_self.hideEventsInfoTimeout = setTimeout(function() {
	  $(_self.EVENTS_INFO_ID).removeClass("showEvent hideEvent").addClass("hideEvent");
	  if (typeof callback === "function") {
	  	callback.call(_self);
	  }
	}, seconds);
};

gameController.prototype.showEventsInfo = function (infoText) {
	var _self = this;

	$(_self.EVENTS_INFO_TEXT_ID).text(infoText);
	$(_self.EVENTS_INFO_ID).removeClass("hideEvent showEvent").addClass("showEvent");
};

gameController.prototype.renderGameField = function () {
	var _self = this;

	$(_self.GAME_SCREEN_CLASS).html('<div class="anime-cb-title-page-game"><p id="anime-cb-title-page-game-room-name"></p></div><div id="anime-cb-card-info-card-name"></div><div id="anime-cb-card-info-wrapper"><div id="anime-cb-card-info-subwrapper"><img id="anime-cb-card-info-card" src="/imgs/player_cards/card_back.png"></div></div><div id="anime-cb-card-info-text"></div><div class="anime-cb-card-graveyard-wrapper player-enemy"><p class="anime-cb-card-graveyard-text player-enemy">Enemy Graveyard</p><img class="anime-cb-card-graveyard-deck player-enemy bottom"><img class="anime-cb-card-graveyard-deck player-enemy top"></div><div id="anime-cb-card-global-deck-wrapper"><img id="anime-cb-card-global-deck" src="/imgs/player_cards/card_back.png"><p id="anime-cb-card-global-deck-text">Global Deck</p></div><div id="anime-cb-game-events-info"><p id="anime-cb-game-events-info-text"></p></div><div class="anime-cb-turn-timer player-enemy"><p class="anime-cb-turn-timer-text player-enemy"></p></div><div class="anime-cb-turn-timer player-you"><p class="anime-cb-turn-timer-text player-you"></p></div><div class="anime-cb-energy-points-wrapper player-you"><p class="anime-cb-energy-points-title player-you">Energy</p><p class="anime-cb-energy-points-text player-you"></p></div><div class="anime-cb-energy-points-wrapper player-enemy"><p class="anime-cb-energy-points-title player-enemy">Energy</p><p class="anime-cb-energy-points-text player-enemy"></p></div><div class="anime-cb-energy-points-regen player-you"></div><div class="anime-cb-energy-points-regen player-enemy"></div><div class="anime-cb-change-chain-decision">Change Chain Decision</div><div class="anime-cb-roll-die" data-tooltip="rollDie"></div><table id="anime-cb-phases-wrapper"><tr class="anime-cb-phase-row"><td id="anime-cb-phase-draw" class="anime-cb-phase-column next" data-phase-text="Draw Phase">DP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-standby" class="anime-cb-phase-column next" data-phase-text="Standby Phase">SP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-main" class="anime-cb-phase-column next" data-phase-text="Main Phase">MP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-roll" class="anime-cb-phase-column next" data-phase-text="Roll Phase">RP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-end" class="anime-cb-phase-column next" data-phase-text="End Phase">EP</td></tr></table><div class="center-screen"><div class="anime-cb-cards-in-hand-wrapper player-enemy"><div class="anime-cb-cards-in-hand player-enemy"></div></div><div class="anime-cb-board-player-label player-enemy"></div><div class="anime-cb-card-field-wrapper"><div class="anime-cb-card-field-charges-label player-enemy">Charges | Energy</div><table class="anime-cb-card-field-charges-status-wrapper player-enemy"><tr><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td></tr></table><table class="anime-cb-card-field player-enemy"><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></table></div><div id="anime-cb-board-wrapper"><table id="anime-cb-board"></table></div><div class="anime-cb-card-field-wrapper"><table class="anime-cb-card-field player-you"><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></table><table class="anime-cb-card-field-charges-status-wrapper player-you"><tr><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td></tr></table><div class="anime-cb-card-field-charges-label player-you">Charges | Energy</div></div><div class="anime-cb-board-player-label player-you"></div><div class="anime-cb-cards-in-hand-wrapper player-you"><div class="anime-cb-cards-in-hand player-you"></div></div></div><div class="anime-cb-card-graveyard-wrapper player-you"><img class="anime-cb-card-graveyard-deck player-you bottom"><img class="anime-cb-card-graveyard-deck player-you top"><p class="anime-cb-card-graveyard-text player-you">Your Graveyard</p></div><div class="anime-cb-screen_footer-game"><button id="anime-cb-surrender" type="button" class="btn btn-primary anime-cb-button-stateless anime-cb-btn-main-menu">Surrender</button></div><div class="anime-cb-player-status-wrapper"><p class="anime-cb-player-status-title">Game Status</p><div class="anime-cb-player-status-content"></div></div><div id="anime-cb-dice-wrapper-player-you"></div><div id="anime-cb-dice-wrapper-player-enemy"></div><div class="modal graveyard-modal player-you"> <div class="modal-content"> <div class="modal-header player-you"> <span class="close">&times;</span> <h2>Your Graveyard</h2> </div> <div class="modal-body"> </div> <div class="modal-footer player-you"> <h3>Your Graveyard</h3> </div> </div></div><div class="modal graveyard-modal player-enemy"> <div class="modal-content"> <div class="modal-header player-enemy"> <span class="close">&times;</span> <h2>Enemy Graveyard</h2> </div> <div class="modal-body"> </div> <div class="modal-footer player-enemy"> <h3>Enemy Graveyard</h3> </div> </div></div><img class="anime-cb-card-activate-show"><div class="center-screen anime-cb-choose-card-effect"><div></div></div>');
};

gameController.prototype.initGameData = function (data) {
	logger.info('initGameData');
	console.log('initGameData');
	console.log('Data: ', data);

	var _self = this;

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;

	console.log('Gameplay Data: ', _self._gameplayData);

	_self.validatePlayers();
};

gameController.prototype.validatePlayers = function () {
	var _self = this;

	assert(_self.client.roomController._roomId == _self._roomData.id);
	assert(_self.client.logInSignUpController._userId == _self._roomData.player1Id
		|| _self.client.logInSignUpController._userId == _self._roomData.player2Id);

	_self._yourName = _self.client.logInSignUpController._username;
	_self._enemyName = _self.client.logInSignUpController._userId == _self._roomData.player1Id
		? _self._roomData.player2Name : _self._roomData.player1Name;

	_self._yourUserId = _self.client.logInSignUpController._userId;
	_self._enemyUserId = _self.client.logInSignUpController._userId == _self._roomData.player1Id
		? _self._roomData.player2Id : _self._roomData.player1Id;
};

gameController.prototype.setRoomName = function () {
	var _self = this;

	$(_self.ROOM_NAME_ID).text("Room: " + _self._roomData.name);
};

gameController.prototype.setPlayerNames = function () {
	var _self = this;

	$(_self.PLAYER_NAME_CLASS + _self.PLAYER_YOU_CLASS).text(_self._yourName);
	$(_self.PLAYER_NAME_CLASS + _self.PLAYER_ENEMY_CLASS).text(_self._enemyName);
};

gameController.prototype.setTimerValues = function () {
	var _self = this;

	$(_self.TIMER_CLASS).text(_self._gameplayData.gameState.timerSeconds);
};

gameController.prototype.renderBoard = function () {
	var _self = this;

  var boardMatrix = _self._gameplayData.gameState.boardData.boardMatrix;
	var boardDataPlayers = _self._gameplayData.gameState.boardData.boardDataPlayers;
 	var player1StartBoardIndex = _self._gameplayData.gameState.playersState[_self._roomData.player1Id].currBoardIndex;
 	var player2StartBoardIndex = _self._gameplayData.gameState.playersState[_self._roomData.player2Id].currBoardIndex;
	var player1StartIndexRow = boardDataPlayers.boardPath[player1StartBoardIndex][0];
	var player1StartIndexColumn = boardDataPlayers.boardPath[player1StartBoardIndex][1];
	var player2StartIndexRow = boardDataPlayers.boardPath[player2StartBoardIndex][0];
	var player2StartIndexColumn = boardDataPlayers.boardPath[player2StartBoardIndex][1];

  boardMatrix.forEach(function(boardRow, boardRowIdx) {
    var boardRowHtml = '<tr class="anime-cb-board-row">';
      boardRow.forEach(function(boardColumn, boardColumnIdx) {
	 			if (boardColumn == _self.BOARD_FIELDS.NORMAL) {
      	  boardRowHtml += '<td class="anime-cb-column active"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.ROLL_AGAIN_1) {
      		boardRowHtml += '<td class="anime-cb-column active roll-again-1"><img class="anime-cb-board-img" src="/imgs/roll_again_1.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.ROLL_AGAIN_2) {
      		boardRowHtml += '<td class="anime-cb-column active roll-again-2"><img class="anime-cb-board-img" src="/imgs/roll_again_2.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.ROLL_AGAIN_3) {
      		boardRowHtml += '<td class="anime-cb-column active roll-again-3"><img class="anime-cb-board-img" src="/imgs/roll_again_3.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.ROLL_AGAIN_BACKWARDS_1) {
      		boardRowHtml += '<td class="anime-cb-column active roll-again-back-1"><img class="anime-cb-board-img" src="/imgs/roll_again_back_1.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.ROLL_AGAIN_BACKWARDS_2) {
      		boardRowHtml += '<td class="anime-cb-column active roll-again-back-2"><img class="anime-cb-board-img" src="/imgs/roll_again_back_2.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.ROLL_AGAIN_BACKWARDS_3) {
      		boardRowHtml += '<td class="anime-cb-column active roll-again-back-3"><img class="anime-cb-board-img" src="/imgs/roll_again_back_3.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.CARD_DRAW_1) {
      		boardRowHtml += '<td class="anime-cb-column active card-draw-1"><img class="anime-cb-board-img" src="/imgs/card_draw_1.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.CARD_DRAW_2) {
      		boardRowHtml += '<td class="anime-cb-column active card-draw-2"><img class="anime-cb-board-img" src="/imgs/card_draw_2.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.CARD_DRAW_3) {
      		boardRowHtml += '<td class="anime-cb-column active card-draw-3"><img class="anime-cb-board-img" src="/imgs/card_draw_3.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.CARD_DISCARD_1) {
      		boardRowHtml += '<td class="anime-cb-column active card-discard-1"><img class="anime-cb-board-img" src="/imgs/card_discard_1.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.CARD_DISCARD_2) {
      		boardRowHtml += '<td class="anime-cb-column active card-discard-2"><img class="anime-cb-board-img" src="/imgs/card_discard_2.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.CARD_DISCARD_3) {
      		boardRowHtml += '<td class="anime-cb-column active card-discard-3"><img class="anime-cb-board-img" src="/imgs/card_discard_3.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.RANDOM_1) {
      		boardRowHtml += '<td class="anime-cb-column active random-1"><img class="anime-cb-board-img" src="/imgs/random_1.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.RANDOM_2) {
      		boardRowHtml += '<td class="anime-cb-column active random-2"><img class="anime-cb-board-img" src="/imgs/random_2.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.RANDOM_3) {
      		boardRowHtml += '<td class="anime-cb-column active random-3"><img class="anime-cb-board-img" src="/imgs/random_3.png"></td>';
      	} else {
          boardRowHtml += '<td class="anime-cb-column"></td>';
      	}
      });

    boardRowHtml += '</tr>';

    $(_self.BOARD_ID).append(boardRowHtml);
  });

  var player1Td = document.getElementById('anime-cb-board').rows[player1StartIndexRow].cells[player1StartIndexColumn];
  var player2Td = document.getElementById('anime-cb-board').rows[player2StartIndexRow].cells[player2StartIndexColumn];

	if (_self._roomData.player1Id == _self._yourUserId) {
		$(player1Td).append('<span class="anime-cb-player-position" id="anime-cb-player-you-position"></span>');
		$(player2Td).append('<span class="anime-cb-player-position" id="anime-cb-player-enemy-position"></span>');
	} else {
		$(player1Td).append('<span class="anime-cb-player-position" id="anime-cb-player-enemy-position"></span>');
		$(player2Td).append('<span class="anime-cb-player-position" id="anime-cb-player-you-position"></span>');
	}

	_self.setBoardPieces();

	if (_self._yourUserId == _self._roomData.player2Id) {
		$(_self.BOARD_ID).css("transform", "rotate(180deg)");
		_self.setBoardPiecesRotated();
	}
};

gameController.prototype.setBoardPieces = function () {
	var _self = this;

  if (_self._roomData.player1Id == _self._yourUserId) {
  	$(_self.BOARD_PLAYER_YOU_ID).css("background-image", 'url("/imgs/player_pieces/'
  		+ _self._roomData.player1Character.characterImg + '")');
  	$(_self.BOARD_PLAYER_ENEMY_ID).css("background-image", 'url("/imgs/player_pieces/'
  		+ _self._roomData.player2Character.characterImg + '")');
  } else {
  	$(_self.BOARD_PLAYER_YOU_ID).css("background-image", 'url("/imgs/player_pieces/'
  		+ _self._roomData.player2Character.characterImg + '")');
  	$(_self.BOARD_PLAYER_ENEMY_ID).css("background-image", 'url("/imgs/player_pieces/'
  		+ _self._roomData.player1Character.characterImg + '")');
  }
};

gameController.prototype.setBoardPiecesRotated = function () {
	var _self = this;

	$(_self.BOARD_PLAYER_YOU_ID).css("transform", "rotate(180deg)");
	$(_self.BOARD_PLAYER_ENEMY_ID).css("transform", "rotate(180deg)");

  if (_self._roomData.player1Id == _self._yourUserId) {
  	$(_self.BOARD_PLAYER_YOU_ID).css("background-image", 'url("/imgs/player_pieces/'
  		+ _self._roomData.player1Character.characterImg + '")');
  	$(_self.BOARD_PLAYER_ENEMY_ID).css("background-image", 'url("/imgs/player_pieces/'
  		+ _self._roomData.player2Character.characterImg + '")');
  } else {
  	$(_self.BOARD_PLAYER_YOU_ID).css("background-image", 'url("/imgs/player_pieces/'
  		+ _self._roomData.player2Character.characterImg + '")');
  	$(_self.BOARD_PLAYER_ENEMY_ID).css("background-image", 'url("/imgs/player_pieces/'
  		+ _self._roomData.player1Character.characterImg + '")');
  }

  $(_self.BOARD_IMG_CLASS).css("transform", "rotate(180deg)");
};

gameController.prototype.drawStartCards = function () {
	var _self = this;
	var cardsToDraw = _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw;
	var cardsToDrawEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId].cardsToDraw

	if (cardsToDrawEnemy > 0) {
		_self.drawCardAnimationsFinishedEnemy = false;
	}

	if (cardsToDraw > 0) {
		for (var i = 0; i < cardsToDraw; i++) {
			_self.drawCard();
		}
	}

	_self.startDrawCardAnimationsFinishedPoll(_self.startTurn);
};

gameController.prototype.startDrawCardAnimationsFinishedPoll = function (callback) {
	var _self = this;

	_self._forceFinish = true;
	_self._startDrawCardAnimationsFinishedFlushTimeout = setTimeout(function() {
		_self._forceFinish = false;
		_self.animationsFinishedPollInterval = setInterval(function() {
			if ((_self.drawCardAnimationsFinishedYou && _self.drawCardAnimationsFinishedEnemy) || _self._forceFinish) {
				clearInterval(_self.animationsFinishedPollInterval);
				if (typeof callback == "function") {
					callback.call(_self);
				}
			}
		}, 50);
	}, 60);
};

gameController.prototype.drawCard = function () {
	var _self = this;

	var cardsToDraw = _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw;

	if (cardsToDraw > 0) {
		_self.drawCardAnimationsFinishedYou = false;
		console.log('Sending draw card request');
		_self._lastClientData = { roomId: _self._roomData.id };
		_self.client.drawCard(_self._lastClientData);
	} else {
		_self.drawCardAnimationsFinishedYou = true;
	}
};

gameController.prototype.processDrawCard = function (data) {
	console.log('processDrawCard');
	console.log('processDrawCard data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	assert(ajv.validate(drawCardResponse, data), 'drawCardResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	if (_self._yourUserId == _self._gameplayData.gameState.playerIdDrawnCard) {
		if (!_self.checkForCardYouIntervalEnabled) {
			if (_self._cardsDrawnYou.length > 0) {
				_self.drawCardFromDeckYouAnimation(_self._cardsDrawnYou.shift());
			}
			_self.checkForCardYouIntervalEnabled = true;
			_self.checkForCardYou = setInterval(function() {
				if (_self._cardsDrawnYou.length > 0) {
					_self.drawCardFromDeckYouAnimation(_self._cardsDrawnYou.shift());
				} else if (_self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw == 0) {
					clearInterval(_self.checkForCardYou);
					_self.checkForCardYouIntervalEnabled = false;
					_self.drawCardAnimationsFinishedYou = true;
				} else {
					clearInterval(_self.checkForCardYou);
					_self.checkForCardYouIntervalEnabled = false;
				}
			}, 550);
		}
	} else {
		_self._cardsDrawnEnemy++;
		if (!_self.checkForCardEnemyIntervalEnabled) {
			if (_self._gameplayData.gameState.playersState[_self._enemyUserId].cardsToDraw == 0) {
				_self.hideEventsInfo(null, 0);
			} else if (_self._gameplayData.gameState.playersState[_self._enemyUserId].cardsToDraw > 0
				&& _self._gameplayData.gameState.nextPhase != _self.TURN_PHASES.DRAW) {
				var eventInfoText = "Your opponent draws "
					+ _self._gameplayData.gameState.playersState[_self._enemyUserId].cardsToDraw;
				if (_self._gameplayData.gameState.playersState[_self._enemyUserId].cardsToDraw > 1) {
					eventInfoText += " cards from the deck";
				} else {
					eventInfoText += " card from the deck";
				}
				_self.showEventsInfo(eventInfoText);
			}
			_self.drawCardFromDeckEnemyAnimation();
			_self._cardsDrawnEnemy--;
			_self.checkForCardEnemyIntervalEnabled = true;
			_self.checkForCardEnemy = setInterval(function() {
				if (_self._cardsDrawnEnemy > 0) {
					_self._cardsDrawnEnemy--;
					_self.drawCardFromDeckEnemyAnimation();
				} else if (_self._gameplayData.gameState.playersState[_self._enemyUserId].cardsToDraw == 0) {
					clearInterval(_self.checkForCardEnemy);
					_self.checkForCardEnemyIntervalEnabled = false;
					_self.drawCardAnimationsFinishedEnemy = true;
				} else {
					clearInterval(_self.checkForCardEnemy);
					_self.checkForCardEnemyIntervalEnabled = false;
				}
			}, 550);
		}
	}
};

gameController.prototype.processDrawCardYou = function (data) {
	console.log('processDrawCardYou');
	console.log('processDrawCardYou data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			_self.drawCard();
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(drawCardYouResponse, data), 'drawCardYouResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._cardsDrawnYou.push(data.cardDrawn);
};

gameController.prototype.startTurn = function () {
	var _self = this;

	if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
		_self.setYourTurnFieldStyle();
		_self.startDrawPhase();
	} else {
		_self.setEnemyTurnFieldStyle();
	}
};

gameController.prototype.disableScroll = function () {
	$('*').on('DOMMouseScroll mousewheel', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.returnValue = false;
    return false;
  });
};

gameController.prototype.enableScroll = function () {
	$('*').off('DOMMouseScroll mousewheel');
};

gameController.prototype.startDrawPhase = function () {
	var _self = this;

	_self._lastClientData = { roomId: _self._roomData.id };
	_self.client.drawPhase(_self._lastClientData);
};

gameController.prototype.processDrawPhase = function (data) {
	console.log('processDrawPhase');
	console.log('processDrawPhase data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.drawPhase(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(drawPhaseResponse, data), 'drawPhaseResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
		_self.startDrawPhaseAnimationYou();
	} else {
		_self.startDrawPhaseAnimationEnemy();
	}
};

gameController.prototype.processStandByPhase = function (data) {
	console.log('processStandByPhase');
	console.log('processStandByPhase data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.standByPhase(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(standByPhaseResponse, data), 'standByPhaseResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateCardsStatusText();
	_self.updateCardChargesStatuses();

	if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
		_self.startStandByPhaseAnimationYou();
	} else {
		_self.startStandByPhaseAnimationEnemy();
	}
};

gameController.prototype.processMainPhase = function (data) {
	console.log('processMainPhase');
	console.log('processMainPhase data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.mainPhase(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(mainPhaseResponse, data), 'mainPhaseResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;

	if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
		_self.startMainPhaseAnimationYou();
	} else {
		_self.startMainPhaseAnimationEnemy();
	}
};

gameController.prototype.summonCard = function (card) {
	logger.info("Trying to summon card");

	var _self = this;
	var cardId = $(card).data("cardId");
	var cardIdx = $(card).index();

	_self._lastClientData = { roomId: _self._roomData.id, cardId: cardId, cardIdx: cardIdx };
	_self.client.summonCard(_self._lastClientData);
};

gameController.prototype.canSummonCard = function (card) {
	var _self = this;

	var canSummonCard = true;
	var cardId = $(card).data("cardId");
	var boardMatrix = _self._gameplayData.gameState.boardData.boardMatrix;
  var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndexYou = _self._gameplayData.gameState.playersState[_self._yourUserId].currBoardIndex;
  var currBoardIndexEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId].currBoardIndex;
	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];
	var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];
	var cardsOnFieldCount = playerStateYou.cardsOnFieldArr.length;
	var cardsChain = playerStateYou.chainObj;
	var cardRarity;
	var cardEffect;
	var cardCost;
	var cardAttributes;

	_self.quickGameInfoMsg = "";

	var cardEffect;
  _self._cardsInHandArr.forEach(function(card, idx) {
		if (card.cardId == cardId) {
			cardEffect = card.cardEffect;
			cardRarity = card.cardRarity;
			cardCost = card.cardCost;
			cardAttributes = card.cardAttributes;
		}
	});

	if ((!cardEffect) || (!cardRarity) || (isNaN(cardCost))) {
		_self.quickGameInfoMsg = "Problem while summoning this card...";
		return false;
	}

	if (cardsChain && cardsChain.cardsToChain && cardsChain.cardsToChain.length > 0) {
		let canChainCard = false;
		cardsChain.cardsToChain.forEach(function(card) {
			if (card.cardId == cardId) {
				canChainCard = true;
			}
		});

		if (canChainCard) {
			return true;
		} else {
			_self.quickGameInfoMsg = "Cannot chain this card";
			return false;
		}
	}

	if (cardsOnFieldCount + 1 > playerStateYou.maxCardsOnField) {
		_self.quickGameInfoMsg = "Max cards on field";
		return false;
	}

	if (! playerStateYou.cardsSummonConstraints.cardsCanSummonAny) {
		_self.quickGameInfoMsg = "Cannot summon cards";
		return false;
	}

	playerStateYou.cardsOnFieldArr.forEach(function(card, idx) {
		if (card.cardId == cardId) {
			canSummonCard = false;
			_self.quickGameInfoMsg = "You can't have more than 1 copy of the same card on your field";
		}
	});

	if (!canSummonCard) {
		return false;
	}

	playerStateEnemy.cardsOnFieldArr.forEach(function(card, idx) {
		if ((card.cardEffect.effect == "nullifyCardsFieldSummon") && (cardAttributes.includes("field"))) {
			canSummonCard = false;
			_self.quickGameInfoMsg = "You can't summon cards with 'field' attribute while " + card.cardName + " is active on your opponent's field";
		}
	});

	if (!canSummonCard) {
		return false;
	}

	if (playerStateYou.energyPoints < cardCost) {
		_self.quickGameInfoMsg = "Not enough Energy";
		return false;
	}

	switch(cardRarity) {
		case _self.CARD_RARITIES.COMMON:
			if (! playerStateYou.cardsSummonConstraints.cardsCanSummonCommon) {
				canSummonCard = false;
				_self.quickGameInfoMsg = "Cannot summon Common cards";
			}
			break;
		case _self.CARD_RARITIES.RARE:
			if (! playerStateYou.cardsSummonConstraints.cardsCanSummonRare) {
				canSummonCard = false;
				_self.quickGameInfoMsg = "Cannot summon Rare cards";
			}
			break;
		case _self.CARD_RARITIES.EPIC:
					if (! playerStateYou.cardsSummonConstraints.cardsCanSummonEpic) {
				canSummonCard = false;
				_self.quickGameInfoMsg = "Cannot summon Epic cards";
			}
			break;
	}

	if (!canSummonCard) {
		return false;
	}

	if (cardEffect.effect == "moveSpacesForward") {
		if (_self._yourUserId == _self._roomData.player1Id) {
			if (!boardPath[currBoardIndexYou + cardEffect.effectValue]) {
				_self.quickGameInfoMsg = "Not enough board spaces forward, less than " + cardEffect.effectValue;
				return false;
			}
		} else if (currBoardIndexYou - cardEffect.effectValue < 0) {
			_self.quickGameInfoMsg = "Not enough board spaces forward, less than " + cardEffect.effectValue;
			return false;
		}
	} else if (cardEffect.effect == "moveSpacesBackwardsUpToEnemy") {
		if (_self._enemyUserId == _self._roomData.player2Id) {
			if (currBoardIndexEnemy >= _self._gameplayData.gameState.boardData.boardDataPlayers.player2StartBoardIndex) {
				_self.quickGameInfoMsg = "You have nowhere to move your opponent";
				return false;
			}
		} else if (currBoardIndexEnemy <= _self._gameplayData.gameState.boardData.boardDataPlayers.player1StartBoardIndex) {
				_self.quickGameInfoMsg = "You have nowhere to move your opponent";
				return false;
		}
	} else if (cardEffect.effect == "moveSpacesBackwardsEnemy") {
		if (_self._enemyUserId == _self._roomData.player2Id) {
			if (!boardPath[currBoardIndexEnemy + cardEffect.effectValue]) {
				_self.quickGameInfoMsg = "Not enough board spaces backward, less than " + cardEffect.effectValue;
				return false;
			}
		} else if (currBoardIndexEnemy - cardEffect.effectValue < 0) {
			_self.quickGameInfoMsg = "Not enough board spaces backward, less than " + cardEffect.effectValue;
			return false;
		}
	} else if (cardEffect.effect.match("createSpecialBoardSpaceForwardTier")) {
		var availableSpace = false;
	  var moveBoardForward = true;
	  if (_self._yourUserId == _self._roomData.player2Id) {
	  	moveBoardForward = false;
	  }

	  var currBoardIndexYouCopy = currBoardIndexYou;
		for (var i = 0; i < cardEffect.effectValue; i++) {
			if (moveBoardForward) {
				currBoardIndexYouCopy++;

				if (!boardPath[currBoardIndexYouCopy]) {
					break;
				}
			} else {
				currBoardIndexYouCopy--;

				if (currBoardIndexYouCopy < 0) {
					break;
				}
			}

		  rowIndex = boardPath[currBoardIndexYouCopy][0];
		  columnIndex = boardPath[currBoardIndexYouCopy][1];

		  if (boardMatrix[rowIndex][columnIndex] == 1) {
		  	availableSpace = true;
		  	break;
			}
		}

		if (!availableSpace) {
			_self.quickGameInfoMsg = "No empty board spaces in range";
			return false;
		}
	} else if (cardEffect.effect == "destroySpecialBoardSpaceForward") {
		var availableSpace = false;
	  var moveBoardForward = true;
	  if (_self._yourUserId == _self._roomData.player2Id) {
	  	moveBoardForward = false;
	  }

	  var currBoardIndexYouCopy = currBoardIndexYou;
		for (var i = 0; i < cardEffect.effectValue; i++) {
			if (moveBoardForward) {
				currBoardIndexYouCopy++;

				if (!boardPath[currBoardIndexYouCopy]) {
					break;
				}
			} else {
				currBoardIndexYouCopy--;

				if (currBoardIndexYouCopy < 0) {
					break;
				}
			}

		  rowIndex = boardPath[currBoardIndexYouCopy][0];
		  columnIndex = boardPath[currBoardIndexYouCopy][1];

		  if (boardMatrix[rowIndex][columnIndex] > 1) {
		  	availableSpace = true;
			}
		}

		if (!availableSpace) {
			_self.quickGameInfoMsg = "No special board spaces in range";
			return false;
		}
	} else if (cardEffect.effect == "moveSpacesForwardNonSpecial") {
		var availableSpace = false;
	  var moveBoardForward = true;
	  if (_self._yourUserId == _self._roomData.player2Id) {
	  	moveBoardForward = false;
	  }

	  var currBoardIndexYouCopy = currBoardIndexYou;
		for (var i = 0; i <= boardPath.length - 1; i++) {
			if (moveBoardForward) {
				if ((currBoardIndexYouCopy + i) > (boardPath.length - 1)) {
					break;
				} else if ((boardMatrix[boardPath[currBoardIndexYouCopy + i][0]][boardPath[currBoardIndexYouCopy + i][1]] == 1)) {
					availableSpace = true;
					break;
				}
			} else {
				if ((currBoardIndexYouCopy - i) < 0) {
					break;
				} else if ((boardMatrix[boardPath[currBoardIndexYouCopy - 1][0]][boardPath[currBoardIndexYouCopy - i][1]] == 1)) {
					availableSpace = true;
					break;
				}
			}
		}

		if (!availableSpace) {
			_self.quickGameInfoMsg = "No non-special board spaces forward";
			return false;
		}
	} else if (cardEffect.effect == "drawCardFromEnemyHand") {
		if (playerStateEnemy.cardsInHand <= 0) {
			_self.quickGameInfoMsg = "Your opponent doesn't have any cards in his hand";
			return false;
		}
	} else if (cardEffect.effect == "drawCardFromEnemyYourHand") {
		if (playerStateEnemy.cardsInHand <= 0) {
			_self.quickGameInfoMsg = "Your opponent doesn't have any cards in his hand";
			return false;
		}

		if (playerStateYou.cardsInHand <= 1) {
			_self.quickGameInfoMsg = "Your have less than 2 cards in your hand";
			return false;
		}
	} else if (cardEffect.effect == "destroyCardFromEnemyField") {
		if (playerStateEnemy.cardsOnFieldArr.length <= 0) {
			_self.quickGameInfoMsg = "Your opponent doesn't have any cards on his field";
			return false;
		}
	} else if (cardEffect.effect == "takeCardFromYourGraveyard") {
		if (playerStateYou.cardsInGraveyardArr.length <= 0) {
			_self.quickGameInfoMsg = "You don't have any cards in your Graveyard";
			return false;
		}
	} else if (cardEffect.effect == "takeCardFromEnemyGraveyard") {
		if (playerStateEnemy.cardsInGraveyardArr.length <= 0) {
			_self.quickGameInfoMsg = "Your opponent doesn't have any cards in his Graveyard";
			return false;
		}
	}  else if (cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialYou") {
		var availableSpace = false;
		for(var i = 0; i < boardPath.length; i++) {
			if ((boardMatrix[boardPath[i][0]][boardPath[i][1]] > 1) && (i != currBoardIndexYou)) {
				availableSpace = true;
				break;
			}
		}

		if (!availableSpace) {
			_self.quickGameInfoMsg = "There aren't any special board spaces on the board or you are on the only one :)";
			return false;
		}
	} else if (cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialEnemy") {
		var availableSpace = false;
		for(var i = 0; i < boardPath.length; i++) {
			if ((boardMatrix[boardPath[i][0]][boardPath[i][1]] > 1) && (i != currBoardIndexEnemy)) {
				availableSpace = true;
				break;
			}
		}

		if (!availableSpace) {
			_self.quickGameInfoMsg = "There aren't any special board spaces on the board or your opponent is on the only one :)";
			return false;
		}
	} else if (cardEffect.effect == "reapplyCurrentSpecialBoardSpaceYou") {
		if (boardMatrix[boardPath[currBoardIndexYou][0]][boardPath[currBoardIndexYou][1]] <= 1) {
			_self.quickGameInfoMsg = "You aren't on a special board space";
			return false;
		}

		let activateNegativeBoardSpace = true;
		playerStateYou.cardsOnFieldArr.forEach(function(card, idx) {
			if (card.cardEffect.effect == "nullifyAllNegativeSpecialBoardSpaces") {
				if (_self.isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexYou][0]][boardPath[currBoardIndexYou][1]])) {
					activateNegativeBoardSpace = false;
					_self.quickGameInfoMsg = "You can't apply negative special board spaces's effects to yourself while "
						+ card.cardName + " is active on your field";
				}
			}
		});

		if (!activateNegativeBoardSpace) {
			return false;
		}
	} else if (cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemy") {
		if (boardMatrix[boardPath[currBoardIndexEnemy][0]][boardPath[currBoardIndexEnemy][1]] <= 1) {
			_self.quickGameInfoMsg = "Your opponent isn't on a special board space";
			return false;
		}

		let activateNegativeBoardSpace = true;
		playerStateEnemy.cardsOnFieldArr.forEach(function(card, idx) {
			if (card.cardEffect.effect == "nullifyAllNegativeSpecialBoardSpaces") {
				if (_self.isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexEnemy][0]][boardPath[currBoardIndexEnemy][1]])) {
					activateNegativeBoardSpace = false;
					_self.quickGameInfoMsg = "You can't apply negative special board spaces's effects to your opponent while "
						+ card.cardName + " is active on his field";
				}
			}
		});

		if (!activateNegativeBoardSpace) {
			return false;
		}
	} else if (cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemyYou") {
		if (boardMatrix[boardPath[currBoardIndexEnemy][0]][boardPath[currBoardIndexEnemy][1]] <= 1) {
			_self.quickGameInfoMsg = "Your opponent isn't on a special board space";
			return false;
		}

		let activateNegativeBoardSpace = true;
		playerStateYou.cardsOnFieldArr.forEach(function(card, idx) {
			if (card.cardEffect.effect == "nullifyAllNegativeSpecialBoardSpaces") {
				if (_self.isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexEnemy][0]][boardPath[currBoardIndexEnemy][1]])) {
					activateNegativeBoardSpace = false;
					_self.quickGameInfoMsg = "You can't apply negative special board spaces's effects to yourself while "
						+ card.cardName + " is active on your field";
				}
			}
		});

		if (!activateNegativeBoardSpace) {
			return false;
		}
	} else if (cardEffect.effect == "reapplyCurrentSpecialBoardSpaceYouEnemy") {
		if (boardMatrix[boardPath[currBoardIndexYou][0]][boardPath[currBoardIndexYou][1]] <= 1) {
			_self.quickGameInfoMsg = "You aren't on a special board space";
			return false;
		}

		let activateNegativeBoardSpace = true;
		playerStateEnemy.cardsOnFieldArr.forEach(function(card, idx) {
			if (card.cardEffect.effect == "nullifyAllNegativeSpecialBoardSpaces") {
				if (_self.isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexYou][0]][boardPath[currBoardIndexYou][1]])) {
					activateNegativeBoardSpace = false;
					_self.quickGameInfoMsg = "You can't apply negative special board spaces's effects to your opponent while "
						+ card.cardName + " is active on his field";
				}
			}
		});

		if (!activateNegativeBoardSpace) {
			return false;
		}
	} else if (cardEffect.effect == "increaseChargesContinousCard") {
		var availableCards = false;

		if (playerStateYou.cardsOnFieldArr.length <= 0) {
			_self.quickGameInfoMsg = "You don't have any cards on the field";
		} else {
			playerStateYou.cardsOnFieldArr.forEach(function(cardOnField) {
				cardOnField.cardAttributes.forEach(function(attribute) {
					if (cardEffect.allowedAttributes.includes(attribute)) {
						availableCards = true;
					}
				});
			});

			if (!availableCards) {
				_self.quickGameInfoMsg = "You don't have cards on the field with any of the following attributes: "
					+ cardEffect.allowedAttributes.join(", ");
			}
		}

		if (!availableCards) {
			return false;
		}
	} else if (cardEffect.effect == "discardCardTakeCardFromYourGraveyard") {
		if ((playerStateYou.cardsInHand - 1) < cardEffect.effectValue1) {
			_self.quickGameInfoMsg = "You don't have enough cards to discard";
			return false;
		}

		if (playerStateYou.cardsInGraveyardArr.length < cardEffect.effectValue2) {
			_self.quickGameInfoMsg = "You don't have any cards in your Graveyard";
			return false;
		}
	} else if (cardEffect.effect == "destroySpecialBoardSpacesAllRadius") {
		if (playerStateYou.energyPoints < cardEffect.effectValue) {
			_self.quickGameInfoMsg = "You must have at least 2 Energy";
			return false;
		}

		let availableSpace = false;
  	let maxRadius = Math.floor(playerStateYou.energyPoints / cardEffect.effectValue);

  	if (_self.isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexYou][0]][boardPath[currBoardIndexYou][1]])) {
  		availableSpace = true;
  	}

  	for(let i = 1; i <= maxRadius; i++) {
			if ((currBoardIndexYou + i) > (boardPath.length - 1)) {
				break;
			} else if (_self.isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexYou + i][0]][boardPath[currBoardIndexYou + i][1]])) {
				availableSpace = true;
				break;
			}
		}

		for(let i = 1; i <= maxRadius; i++) {
			if ((currBoardIndexYou - i) < 0) {
				break;
			} else if (_self.isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexYou - i][0]][boardPath[currBoardIndexYou - i][1]])) {
				availableSpace = true;
				break;
			}
		}

		if (!availableSpace) {
			_self.quickGameInfoMsg = "No negative special board spaces in max radius (" + maxRadius + ")";
			return false;
		}
	}

	return canSummonCard;
};

gameController.prototype.processSummonCard = function (data) {
	console.log('processSummonCard');
	console.log('processSummonCard data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.summonCard(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(summonCardResponse, data), 'summonCardResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.playerIdSummonedCard == _self._yourUserId) {
		_self.summonCardFromHandAnimationYou(_self._gameplayData.gameState.cardSummoned, _self.performCardEffectInstantYou
			.bind(_self, _self._gameplayData.gameState.cardSummoned));
	} else {
		_self.hideEventsInfo(null, 0);
		_self.summonCardFromHandAnimationEnemy(_self._gameplayData.gameState.cardSummoned, _self.performCardEffectInstantEnemy
			.bind(_self, _self._gameplayData.gameState.cardSummoned));
	}
};

gameController.prototype.processRollPhase = function (data) {
	console.log('processRollPhase');
	console.log('processRollPhase data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.rollPhase(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(rollPhaseResponse, data), 'rollPhaseResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
		_self.startRollPhaseAnimationYou();
	} else {
		_self.startRollPhaseAnimationEnemy();
	}
};

gameController.prototype.processRollDiceBoard = function (data) {
	console.log('processRollDiceBoard');
	console.log('processRollDiceBoard data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.rollDiceBoard(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(rollDiceBoardResponse, data), 'rollDiceBoardResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.rollDiceBoard.playerIdRollDice == _self._yourUserId) {
		if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
			if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
				_self.rollDiceYou(_self._gameplayData.gameState.rollDiceBoard.rollDiceValue, _self.moveYourCharacter, _self.enableMainPhaseActions);
			} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
				_self.rollDiceYou(_self._gameplayData.gameState.rollDiceBoard.rollDiceValue, _self.moveYourCharacter, _self.enableRollPhaseActions);
			}
		} else {
			_self.rollDiceYou(_self._gameplayData.gameState.rollDiceBoard.rollDiceValue, _self.moveYourCharacter,
				_self.checkIfYouHaveToDoAction.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self)));
		}
	} else {
		_self.hideEventsInfo(null, 0);
		if (_self._gameplayData.gameState.currPlayerId == _self._enemyUserId) {
			_self.rollDiceEnemy(_self._gameplayData.gameState.rollDiceBoard.rollDiceValue, _self.moveEnemyCharacter, _self.waitForEnemyActions);
		} else {
			if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
				_self.rollDiceEnemy(_self._gameplayData.gameState.rollDiceBoard.rollDiceValue, _self.moveEnemyCharacter, _self.checkIfEnemyHasToDoAction
					.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self)));
			} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
				_self.rollDiceEnemy(_self._gameplayData.gameState.rollDiceBoard.rollDiceValue, _self.moveEnemyCharacter, _self.checkIfEnemyHasToDoAction
					.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableRollPhaseActions.bind(_self)));
			}
		}
	}
};

gameController.prototype.processEndPhase = function (data) {
	console.log('processEndPhase');
	console.log('processEndPhase data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.endPhase(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(endPhaseResponse, data), 'endPhaseResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateCardsStatusText();
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.currPlayerId != _self._yourUserId) {
		_self.checkForExpiredCardsYou();
		_self.startEndPhaseAnimation(_self.nextTurn.bind(_self));
	} else {
		_self.checkForExpiredCardsEnemy();
		_self.startEndPhaseAnimation(_self.nextTurn.bind(_self));
	}
};

gameController.prototype.discardCard = function (card) {
	logger.info("Trying to discard card");

	var _self = this;

	var cardId = $(card).data("cardId");
	var cardIdx = $(card).index();

	_self._lastClientData = { roomId: _self._roomData.id, cardId: cardId, cardIdx: cardIdx };
	_self.client.discardCard(_self._lastClientData);
};

gameController.prototype.drawCardFromEnemyHand = function(card) {
	logger.info("Trying to draw card from enemy hand");

	var _self = this;
	var cardIdx = _self._gameplayData.gameState.playersState[_self._enemyUserId].cardsInHand - ($(card).index() + 1);

	_self._lastClientData = { roomId: _self._roomData.id, cardIdx: cardIdx };
	_self.client.drawCardFromEnemyHand(_self._lastClientData);
};

gameController.prototype.destroyCardFromEnemyField = function(card) {
		logger.info("Trying to destroy card from enemy field");

	var _self = this;
	var cardId = $(card).data("cardId");

	_self._lastClientData = { roomId: _self._roomData.id, cardId: cardId };
	_self.client.destroyCardFromEnemyField(_self._lastClientData);
};

gameController.prototype.takeCardFromGraveyard = function (card, playerId) {
	logger.info("Trying to take card from your graveyard");

	var _self = this;
	var cardIdx = _self._gameplayData.gameState.playersState[playerId].cardsInGraveyardArr.length - ($(card).index() + 1);

	_self._lastClientData = { roomId: _self._roomData.id, cardIdx: cardIdx, playerIdGraveyard: playerId };
	_self.client.takeCardFromGraveyard(_self._lastClientData);
};

gameController.prototype.processDiscardCard = function (data) {
	console.log('processDiscardCard');
	console.log('processDiscardCard data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.discardCard(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(discardCardResponse, data), 'discardCardResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	var callback;
	if (_self._gameplayData.gameState.playerIdDiscardedCard == _self._yourUserId) {
		if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
			if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
				callback = _self.enableMainPhaseActions.bind(_self);
			} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
				callback = _self.enableRollPhaseActions.bind(_self);
			}
		} else {
			callback = _self.checkIfYouHaveToDoAction
				.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self));
		}

		_self.discardCardFromHandYou(_self._gameplayData.gameState.cardDiscarded, callback);
	} else {
		_self.hideEventsInfo(null, 0);
		if (_self._gameplayData.gameState.currPlayerId == _self._enemyUserId) {
			callback = _self.waitForEnemyActions.bind(_self);
		} else {
			if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
				callback = _self.checkIfEnemyHasToDoAction.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
			} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
				callback = _self.checkIfEnemyHasToDoAction.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableRollPhaseActions.bind(_self));
			}
		}

		_self.discardCardFromHandEnemy(_self._gameplayData.gameState.cardDiscarded, callback);
	}
};

gameController.prototype.processFinishCardEffect = function (data) {
	console.log('processFinishCardEffect');
	console.log('processFinishCardEffect data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.finishCardEffect(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(finishCardEffectResponse, data), 'finishCardEffectResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.playerIdFinishCard == _self._yourUserId) {
		_self.performCardEffectInstantYou(_self._gameplayData.gameState.cardFinish);
	} else {
		_self.performCardEffectInstantEnemy(_self._gameplayData.gameState.cardFinish);
	}
};

gameController.prototype.processTimerValues = function (data) {
	var _self = this;

	_self._timerValuePlayer1 = data.timerValuePlayer1;
	_self._timerValuePlayer2 = data.timerValuePlayer2;
	_self.updateTimers();
};

gameController.prototype.updateTimers = function () {
	var _self = this;

	if (_self._roomData && _self._yourUserId == _self._roomData.player1Id) {
		$(_self.TIMER_CLASS + _self.PLAYER_YOU_CLASS).text(_self._timerValuePlayer1);
		$(_self.TIMER_CLASS + _self.PLAYER_ENEMY_CLASS).text(_self._timerValuePlayer2);
	} else {
		$(_self.TIMER_CLASS + _self.PLAYER_YOU_CLASS).text(_self._timerValuePlayer2);
		$(_self.TIMER_CLASS + _self.PLAYER_ENEMY_CLASS).text(_self._timerValuePlayer1);
	}
};

gameController.prototype.startDrawPhaseAnimationYou = function () {
	var _self = this;

	_self.switchPhaseYou(_self.PHASE_DRAW_ID);
};

gameController.prototype.startDrawPhaseAnimationEnemy = function () {
	var _self = this;

	_self.switchPhaseEnemy(_self.PHASE_DRAW_ID, _self.waitForEnemyActions.bind(_self));
};

gameController.prototype.startStandByPhaseAnimationYou = function () {
	var _self = this;

	_self.switchPhaseYou(_self.PHASE_STANDBY_ID);
};

gameController.prototype.startStandByPhaseAnimationEnemy = function () {
	var _self = this;

	_self.switchPhaseEnemy(_self.PHASE_STANDBY_ID, _self.checkForExpiredCardsEnemy.bind(_self));
};

gameController.prototype.startMainPhaseAnimationYou = function () {
	var _self = this;

	_self.switchPhaseYou(_self.PHASE_MAIN_ID);
};

gameController.prototype.startMainPhaseAnimationEnemy = function () {
	var _self = this;

	_self.switchPhaseEnemy(_self.PHASE_MAIN_ID,
		_self.updateGameStatusInfo.bind(_self),
		_self.checkForExpiredCardsEnemy.bind(_self, _self.checkIfYouHaveToDoAction
			.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self)))
	);
};

gameController.prototype.startRollPhaseAnimationYou = function () {
	var _self = this;

	_self.switchPhaseYou(_self.PHASE_ROLL_ID);
};

gameController.prototype.startRollPhaseAnimationEnemy = function () {
	var _self = this;

	_self.switchPhaseEnemy(_self.PHASE_ROLL_ID, _self.updateGameStatusInfo.bind(_self),
		_self.checkForExpiredCardsEnemy.bind(_self, _self.waitForEnemyActions.bind(_self)));
};

gameController.prototype.startEndPhaseAnimation = function (callback) {
	var _self = this;

	_self.switchPhaseEnemy(_self.PHASE_END_ID, callback);
};

gameController.prototype.startStandByPhase = function () {
	var _self = this;

	_self._lastClientData = { roomId: _self._roomData.id };
	_self.client.standByPhase(_self._lastClientData);
};

gameController.prototype.startMainPhase = function () {
	var _self = this;

	_self._lastClientData = { roomId: _self._roomData.id };
	_self.client.mainPhase(_self._lastClientData);
};

gameController.prototype.startRollPhase = function () {
	var _self = this;

	_self._lastClientData = { roomId: _self._roomData.id };
	_self.client.rollPhase(_self._lastClientData);
};

gameController.prototype.setYourTurnFieldStyle = function() {
	var _self = this;

	$(_self.PHASE_COLUMN_CLASS).removeClass('player-enemy');
	$(_self.PHASE_COLUMN_CLASS).addClass('player-you');
};

gameController.prototype.setEnemyTurnFieldStyle = function() {
	var _self = this;

	$(_self.PHASE_COLUMN_CLASS).removeClass('player-you');
	$(_self.PHASE_COLUMN_CLASS).addClass('player-enemy');
};

gameController.prototype.switchPhaseYou = function (currPhaseIdSelector) {
	var _self = this;

	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];
  var phaseText = $(currPhaseIdSelector).data("phaseText");

  $(_self.PHASE_COLUMN_CLASS).removeClass("active");
  $(currPhaseIdSelector).parent().prevAll().find(_self.PHASE_COLUMN_CLASS).removeClass('next');
  $(currPhaseIdSelector).parent().prevAll().find(_self.PHASE_COLUMN_CLASS).addClass('ended');
  $(currPhaseIdSelector).removeClass("next");
  $(currPhaseIdSelector).addClass("active");

  _self.showEventsInfo(phaseText);
  _self.hideEventsInfo();

  _self.switchPhaseTimeout = setTimeout(function() {
  	if (currPhaseIdSelector == _self.PHASE_DRAW_ID) {
  		if (playerStateYou.cardsToDraw > 0) {
	  		_self.setCardDrawListener();
		  	_self.startDrawCardAnimationsFinishedPoll(_self.startStandByPhase);
  		} else {
  			_self.startStandByPhase();
  		}
	  } else if (currPhaseIdSelector == _self.PHASE_STANDBY_ID) {
	  	_self.updateGameStatusInfo();
	  	_self.checkForExpiredCardsYou(_self.startMainPhase.bind(_self));
	  } else if (currPhaseIdSelector == _self.PHASE_MAIN_ID) {
	  	_self.updateGameStatusInfo();
	  	_self.checkForExpiredCardsYou(_self.checkIfEnemyHasToDoAction
	  		.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self)));
  	} else if (currPhaseIdSelector == _self.PHASE_ROLL_ID) {
  		_self.updateGameStatusInfo();
	  	_self.checkForExpiredCardsYou(_self.enableRollPhaseActions.bind(_self));
	  } else if (currPhaseIdSelector == _self.PHASE_END_ID) {
	  	$(currPhaseIdSelector).removeClass("active");
	  	$(currPhaseIdSelector).addClass("ended");
	  }
  }.bind(this), 2100);
};

gameController.prototype.showEnergyChangeAnimation = function (playerId, playerSelectorClass, showValue) {
	var _self = this;

	showValue = +showValue;
	if (showValue >= 0) {
		showValue = "+" + showValue;
	}

	clearTimeout(_self.showEnergyTimeout);
	$(_self.ENERGY_REGEN_CLASS + playerSelectorClass).css("animation", "");
	$(_self.ENERGY_REGEN_CLASS + playerSelectorClass).css("-webkit-animation", "");

	var playerState = _self._gameplayData.gameState.playersState[playerId];
	$(_self.ENERGY_REGEN_CLASS + playerSelectorClass).html(showValue);
	$(_self.ENERGY_REGEN_CLASS + playerSelectorClass).css("animation", "energy-regen-" + (playerSelectorClass.substr(1)) + " 2s ease-out")
	$(_self.ENERGY_REGEN_CLASS + playerSelectorClass).css("-webkit-animation", "energy-regen-" + (playerSelectorClass.substr(1)) + " 2s ease-out")

	_self.showEnergyTimeout = setTimeout(function() {
		$(_self.ENERGY_REGEN_CLASS + playerSelectorClass).css("animation", "");
		$(_self.ENERGY_REGEN_CLASS + playerSelectorClass).css("-webkit-animation", "");
	}, 2000);
};

gameController.prototype.enableMainPhaseActions = function () {
	var _self = this;

	_self.updateCardChargesStatuses();
	_self.updateCardsStatusText();

	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];

	if (playerStateYou.chainObj && playerStateYou.chainObj.chainTrigger) {
		if (_self._postDestroyCard) {
			var card = _self._postDestroyCard;
			_self._postDestroyCard = null;
			_self.destroyCardAnimationYou.call(_self, card, _self.enableMainPhaseActions.bind(_self));
			return;
		}

		if (playerStateYou.chainObj.cardsToChain.length > 0) {
			_self.setCardChainListener();
		} else {
			_self.finishChainEffect();
		}
	} else if (playerStateYou.cardsToDraw > 0) {
		_self.setCardDrawListener();
	  _self.startDrawCardAnimationsFinishedPoll(_self.checkIfEnemyHasToDoAction
	  	.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self)));
  	return;
	} else if (playerStateYou.cardsToDrawFromEnemyHand > 0) {
		_self.setDrawCardFromEnemyHandListener();
	} else if (playerStateYou.cardsToDiscard > 0) {
		_self.setCardDiscardListener();
	} else if (playerStateYou.cardsToTakeFromYourGraveyard > 0) {
		_self.setTakeCardFromYourGraveyardListener();
	} else if (playerStateYou.cardsToTakeFromEnemyGraveyard > 0) {
		_self.setTakeCardFromEnemyGraveyardListener();
	} else if (playerStateYou.cardsToDestroyFromEnemyField > 0) {
		_self.setDestroyCardFromEnemyFieldListener();
	} else if (playerStateYou.canRollDiceBoardCount > 0) {
		_self.enableRollDiceBoard();
		return;
	} else if (_self._postDestroyCard) {
		var card = _self._postDestroyCard;
		_self._postDestroyCard = null;
		_self.destroyCardAnimationYou.call(_self, card, _self.enableMainPhaseActions.bind(_self));
		return;
	} else {
		_self.hideEventsInfo(null, 0);
		$(_self.PHASE_ROLL_ID).addClass("selectable");
		_self.setUpContinuousCardOnClickListener();
		_self.setCardSummonListener();

		$(_self.PHASE_ROLL_ID).attr("data-tooltip", "switchPhaseRoll");
		$(_self.PHASE_ROLL_ID).on("click", function(e) {
			$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).removeAttr("data-tooltip");
			_self.disableMainPhaseActions();
			_self.disableContinuousCardOnClickListener();
			_self.startRollPhase();
		});
	}
};

gameController.prototype.setCardChainListener = function () {
	var _self = this;

	_self.hideEventsInfo(null, 0);
	$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').html("");
	$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child')
		.append('<div class="anime-cb-choose-card-effect-title">Do you want to chain cards ?</div>');

	$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').append('<img class="anime-cb-choose-card-effect-choice"\
		src="/imgs/yes.png" data-chain-cards="true" style="width: 100px; height: 100px;">');
	$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').append('<img class="anime-cb-choose-card-effect-choice"\
		src="/imgs/no.png" data-chain-cards="false" style="width: 100px; height: 100px;">');

	_self.chooseCardEffectInitStyles();

	$(_self.CHOOSE_CARD_EFFECT_CLASS).on("click", _self.CHOOSE_CARD_EFFECT_CHOICE_CLASS, function() {
		$(_self.CHOOSE_CARD_EFFECT_CLASS).off("click");
		_self.chooseCardEffectFinishStyles();
		$(_self.CHANGE_CHAIN_DECISION_CLASS).show();
		$(_self.CHANGE_CHAIN_DECISION_CLASS).on("click", function() {
			$(_self.CHANGE_CHAIN_DECISION_CLASS).off("click");
			$(_self.CHANGE_CHAIN_DECISION_CLASS).hide();
			$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).removeAttr("data-tooltip");
			$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).off("click");
			$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("animation", "");
			_self.setCardChainListener();
		});

		if ($(this).data("chainCards")) {
			_self.showEventsInfo("Choose a card to chain");
			_self.hideEventsInfo(null, 1500);

			$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).each(function() {
				var card = this;
				var canSummonCard = _self.canSummonCard(card);

				if (!canSummonCard) {
					var msg = _self.quickGameInfoMsg;
					$(card).on("click", function(e) {
						if (_self.quickGameInfoEnabled) {
							_self.showQuickGameInfo(msg);
						}
					});
					return;
				}

				$(card).css("animation", "border-animation 2s infinite linear");
				$(card).attr("data-tooltip", "chainCard");
				$(card).on("click", function(e) {
					$(_self.CHANGE_CHAIN_DECISION_CLASS).off("click");
					$(_self.CHANGE_CHAIN_DECISION_CLASS).hide();
					$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).removeAttr("data-tooltip");
					$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).off("click");
					$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("animation", "");
					_self.summonCard.call(_self, this);
				});
			});
		} else {
			$(_self.CHANGE_CHAIN_DECISION_CLASS).off("click");
			$(_self.CHANGE_CHAIN_DECISION_CLASS).hide();
			_self.finishChainEffect();
			return;
		}
	});
};

gameController.prototype.finishChainEffect = function () {
	var _self = this;

	_self._lastClientData = { roomId: _self._roomData.id };
	_self.client.finishChainEffect(_self._lastClientData);
};

gameController.prototype.setCardSummonListener = function () {
	var _self = this;

	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).each(function() {
		var card = this;
		var canSummonCard = _self.canSummonCard(card);

		if (!canSummonCard) {
			var msg = _self.quickGameInfoMsg;
			$(card).on("click", function(e) {
				if (_self.quickGameInfoEnabled) {
					_self.showQuickGameInfo(msg);
				}
			});
			return;
		}

		$(card).attr("data-tooltip", "summonCard");
		$(card).on("click", function(e) {
			$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).removeAttr("data-tooltip");
			_self.disableMainPhaseActions();
			_self.disableContinuousCardOnClickListener();
			_self.summonCard.call(_self, this);
		});
	});
};

gameController.prototype.disableMainPhaseActions = function () {
	var _self = this;

	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).off("click");
	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).removeAttr("data-tooltip");
	$(_self.PHASE_ROLL_ID).off("click");
	$(_self.PHASE_ROLL_ID).removeClass("selectable");
	_self.disableContinuousCardOnClickListener();
	$(_self.PHASE_ROLL_ID).removeAttr("data-tooltip");
};

gameController.prototype.enableActionsInEnemyPhase = function () {
	var _self = this;

	_self.updateCardChargesStatuses();
	_self.updateCardsStatusText();

	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];

	if (playerStateYou.chainObj && playerStateYou.chainObj.chainTrigger) {
		if (_self._postDestroyCard) {
			var card = _self._postDestroyCard;
			_self._postDestroyCard = null;
			_self.destroyCardAnimationYou.call(_self, card, _self.enableActionsInEnemyPhase.bind(_self));
			return;
		}

		if (playerStateYou.chainObj.cardsToChain.length > 0) {
			_self.setCardChainListener();
		} else {
			_self.finishChainEffect();
		}
	} else if (playerStateYou.cardsToDraw > 0) {
		_self.setCardDrawListener();
	  _self.startDrawCardAnimationsFinishedPoll(_self.checkIfYouHaveToDoAction
	  	.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self)));
  	return;
	} else if (playerStateYou.cardsToDrawFromEnemyHand > 0) {
		_self.setDrawCardFromEnemyHandListener();
	} else if (playerStateYou.cardsToDiscard > 0) {
		_self.setCardDiscardListener();
	} else if (playerStateYou.cardsToTakeFromYourGraveyard > 0) {
		_self.setTakeCardFromYourGraveyardListener();
	} else if (playerStateYou.cardsToTakeFromEnemyGraveyard > 0) {
		_self.setTakeCardFromEnemyGraveyardListener();
	} else if (playerStateYou.cardsToDestroyFromEnemyField > 0) {
		_self.setDestroyCardFromEnemyFieldListener();
	} else if (playerStateYou.canRollDiceBoardInRollPhase
		&& playerStateYou.canRollDiceBoardCount > 0) {
		_self.enableRollDiceBoard();
		return;
	} else if (_self._postDestroyCard) {
		var card = _self._postDestroyCard;
		_self._postDestroyCard = null;
		_self.destroyCardAnimationEnemy.call(_self, card);
		setTimeout(_self.waitForEnemyActions.bind(_self), 0);
		return;
	} else {
		_self.waitForEnemyActions();
	}
};

gameController.prototype.checkForExpiredCardsYou = function (callback) {
	var _self = this;

	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];

	if (playerStateYou.cardsExpired.length > 0) {
		playerStateYou.cardsExpired.forEach(function(card, cardIdx, arr) {
			if (cardIdx == arr.length - 1) {
				_self.destroyCardAnimationYou(card, callback);
			} else {
				_self.destroyCardAnimationYou(card);
			}
		});
	} else {
		if (typeof callback === "function") {
			callback();
		}
	}
};

gameController.prototype.checkForExpiredCardsEnemy = function (callback) {
	var _self = this;

	var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];

	if (playerStateEnemy.cardsExpired.length > 0) {
		playerStateEnemy.cardsExpired.forEach(function(card, cardIdx, arr) {
			if (cardIdx == arr.length - 1) {
				_self.destroyCardAnimationEnemy(card, callback);
			} else {
				_self.destroyCardAnimationEnemy(card);
			}
		});
	} else {
		if (typeof callback === "function") {
			callback();
		}
	}
};

gameController.prototype.performCardEffectInstantYou = function (card) {
	var _self = this;

	if (!card.cardEffect.continuous) {
		if (card.cardEffect.effect == "moveSpacesForwardUpTo") {
			if (card.cardEffect.isFinished) {
				_self.moveYourCharacter(card.cardEffect.effectValueChosen,
					_self.destroyCardAnimationYou.bind(_self, card, _self.enableMainPhaseActions.bind(_self)), 0);
			} else {
				_self.setBoardSpaceListener(card);
			}
		} else if (card.cardEffect.effect == "moveSpacesBackwardsUpToEnemy") {
			if (card.cardEffect.isFinished) {
				_self.moveEnemyCharacter(card.cardEffect.effectValueChosen,
					_self.destroyCardAnimationYou.bind(_self, card, _self.checkIfEnemyHasToDoAction
						.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self))), 0);
			} else {
				_self.setBoardSpaceListener(card);
			}
		} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpTo") {
			if (card.cardEffect.isFinished) {
				_self.moveYourCharacter(card.cardEffect.effectValueChosen,
					_self.destroyCardAnimationYou.bind(_self, card, _self.enableMainPhaseActions.bind(_self)), 0);
			} else {
				_self.setBoardSpaceListener(card);
			}
		}	else if (card.cardEffect.effect == "moveSpacesForward") {
			_self.moveYourCharacter(card.cardEffect.effectValue,
				_self.destroyCardAnimationYou.bind(_self, card, _self.enableMainPhaseActions.bind(_self)), 500);
		} else if (card.cardEffect.effect == "moveSpacesBackwardsEnemy") {
			_self.moveEnemyCharacter(card.cardEffect.effectValue,
				_self.destroyCardAnimationYou.bind(_self, card, _self.checkIfEnemyHasToDoAction
					.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self))), 0);
		} else if (card.cardEffect.effect.match("createSpecialBoardSpaceForwardTier")) {
			if (card.cardEffect.isFinished) {
				_self.createNewSpecialBoardSpaceAnimation(card.finishData,
					_self.destroyCardAnimationYou.bind(_self, card, _self.enableMainPhaseActions.bind(_self)));
			} else {
				_self.setBoardSpaceListener(card);
			}
		} else if (card.cardEffect.effect == "destroySpecialBoardSpaceForward") {
			if (card.cardEffect.isFinished) {
				_self.destroySpecialBoardSpaceAnimation(card.finishData,
					_self.destroyCardAnimationYou.bind(_self, card, _self.enableMainPhaseActions.bind(_self)));
			} else {
				_self.setBoardSpaceListener(card);
			}
		} else if (card.cardEffect.effect == "drawCardFromEnemyHand") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "drawCardFromEnemyYourHand") {
			_self._postDestroyCard = card;
			_self.checkIfEnemyHasToDoAction(_self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
		} else if (card.cardEffect.effect == "destroyCardFromEnemyField") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "drawCardFromDeckYouEnemy") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "takeCardFromYourGraveyard") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "takeCardFromEnemyGraveyard") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "moveSpacesForwardMoveSpacesBackwardEnemyX") {
			if (card.cardEffect.isFinished) {
				_self.rollDiceYou(card.cardEffect.effectValueChosen, noop);
				_self.moveSpacesTimeout = setTimeout(function() {
					if (card.playerYouMovedSuccessfully) {
						_self.moveEnemyCharacter(card.cardEffect.effectValueChosen, null, 0);
						_self.moveYourCharacter(card.cardEffect.effectValueChosen,
							_self.destroyCardAnimationYou.bind(_self, card, _self.checkIfEnemyHasToDoAction
							.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self))), 0);
					} else {
						_self.moveYourCharacter(card.cardEffect.effectValueChosen, null, 0);
						_self.moveEnemyCharacter(card.cardEffect.effectValueChosen,
							_self.destroyCardAnimationYou.bind(_self, card, _self.checkIfEnemyHasToDoAction
							.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self))), 0);
					}
				}, 2000);
			} else {
				_self.setRollDiceCardListener(card);
			}
		} else if (card.cardEffect.effect == "drawCardFromDeckYouDiscardCardYou") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialYou") {
			if (card.cardEffect.isFinished) {
				_self.moveYourCharacter(card.finishData.moveSpaces,
					_self.destroyCardAnimationYou.bind(_self, card, _self.enableMainPhaseActions.bind(_self)), 500);
			} else {
				_self.setDirectionListener(card, _self._yourUserId);
			}
		} else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialEnemy") {
			if (card.cardEffect.isFinished) {
				_self.moveEnemyCharacter(card.finishData.moveSpaces,
					_self.destroyCardAnimationYou.bind(_self, card, _self.checkIfEnemyHasToDoAction
						.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self))), 500);
			} else {
				_self.setDirectionListener(card, _self._enemyUserId);
			}
		} else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceYou") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemy") {
			_self._postDestroyCard = card;
			_self.checkIfEnemyHasToDoAction(_self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
		} else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemyYou") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceYouEnemy") {
			_self._postDestroyCard = card;
			_self.checkIfEnemyHasToDoAction(_self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
		} else if (card.cardEffect.effect == "increaseChargesContinousCard") {
			if (card.cardEffect.isFinished) {
				_self.destroyCardAnimationYou(card, _self.enableMainPhaseActions.bind(_self));
			} else {
				_self.setCardSelectOnFieldListenerWrapper(card);
			}
		} else if (card.cardEffect.effect == "rollDiceForwardBackward") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "moveSpacesForwardNonSpecial") {
			if (card.cardEffect.isFinished) {
				_self.rollDiceYou(card.cardEffect.effectValueChosen,
					_self.moveYourCharacter.bind(_self, card.cardEffect.moveSpaces,
						_self.destroyCardAnimationYou.bind(_self, card, _self.enableMainPhaseActions.bind(_self)), 2000));
			} else {
				_self.setRollDiceCardListener(card);
			}
		} else if (card.cardEffect.effect == "discardCardTakeCardFromYourGraveyard") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "energyGain") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "chooseAttributeVariation1") {
			if (card.cardEffect.isFinished) {
				_self._postDestroyCard = card;

				if (card.cardEffect.successfullyGuessed) {
					_self.showEventsInfo("Successfully Guessed !");
				} else {
					_self.showEventsInfo("Failed to Guess...");
				}

				_self.hideEventsInfo(null, 1000);

				_self.waitForMsgTimeout = setTimeout(function() {
					if (card.cardEffect.moveSpaces) {
						_self.moveYourCharacter(card.cardEffect.moveSpaces,
							_self.enableMainPhaseActions.bind(_self), 0);
					} else if (card.cardEffect.cardsToDraw || card.cardEffect.cardsToDiscard
						|| card.cardEffect.gainEnergy || card.cardEffect.loseEnergy) {
						_self.enableMainPhaseActions();
					}
				}, 1500);
			} else {
				_self.setAttributeListenerVariation1(card);
			}
		} else if (card.cardEffect.effect == "chooseAttributeVariation2") {
			if (card.cardEffect.isFinished) {
				_self._postDestroyCard = card;

				if (card.cardEffect.successfullyGuessed) {
					_self.showEventsInfo("Successfully Guessed !");
				} else {
					_self.showEventsInfo("Failed to Guess...");
				}

				_self.hideEventsInfo(null, 1000);

				_self.waitForMsgTimeout = setTimeout(function() {
					if (card.cardEffect.moveSpaces) {
						_self.moveEnemyCharacter(card.cardEffect.moveSpaces, _self.checkIfEnemyHasToDoAction
							.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self)), 0);
					} else if (card.cardEffect.cardsToDraw || card.cardEffect.cardsToDiscard
						|| card.cardEffect.gainEnergy || card.cardEffect.loseEnergy) {
						_self.checkIfEnemyHasToDoAction(_self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
					}
				}, 1500);
			} else {
				_self.setAttributeListenerVariation1(card);
			}
		} else if (card.cardEffect.effect == "destroySpecialBoardSpacesAllRadius") {
			if (card.cardEffect.isFinished) {
				card.finishData.destroyedBoardSpacesPositions.forEach(function(boardSpaceData, positionIdx, arr) {
					if (positionIdx == arr.length - 1) {
						_self.destroySpecialBoardSpaceAnimation(boardSpaceData,
							_self.destroyCardAnimationYou.bind(_self, card, _self.enableMainPhaseActions.bind(_self)));
					} else {
						_self.destroySpecialBoardSpaceAnimation(boardSpaceData);
					}
				});
			} else {
				_self.setEnergyListener(card);
			}
		}
	} else if (card.cardEffect.continuous) {
		_self.enableMainPhaseActions();
	}
};

gameController.prototype.setDirectionListener = function (card, playerId) {
	var _self = this;

	var playerState = _self._gameplayData.gameState.playersState[playerId];

	$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').html("");
	$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child')
		.append('<div class="anime-cb-choose-card-effect-title">Choose direction</div>');

	if (playerId == _self._roomData.player1Id) {
		if (card.cardEffect.specialBoardSpaceForwardAvailable) {
			$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').append('<img class="anime-cb-choose-card-effect-choice"\
				src="/imgs/direction_forward.png" data-move-backward="false" style="width: 100px; height: 100px;">');
		}

		if (card.cardEffect.specialBoardSpaceBackwardAvailable) {
			$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').append('<img class="anime-cb-choose-card-effect-choice"\
				src="/imgs/direction_backward.png" data-move-backward="true" style="width: 100px; height: 100px;">');
		}
	} else {
		if (card.cardEffect.specialBoardSpaceBackwardAvailable) {
			$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').append('<img class="anime-cb-choose-card-effect-choice"\
				src="/imgs/direction_forward.png" data-move-backward="false" style="width: 100px; height: 100px;">');
		}

		if (card.cardEffect.specialBoardSpaceForwardAvailable) {
			$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').append('<img class="anime-cb-choose-card-effect-choice"\
				src="/imgs/direction_backward.png" data-move-backward="true" style="width: 100px; height: 100px;">');
		}
	}

	_self.chooseCardEffectInitStyles();

	$(_self.CHOOSE_CARD_EFFECT_CLASS).on('click', _self.CHOOSE_CARD_EFFECT_CHOICE_CLASS, function() {
		$(_self.CHOOSE_CARD_EFFECT_CLASS).off("click");
		_self.chooseCardEffectFinishStyles();

		var finishData = { moveBackward: $(this).data("moveBackward") };
		_self._lastClientData = { roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData };

		if (card.cardEffect.continuous) {
			_self.client.finishCardEffectContinuous(_self._lastClientData);
		} else {
			_self.client.finishCardEffect(_self._lastClientData);
		}
	});
};

gameController.prototype.chooseCardEffectInitStyles = function () {
	var _self = this;

	$(_self.CHOOSE_CARD_EFFECT_CLASS).addClass('fade-in-custom');
	$(_self.CHOOSE_CARD_EFFECT_CLASS).addClass("transparent");
	$(_self.CHOOSE_CARD_EFFECT_CLASS).css("opacity", 1);
	$(_self.CHOOSE_CARD_EFFECT_CLASS).css("z-index", 1);
  $(_self.BOARD_PLAYER_YOU_ID).css("z-index", "1");
	$(_self.BOARD_PLAYER_ENEMY_ID).css("z-index", "1");
};

gameController.prototype.chooseCardEffectFinishStyles = function () {
	var _self = this;

	$(_self.BOARD_PLAYER_YOU_ID).css("z-index", "3");
	$(_self.BOARD_PLAYER_ENEMY_ID).css("z-index", "2");
	$(_self.CHOOSE_CARD_EFFECT_CLASS).removeClass('fade-in-custom');
	$(_self.CHOOSE_CARD_EFFECT_CLASS).removeClass("transparent");
	$(_self.CHOOSE_CARD_EFFECT_CLASS).css("opacity", 0);
	$(_self.CHOOSE_CARD_EFFECT_CLASS).css("z-index", -1);
};

gameController.prototype.setEnergyListener = function (card) {
	var _self = this;

	var playerState = _self._gameplayData.gameState.playersState[_self._yourUserId];
	var energyPoints = playerState.energyPoints;
	var minEnergyToUse = card.cardEffect.minEnergyToUse;
	var maxEnergyToUse = card.cardEffect.maxEnergyToUse;

	$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').html("");
	$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child')
		.append('<div class="anime-cb-choose-card-effect-title">Choose Energy to spend</div>');

	for (var i = minEnergyToUse; i <= maxEnergyToUse; i+=card.cardEffect.effectValue) {
		$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').append('<img class="anime-cb-choose-card-effect-choice"\
			src="/imgs/number_' + i + '.png" data-energy-chosen="'
			+ i +  '" style="width: 100px; height: 100px;">');
	}

	_self.chooseCardEffectInitStyles();

	$(_self.CHOOSE_CARD_EFFECT_CLASS).on('click', _self.CHOOSE_CARD_EFFECT_CHOICE_CLASS, function() {
		$(_self.CHOOSE_CARD_EFFECT_CLASS).off("click");
		_self.chooseCardEffectFinishStyles();

		var finishData = { energyChosen: $(this).data("energyChosen") };
		_self._lastClientData = { roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData };

		if (card.cardEffect.continuous) {
			_self.client.finishCardEffectContinuous(_self._lastClientData);
		} else {
			_self.client.finishCardEffect(_self._lastClientData);
		}
	});
};

gameController.prototype.setAttributeListenerVariation1 = function (card) {
	var _self = this;

	var playerState = _self._gameplayData.gameState.playersState[_self._yourUserId];

	$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').html("");
	$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child')
		.append('<div class="anime-cb-choose-card-effect-title">Choose card attribute</div>');

	_self.CARD_ATTRIBUTES.forEach(function(attribute) {
		$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').append('<img class="anime-cb-choose-card-effect-choice"\
			src="/imgs/' + _self.CARD_ATTRUBUTES_IMGS[attribute] + '" data-card-attribute="'
			+ attribute +  '" style="width: 100px; height: 100px;">');
	});

	_self.chooseCardEffectInitStyles();

	$(_self.CHOOSE_CARD_EFFECT_CLASS).on('click', _self.CHOOSE_CARD_EFFECT_CHOICE_CLASS, function() {
		$(_self.CHOOSE_CARD_EFFECT_CLASS).off("click");
		_self.chooseCardEffectFinishStyles();

		var callBackFunc = function (card, cardAttribute) {
			var finishData = { chosenAttribute: cardAttribute };
			_self._lastClientData = { roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData };

			if (card.cardEffect.continuous) {
				_self.client.finishCardEffectContinuous(_self._lastClientData);
			} else {
				_self.client.finishCardEffect(_self._lastClientData);
			}
		};

		_self.setCardDrawListener();
	  _self.startDrawCardAnimationsFinishedPoll(callBackFunc.bind(_self, card, $(this).data("cardAttribute")));
	});
};

gameController.prototype.setCardSelectOnFieldListenerWrapper = function (card) {
	var _self = this;

	if (card.cardEffect.effect == "increaseChargesContinousCard") {
		_self.setCardSelectFromFieldListener(card, [_self.PLAYER_YOU_CLASS]);
	} else if (card.cardEffect.effect == "decreaseChargesContinousCardAll") {
		_self.setCardSelectFromFieldListener(card, [_self.PLAYER_YOU_CLASS, _self.PLAYER_ENEMY_CLASS]);
	}
};

gameController.prototype.setCardSelectOnFieldListenerWrapperEnemy = function (card) {
	var _self = this;

	if (card.cardEffect.effect == "increaseChargesContinousCard") {
		_self.setCardSelectFromFieldListenerEnemy(card, [_self.PLAYER_ENEMY_CLASS]);
	} else if (card.cardEffect.effect == "decreaseChargesContinousCardAll") {
		_self.setCardSelectFromFieldListenerEnemy(card, [_self.PLAYER_ENEMY_CLASS, _self.PLAYER_YOU_CLASS]);
	}
};

gameController.prototype.setCardSelectFromFieldListener = function (card, playerIdSelectorsArr) {
	var _self = this;

	var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];
	var allowedAttributes = card.cardEffect.allowedAttributes;
	var cardFromFieldText = "";

	if (playerIdSelectorsArr.length > 1) {
		cardFromFieldText += " any field";
	} else {
		if (playerIdSelectorsArr[0] == _self.PLAYER_YOU_CLASS) {
			cardFromFieldText += " your field";
		} else {
			cardFromFieldText += " your opponent's field";
		}
	}

	var eventInfoText = "Select card from" + cardFromFieldText;
	_self.showEventsInfo(eventInfoText);

	var availableTargetsEnemy = [];
	if (playerIdSelectorsArr.includes(_self.PLAYER_ENEMY_CLASS)) {
		playerStateEnemy.cardsOnFieldArr.forEach(function(cardOnField) {
			if (cardOnField.cardEffect.effect == "taunt") {
				availableTargetsEnemy.push(cardOnField);
			}
		});
	}

	playerIdSelectorsArr.forEach(function(playerSelectorClass) {
		$(_self.CARD_ON_FIELD_CLASS + playerSelectorClass).each(function() {
			var cardOnField = this;
			var cardAttributes = $(cardOnField).data("cardAttributes");
			var selectable = false;
			cardAttributes.forEach(function(attribute) {
				if (allowedAttributes.includes(attribute)) {
					selectable = true;
				}
			});

			if (!selectable) {
				_self.quickGameInfoMsg = "Cannot target cards without any of the following attributes: " +
					(allowedAttributes.join(", "));
			}

			if ($(cardOnField).hasClass("player-you") && $(cardOnField).data("cardId") == card.cardId) {
				selectable = false;
				_self.quickGameInfoMsg = "Cannot target the same card";
			}

			if (playerSelectorClass == _self.PLAYER_ENEMY_CLASS
				&& availableTargetsEnemy.length > 0) {
				selectable = false;
				_self.quickGameInfoMsg = "Can target only cards with 'Taunt' effect: "
  				+ (availableTargetsEnemy.map(a => a.cardName)).join(", ");
		    availableTargetsEnemy.forEach(function(cardTarget) {
		      if ($(cardOnField).data("cardId") == cardTarget.cardId) {
		        selectable = true;
		      }
		    });
		  }

			if (!selectable) {
				var msg = _self.quickGameInfoMsg;
				$(cardOnField).on("click", function(e) {
					_self.showQuickGameInfo(msg);
				});
				return;
			}

			$(cardOnField).attr("data-tooltip", "selectCard");
			$(cardOnField).on("click", function() {
				$(_self.CARD_ON_FIELD_CLASS).off("click");
				$(_self.CARD_ON_FIELD_CLASS).removeAttr("data-tooltip");
				_self.hideEventsInfo(null, 0);
				var finishData = { cardId: $(this).data("cardId"), fieldChosen: $(this).hasClass("player-you") ? "your" : "enemy" };
				_self._lastClientData = { roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData };

				if (card.cardEffect.continuous) {
					_self.client.finishCardEffectContinuous(_self._lastClientData);
				} else {
					_self.client.finishCardEffect(_self._lastClientData);
				}
			});
		});
	});
};

gameController.prototype.setCardSelectFromFieldListenerEnemy = function (card, playerIdSelectorsArr) {
		var _self = this;

	var playerSelectorClass;
	var cardFromFieldText = "";

	if (playerIdSelectorsArr.length > 1) {
		cardFromFieldText += " any field";
	} else {
		if (playerIdSelectorsArr[0] == _self.PLAYER_YOU_CLASS) {
			cardFromFieldText += " your field";
		} else {
			cardFromFieldText += " his field";
		}
	}

	var eventInfoText = "Your opponent must select a card from " + cardFromFieldText;

	_self.showEventsInfo(eventInfoText);
};

gameController.prototype.setRollDiceCardListener = function (card) {
	var _self = this;

	var eventInfoText = "Roll dice for " + card.cardName;
	_self.showEventsInfo(eventInfoText);

	$(_self.ROLL_DIE_CLASS).show();
	$(_self.ROLL_DIE_CLASS).on("click", function() {
		$(_self.ROLL_DIE_CLASS).off("click");
		$(_self.ROLL_DIE_CLASS).hide();
		_self.hideEventsInfo(null, 0);
		var finishData = { diceValueDummy: 0 };
		_self._lastClientData = { roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData };
		_self.client.finishCardEffect(_self._lastClientData);
	});
};

gameController.prototype.setRollDiceCardListenerEnemy = function (card) {
	var _self = this;

	var eventInfoText = "Your opponent rolls dice for " + card.cardName;
	_self.showEventsInfo(eventInfoText);
};

gameController.prototype.performCardEffectContinuousYou = function (card) {
	var _self = this;

	_self.updateCardChargesStatuses();
	if (card.cardEffect.continuous) {
		if (card.cardEffect.effect == "copySpecialSpacesUpTo"
			|| card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToEnemy"
			|| card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToYou") {
			_self.setBoardSpaceListener(card);
		} else if (card.cardEffect.effect == "decreaseChargesContinousCardAll") {
			_self.setCardSelectOnFieldListenerWrapper(card);
		}
	}
};

gameController.prototype.performCardEffectContinuousEnemy = function (card) {
	var _self = this;

	_self.updateCardChargesStatuses();
	if (card.cardEffect.continuous) {
		if (card.cardEffect.effect == "copySpecialSpacesUpTo"
			|| card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToEnemy"
			|| card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToYou") {
			_self.setBoardSpaceListenerEnemy(card);
		} else if (card.cardEffect.effect == "decreaseChargesContinousCardAll") {
			_self.setCardSelectOnFieldListenerWrapperEnemy(card);
		}
	}
};

gameController.prototype.performCardEffectContinuousFinishYou = function (card) {
	var _self = this;

	if (card.cardEffect.continuous) {
		if (card.cardEffect.effect == "copySpecialSpacesUpTo") {
			if (card.cardEffect.isFinished) {
				_self.destroyCardAnimationYou(card, _self.enableMainPhaseActions.bind(_self));
			} else {
				_self.enableMainPhaseActions();
			}
		} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToEnemy") {
			if (card.cardEffect.isFinished) {
				_self.moveEnemyCharacter(card.cardEffect.effectValueChosen,
					_self.destroyCardAnimationYou.bind(_self, card, _self.checkIfEnemyHasToDoAction
						.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self))), 0);
			} else {
				_self.moveEnemyCharacter(card.cardEffect.effectValueChosen, _self.checkIfEnemyHasToDoAction
					.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self)), 0);
			}
		} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToYou") {
			if (card.cardEffect.isFinished) {
				_self.moveYourCharacter(card.cardEffect.effectValueChosen,
					_self.destroyCardAnimationYou.bind(_self, card, _self.checkIfEnemyHasToDoAction
						.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self))), 0);
			} else {
				_self.moveYourCharacter(card.cardEffect.effectValueChosen, _self.checkIfEnemyHasToDoAction
					.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self)), 0);
			}
		} else if (card.cardEffect.effect == "decreaseChargesContinousCardAll") {
			var callback = function (card) {
				if (card.finishData.fieldChosen == "your") {
					_self.checkForExpiredCardsYou(_self.checkIfEnemyHasToDoAction
						.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self)));
				} else {
					_self.checkForExpiredCardsEnemy(_self.checkIfEnemyHasToDoAction
						.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self)));
				}
			};

			let playerSelectorClass = card.finishData.fieldChosen == "your" ? _self.PLAYER_YOU_CLASS : _self.PLAYER_ENEMY_CLASS;
			if (card.cardEffect.isFinished) {
				_self.showCardOnScreen(card.finishData.cardChosen, playerSelectorClass,
					_self.destroyCardAnimationYou.bind(_self, card, callback.bind(_self, card)));
			} else {
				_self.showCardOnScreen(card.finishData.cardChosen, playerSelectorClass, callback.bind(_self, card));
			}
		} else {
			_self.enableMainPhaseActions();
		}
	}
};

gameController.prototype.performCardEffectContinuousFinishEnemy = function (card) {
	var _self = this;

	if (card.cardEffect.continuous) {
		if (card.cardEffect.effect == "copySpecialSpacesUpTo") {
			if (card.cardEffect.isFinished) {
				_self.destroyCardAnimationEnemy(card, _self.waitForEnemyActions.bind(_self));
			} else {
				_self.waitForEnemyActions();
			}
		} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToEnemy") {
			if (card.cardEffect.isFinished) {
				_self.moveYourCharacter(card.cardEffect.effectValueChosen,
					_self.destroyCardAnimationEnemy.bind(_self, card, _self.checkIfYouHaveToDoAction
						.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self))), 0);
			} else {
				_self.moveYourCharacter(card.cardEffect.effectValueChosen, _self.checkIfYouHaveToDoAction
					.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self)), 0);
			}
		} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToYou") {
			if (card.cardEffect.isFinished) {
				_self.moveEnemyCharacter(card.cardEffect.effectValueChosen,
					_self.destroyCardAnimationEnemy.bind(_self, card, _self.checkIfYouHaveToDoAction
						.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self))), 0);
			} else {
				_self.moveEnemyCharacter(card.cardEffect.effectValueChosen, _self.checkIfYouHaveToDoAction
					.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self)), 0);
			}
		} else if (card.cardEffect.effect == "decreaseChargesContinousCardAll") {
			_self.hideEventsInfo(null, 0);
			var callback = function (card) {
				if (card.finishData.fieldChosen == "your") {
					_self.checkForExpiredCardsEnemy(_self.checkIfYouHaveToDoAction
						.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self)));
				} else {
					_self.checkForExpiredCardsYou(_self.checkIfYouHaveToDoAction
						.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self)));
				}
			};

			let playerSelectorClass = card.finishData.fieldChosen == "your" ? _self.PLAYER_ENEMY_CLASS : _self.PLAYER_YOU_CLASS;
			if (card.cardEffect.isFinished) {
				_self.showCardOnScreen(card.finishData.cardChosen, playerSelectorClass,
					_self.destroyCardAnimationEnemy.bind(_self, card, callback.bind(_self, card)));
			} else {
				_self.showCardOnScreen(card.finishData.cardChosen, playerSelectorClass, callback.bind(_self, card));
			}
		} else {
			_self.waitForEnemyActions();
		}
	}
};

gameController.prototype.checkIfEnemyHasToDoAction = function (callback, callback2) {
	var _self = this;

	var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];

	$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-enemy");
	if (_self._gameplayData.gameState.activePlayerId == _self._enemyUserId) {
		if (typeof callback === "function") {
			callback();
		}
	} else {
		if (typeof callback === "function") {
			callback2();
		}
	}
};

gameController.prototype.checkIfYouHaveToDoAction = function (callback, callback2) {
	var _self = this;

	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];

	$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-enemy");
	if (_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
		if (typeof callback === "function") {
			callback();
		}
	} else {
		if (typeof callback2 === "function") {
			callback2();
		}
	}
};

gameController.prototype.setBoardSpaceListener = function (card) {
	var _self = this;

	if (card.cardEffect.effect == "moveSpacesForwardUpTo") {
		_self.setBoardSpaceListenerMoveSpaces(card, _self._yourUserId, "forward");
	} else if (card.cardEffect.effect == "moveSpacesBackwardsUpToEnemy") {
		_self.setBoardSpaceListenerMoveSpaces(card, _self._enemyUserId, "backward");
	} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpTo") {
		_self.setBoardSpaceListenerMoveSpaces(card, _self._yourUserId, "both");
	} else if (card.cardEffect.effect == "copySpecialSpacesUpTo") {
		_self.setBoardSpaceListenerCopySpecialSpacesUpToYou(card);
	} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToEnemy") {
		_self.setBoardSpaceListenerMoveSpaces(card, _self._enemyUserId, "both");
	} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToYou") {
		_self.setBoardSpaceListenerMoveSpaces(card, _self._yourUserId, "both");
	} else if (card.cardEffect.effect.match("createSpecialBoardSpaceForwardTier")) {
		_self.setBoardSpaceListenerCreateSpecialBoardSpaceForwardTierYou(card);
	} else if (card.cardEffect.effect == "destroySpecialBoardSpaceForward") {
		_self.setBoardSpaceListenerDestroySpecialBoardSpaceForwardYou(card);
	}
};

gameController.prototype.setBoardSpaceListenerMoveSpaces = function (card, playerId, direction) {
	var _self = this;

	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[playerId].currBoardIndex;
  var backwardBoardIndex = currBoardIndex;
  var forwardBoardIndex = currBoardIndex;
  var rowIndexForward;
  var columnIndexForward;
  var rowIndexBackward;
  var columnIndexBackward;

  var moveBoardForward = true;
  if (playerId == _self._roomData.player2Id) {
  	moveBoardForward = false;
  }

  var cannotMoveForward = false;
  var cannotMoveBackward = false;

	$(_self.BOARD_ID).css("z-index", 4);
	for (var i = 0; i < card.cardEffect.effectValue; i++) {
		cannotMoveForward = false;
		cannotMoveBackward = false;

		forwardBoardIndex++;
		backwardBoardIndex--;

		if (!boardPath[forwardBoardIndex]) {
			cannotMoveForward = true;
		}

		if (backwardBoardIndex < 0) {
			cannotMoveBackward = true;
		}

		if (cannotMoveForward && cannotMoveBackward) {
			break;
		}

		if (!cannotMoveForward && ((moveBoardForward && direction == "forward")
			|| (!moveBoardForward && direction == "backward") || (direction == "both"))) {
		  rowIndexForward = boardPath[forwardBoardIndex][0];
		  columnIndexForward = boardPath[forwardBoardIndex][1];

			var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndexForward + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
				+ ':nth-child(' + (columnIndexForward + 1) + ')';
		  $(selectorTd).data("moveSpaces", i + 1);
		  $(selectorTd).addClass("selectable-you");
			$(selectorTd).on("click", function () {
				$(_self.BOARD_COLUMN_CLASS).off("click");
				$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-you");
				$(_self.BOARD_ID).css("z-index", 1);

				var finishData = { effectValueChosen: $(this).data("moveSpaces"), moveBackward: moveBoardForward ? false : true };
				_self._lastClientData = { roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData };

				if (card.cardEffect.continuous) {
					_self.client.finishCardEffectContinuous(_self._lastClientData);
				} else {
					_self.client.finishCardEffect(_self._lastClientData);
				}
			});
	  }

	  if (!cannotMoveBackward && ((moveBoardForward && direction == "backward")
	  	|| (!moveBoardForward && direction == "forward") || (direction == "both"))) {
		  rowIndexBackward = boardPath[backwardBoardIndex][0];
		  columnIndexBackward = boardPath[backwardBoardIndex][1];

		  var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndexBackward + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
				+ ':nth-child(' + (columnIndexBackward + 1) + ')';
		  $(selectorTd).data("moveSpaces", i + 1);
		  $(selectorTd).addClass("selectable-you");
			$(selectorTd).on("click", function () {
				$(_self.BOARD_COLUMN_CLASS).off("click");
				$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-you");
				$(_self.BOARD_ID).css("z-index", 1);

				var finishData = { effectValueChosen: $(this).data("moveSpaces"), moveBackward: moveBoardForward ? true : false };
				_self._lastClientData = { roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData };

				if (card.cardEffect.continuous) {
					_self.client.finishCardEffectContinuous(_self._lastClientData);
				} else {
					_self.client.finishCardEffect(_self._lastClientData);
				}
			});
	  }
	}

	assert (i != 0);
};

gameController.prototype.setBoardSpaceListenerCreateSpecialBoardSpaceForwardTierYou = function (card) {
	var _self = this;

	var boardMatrix = _self._gameplayData.gameState.boardData.boardMatrix;
	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[_self._yourUserId].currBoardIndex;
  var rowIndex;
  var columnIndex;
  var cardTier = (+card.cardEffect.effect.slice(-1));

  var moveBoardForward = true;
  if (_self._yourUserId == _self._roomData.player2Id) {
  	moveBoardForward = false;
  }

	$(_self.BOARD_ID).css("z-index", 4);
	for (var i = 0; i < card.cardEffect.effectValue; i++) {
		if (moveBoardForward) {
			currBoardIndex++;

			if (!boardPath[currBoardIndex]) {
				break;
			}
		} else {
			currBoardIndex--;

			if (currBoardIndex < 0) {
				break;
			}
		}

	  rowIndex = boardPath[currBoardIndex][0];
	  columnIndex = boardPath[currBoardIndex][1];

	  if (boardMatrix[rowIndex][columnIndex] == 1) {
		  var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndex + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
				+ ':nth-child(' + (columnIndex + 1) + ')';
		  $(selectorTd).addClass("selectable-you");
			$(selectorTd).on("click", function () {
				$(_self.BOARD_COLUMN_CLASS).off("click");
				$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-you");
				$(_self.BOARD_ID).css("z-index", 1);

				var boardSpaceTd = this;

				$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').html("");
				$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child')
					.append('<div class="anime-cb-choose-card-effect-title">Choose special board space</div>');

				for (var spaceType in _self.BOARD_FIELDS) {
					if (spaceType.endsWith("_" + cardTier)) {
						$(_self.CHOOSE_CARD_EFFECT_CLASS + ' > div:first-child').append('<img class="anime-cb-choose-card-effect-choice"\
							src="/imgs/' + _self.BOARD_FIELDS_IMGS[spaceType] + '" data-special-space-type="'
							+ _self.BOARD_FIELDS[spaceType] +  '" style="width: 100px; height: 100px;">');
					}
				}

				_self.chooseCardEffectInitStyles();

				$(_self.CHOOSE_CARD_EFFECT_CLASS).on('click', _self.CHOOSE_CARD_EFFECT_CHOICE_CLASS, function() {
					$(_self.CHOOSE_CARD_EFFECT_CLASS).off("click");
					_self.chooseCardEffectFinishStyles();

					var finishData = { rowIndex: $(boardSpaceTd).closest('tr').index(),
						columnIndex: $(boardSpaceTd).index(), specialSpaceType: $(this).data("specialSpaceType") };
					_self._lastClientData = { roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData };

					if (card.cardEffect.continuous) {
						_self.client.finishCardEffectContinuous(_self._lastClientData);
					} else {
						_self.client.finishCardEffect(_self._lastClientData);
					}
				});
			});
		}
	}

	assert (i != 0);
};

gameController.prototype.setBoardSpaceListenerDestroySpecialBoardSpaceForwardYou = function (card) {
	var _self = this;

	var boardMatrix = _self._gameplayData.gameState.boardData.boardMatrix;
	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[_self._yourUserId].currBoardIndex;
  var rowIndex;
  var columnIndex;

  var moveBoardForward = true;
  if (_self._yourUserId == _self._roomData.player2Id) {
  	moveBoardForward = false;
  }

	$(_self.BOARD_ID).css("z-index", 4);
	for (var i = 0; i < card.cardEffect.effectValue; i++) {
		if (moveBoardForward) {
			currBoardIndex++;

			if (!boardPath[currBoardIndex]) {
				break;
			}
		} else {
			currBoardIndex--;

			if (currBoardIndex < 0) {
				break;
			}
		}

	  rowIndex = boardPath[currBoardIndex][0];
	  columnIndex = boardPath[currBoardIndex][1];

	  if (boardMatrix[rowIndex][columnIndex] > 1) {
		  var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndex + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
				+ ':nth-child(' + (columnIndex + 1) + ')';
		  $(selectorTd).addClass("selectable-you");
			$(selectorTd).on("click", function () {
				$(_self.BOARD_COLUMN_CLASS).off("click");
				$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-you");
				$(_self.BOARD_ID).css("z-index", 1);

				var finishData = { rowIndex: $(this).closest('tr').index(), columnIndex: $(this).index() };

				_self._lastClientData = { roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData };

				if (card.cardEffect.continuous) {
					_self.client.finishCardEffectContinuous(_self._lastClientData);
				} else {
					_self.client.finishCardEffect(_self._lastClientData);
				}
			});
		}
	}

	assert (i != 0);
};

gameController.prototype.setBoardSpaceListenerCreateSpecialBoardSpaceForwardTierEnemy = function (card) {
	var _self = this;

	var boardMatrix = _self._gameplayData.gameState.boardData.boardMatrix;
	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[_self._enemyUserId].currBoardIndex;
  var rowIndex;
  var columnIndex;

  var moveBoardForward = true;
  if (_self._enemyUserId == _self._roomData.player2Id) {
  	moveBoardForward = false;
  }

	for (var i = 0; i < card.cardEffect.effectValue; i++) {
		if (moveBoardForward) {
			currBoardIndex++;

			if (!boardPath[currBoardIndex]) {
				break;
			}
		} else {
			currBoardIndex--;

			if (currBoardIndex < 0) {
				break;
			}
		}

	  rowIndex = boardPath[currBoardIndex][0];
	  columnIndex = boardPath[currBoardIndex][1];

	  if (boardMatrix[rowIndex][columnIndex] == 1) {
		  var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndex + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
				+ ':nth-child(' + (columnIndex + 1) + ')';
		  $(selectorTd).addClass("selectable-enemy");
		}
	}
};

gameController.prototype.setBoardSpaceListenerDestroySpecialBoardSpaceForwardEnemy = function (card) {
	var _self = this;

	var boardMatrix = _self._gameplayData.gameState.boardData.boardMatrix;
	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[_self._enemyUserId].currBoardIndex;
  var rowIndex;
  var columnIndex;

  var moveBoardForward = true;
  if (_self._enemyUserId == _self._roomData.player2Id) {
  	moveBoardForward = false;
  }

	for (var i = 0; i < card.cardEffect.effectValue; i++) {
		if (moveBoardForward) {
			currBoardIndex++;

			if (!boardPath[currBoardIndex]) {
				break;
			}
		} else {
			currBoardIndex--;

			if (currBoardIndex < 0) {
				break;
			}
		}

	  rowIndex = boardPath[currBoardIndex][0];
	  columnIndex = boardPath[currBoardIndex][1];

	  if (boardMatrix[rowIndex][columnIndex] > 1) {
		  var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndex + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
				+ ':nth-child(' + (columnIndex + 1) + ')';
		  $(selectorTd).addClass("selectable-enemy");
		}
	}
};

gameController.prototype.setBoardSpaceListenerCopySpecialSpacesUpToYou = function (card) {
	var _self = this;

	var boardMatrix = _self._gameplayData.gameState.boardData.boardMatrix;
	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[_self._yourUserId].currBoardIndex;
  var rowIndex;
  var columnIndex;

  var moveBoardForward = true;
  if (_self._yourUserId == _self._roomData.player2Id) {
  	moveBoardForward = false;
  }

	$(_self.BOARD_ID).css("z-index", 4);
	for (var i = 0; i < card.cardEffect.effectValue; i++) {
		if (moveBoardForward) {
			currBoardIndex++;

			if (!boardPath[currBoardIndex]) {
				break;
			}
		} else {
			currBoardIndex--;

			if (currBoardIndex < 0) {
				break;
			}
		}

	  rowIndex = boardPath[currBoardIndex][0];
	  columnIndex = boardPath[currBoardIndex][1];

	  if (boardMatrix[rowIndex][columnIndex] > 0 && boardMatrix[rowIndex][columnIndex] != 1) {
		  var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndex + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
				+ ':nth-child(' + (columnIndex + 1) + ')';
		  $(selectorTd).addClass("selectable-you");
			$(selectorTd).on("click", function () {
				$(_self.BOARD_COLUMN_CLASS).off("click");
				$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-you");
				$(_self.BOARD_ID).css("z-index", 1);

				var finishData = { rowIndex: $(this).closest('tr').index(), columnIndex: $(this).index() };
				_self._lastClientData = { roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData };

				if (card.cardEffect.continuous) {
					_self.client.finishCardEffectContinuous(_self._lastClientData);
				} else {
					_self.client.finishCardEffect(_self._lastClientData);
				}
			});
		}
	}

	assert (i != 0);
};

gameController.prototype.setBoardSpaceListenerCopySpecialSpacesUpToEnemy = function (card) {
	var _self = this;

	var boardMatrix = _self._gameplayData.gameState.boardData.boardMatrix;
	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[_self._enemyUserId].currBoardIndex;
  var rowIndex;
  var columnIndex;

  var moveBoardForward = true;
  if (_self._enemyUserId == _self._roomData.player2Id) {
  	moveBoardForward = false;
  }

	for (var i = 0; i < card.cardEffect.effectValue; i++) {
		if (moveBoardForward) {
			currBoardIndex++;

			if (!boardPath[currBoardIndex]) {
				break;
			}
		} else {
			currBoardIndex--;

			if (currBoardIndex < 0) {
				break;
			}
		}

	  rowIndex = boardPath[currBoardIndex][0];
	  columnIndex = boardPath[currBoardIndex][1];

	  if (boardMatrix[rowIndex][columnIndex] > 0 && boardMatrix[rowIndex][columnIndex] != 1) {
		  var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndex + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
				+ ':nth-child(' + (columnIndex + 1) + ')';
		  $(selectorTd).addClass("selectable-enemy");
		}
	}
};

gameController.prototype.setBoardSpaceListenerEnemy = function (card) {
	var _self = this;

	if (card.cardEffect.effect == "moveSpacesForwardUpTo") {
		_self.setBoardSpaceListenerMoveSpacesEnemy(card, _self._enemyUserId, "forward");
	} else if (card.cardEffect.effect == "moveSpacesBackwardsUpToEnemy") {
		_self.setBoardSpaceListenerMoveSpacesEnemy(card, _self._yourUserId, "backward");
	} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpTo") {
		_self.setBoardSpaceListenerMoveSpacesEnemy(card, _self._enemyUserId, "both");
	} else if (card.cardEffect.effect == "copySpecialSpacesUpTo") {
		_self.setBoardSpaceListenerCopySpecialSpacesUpToEnemy(card);
	} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToEnemy") {
		_self.setBoardSpaceListenerMoveSpacesEnemy(card, _self._yourUserId, "both");
	} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToYou") {
		_self.setBoardSpaceListenerMoveSpacesEnemy(card, _self._enemyUserId, "both");
	} else if (card.cardEffect.effect.match("createSpecialBoardSpaceForwardTier")) {
		_self.setBoardSpaceListenerCreateSpecialBoardSpaceForwardTierEnemy(card);
	} else if (card.cardEffect.effect == "destroySpecialBoardSpaceForward") {
		_self.setBoardSpaceListenerDestroySpecialBoardSpaceForwardEnemy(card);
	}
};

gameController.prototype.setBoardSpaceListenerMoveSpacesEnemy = function (card, playerId, direction) {
	var _self = this;

	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[playerId].currBoardIndex;
  var backwardBoardIndex = currBoardIndex;
  var forwardBoardIndex = currBoardIndex;
  var rowIndexForward;
  var columnIndexForward;
  var rowIndexBackward;
  var columnIndexBackward;

  var moveBoardForward = true;
  if (playerId == _self._roomData.player2Id) {
  	moveBoardForward = false;
  }

  var cannotMoveForward = false;
  var cannotMoveBackward = false;

	for (var i = 0; i < card.cardEffect.effectValue; i++) {
		cannotMoveForward = false;
		cannotMoveBackward = false;

		forwardBoardIndex++;
		backwardBoardIndex--;

		if (!boardPath[forwardBoardIndex]) {
			cannotMoveForward = true;
		}

		if (backwardBoardIndex < 0) {
			cannotMoveBackward = true;
		}

		if (cannotMoveForward && cannotMoveBackward) {
			break;
		}

		if (!cannotMoveForward && ((moveBoardForward && direction == "forward")
			|| (!moveBoardForward && direction == "backward") || (direction == "both"))) {
		  rowIndexForward = boardPath[forwardBoardIndex][0];
		  columnIndexForward = boardPath[forwardBoardIndex][1];

			var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndexForward + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
				+ ':nth-child(' + (columnIndexForward + 1) + ')';
		  $(selectorTd).data("moveSpaces", i + 1);
		  $(selectorTd).addClass("selectable-enemy");
	  }

	  if (!cannotMoveBackward && ((moveBoardForward && direction == "backward")
	  	|| (!moveBoardForward && direction == "forward") || (direction == "both"))) {
		  rowIndexBackward = boardPath[backwardBoardIndex][0];
		  columnIndexBackward = boardPath[backwardBoardIndex][1];

		  var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndexBackward + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
				+ ':nth-child(' + (columnIndexBackward + 1) + ')';
		  $(selectorTd).data("moveSpaces", i + 1);
		  $(selectorTd).addClass("selectable-enemy");
	  }
	}
};

gameController.prototype.performCardEffectInstantEnemy = function (card) {
	var _self = this;

	if (!card.cardEffect.continuous) {
		if (card.cardEffect.effect == "moveSpacesForwardUpTo") {
			if (card.cardEffect.isFinished) {
				_self.moveEnemyCharacter(card.cardEffect.effectValueChosen,
					_self.destroyCardAnimationEnemy.bind(_self, card, _self.waitForEnemyActions.bind(_self)), 0);
			} else {
				_self.setBoardSpaceListenerEnemy(card);
			}
		} else if (card.cardEffect.effect == "moveSpacesBackwardsUpToEnemy") {
			if (card.cardEffect.isFinished) {
				_self.moveYourCharacter(card.cardEffect.effectValueChosen,
					_self.destroyCardAnimationEnemy.bind(_self, card, _self.checkIfYouHaveToDoAction
						.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self))), 0);
			} else {
				_self.setBoardSpaceListenerEnemy(card);
			}
		} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpTo") {
			if (card.cardEffect.isFinished) {
				_self.moveEnemyCharacter(card.cardEffect.effectValueChosen,
					_self.destroyCardAnimationEnemy.bind(_self, card, _self.waitForEnemyActions.bind(_self)), 0);
			} else {
				_self.setBoardSpaceListenerEnemy(card);
			}
		} else if (card.cardEffect.effect == "moveSpacesForward") {
			_self.moveEnemyCharacter(card.cardEffect.effectValue,
				_self.destroyCardAnimationEnemy.bind(_self, card, _self.waitForEnemyActions.bind(_self)), 500);
		} else if (card.cardEffect.effect == "moveSpacesBackwardsEnemy") {
			_self.moveYourCharacter(card.cardEffect.effectValue,
				_self.destroyCardAnimationEnemy.bind(_self, card, _self.checkIfYouHaveToDoAction
					.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self))), 0);
		} else if (card.cardEffect.effect.match("createSpecialBoardSpaceForwardTier")) {
			if (card.cardEffect.isFinished) {
				_self.createNewSpecialBoardSpaceAnimation(card.finishData,
					_self.destroyCardAnimationEnemy.bind(_self, card, _self.waitForEnemyActions.bind(_self)));
			} else {
				_self.setBoardSpaceListenerEnemy(card);
			}
		} else if (card.cardEffect.effect == "destroySpecialBoardSpaceForward") {
			if (card.cardEffect.isFinished) {
				_self.destroySpecialBoardSpaceAnimation(card.finishData,
					_self.destroyCardAnimationEnemy.bind(_self, card, _self.waitForEnemyActions.bind(_self)));
			} else {
				_self.setBoardSpaceListenerEnemy(card);
			}
		} else if (card.cardEffect.effect == "drawCardFromEnemyHand") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "drawCardFromEnemyYourHand") {
			_self._postDestroyCard = card;
			_self.checkIfYouHaveToDoAction(_self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self));
		} else if (card.cardEffect.effect == "destroyCardFromEnemyField") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "drawCardFromDeckYouEnemy") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "takeCardFromYourGraveyard") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "takeCardFromEnemyGraveyard") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "moveSpacesForwardMoveSpacesBackwardEnemyX") {
			if (card.cardEffect.isFinished) {
				_self.hideEventsInfo(null, 0);
				_self.rollDiceEnemy(card.cardEffect.effectValueChosen, noop);
				_self.moveSpacesTimeout = setTimeout(function() {
					if (card.playerYouMovedSuccessfully) {
						_self.moveYourCharacter(card.cardEffect.effectValueChosen, null, 0);
						_self.moveEnemyCharacter(card.cardEffect.effectValueChosen,
							_self.destroyCardAnimationEnemy.bind(_self, card, _self.checkIfYouHaveToDoAction
								.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self))), 0);
					} else {
						_self.moveEnemyCharacter(card.cardEffect.effectValueChosen, null, 0);
						_self.moveYourCharacter(card.cardEffect.effectValueChosen,
							_self.destroyCardAnimationEnemy.bind(_self, card, _self.checkIfYouHaveToDoAction
								.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self))), 0);
					}
				}, 2000);
			} else {
				_self.setRollDiceCardListenerEnemy(card);
			}
		} else if (card.cardEffect.effect == "drawCardFromDeckYouDiscardCardYou") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialYou") {
			if (card.cardEffect.isFinished) {
				_self.moveEnemyCharacter(card.finishData.moveSpaces,
					_self.destroyCardAnimationEnemy.bind(_self, card, _self.waitForEnemyActions.bind(_self)), 500);
			}
		} else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialEnemy") {
			if (card.cardEffect.isFinished) {
				_self.moveYourCharacter(card.finishData.moveSpaces,
					_self.destroyCardAnimationEnemy.bind(_self, card, _self.checkIfYouHaveToDoAction
						.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self))), 500);
			}
		} else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceYou") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemy") {
			_self._postDestroyCard = card;
			_self.checkIfYouHaveToDoAction(_self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self));
		} else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemyYou") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceYouEnemy") {
			_self._postDestroyCard = card;
			_self.checkIfYouHaveToDoAction(_self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self));
		} else if (card.cardEffect.effect == "increaseChargesContinousCard") {
			if (card.cardEffect.isFinished) {
				_self.hideEventsInfo(null, 0);
				_self.destroyCardAnimationEnemy(card, _self.waitForEnemyActions.bind(_self));
			} else {
				_self.setCardSelectOnFieldListenerWrapperEnemy(card);
			}
		} else if (card.cardEffect.effect == "rollDiceForwardBackward") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "moveSpacesForwardNonSpecial") {
			if (card.cardEffect.isFinished) {
				_self.hideEventsInfo(null, 0);
				_self.rollDiceEnemy(card.cardEffect.effectValueChosen,
					_self.moveEnemyCharacter.bind(_self, card.cardEffect.moveSpaces,
						_self.destroyCardAnimationEnemy.bind(_self, card, _self.waitForEnemyActions.bind(_self)), 2000));
			} else {
				_self.setRollDiceCardListenerEnemy(card);
			}
		} else if (card.cardEffect.effect == "discardCardTakeCardFromYourGraveyard") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "energyGain") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "chooseAttributeVariation1") {
			if (card.cardEffect.isFinished) {
				_self._postDestroyCard = card;

				if (card.cardEffect.successfullyGuessed) {
					_self.showEventsInfo("Your opponent successfully guessed !");
				} else {
					_self.showEventsInfo("Your opponent failed to guess...");
				}

				_self.hideEventsInfo(null, 1000);

				_self.waitForMsgTimeout = setTimeout(function() {
					if (card.cardEffect.moveSpaces) {
						_self.moveEnemyCharacter(card.cardEffect.moveSpaces,
							_self.waitForEnemyActions.bind(_self), 0);
					} else if (card.cardEffect.cardsToDraw || card.cardEffect.cardsToDiscard
						|| card.cardEffect.gainEnergy || card.cardEffect.loseEnergy) {
						_self.waitForEnemyActions();
					}
				}, 1500);
			}
		} else if (card.cardEffect.effect == "chooseAttributeVariation2") {
			if (card.cardEffect.isFinished) {
				_self._postDestroyCard = card;

				if (card.cardEffect.successfullyGuessed) {
					_self.showEventsInfo("Your opponent successfully guessed !");
				} else {
					_self.showEventsInfo("Your opponent failed to guess...");
				}

				_self.hideEventsInfo(null, 1000);

				_self.waitForMsgTimeout = setTimeout(function() {
					if (card.cardEffect.moveSpaces) {
						_self.moveYourCharacter(card.cardEffect.moveSpaces, _self.checkIfYouHaveToDoAction
							.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self)), 0);
					} else if (card.cardEffect.cardsToDraw || card.cardEffect.cardsToDiscard
						|| card.cardEffect.gainEnergy || card.cardEffect.loseEnergy) {
						_self.checkIfYouHaveToDoAction(_self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self));
					}
				}, 1500);
			}
		} else if (card.cardEffect.effect == "destroySpecialBoardSpacesAllRadius") {
			if (card.cardEffect.isFinished) {
				card.finishData.destroyedBoardSpacesPositions.forEach(function(boardSpaceData, positionIdx, arr) {
					if (positionIdx == arr.length - 1) {
						_self.destroySpecialBoardSpaceAnimation(boardSpaceData,
							_self.destroyCardAnimationEnemy.bind(_self, card, _self.waitForEnemyActions.bind(_self)));
					} else {
						_self.destroySpecialBoardSpaceAnimation(boardSpaceData);
					}
				});
			}
		}
	} else {
		_self.waitForEnemyActions();
	}
};

gameController.prototype.destroyCardAnimationYou = function (card, callback) {
	var _self = this;

	var cardEl = $(_self.CARD_FIELD_CLASS + _self.PLAYER_YOU_CLASS).find("[data-card-id='" + card.cardId + "']");
	$(cardEl).css("animation", "fade-out 1.5s ease-in both");
  $(cardEl).css("-webkit-animation", "fade-out 1.5s ease-in both");
  $(cardEl).removeClass("hover");

  _self.destroyCardTimeout = setTimeout(function() {
  	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.bottom')
			.attr("src", $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top').attr("src"));

		var $graveyardTopCard = $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top');
		$graveyardTopCard.attr("src", $(cardEl).attr("src"));
		$graveyardTopCard.data("cardId", $(cardEl).data("cardId"));
		$graveyardTopCard.data("cardName", $(cardEl).data("cardName"));
		$graveyardTopCard.data("cardText", $(cardEl).data("cardText"));
		$graveyardTopCard.data("cardRarity", $(cardEl).data("cardRarity"));
		$graveyardTopCard.data("cardEffect", $(cardEl).data("cardEffect"));
		$graveyardTopCard.data("cardCost", $(cardEl).data("cardCost"));
		$graveyardTopCard.data("cardAttributes", $(cardEl).data("cardAttributes"));

		_self.removeCardChargesStatus(cardEl, _self.PLAYER_YOU_CLASS);

  	$(cardEl).remove();

  	if (typeof callback === "function") {
  		callback.call(_self);
  	}
  }, 1500);
};

gameController.prototype.destroyCardAnimationEnemy = function (card, callback) {
	var _self = this;

	var cardEl = $(_self.CARD_FIELD_CLASS + _self.PLAYER_ENEMY_CLASS).find("[data-card-id='" + card.cardId + "']");
	$(cardEl).css("animation", "fade-out 1.5s ease-in both");
  $(cardEl).css("-webkit-animation", "fade-out 1.5s ease-in both");
  $(cardEl).removeClass("hover");

  _self.destroyCardTimeout = setTimeout(function() {
  	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.bottom')
			.attr("src", $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top').attr("src"));

		var $graveyardTopCard = $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top');
		$graveyardTopCard.attr("src", $(cardEl).attr("src"));
		$graveyardTopCard.data("cardId", $(cardEl).data("cardId"));
		$graveyardTopCard.data("cardName", $(cardEl).data("cardName"));
		$graveyardTopCard.data("cardText", $(cardEl).data("cardText"));
		$graveyardTopCard.data("cardRarity", $(cardEl).data("cardRarity"));
		$graveyardTopCard.data("cardEffect", $(cardEl).data("cardEffect"));
		$graveyardTopCard.data("cardCost", $(cardEl).data("cardCost"));
		$graveyardTopCard.data("cardAttributes", $(cardEl).data("cardAttributes"));

		_self.removeCardChargesStatus(cardEl, _self.PLAYER_ENEMY_CLASS);

  	$(cardEl).remove();

  	if (typeof callback === "function") {
  		callback.call(_self);
  	}
  }, 1500);
};

gameController.prototype.createNewSpecialBoardSpaceAnimation = function(spaceData, callback) {
	var _self = this;

	var spaceImg = _self.BOARD_FIELDS_IMGS[spaceData.spaceType];
	var $boardSpaceTd = $(_self.BOARD_ROW_CLASS + ':nth-child(' + (spaceData.rowIndex + 1) + ') '
		+ _self.BOARD_COLUMN_CLASS + ':nth-child(' + (spaceData.columnIndex + 1) + ')');

	$boardSpaceTd.find('img').remove();
	$boardSpaceTd.prepend('<img class="anime-cb-board-img" src="/imgs/' + spaceImg + '">');

	if (_self._yourUserId == _self._roomData.player2Id) {
		_self.setBoardPiecesRotated();
		$boardSpaceTd.find('img').css("animation", "create-board-space-rotated 0.6s ease-out both");
		$boardSpaceTd.find('img').css("-webkit-animation", "create-board-space-rotated 0.6s ease-out both");
	} else {
		$boardSpaceTd.find('img').css("animation", "create-board-space 0.6s ease-out both");
		$boardSpaceTd.find('img').css("-webkit-animation", "create-board-space 0.6s ease-out both");
	}

	_self.specialSpaceTimeout = setTimeout(function() {
		$boardSpaceTd.find('img').css("animation", "");
		$boardSpaceTd.find('img').css("-webkit-animation", "");

		if (typeof callback === "function") {
			callback();
		}
	}, 650);
};

gameController.prototype.destroySpecialBoardSpaceAnimation = function (spaceData, callback) {
	var _self = this;

	var $boardSpaceTd = $(_self.BOARD_ROW_CLASS + ':nth-child(' + (spaceData.rowIndex + 1) + ') '
		+ _self.BOARD_COLUMN_CLASS + ':nth-child(' + (spaceData.columnIndex + 1) + ')');

	// if (_self._yourUserId == _self._roomData.player2Id) {
	// 	_self.setBoardPiecesRotated();
	// 	$boardSpaceTd.find('img').css("animation", "destroy-board-space 0.6s ease-out both");
	// 	$boardSpaceTd.find('img').css("-webkit-animation", "destroy-board-space 0.6s ease-out both");
	// } else {
		$boardSpaceTd.find('img').css("animation", "destroy-board-space 0.6s ease-out both");
		$boardSpaceTd.find('img').css("-webkit-animation", "destroy-board-space 0.6s ease-out both");
	// }

	_self.specialSpaceTimeout = setTimeout(function() {
		$boardSpaceTd.find('img').remove();

		if (typeof callback === "function") {
			callback();
		}
	}, 650);
};

gameController.prototype.enableRollPhaseActions = function () {
	var _self = this;

	_self.updateCardChargesStatuses();
	_self.updateCardsStatusText();

	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];

	if (playerStateYou.chainObj && playerStateYou.chainObj.chainTrigger) {
		if (_self._postDestroyCard) {
			var card = _self._postDestroyCard;
			_self._postDestroyCard = null;
			_self.destroyCardAnimationYou.call(_self, card, _self.enableRollPhaseActions.bind(_self));
			return;
		}

		if (playerStateYou.chainObj.cardsToChain.length > 0) {
			_self.setCardChainListener();
		} else {
			_self.finishChainEffect();
		}
	} else if (playerStateYou.cardsToDraw > 0) {
		_self.setCardDrawListener();
		_self.startDrawCardAnimationsFinishedPoll(_self.checkIfEnemyHasToDoAction
	  	.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableRollPhaseActions.bind(_self)));
  	return;
	} else if (playerStateYou.cardsToDrawFromEnemyHand > 0) {
		_self.setDrawCardFromEnemyHandListener();
	} else if (playerStateYou.cardsToDiscard > 0) {
		_self.setCardDiscardListener();
	} else if (playerStateYou.cardsToTakeFromYourGraveyard > 0) {
		_self.setTakeCardFromYourGraveyardListener();
	} else if (playerStateYou.cardsToTakeFromEnemyGraveyard > 0) {
		_self.setTakeCardFromEnemyGraveyardListener();
	} else if (playerStateYou.cardsToDestroyFromEnemyField > 0) {
		_self.setDestroyCardFromEnemyFieldListener();
	} else if (playerStateYou.canRollDiceBoardInRollPhase
		&& playerStateYou.canRollDiceBoardCount > 0) {
		_self.enableRollDiceBoard();
		return;
	} else if (_self._postDestroyCard) {
		var card = _self._postDestroyCard;
		_self._postDestroyCard = null;
		_self.destroyCardAnimationYou.call(_self, card, _self.enableRollPhaseActions.bind(_self));
		return;
	} else {
		_self.hideEventsInfo(null, 0);
		$(_self.PHASE_ROLL_ID + ', ' + _self.PHASE_END_ID).removeClass("selectable");
		$(_self.PHASE_END_ID).attr("data-tooltip", "switchPhaseEnd");
		$(_self.PHASE_END_ID).addClass("selectable");
		$(_self.PHASE_END_ID).on("click", function(e) {
			$(_self.PHASE_END_ID).off("click");
			$(_self.PHASE_END_ID).removeClass("selectable");
			$(_self.PHASE_END_ID).removeAttr("data-tooltip");
			_self._lastClientData = { roomId: _self._roomData.id };
			_self.client.endPhase(_self._lastClientData);
		});
	}
};

gameController.prototype.waitForEnemyActions = function () {
	var _self = this;

	_self.updateCardChargesStatuses();
	_self.updateCardsStatusText();

	var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];
	$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-enemy");

	if (playerStateEnemy.chainObj && playerStateEnemy.chainObj.chainTrigger) {
		_self.showEventsInfo("Waiting for opponent's chain decision...");
		if (_self._postDestroyCard) {
			var card = _self._postDestroyCard;
			_self._postDestroyCard = null;
			_self.destroyCardAnimationEnemy.call(_self, card, _self.waitForEnemyActions.bind(_self));
			return;
		}
	} else if (playerStateEnemy.cardsToDraw > 0) {
		var eventInfoText = "Your opponent draws " + playerStateEnemy.cardsToDraw;
		if (playerStateEnemy.cardsToDraw > 1) {
			eventInfoText += " cards from the deck";
		} else {
			eventInfoText += " card from the deck";
		}

		_self.showEventsInfo(eventInfoText);

		if (!_self.drawCardAnimationsFinishedEnemy) {
			return;
		}

		_self.drawCardAnimationsFinishedEnemy = false;
		if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
			var callback;

			if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
				callback = _self.checkIfEnemyHasToDoAction
				.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
			} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
				callback = _self.checkIfEnemyHasToDoAction
					.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableRollPhaseActions.bind(_self));
			}

			_self.startDrawCardAnimationsFinishedPoll(callback);
		} else {
			_self.startDrawCardAnimationsFinishedPoll(_self.checkIfYouHaveToDoAction
				.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self)));
		}
	} else if (playerStateEnemy.cardsToDrawFromEnemyHand > 0) {
		var eventInfoText = "Your opponent draws " + playerStateEnemy.cardsToDrawFromEnemyHand;
		if (playerStateEnemy.cardsToDrawFromEnemyHand > 1) {
			eventInfoText += " cards from your hand";
		} else {
			eventInfoText += " card from your hand";
		}

		_self.showEventsInfo(eventInfoText);
	} else if (playerStateEnemy.cardsToDiscard > 0) {
		var eventInfoText = "Your opponent must discard " + playerStateEnemy.cardsToDiscard;
		if (playerStateEnemy.cardsToDiscard > 1) {
			eventInfoText += " cards from his hand";
		} else {
			eventInfoText += " card from his hand";
		}
		_self.showEventsInfo(eventInfoText);
	} else if (playerStateEnemy.cardsToTakeFromYourGraveyard > 0) {
		var eventInfoText = "Your opponent takes " + playerStateEnemy.cardsToTakeFromYourGraveyard;
		if (playerStateEnemy.cardsToTakeFromYourGraveyard > 1) {
			eventInfoText += " cards from his graveyard";
		} else {
			eventInfoText += " card from his graveyard";
		}

		_self.showEventsInfo(eventInfoText);
	} else if (playerStateEnemy.cardsToTakeFromEnemyGraveyard > 0) {
		var eventInfoText = "Your opponent takes " + playerStateEnemy.cardsToTakeFromEnemyGraveyard;
		if (playerStateEnemy.cardsToTakeFromEnemyGraveyard > 1) {
			eventInfoText += " cards from your graveyard";
		} else {
			eventInfoText += " card from your graveyard";
		}

		_self.showEventsInfo(eventInfoText);
	} else if (playerStateEnemy.cardsToDestroyFromEnemyField > 0) {
		var eventInfoText = "Your opponent destroys " + playerStateEnemy.cardsToDestroyFromEnemyField;
		if (playerStateEnemy.cardsToDestroyFromEnemyField > 1) {
			eventInfoText += " cards from your field";
		} else {
			eventInfoText += " card from your field";
		}

		_self.showEventsInfo(eventInfoText);
	} else if (playerStateEnemy.canRollDiceBoardInRollPhase
		&& playerStateEnemy.canRollDiceBoardCount > 0) {

		var eventInfoText = "";
		if (playerStateEnemy.rollAgain) {
			eventInfoText += "Your opponent rolls the die again";
		} else {
			eventInfoText += "Your opponent rolls the die";
		}

		if (!playerStateEnemy.moveBackwardsOnNextRoll) {
			if (playerStateEnemy.canRollDiceBoardCount > 1) {
				eventInfoText += " " + playerStateEnemy.canRollDiceBoardCount + " times";
			} else {
				eventInfoText += " " + playerStateEnemy.canRollDiceBoardCount + " time";
			}
		} else {
			if (playerStateEnemy.canRollDiceBoardCountBackward > 1) {
				eventInfoText += " " + playerStateEnemy.canRollDiceBoardCountBackward + " times";
			} else {
				eventInfoText += " " + playerStateEnemy.canRollDiceBoardCountBackward + " time";
			}
			eventInfoText += " backwards";
		}

		_self.showEventsInfo(eventInfoText);
	} else if (_self._postDestroyCard) {
		var card = _self._postDestroyCard;
		_self._postDestroyCard = null;
		_self.destroyCardAnimationEnemy.call(_self, card);
		setTimeout(_self.waitForEnemyActions.bind(_self));
	} else {
		if (_self._gameplayData.gameState.nextPhase != _self.TURN_PHASES.STANDBY
			&& _self._gameplayData.gameState.nextPhase != _self.TURN_PHASES.MAIN) {
			_self.hideEventsInfo(null, 0);
		}
	}
};

gameController.prototype.setCardDrawListener = function () {
	var _self = this;

	_self.drawCardAnimationsFinishedYou = false;
	_self.drawCardInteractive = true;

	var eventInfoText = "Draw " + _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw;
	if (_self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw > 1) {
			eventInfoText += " cards from the deck";
		} else {
			eventInfoText += " card from the deck";
	}
	_self.showEventsInfo(eventInfoText);

	$(_self.DECK_GLOBAL_ID).attr("data-tooltip", "drawCardDeck");
	$(_self.DECK_GLOBAL_ID).on('click', function(e) {
		$(_self.DECK_GLOBAL_ID).off("click");
		$(_self.DECK_GLOBAL_ID).removeAttr("data-tooltip");
		_self.hideEventsInfo(null, 0);
		_self.drawCard();
	});
};

gameController.prototype.setCardDiscardListener = function () {
	var _self = this;

	var eventInfoText = "You must discard " + _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDiscard;
		if (_self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDiscard > 1) {
			eventInfoText += " cards from your hand";
		} else {
			eventInfoText += " card from your hand";
	}
	_self.showEventsInfo(eventInfoText);

	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).attr("data-tooltip", "discardCard");
	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).on('click', function(e) {
		$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).off();
		$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).removeAttr("data-tooltip");
		_self.discardCard.call(_self, this);
		_self.hideEventsInfo(null, 0);
	});
};

gameController.prototype.setDrawCardFromEnemyHandListener = function () {
	var _self = this;

	var eventInfoText = "Draw " + _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDrawFromEnemyHand;
	if (_self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDrawFromEnemyHand > 1) {
		eventInfoText += " cards from your opponents hand";
	} else {
		eventInfoText += " card from your opponents hand";
	}

	_self.showEventsInfo(eventInfoText);

	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).attr("data-tooltip", "takeCard");
	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).on('click', function(e) {
		$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).off();
		$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).removeAttr("data-tooltip");
		_self.drawCardFromEnemyHand.call(_self, this);
		_self.hideEventsInfo(null, 0);
	});
};

gameController.prototype.setDestroyCardFromEnemyFieldListener = function () {
	var _self = this;

	var playerState = _self._gameplayData.gameState.playersState[_self._yourUserId];
	var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];

	var eventInfoText = "Destroy " + playerState.cardsToDestroyFromEnemyField;
	if (playerState.cardsToDestroyFromEnemyField > 1) {
		eventInfoText += " cards from your opponents field";
	} else {
		eventInfoText += " card from your opponents field";
	}

	_self.showEventsInfo(eventInfoText);

	$(_self.CARD_ON_FIELD_CLASS + _self.PLAYER_ENEMY_CLASS).each(function() {
		var card = this;
		var canDestroyCard = _self.canDestroyCard(card);

		if (!canDestroyCard) {
			var msg = _self.quickGameInfoMsg;
			$(card).on("click", function(e) {
				if (_self.quickGameInfoEnabled) {
					_self.showQuickGameInfo(msg);
				}
			});
			return;
		}

		$(this).attr("data-tooltip", "destroyCard");
		$(this).on("click", function(e) {
			$(_self.CARD_ON_FIELD_CLASS + _self.PLAYER_ENEMY_CLASS).off("click");
			$(_self.CARD_ON_FIELD_CLASS + _self.PLAYER_ENEMY_CLASS).removeAttr("data-tooltip");
			_self.destroyCardFromEnemyField.call(_self, this);
			_self.hideEventsInfo(null, 0);
		});
	});
};

gameController.prototype.setTakeCardFromYourGraveyardListener = function () {
	var _self = this;

	var playerState = _self._gameplayData.gameState.playersState[_self._yourUserId];
	var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];

	var eventInfoText = "Take " + playerState.cardsToTakeFromYourGraveyard;
	if (playerState.cardsToTakeFromYourGraveyard > 1) {
		eventInfoText += " cards from your graveyard to your hand";
	} else {
		eventInfoText += " card from your graveyard to your hand";
	}

	_self.showEventsInfo(eventInfoText);
	_self.populateGraveyard(_self._yourUserId, _self.PLAYER_YOU_CLASS);
	_self.disableGraveyardPopulation();
	$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS).show();

	$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + ' .modal-body img').each(function() {
		if (!_self.canTakeCardFromGraveyard(this)) {
			return;
		}

		$(this).attr("data-tooltip", "takeCard");
		$(this).on("click", function(e) {
			$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS).hide();
			_self.enableGraveyardPopulation();
			$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + ' .modal-body img').off("click");
			$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + ' .modal-body img').removeAttr("data-tooltip");
			_self.takeCardFromGraveyard.call(_self, this, _self._yourUserId);
			_self.hideEventsInfo(null, 0);
		});
	});
};

gameController.prototype.setTakeCardFromEnemyGraveyardListener = function () {
	var _self = this;

	console.log('setTakeCardFromEnemyGraveyardListener');
	var playerState = _self._gameplayData.gameState.playersState[_self._yourUserId];
	var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];

	var eventInfoText = "Take " + playerState.cardsToTakeFromEnemyGraveyard;
	if (playerState.cardsToTakeFromEnemyGraveyard > 1) {
		eventInfoText += " cards from your opponents's graveyard to your hand";
	} else {
		eventInfoText += " card from your opponent's graveyard to your hand";
	}

	_self.showEventsInfo(eventInfoText);
	_self.populateGraveyard(_self._enemyUserId, _self.PLAYER_ENEMY_CLASS);
	_self.disableGraveyardPopulation();
	$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS).show();

	$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + ' .modal-body img').each(function() {
		if (!_self.canTakeCardFromGraveyard(this)) {
			return;
		}

		$(this).attr("data-tooltip", "takeCard");
		$(this).on("click", function(e) {
			$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS).hide();
			_self.enableGraveyardPopulation();
			$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + ' .modal-body img').off("click");
			$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + ' .modal-body img').removeAttr("data-tooltip");
			_self.takeCardFromGraveyard.call(_self, this, _self._enemyUserId);
			_self.hideEventsInfo(null, 0);
		});
	});
};

gameController.prototype.disableGraveyardPopulation = function () {
	var _self = this;

	_self._enableGraveyardPopulationOnClick = false;
};

gameController.prototype.enableGraveyardPopulation = function () {
	var _self = this;

	_self._enableGraveyardPopulationOnClick = true;
};

gameController.prototype.canTakeCardFromGraveyard = function (card) {
	var _self = this;
	var canTakeCard = true;

	return canTakeCard;
};

gameController.prototype.canDestroyCard = function(card) {
	var _self = this;

	var cardId = $(card).data("cardId");
	var availableTargets = [];
	var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];

	playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
		if (card.cardEffect.effect == "taunt") {
			availableTargets.push(card);
		}
	});

  let canDestroyCard = false;
  if (availableTargets.length > 0) {
    availableTargets.forEach(function(card) {
      if (cardId == card.cardId) {
        canDestroyCard = true;
      }
    });
  } else {
    canDestroyCard = true;
  }

  if (!canDestroyCard) {
  	_self.quickGameInfoMsg = "Can target only cards with 'Taunt' effect: "
  		+ (availableTargets.map(a => a.cardName)).join(", ");
  }

  return canDestroyCard;
};

gameController.prototype.enableRollDiceBoard = function () {
	var _self = this;

	var eventInfoText = "";
	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];

	if (playerStateYou.rollAgain) {
		eventInfoText += "Roll the die again";
	} else {
		eventInfoText += "Roll the die";
	}

	if (!playerStateYou.moveBackwardsOnNextRoll) {
		if (playerStateYou.canRollDiceBoardCount > 1) {
			eventInfoText += " " + playerStateYou.canRollDiceBoardCount + " times";
		} else {
			eventInfoText += " " + playerStateYou.canRollDiceBoardCount + " time";
		}
	} else {
		if (playerStateYou.canRollDiceBoardCountBackward > 1) {
			eventInfoText += " " + playerStateYou.canRollDiceBoardCountBackward + " times";
		} else {
			eventInfoText += " " + playerStateYou.canRollDiceBoardCountBackward + " time";
		}
		eventInfoText += " backwards";
	}

	_self.showEventsInfo(eventInfoText);

	$(_self.ROLL_DIE_CLASS).show();

	$(_self.ROLL_DIE_CLASS).on("click", function(e) {
		$(_self.ROLL_DIE_CLASS).off("click");
		$(_self.ROLL_DIE_CLASS).hide();

		_self.hideEventsInfo(null, 0);
		_self._lastClientData = { roomId: _self._roomData.id };
		_self.client.rollDiceBoard(_self._lastClientData);
	});
};

gameController.prototype.switchPhaseEnemy = function (currPhaseIdSelector, callback, callback2, callback3) {
	var _self = this;

  var phaseText = $(currPhaseIdSelector).data("phaseText");

  $(_self.PHASE_COLUMN_CLASS).removeClass("active");
  $(currPhaseIdSelector).parent().prevAll().find(_self.PHASE_COLUMN_CLASS).removeClass('next');
  $(currPhaseIdSelector).parent().prevAll().find(_self.PHASE_COLUMN_CLASS).addClass('ended');
  $(currPhaseIdSelector).removeClass("next");
  $(currPhaseIdSelector).addClass("active");

  if (currPhaseIdSelector == _self.PHASE_END_ID) {
		$(currPhaseIdSelector).removeClass("active");
		$(currPhaseIdSelector).addClass("ended");
	}

  _self.showEventsInfo(phaseText);
  _self.hideEventsInfo();
  _self.switchPhaseTimeout = setTimeout(function () {
  	if (typeof callback === "function") {
  		callback();
  	}

  	if (typeof callback2 === "function") {
  		callback2();
  	}

  	if (typeof callback3 === "function") {
  		callback3();
  	}
  }, 2100);
};

gameController.prototype.nextTurn = function () {
	var _self = this;

  $(_self.PHASE_COLUMN_CLASS).removeClass("ended");
	$(_self.PHASE_COLUMN_CLASS).removeClass("active");
	$(_self.PHASE_COLUMN_CLASS).removeClass("selectable");
  $(_self.PHASE_COLUMN_CLASS).addClass("next");
  _self.startTurn();
};

gameController.prototype.fillInfoCard = function (card) {
	var _self = this;

	if (!$(card).attr("src")) {
		return;
	}

	var cardRarity = $(card).data("cardRarity") || "";
	var cardText = $(card).data("cardText") || "";
	var cardCost = !isNaN($(card).data("cardCost")) ? $(card).data("cardCost") : undefined;
	var cardAttributes = $(card).data("cardAttributes") || "";
	var cardEffect = $(card).data("cardEffect") || "";

	cardRarity = cardRarity ? cardRarity.toUpperCase() + ' [' : cardRarity;
	cardCost = !isNaN(cardCost) ? ('<span title="' + cardCost + ' Energy cost">' + cardCost + 'E</span>') : cardCost;

	if ($(card).attr("src") != $(_self.CARD_INFO_IMG_ID).attr("src")) {
  	$(_self.CARD_INFO_IMG_ID).attr("src", $(card).attr("src"));
	}

  $(_self.CARD_INFO_IMG_ID).css("border", "1px solid white");
  $(_self.CARD_INFO_NAME_ID).text($(card).data("cardName") || "");

  var cardHtml = cardRarity;
  cardHtml = cardCost ? cardHtml + cardCost : cardHtml;

  if (cardEffect && cardEffect.effectChargesCount) {
  	cardHtml += ', <span title="Charges count">' + cardEffect.effectChargesCount + 'C</span>';
  }

  cardHtml = cardCost ? (cardHtml + '] &nbsp;') : cardHtml;

  if (cardEffect) {
  	if (cardEffect.continuous) {
  		cardHtml += '<img class="anime-cb-card-info-text-img" src="/imgs/continuous.png" title="Continuous card">, ';
  	}

  	if (cardEffect.chainTrigger) {
  		cardHtml += '<img class="anime-cb-card-info-text-img" src="/imgs/chainable.png" title="Chainable card">, ';
  	}
  }

  if (cardAttributes) {
	  cardAttributes.forEach(function(cardAttr) {
	  	cardHtml += '<img class="anime-cb-card-info-text-img" src="/imgs/' + cardAttr
	  	+ '_attr.png" title="' + (cardAttr.charAt(0).toUpperCase() + cardAttr.slice(1)) + ' attribute">,';
	  });

	  cardHtml = cardHtml.substring(0, cardHtml.length - 1);
  	cardHtml += '<br>';
	}

  cardHtml += cardText;

  if ($(_self.CARD_INFO_TEXT_ID).html() != cardHtml) {
  	$(_self.CARD_INFO_TEXT_ID).html(cardHtml);
  }
};

gameController.prototype.handleCardHover = function (e, card) {
	var _self = this;

  const xVal = e.offsetX;
  const yVal = e.offsetY;

  const height = $(card).height();
  const width = $(card).width();

  const yRotation = 20 * ((xVal - width / 2) / width);
  const xRotation = -20 * ((yVal - height / 2) / height);

  const string = 'perspective(500px) scale(1.1) rotateX(' + xRotation + 'deg) rotateY(' + yRotation + 'deg)';

  $(card).css("transform", string);

  _self.fillInfoCard(card);

  $(_self.CARDS_IN_HAND_CLASS).css("overflow", "visible");
  $(_self.CARDS_IN_HAND_WRAPPER_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "visible");
};

gameController.prototype.populateGraveyard = function (playerId, playerSelectorClass) {
	var _self = this;

	if (!playerId || !_self._gameplayData || !_self._enableGraveyardPopulationOnClick) {
		return;
	}

	var graveyardArr = _self._gameplayData.gameState.playersState[playerId].cardsInGraveyardArr;
	var $modal_body = $(_self.MODAL_GRAVEYARD_CLASS + playerSelectorClass).find('.modal-body');
	$modal_body.html("");

	graveyardArr.forEach(function(card) {
		var cardId = card.cardId;
		var cardName = card.cardName;
		var cardText = card.cardText;
		var cardImg = card.cardImg;
		var cardRarity = card.cardRarity;
		var cardEffect = card.cardEffect;
		var cardCost = card.cardCost;
		var cardAttributes = card.cardAttributes;

		$modal_body.prepend('<img class="anime-cb-card ' + playerSelectorClass.substr(1) + ' in-graveyard" src="/imgs/player_cards/' + cardImg + '">');

		var $card = $modal_body.find('img').first();
		$modal_body.find('img').first().data("cardId", cardId);
		$modal_body.find('img').first().data("cardName", cardName);
		$modal_body.find('img').first().data("cardText", cardText);
		$modal_body.find('img').first().data("cardRarity", cardRarity);
		$modal_body.find('img').first().data("cardEffect", cardEffect);
		$modal_body.find('img').first().data("cardCost", cardCost);
		$modal_body.find('img').first().data("cardAttributes", cardAttributes);
	});
};

gameController.prototype.noScrollOnCardHover = function (e) {
  var $this = $(this),
    scrollTop = this.scrollTop,
    scrollHeight = this.scrollHeight,
    height = $this.height(),
    delta = (e.type == 'DOMMouseScroll' ?
        e.originalEvent.detail * -40 :
        e.originalEvent.wheelDelta),
    up = delta > 0;

  var prevent = function() {
    e.stopPropagation();
    e.preventDefault();
    e.returnValue = false;
    return false;
  }

  if (!up && -delta > scrollHeight - height - scrollTop) {
    $this.scrollTop(scrollHeight);
    return prevent();
  } else if (up && delta > scrollTop) {
    $this.scrollTop(0);
    return prevent();
  }
};

gameController.prototype.moveYourCharacter = function (spacesCount, callback, secondsTimeout = 2000) {
	var _self = this;

  var moveBackwardsYou = _self._gameplayData.gameState.playersState[_self._yourUserId].moveBackwards;

	if ((_self._yourUserId == _self._roomData.player1Id && !moveBackwardsYou)
		|| (_self._yourUserId == _self._roomData.player2Id && moveBackwardsYou)) {
		_self.moveAnimationBoardForward(spacesCount, _self._yourUserId, _self.BOARD_PLAYER_YOU_ID, callback, secondsTimeout);
	} else {
		_self.moveAnimationBoardBackwards(spacesCount, _self._yourUserId, _self.BOARD_PLAYER_YOU_ID, callback, secondsTimeout);
	}
}

gameController.prototype.moveEnemyCharacter = function (spacesCount, callback, secondsTimeout = 2000) {
	var _self = this;

  var moveBackwardsEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId].moveBackwards;

	if ((_self._yourUserId == _self._roomData.player1Id && !moveBackwardsEnemy)
		|| (_self._yourUserId == _self._roomData.player2Id && moveBackwardsEnemy)) {
		_self.moveAnimationBoardBackwards(spacesCount, _self._enemyUserId, _self.BOARD_PLAYER_ENEMY_ID, callback, secondsTimeout);
	} else {
		_self.moveAnimationBoardForward(spacesCount, _self._enemyUserId, _self.BOARD_PLAYER_ENEMY_ID, callback, secondsTimeout);
	}
}

gameController.prototype.moveAnimationBoardForward = function (spacesCount, playerId, playerIdSelector, callback, secondsTimeout = 2000) {
	var _self = this;

  var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[playerId].lastBoardIndex;
  var rowIndex = boardPath[currBoardIndex][0];
  var columnIndex = boardPath[currBoardIndex][1];

  var $currTd = $(playerIdSelector).parent();
  var $currTr = $(playerIdSelector).closest('tr');

  var nextHeight = 50;
	var nextWidth = 50;

  var animsCounter = 0;
  function incrementAnimsUpdateBoard() {
	  animsCounter++;

	  if (!_self._gameplayData) {
	  	return;
	  }

	  if (animsCounter == spacesCount) {
	  	$(playerIdSelector).remove();
			var currPlayerTd = document.getElementById('anime-cb-board').rows[rowIndex].cells[columnIndex];
			$(currPlayerTd).append('<span class="anime-cb-player-position" id="' + playerIdSelector.substr(1) + '"></span>');

			_self.client.roomController.resetRoomsInterval.call(_self.client.roomController);
			_self.checkForWin(callback);
  	}
  }

  _self.moveCharacterTimeout = setTimeout(function() {
		if ((currBoardIndex + spacesCount > boardPath.length - 1) || spacesCount == 0) {
			if (typeof callback == "function") {
				callback.call(_self);
			}
			return;
		}

		for (var i = 0; i < spacesCount; i++) {
		  if (boardPath[currBoardIndex + 1][0] != rowIndex) {
		    if (boardPath[currBoardIndex + 1][0] < rowIndex) {
		    	$currTr = $currTr.prev();
		    	$currTd = $currTr.find('td:nth-child(' + ($currTd.index() + 1) + ')');
		    	nextHeight = $currTd.outerHeight();
		  	  $(playerIdSelector).animate({'margin-top': '-=' + nextHeight + 'px'}, 400, null, incrementAnimsUpdateBoard);
		  	} else {
		  		$currTr = $currTr.next();
		    	$currTd = $currTr.find('td:nth-child(' + ($currTd.index() + 1) + ')');
		    	nextHeight = $currTd.outerHeight();
		  	  $(playerIdSelector).animate({'margin-top': '+=' + nextHeight + 'px'}, 400, null, incrementAnimsUpdateBoard);
		  	}
		  }

		  if (boardPath[currBoardIndex + 1][1] != columnIndex) {
		    if (boardPath[currBoardIndex + 1][1] < columnIndex) {
		    	$currTd = $currTr.find('td:nth-child(' + $currTd.index() + ')');
		    	nextWidth = $currTd.outerWidth();
		      $(playerIdSelector).animate({'margin-left': '-=' + nextWidth + 'px'}, 400, null, incrementAnimsUpdateBoard);
		    } else {
		    	$currTd = $currTr.find('td:nth-child(' + ($currTd.index() + 2) + ')');
		    	nextWidth = $currTd.outerWidth();
		      $(playerIdSelector).animate({'margin-left': '+=' + nextWidth + 'px'}, 400, null, incrementAnimsUpdateBoard);
		  	}
		  }

		  rowIndex = boardPath[currBoardIndex + 1][0];
		  columnIndex = boardPath[currBoardIndex + 1][1];
		  currBoardIndex++;
 		}
  }, secondsTimeout);
};

gameController.prototype.moveAnimationBoardBackwards = function (spacesCount, playerId, playerIdSelector, callback, secondsTimeout = 2000) {
	var _self = this;

  var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[playerId].lastBoardIndex;
  var rowIndex = boardPath[currBoardIndex][0];
  var columnIndex = boardPath[currBoardIndex][1];

  var $currTd = $(playerIdSelector).parent();
  var $currTr = $(playerIdSelector).closest('tr');

  var nextHeight = 50;
	var nextWidth = 50;

	var animsCounter = 0;
  function incrementAnimsUpdateBoard() {
	  animsCounter++;

	  if (!_self._gameplayData) {
	  	return;
	  }

	  if (animsCounter == spacesCount) {
	  	$(playerIdSelector).remove();
			var currPlayerTd = document.getElementById('anime-cb-board').rows[rowIndex].cells[columnIndex];
			$(currPlayerTd).append('<span class="anime-cb-player-position" id="' + playerIdSelector.substr(1) + '"></span>');

			_self.client.roomController.resetRoomsInterval.call(_self.client.roomController);
			_self.checkForWin(callback);
	  }
	}

  _self.moveCharacterTimeout = setTimeout(function() {
		if ((currBoardIndex - spacesCount < 0) || spacesCount == 0) {
			if (typeof callback == "function") {
				callback.call(_self);
			}
			return;
		}

		for (var i = 0; i < spacesCount; i++) {
		  if (boardPath[currBoardIndex - 1][0] != rowIndex) {
		    if (boardPath[currBoardIndex - 1][0] < rowIndex) {
		    	$currTr = $currTr.prev();
		    	$currTd = $currTr.find('td:nth-child(' + ($currTd.index() + 1) + ')');
		    	nextHeight = $currTd.outerHeight();
		  	  $(playerIdSelector).animate({'margin-top': '-=' + nextHeight + 'px'}, 400, null, incrementAnimsUpdateBoard);
		  	} else {
		  		$currTr = $currTr.next();
		    	$currTd = $currTr.find('td:nth-child(' + ($currTd.index() + 1) + ')');
		    	nextHeight = $currTd.outerHeight();
		  	  $(playerIdSelector).animate({'margin-top': '+=' + nextHeight + 'px'}, 400, null, incrementAnimsUpdateBoard);
		  	}
		  }

		  if (boardPath[currBoardIndex - 1][1] != columnIndex) {
		    if (boardPath[currBoardIndex - 1][1] < columnIndex) {
		    	$currTd = $currTr.find('td:nth-child(' + $currTd.index() + ')');
		    	nextWidth = $currTd.outerWidth();
		      $(playerIdSelector).animate({'margin-left': '-=' + nextWidth + 'px'}, 400, null, incrementAnimsUpdateBoard);
		    } else {
		    	$currTd = $currTr.find('td:nth-child(' + ($currTd.index() + 2) + ')');
		    	nextWidth = $currTd.outerWidth();
		      $(playerIdSelector).animate({'margin-left': '+=' + nextWidth + 'px'}, 400, null, incrementAnimsUpdateBoard);
		  	}
		  }

		  rowIndex = boardPath[currBoardIndex - 1][0];
		  columnIndex = boardPath[currBoardIndex - 1][1];
		  currBoardIndex--;
 		}
  }, secondsTimeout);
};

gameController.prototype.checkForWin = function (callback) {
	var _self = this;

	if (_self._yourUserId == _self._roomData.player1Id) {
		_self.setBoardPieces();
	} else {
		_self.setBoardPiecesRotated();
	}

	if (_self._gameplayData.gameState.playerIdWinGame) {
		if (_self._gameplayData.gameState.playerIdWinGame == _self._yourUserId) {
			var yourName = _self._roomData.player1Id == _self._yourUserId ? _self._roomData.player1Name : _self._roomData.player2Name;
			_self.showEventsInfo("YOU WIN !!!");
			_self.setLeaveButton(_self._yourUserId);
			return;
		} else {
			var enemyName = _self._roomData.player1Id == _self._enemyUserId ? _self._roomData.player1Name : _self._roomData.player2Name;
			_self.showEventsInfo("YOU LOSE...");
			_self.setLeaveButton(_self._enemyUserId);
			return;
		}
	}

	if (typeof callback == "function") {
		callback.call(_self);
	}
};

gameController.prototype.rollDiceYou = function (diceValue, callback, callback2) {
	var _self = this;

  var diceContainer = $(_self.DICE_THROW_CONTAINER_PLAYER_YOU_ID)[0];
  var options = {
    element: diceContainer,
    numberOfDice: 1,
    delay: 1500,
    values: [diceValue],
    noSound: !_self.client.logInSignUpController._settings.sound
    	|| !_self.client.logInSignUpController._settings.cardBoardEffectSounds,
    callback: callback.bind(_self, diceValue, callback2, 2000)
  };

  rollADie(options);
};

gameController.prototype.rollDiceEnemy = function (diceValue, callback, callback2) {
	var _self = this;

  var diceContainer = $(_self.DICE_THROW_CONTAINER_PLAYER_ENEMY_ID)[0];
  var options = {
    element: diceContainer,
    numberOfDice: 1,
    delay: 1500,
    values: [diceValue],
    noSound: !_self.client.logInSignUpController._settings.sound ||
    	!_self.client.logInSignUpController._settings.cardBoardEffectSounds,
    callback: callback.bind(_self, diceValue, callback2, 2000)
  };

  rollADie(options);
};

gameController.prototype.summonCardFromHandAnimationYou = function (cardObj, callback) {
	var _self = this;

	var cardIdx = _self._gameplayData.gameState.cardSummonedIdxInPlayerHand + 1;
	var card = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS
		+ _self.PLAYER_YOU_CLASS + ':nth-child(' + cardIdx + ')');

	var cardSuccessfullySummoned = false;
	var cardId = cardObj.cardId;
	var cardName = cardObj.cardName;
	var cardText = cardObj.cardText;
	var cardImg = cardObj.cardImg;
	var cardRarity = cardObj.cardRarity;
	var cardEffect = cardObj.cardEffect;
	var cardCost = cardObj.cardCost;
	var cardAttributes = cardObj.cardAttributes;

	$(_self.CARD_FIELD_CLASS + _self.PLAYER_YOU_CLASS + ' td').each(function(idx) {
		if (!$(this).find('img').length) {
			$(this).css("-webkit-animation", "summon-your-card 0.6s ease-out both");
			$(this).css("animation", "summon-your-card 0.6s ease-out both");
			$(this).html('<img class="anime-cb-card-onfield hover player-you" src="/imgs/player_cards/'
				+ cardImg + '" data-card-id="' + cardId + '">');
			$(this).find('img').data("cardId", cardId);
			$(this).find('img').data("cardName", cardName);
			$(this).find('img').data("cardText", cardText);
			$(this).find('img').data("cardRarity", cardRarity);
			$(this).find('img').data("cardEffect", cardEffect);
			$(this).find('img').data("cardCost", cardCost);
			$(this).find('img').data("cardAttributes", cardAttributes);
			$(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
			$(card).remove();

			cardSuccessfullySummoned = true;

			_self.decreaseYourCardsInHandDensity();
			_self.updateCardsStatusText();

			_self.summonCardTimeout = setTimeout(function() {
				$(this).css("animation", "");
				$(this).css("-webkit-animation", "");

				if (!cardEffect.continuous || (cardEffect.continuous && cardEffect.continuousEffectType == "passive")) {
					_self.showCardActivateOnScreenYou(cardObj, callback);
				} else if (typeof callback === "function") {
					callback.call(_self);
				}

			}.bind(this), 600);

			return false;
		}
	});

	assert(cardSuccessfullySummoned);
};

gameController.prototype.showCardActivateOnScreenYou = function (cardObj, callback) {
	var _self = this;

	var cardSounds = cardObj.cardSounds;

	if (_self.client.logInSignUpController._settings.sound
		&& _self.client.logInSignUpController._settings.cardBoardEffectSounds
		&& cardSounds.activateEffects
		&& cardSounds.activateEffects[0]) {
		var randNum = getRandomInt(0, cardSounds.activateEffects.length - 1);
		_self.playSound(cardSounds.activateEffects[randNum]);
	}

	$('.anime-cb-card-activate-show').attr("src", "/imgs/player_cards/" + cardObj.cardImg);
	$('.anime-cb-card-activate-show').css("animation", "vibrate-card-activate-you 0.3s linear 5 both");

	_self.showCardTimeout = setTimeout(function() {
		$('.anime-cb-card-activate-show').css("animation", "");
		if (typeof callback === "function") {
			callback();
		}
	}, 2000);
};

gameController.prototype.showCardActivateOnScreenEnemy = function (cardObj, callback) {
	var _self = this;

	var cardSounds = cardObj.cardSounds;

	if (_self.client.logInSignUpController._settings.sound
		&& _self.client.logInSignUpController._settings.cardBoardEffectSounds
		&& cardSounds.activateEffects
		&& cardSounds.activateEffects[0]) {
		var randNum = getRandomInt(0,  cardSounds.activateEffects.length - 1);
		_self.playSound(cardSounds.activateEffects[randNum]);
	}

	$('.anime-cb-card-activate-show').attr("src", "/imgs/player_cards/" + cardObj.cardImg);
	$('.anime-cb-card-activate-show').css("animation", "vibrate-card-activate-enemy 0.3s linear 5 both");

	_self.showCardTimeout = setTimeout(function() {
		$('.anime-cb-card-activate-show').css("animation", "");
		if (typeof callback === "function") {
			callback();
		}
	}, 2000);
};

gameController.prototype.updateCardChargesStatuses = function () {
	var _self = this;

	_self._gameplayData.gameState.playersState[_self._yourUserId].cardsOnFieldArr.forEach(function(card) {
		_self.updateCardChargesStatus(card, _self.PLAYER_YOU_CLASS);
	});

	_self._gameplayData.gameState.playersState[_self._enemyUserId].cardsOnFieldArr.forEach(function(card) {
		_self.updateCardChargesStatus(card, _self.PLAYER_ENEMY_CLASS);
	});
};

gameController.prototype.updateCardChargesStatus = function (cardObj, playerSelectorClass) {
	var _self = this;

	var cardEffect = cardObj.cardEffect;

	if (!cardEffect.continuous) {
		return;
	}

	$(_self.CARD_ON_FIELD_CLASS + playerSelectorClass).each(function() {
		var cardTd = $(this).parent();
		if ($(this).data("cardId") == cardObj.cardId) {
			$(_self.CARD_FIELD_CHARGES_WRAPPER_CLASS + playerSelectorClass + ' td:nth-child(' + (cardTd.index() + 1) + ')')
				.html((cardEffect.effectChargesCount - cardEffect.chargesUsedTotal) + '/' + cardEffect.effectChargesCount
					+ ' | ' + '<span class="anime-cb-card-field-energy-cost">' + (cardObj.cardEffect.energyPerUse || 0) + '</span>');
		}
	});
};

gameController.prototype.removeCardChargesStatus = function (card, playerSelectorClass) {
	var _self = this;

	var cardTd = $(card).parent();
	$(_self.CARD_FIELD_CHARGES_WRAPPER_CLASS + playerSelectorClass + ' td:nth-child(' + (cardTd.index() + 1) + ')').text("");
};

gameController.prototype.setUpContinuousCardOnClickListener = function () {
	var _self = this;

	_self.disableContinuousCardOnClickListener();
	$(_self.CARD_ON_FIELD_CLASS + _self.PLAYER_YOU_CLASS).each(function(idx) {
		var card = this;
		var cardEffect = $(card).data("cardEffect");
		var canActivateCard = _self.canActivateCard(card);

		if (!canActivateCard) {
			var msg = _self.quickGameInfoMsg;
			$(card).on("click", function(e) {
				if (_self.quickGameInfoEnabled) {
					_self.showQuickGameInfo(msg);
				}
			});
			return;
		}

		$(card).attr("data-tooltip", "activateEffect");
		$(card).on("click", function(e) {
			_self.disableContinuousCardOnClickListener();
			_self.disableMainPhaseActions();
			_self.activateCardEffect(this);
		});
	});
};

gameController.prototype.disableContinuousCardOnClickListener = function () {
	var _self = this;

	$(_self.CARD_ON_FIELD_CLASS + _self.PLAYER_YOU_CLASS).off("click");
	$(_self.CARD_ON_FIELD_CLASS + _self.PLAYER_YOU_CLASS).removeAttr("data-tooltip");
};

gameController.prototype.canActivateCard = function (card) {
	var _self = this;

	var cardId = $(card).data("cardId");
	var boardMatrix = _self._gameplayData.gameState.boardData.boardMatrix;
	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[_self._yourUserId].currBoardIndex;
  var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];
  var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];
  var rowIndex;
  var columnIndex;
  var canActivateCard = true;

	var cardEffect;
  playerStateYou.cardsOnFieldArr.forEach(function(card, idx) {
		if (card.cardId == cardId) {
			cardEffect = card.cardEffect;
		}
	});

	if (!cardEffect) {
		_self.quickGameInfoMsg = "Problem while activating card...";
		return false;
	}

	if ((!cardEffect.continuous) || (cardEffect.continuousEffectType != "onClick")) {
		_self.quickGameInfoMsg = "This card has passive effect";
		return false;
	}

  if (cardEffect.effect == "copySpecialSpacesUpTo") {
  	var availableSpaces = 0;
	  var moveBoardForward = true;
	  if (_self._yourUserId == _self._roomData.player2Id) {
	  	moveBoardForward = false;
	  }

		for (var i = 0; i < cardEffect.effectValue; i++) {
			if (moveBoardForward) {
				currBoardIndex++;

				if (!boardPath[currBoardIndex]) {
					break;
				}
			} else {
				currBoardIndex--;

				if (currBoardIndex < 0) {
					break;
				}
			}

		  rowIndex = boardPath[currBoardIndex][0];
		  columnIndex = boardPath[currBoardIndex][1];

		  if (boardMatrix[rowIndex][columnIndex] > 1) {
		  	availableSpaces++;
			}
		}

		if (availableSpaces <= 0) {
			_self.quickGameInfoMsg = "No special board spaces in range";
			return false;
		}
	} else if (cardEffect.effect == "decreaseChargesContinousCardAll") {
		var availableCards = false;
		playerStateYou.cardsOnFieldArr.forEach(function(cardOnField) {
			cardOnField.cardAttributes.forEach(function(attribute) {
				if (cardOnField.cardId != cardId && cardEffect.allowedAttributes.includes(attribute)) {
					availableCards = true;
				}
			});
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(cardOnField) {
			cardOnField.cardAttributes.forEach(function(attribute) {
				if (cardEffect.allowedAttributes.includes(attribute)) {
					availableCards = true;
				}
			});
		});

		if (!availableCards) {
			_self.quickGameInfoMsg = "No available cards to use this effect on";
			return false;
		}
	}

	if (playerStateYou.energyPoints < cardEffect.energyPerUse) {
		_self.quickGameInfoMsg = "Not enough Energy";
		return false;
	}

	if ("activationsCountThisTurn" in cardEffect && cardEffect.activationsCountThisTurn >= cardEffect.maxUsesPerTurn) {
		_self.quickGameInfoMsg = "Max uses per turn reached";
		return false;
	}

	if ("effectChargesCount" in cardEffect && cardEffect.chargesUsedTotal >= cardEffect.effectChargesCount) {
		_self.quickGameInfoMsg = "No charges";
		return false;
	}

	return canActivateCard;
};

gameController.prototype.activateCardEffect = function (card) {
	var _self = this;

	var cardId = $(card).data("cardId");

	_self._lastClientData = { roomId: _self._roomData.id, cardId: cardId };
	_self.client.activateCardEffect(_self._lastClientData);
};

gameController.prototype.processActivateCardEffect = function (data) {
	console.log('processActivateCardEffect');
	console.log('processActivateCardEffect data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.activateCardEffect(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(activateCardEffectResponse, data), 'activateCardEffectResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.playerIdActivatedCard == _self._yourUserId) {
		_self.showCardActivateOnScreenYou(_self._gameplayData.gameState.cardActivated, _self.performCardEffectContinuousYou
			.bind(_self, _self._gameplayData.gameState.cardActivated));
	} else {
		_self.showCardActivateOnScreenEnemy(_self._gameplayData.gameState.cardActivated, _self.performCardEffectContinuousEnemy
			.bind(_self, _self._gameplayData.gameState.cardActivated));
	}
};

gameController.prototype.processFinishCardEffectContinuous = function (data) {
	console.log('processFinishCardEffectContinuous');
	console.log('processFinishCardEffectContinuous data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.finishCardEffectContinuous(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(finishCardEffectContinuousResponse, data), 'finishCardEffectContinuousResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.playerIdFinishCardContinuous == _self._yourUserId) {
		_self.performCardEffectContinuousFinishYou(_self._gameplayData.gameState.cardFinishContinuous);
	} else {
		_self.performCardEffectContinuousFinishEnemy(_self._gameplayData.gameState.cardFinishContinuous);
	}
};

gameController.prototype.processFinishChainEffect = function (data) {
	console.log('processFinishChainEffect');
	console.log('processFinishChainEffect data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.finishChainEffect(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(finishChainEffectResponse, data), 'finishChainEffectResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
		if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
			_self.checkIfEnemyHasToDoAction(_self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
		} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
			_self.checkIfEnemyHasToDoAction(_self.waitForEnemyActions.bind(_self), _self.enableRollPhaseActions.bind(_self));
		}
	} else {
		_self.checkIfYouHaveToDoAction(_self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self));
	}
};

gameController.prototype.processDrawCardFromEnemyHand = function(data) {
	console.log('processDrawCardFromEnemyHand');
	console.log('processDrawCardFromEnemyHand data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.drawCardFromEnemyHand(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(drawCardFromEnemyHandResponse, data), 'drawCardFromEnemyHandResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	var callback;
	if (_self._gameplayData.gameState.playerIdDrawnCardFromEnemyHand == _self._yourUserId) {
		if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
			if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
				callback = _self.enableMainPhaseActions.bind(_self);
			} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
				callback = _self.enableRollPhaseActions.bind(_self);
			}
		} else {
			callback = _self.checkIfYouHaveToDoAction
				.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self));
		}

		_self.drawCardFromEnemyHandYouAnimation(_self._gameplayData.gameState.cardDrawnFromEnemyHand, callback);
	} else {
		_self.hideEventsInfo(null, 0);
		if (_self._gameplayData.gameState.currPlayerId == _self._enemyUserId) {
			callback = _self.waitForEnemyActions.bind(_self);
		} else {
			if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
				callback = _self.checkIfEnemyHasToDoAction.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
			} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
				callback = _self.checkIfEnemyHasToDoAction.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableRollPhaseActions.bind(_self));
			}
		}

		_self.drawCardFromEnemyHandEnemyAnimation(_self._gameplayData.gameState.cardDrawnFromEnemyHand, callback);
	}
};

gameController.prototype.processDestroyCardFromEnemyField = function(data) {
	console.log('processDestroyCardFromEnemyField');
	console.log('processDestroyCardFromEnemyField data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.destroyCardFromEnemyField(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(destroyCardFromEnemyFieldResponse, data), 'destroyCardFromEnemyFieldResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	var callback;
	if (_self._gameplayData.gameState.playerIdDestroyedCardFromEnemyField == _self._yourUserId) {
		if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
			if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
				callback = _self.enableMainPhaseActions.bind(_self);
			} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
				callback = _self.enableRollPhaseActions.bind(_self);
			}
		} else {
			callback = _self.checkIfYouHaveToDoAction
				.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self));
		}

		_self.destroyCardFromEnemyFieldYouAnimation(_self._gameplayData.gameState.cardDestroyedFromEnemyField, callback);
	} else {
		if (_self._gameplayData.gameState.currPlayerId == _self._enemyUserId) {
			callback = _self.waitForEnemyActions.bind(_self);
		} else {
			if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
				callback = _self.checkIfEnemyHasToDoAction.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
			} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
				callback = _self.checkIfEnemyHasToDoAction.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableRollPhaseActions.bind(_self));
			}
		}

		_self.hideEventsInfo(null, 0);
		_self.destroyCardFromEnemyFieldEnemyAnimation(_self._gameplayData.gameState.cardDestroyedFromEnemyField, callback);
	}
};

gameController.prototype.processTakeCardFromGraveyard = function(data) {
	console.log('processTakeCardFromGraveyard');
	console.log('processTakeCardFromGraveyard data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.takeCardFromGraveyard(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(takeCardFromGraveyardResponse, data), 'takeCardFromGraveyardResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self._cardsInHandArr = data.cardsInHandArr;
	_self.updateGameStatusInfo();

	var callback;
	if (_self._gameplayData.gameState.playerIdTakenCardFromGraveyard == _self._yourUserId) {
		if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
			if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
				callback = _self.enableMainPhaseActions.bind(_self);
			} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
				callback = _self.enableRollPhaseActions.bind(_self);
			}
		} else {
			callback = _self.checkIfYouHaveToDoAction
				.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self));
		}

		if (_self._gameplayData.gameState.cardTakenFromGraveyard.playerIdGraveyard == _self._yourUserId) {
			_self.takeCardFromYourGraveyardYouAnimation(_self._gameplayData.gameState.cardTakenFromGraveyard, callback);
		} else {
			_self.takeCardFromEnemyGraveyardYouAnimation(_self._gameplayData.gameState.cardTakenFromGraveyard, callback);
		}
	} else {
		_self.hideEventsInfo(null, 0);
		if (_self._gameplayData.gameState.currPlayerId == _self._enemyUserId) {
			callback = _self.waitForEnemyActions.bind(_self);
		} else {
			if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
				callback = _self.checkIfEnemyHasToDoAction.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
			} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
				callback = _self.checkIfEnemyHasToDoAction.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableRollPhaseActions.bind(_self));
			}
		}

		if (_self._gameplayData.gameState.cardTakenFromGraveyard.playerIdGraveyard == _self._enemyUserId) {
			_self.takeCardFromYourGraveyardEnemyAnimation(_self._gameplayData.gameState.cardTakenFromGraveyard, callback);
		} else {
			_self.takeCardFromEnemyGraveyardEnemyAnimation(_self._gameplayData.gameState.cardTakenFromGraveyard, callback);
		}
	}
};

gameController.prototype.summonCardFromHandAnimationEnemy = function (cardObj, callback) {
	var _self = this;

	var cardIdx = _self._gameplayData.gameState.cardSummonedIdxInPlayerHand + 1;
	var card = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS
		+ _self.PLAYER_ENEMY_CLASS + ':nth-last-child(' + cardIdx + ')');

	var cardSuccessfullySummoned = false;
	var cardId = cardObj.cardId;
	var cardName = cardObj.cardName;
	var cardText = cardObj.cardText;
	var cardImg = cardObj.cardImg;
	var cardRarity = cardObj.cardRarity;
	var cardEffect = cardObj.cardEffect;
	var cardCost = cardObj.cardCost;
	var cardAttributes = cardObj.cardAttributes;

	$($(_self.CARD_FIELD_CLASS + _self.PLAYER_ENEMY_CLASS + ' td').get().reverse()).each(function(idx) {
		if (!$(this).find('img').length) {
			$(this).css("-webkit-animation", "summon-enemy-card 0.6s ease-out both");
			$(this).css("animation", "summon-enemy-card 0.6s ease-out both");
			$(this).html('<img class="anime-cb-card-onfield hover player-enemy" src="/imgs/player_cards/'
				+ cardImg + '" data-card-id="' + cardId + '">');
			$(this).find('img').data("cardId", cardId);
			$(this).find('img').data("cardName", cardName);
			$(this).find('img').data("cardText", cardText);
			$(this).find('img').data("cardRarity", cardRarity);
			$(this).find('img').data("cardEffect", cardEffect);
			$(this).find('img').data("cardCost", cardCost);
			$(this).find('img').data("cardAttributes", cardAttributes);
			$(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
			$(card).remove();

			_self.decreaseEnemyCardsInHandDensity();
			_self.updateCardsStatusText();

			_self.summonCardTimeout = setTimeout(function() {
				$(this).css("animation", "");
				$(this).css("-webkit-animation", "");

				if (!cardEffect.continuous || (cardEffect.continuous && cardEffect.continuousEffectType == "passive")) {
					_self.showCardActivateOnScreenEnemy(cardObj, callback);
				} else if (typeof callback === "function") {
					callback.call(_self);
				}
			}.bind(this), 600);

			return false;
		}
	});
};

gameController.prototype.drawCardFromDeckYouAnimation = function (card) {
	var _self = this;

	var cardId = card.cardId;
	var cardName = card.cardName;
	var cardText = card.cardText;
	var cardImg = card.cardImg;
	var cardRarity = card.cardRarity;
	var cardEffect = card.cardEffect;
	var cardCost = card.cardCost;
	var cardAttributes = card.cardAttributes;

  var cardsInHandCount = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).length;
  var drawFromDeckAnimationCount = cardsInHandCount + 1;

  if (cardsInHandCount >= 10 && cardsInHandCount <= 15) {
  	drawFromDeckAnimationCount = 10;
  } else if (cardsInHandCount > 15) {
  	drawFromDeckAnimationCount = 11;
  }

  _self.disableScroll();

  $(_self.GAME_SCREEN_CLASS).off('mouseout');
  $(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
	});

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "visible");
  $(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("animation", "");
  $(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("-webkit-animation", "");
  // $(_self.CARDS_IN_HAND_WRAPPER_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "visible");
  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).append('<img style="animation: draw-from-deck-you-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; -webkit-animation: draw-from-deck-you-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;" class="anime-cb-card player-you" '
  		+ 'src="/imgs/player_cards/' + cardImg + '">');

  var $card = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' img').last();
  $card.data("cardId", cardId);
  $card.data("cardName", cardName);
  $card.data("cardText", cardText);
  $card.data("cardRarity", cardRarity);
  $card.data("cardEffect", cardEffect);
  $card.data("cardCost", cardCost);
  $card.data("cardAttributes", cardAttributes);

  _self.increaseYourCardsInHandDensity();
  _self.updateCardsStatusText();

  clearTimeout(_self.drawCardYouAnimationTimeout);

  _self.drawCardYouAnimationTimeout = setTimeout(function() {
  	$(_self.GAME_SCREEN_CLASS).off('mouseout');
  	$(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
		  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
		  $(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
		});
  	$('*').off('DOMMouseScroll mousewheel');
  	$(_self.CARDS_IN_HAND_CLASS).on('DOMMouseScroll mousewheel', _self.noScrollOnCardHover);
  	$(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("animation", "");
  	$(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("-webkit-animation", "");
  	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "hidden");

  	if (_self.drawCardInteractive && _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw > 0) {
  		_self.setCardDrawListener();
  	} else {
  		_self.drawCardInteractive = false;
  	}
  	// $(_self.CARDS_IN_HAND_WRAPPER_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "hidden");
  }, 550);
};

gameController.prototype.drawCardFromDeckEnemyAnimation = function() {
	var _self = this;

	var cardsInHandCount = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).length;
  var drawFromDeckAnimationCount = cardsInHandCount + 1;

  if (cardsInHandCount >= 10 && cardsInHandCount <= 15) {
  	drawFromDeckAnimationCount = 10;
  } else if (cardsInHandCount > 15) {
  	drawFromDeckAnimationCount = 11;
  }

  _self.disableScroll();

 	$(_self.GAME_SCREEN_CLASS).off('mouseout');
 	 $(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
	});

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).css("overflow", "visible");
  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).append('<img style="animation: draw-from-deck-enemy-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; -webkit-animation: draw-from-deck-enemy-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;" class="anime-cb-card player-enemy" '
  		+ 'src="/imgs/player_cards/card_back.png">');

  _self.increaseEnemyCardsInHandDensity();
  _self.updateCardsStatusText();

	clearTimeout(_self.drawCardEnemyAnimationTimeout);

  _self.drawCardEnemyAnimationTimeout = setTimeout(function() {
  	$(_self.GAME_SCREEN_CLASS).off('mouseout');
  	$(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
		  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
		  $(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
		});
  	$('*').off('DOMMouseScroll mousewheel');
  	$(_self.CARDS_IN_HAND_CLASS).on('DOMMouseScroll mousewheel', _self.noScrollOnCardHover);
  	$(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("animation", "");
  	$(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("-webkit-animation", "");
  	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).css("overflow", "hidden");
  }, 550);
};

gameController.prototype.drawCardFromEnemyHandYouAnimation = function(cardObj, callback) {
	var _self = this;

	var cardId = cardObj.cardId;
	var cardName = cardObj.cardName;
	var cardText = cardObj.cardText;
	var cardImg = cardObj.cardImg;
	var cardRarity = cardObj.cardRarity;
	var cardEffect = cardObj.cardEffect;
	var cardCost = cardObj.cardCost;
	var cardAttributes = cardObj.cardAttributes;

  var cardsInHandCount = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).length;
  var drawFromEnemyHandAnimationCount = cardsInHandCount + 1;

  if (cardsInHandCount >= 10 && cardsInHandCount <= 15) {
  	drawFromEnemyHandAnimationCount = 10;
  } else if (cardsInHandCount > 15) {
  	drawFromEnemyHandAnimationCount = 11;
  }

  _self.disableScroll();

  $(_self.GAME_SCREEN_CLASS).off('mouseout');
  $(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
	});

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "visible");
  $(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("animation", "");
  $(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("-webkit-animation", "");
  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).append('<img style="animation: draw-from-enemy-hand-you-'
  	+ drawFromEnemyHandAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; -webkit-animation: draw-from-enemy-hand-you-'
  	+ drawFromEnemyHandAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;" class="anime-cb-card player-you" '
  		+ 'src="/imgs/player_cards/' + cardImg + '">');

  $(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).last().remove();

  var $card = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' img').last();
  $card.data("cardId", cardId);
  $card.data("cardName", cardName);
  $card.data("cardText", cardText);
  $card.data("cardRarity", cardRarity);
  $card.data("cardEffect", cardEffect);
  $card.data("cardCost", cardCost);
  $card.data("cardAttributes", cardAttributes);

  _self.increaseYourCardsInHandDensity();
  _self.decreaseEnemyCardsInHandDensity();
  _self.updateCardsStatusText();

  clearTimeout(_self.drawCardYouAnimationTimeout);

  _self.drawCardYouAnimationTimeout = setTimeout(function() {
  	$(_self.GAME_SCREEN_CLASS).off('mouseout');
  	$(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
		  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
		  $(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
		});
  	$('*').off('DOMMouseScroll mousewheel');
  	$(_self.CARDS_IN_HAND_CLASS).on('DOMMouseScroll mousewheel', _self.noScrollOnCardHover);
  	$(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("animation", "");
  	$(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("-webkit-animation", "");
  	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "hidden");

  	if (typeof callback === "function") {
  		_self.shuffleCardsInHandYou.call(_self, callback.bind(_self));
  	} else {
  		_self.shuffleCardsInHandYou.call(_self);
  	}
  }, 550);
};

gameController.prototype.drawCardFromEnemyHandEnemyAnimation = function(cardObj, callback) {
	var _self = this;

	var cardsInHandCount = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).length;
  var drawFromEnemyHandAnimationCount = cardsInHandCount + 1;

  if (cardsInHandCount >= 10 && cardsInHandCount <= 15) {
  	drawFromEnemyHandAnimationCount = 10;
  } else if (cardsInHandCount > 15) {
  	drawFromEnemyHandAnimationCount = 11;
  }

  _self.disableScroll();

 	$(_self.GAME_SCREEN_CLASS).off('mouseout');
 	 $(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
	});

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).css("overflow", "visible");
  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).append('<img style="animation: draw-from-enemy-hand-enemy-'
  	+ drawFromEnemyHandAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; -webkit-animation: draw-from-enemy-hand-enemy-'
  	+ drawFromEnemyHandAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;" class="anime-cb-card player-enemy" '
  		+ 'src="/imgs/player_cards/card_back.png">');

  $(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS + ':nth-child(' + (cardObj.cardInHandIdx + 1) + ')').remove();

  _self.decreaseYourCardsInHandDensity();
  _self.increaseEnemyCardsInHandDensity();
  _self.updateCardsStatusText();

	clearTimeout(_self.drawCardEnemyAnimationTimeout);

  _self.drawCardEnemyAnimationTimeout = setTimeout(function() {
  	$(_self.GAME_SCREEN_CLASS).off('mouseout');
  	$(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
		  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
		  $(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
		});
  	$('*').off('DOMMouseScroll mousewheel');
  	$(_self.CARDS_IN_HAND_CLASS).on('DOMMouseScroll mousewheel', _self.noScrollOnCardHover);
  	$(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("animation", "");
  	$(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("-webkit-animation", "");
  	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).css("overflow", "hidden");

  	if (typeof callback === "function") {
  		_self.shuffleCardsInHandEnemy.call(_self, callback.bind(_self));
  	} else {
  		_self.shuffleCardsInHandEnemy.call(_self);
  	}
  }, 1000);
};

gameController.prototype.destroyCardFromEnemyFieldYouAnimation = function(card, callback) {
	var _self = this;

	var $cardEl = $(_self.CARD_FIELD_CLASS + _self.PLAYER_ENEMY_CLASS).find("[data-card-id='" + card.cardId + "']");
	$cardEl.removeClass("hover");
	$('.anime-cb-card-activate-show').attr("src", $cardEl.attr("src"));
	$('.anime-cb-card-activate-show').css("animation", "destroy-card-on-field-you 1s cubic-bezier(0.550, 0.085, 0.680, 0.530) both");

	assert(typeof callback === "function");
	_self.destroyCardAnimationEnemy(card, callback);

	setTimeout(function() {
		$('.anime-cb-card-activate-show').css("animation", "");
	}, 1000);
};

gameController.prototype.destroyCardFromEnemyFieldEnemyAnimation = function(card, callback) {
	var _self = this;

	var $cardEl = $(_self.CARD_FIELD_CLASS + _self.PLAYER_YOU_CLASS).find("[data-card-id='" + card.cardId + "']");
	$cardEl.removeClass("hover");
	$('.anime-cb-card-activate-show').attr("src", $cardEl.attr("src"));
	$('.anime-cb-card-activate-show').css("animation", "destroy-card-on-field-enemy 1s cubic-bezier(0.550, 0.085, 0.680, 0.530) both");

	assert(typeof callback === "function");
	_self.destroyCardAnimationYou(card, callback);

	setTimeout(function() {
		$('.anime-cb-card-activate-show').css("animation", "");
	}, 1000);
};

gameController.prototype.discardCardFromHandYou = function (card, callback) {
	var _self = this;

	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.bottom')
		.attr("src", $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top').attr("src"));
	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top')
		.css("-webkit-animation", "discard-card-from-hand-you 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");
	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top')
		.css("animation", "discard-card-from-hand-you 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");

	var $graveyardTopCard = $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top');
	$graveyardTopCard.attr("src", "/imgs/player_cards/" + card.cardImg);
	$graveyardTopCard.data("cardId", card.cardId);
	$graveyardTopCard.data("cardName", card.cardName);
	$graveyardTopCard.data("cardText", card.cardText);
	$graveyardTopCard.data("cardRarity", card.cardRarity);
	$graveyardTopCard.data("cardEffect", card.cardEffect);
	$graveyardTopCard.data("cardCost", card.cardCost);
	$graveyardTopCard.data("cardAttributes", card.cardAttributes);

	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS + ':nth-child(' + (card.cardInHandIdx + 1) + ')').remove();
	$(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");

	_self.decreaseYourCardsInHandDensity();
	_self.updateCardsStatusText();

	_self.discardCardTimeout = setTimeout(function() {
		$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top').css("animation", "");
		$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top').css("-webkit-animation", "");

		if (typeof callback === "function") {
			callback();
		}
	}, 700);
};

gameController.prototype.discardCardFromHandEnemy = function (card, callback) {
	var _self = this;

	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.bottom')
		.attr("src", $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top').attr("src"));
	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top')
		.css("-webkit-animation", "discard-card-from-hand-enemy 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");
	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top')
		.css("animation", "discard-card-from-hand-enemy 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");

	var $graveyardTopCard = $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top');
	$graveyardTopCard.attr("src", "/imgs/player_cards/" + card.cardImg);
	$graveyardTopCard.data("cardId", card.cardId);
	$graveyardTopCard.data("cardName", card.cardName);
	$graveyardTopCard.data("cardText", card.cardText);
	$graveyardTopCard.data("cardRarity", card.cardRarity);
	$graveyardTopCard.data("cardEffect", card.cardEffect);
	$graveyardTopCard.data("cardCost", card.cardCost);
	$graveyardTopCard.data("cardAttributes", card.cardAttributes);

	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).last().remove();
	$(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");

	_self.decreaseEnemyCardsInHandDensity();
	_self.updateCardsStatusText();

	_self.discardCardTimeout = setTimeout(function() {
		$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top').css("animation", "");
		$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top').css("-webkit-animation", "");

		if (typeof callback === "function") {
			callback();
		}
	}, 700);
};

gameController.prototype.takeCardFromYourGraveyardYouAnimation = function (cardObj, callback) {
	var _self = this;

	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];
	var cardInGraveyardIdx = cardObj.cardInGraveyardIdx;
	var cardId = cardObj.cardId;
	var cardName = cardObj.cardName;
	var cardText = cardObj.cardText;
	var cardImg = cardObj.cardImg;
	var cardRarity = cardObj.cardRarity;
	var cardEffect = cardObj.cardEffect;
	var cardCost = cardObj.cardCost;
	var cardAttributes = cardObj.cardAttributes;

	var cardsInHandCount = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).length;
  var drawFromDeckAnimationCount = cardsInHandCount + 1;

  if (cardsInHandCount >= 10 && cardsInHandCount <= 15) {
  	drawFromDeckAnimationCount = 10;
  } else if (cardsInHandCount > 15) {
  	drawFromDeckAnimationCount = 11;
  }

  _self.disableScroll();

  $(_self.GAME_SCREEN_CLASS).off('mouseout');
  $(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
	});

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "visible");
  $(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("animation", "");
  $(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("-webkit-animation", "");
  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).append('<img style="animation: take-card-from-your-graveyard-you-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; -webkit-animation: take-card-from-your-graveyard-you-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;" class="anime-cb-card player-you" '
  		+ 'src="/imgs/player_cards/' + cardImg + '">');

  var $card = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' img').last();
  $card.data("cardId", cardId);
  $card.data("cardName", cardName);
  $card.data("cardText", cardText);
  $card.data("cardRarity", cardRarity);
  $card.data("cardEffect", cardEffect);
  $card.data("cardCost", cardCost);
  $card.data("cardAttributes", cardAttributes);

	if (cardInGraveyardIdx == (playerStateYou.cardsInGraveyardArr.length - 1)) {
		var $graveyardTopCard = $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top');
		if (playerStateYou.cardsInGraveyardArr.length > 1) {
			var prevCardObj = playerStateYou.cardsInGraveyardArr[playerStateYou.cardsInGraveyardArr.length - 2];
			$graveyardTopCard.attr("src", "/imgs/player_cards/" + prevCardObj.cardImg);
			$graveyardTopCard.data("cardId", prevCardObj.cardId);
			$graveyardTopCard.data("cardName", prevCardObj.cardName);
			$graveyardTopCard.data("cardText", prevCardObj.cardText);
			$graveyardTopCard.data("cardRarity", prevCardObj.cardRarity);
			$graveyardTopCard.data("cardEffect", prevCardObj.cardEffect);
			$graveyardTopCard.data("cardCost", prevCardObj.cardCost);
			$graveyardTopCard.data("cardAttributes", prevCardObj.cardAttributes);
		} else {
			$graveyardTopCard.data("cardId", null);
			$graveyardTopCard.data("cardName", null);
			$graveyardTopCard.data("cardText", null);
			$graveyardTopCard.data("cardRarity", null);
			$graveyardTopCard.data("cardEffect", null);
			$graveyardTopCard.data("cardCost", null);
			$graveyardTopCard.data("cardAttributes", null);
			$graveyardTopCard.remove();
			$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.bottom')
				.after('<img class="anime-cb-card-graveyard-deck player-you top">');
		}
	}

	_self.increaseYourCardsInHandDensity();

	_self.takeCardTimeout = setTimeout(function() {
		$(_self.GAME_SCREEN_CLASS).off('mouseout');
  	$(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
		  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
		  $(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
		});
  	$('*').off('DOMMouseScroll mousewheel');
  	$(_self.CARDS_IN_HAND_CLASS).on('DOMMouseScroll mousewheel', _self.noScrollOnCardHover);
  	$(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("animation", "");
  	$(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("-webkit-animation", "");
  	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "hidden");

  	_self.showCardOnScreen(cardObj, _self.PLAYER_YOU_CLASS, _self.shuffleCardsInHandYou.bind(_self, callback));
	}, 550);
};

gameController.prototype.takeCardFromEnemyGraveyardYouAnimation = function (cardObj, callback) {
	var _self = this;

	var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];
	var cardInGraveyardIdx = cardObj.cardInGraveyardIdx;
	var cardId = cardObj.cardId;
	var cardName = cardObj.cardName;
	var cardText = cardObj.cardText;
	var cardImg = cardObj.cardImg;
	var cardRarity = cardObj.cardRarity;
	var cardEffect = cardObj.cardEffect;
	var cardCost = cardObj.cardCost;
	var cardAttributes = cardObj.cardAttributes;

	var cardsInHandCount = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).length;
  var drawFromDeckAnimationCount = cardsInHandCount + 1;

  if (cardsInHandCount >= 10 && cardsInHandCount <= 15) {
  	drawFromDeckAnimationCount = 10;
  } else if (cardsInHandCount > 15) {
  	drawFromDeckAnimationCount = 11;
  }

  _self.disableScroll();

  $(_self.GAME_SCREEN_CLASS).off('mouseout');
  $(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
	});

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "visible");
  $(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("animation", "");
  $(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("-webkit-animation", "");
  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).append('<img style="animation: take-card-from-enemy-graveyard-you-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; -webkit-animation: take-card-from-enemy-graveyard-you-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;" class="anime-cb-card player-you" '
  		+ 'src="/imgs/player_cards/' + cardImg + '">');

  var $card = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' img').last();
  $card.data("cardId", cardId);
  $card.data("cardName", cardName);
  $card.data("cardText", cardText);
  $card.data("cardRarity", cardRarity);
  $card.data("cardEffect", cardEffect);
  $card.data("cardCost", cardCost);
  $card.data("cardAttributes", cardAttributes);

	if (cardInGraveyardIdx == playerStateEnemy.cardsInGraveyardArr.length) {
		var $graveyardTopCard = $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top');
		if (playerStateEnemy.cardsInGraveyardArr.length > 0) {
			var prevCardObj = playerStateEnemy.cardsInGraveyardArr[playerStateEnemy.cardsInGraveyardArr.length - 1];
			$graveyardTopCard.attr("src", "/imgs/player_cards/" + prevCardObj.cardImg);
			$graveyardTopCard.data("cardId", prevCardObj.cardId);
			$graveyardTopCard.data("cardName", prevCardObj.cardName);
			$graveyardTopCard.data("cardText", prevCardObj.cardText);
			$graveyardTopCard.data("cardRarity", prevCardObj.cardRarity);
			$graveyardTopCard.data("cardEffect", prevCardObj.cardEffect);
			$graveyardTopCard.data("cardCost", prevCardObj.cardCost);
			$graveyardTopCard.data("cardAttributes", prevCardObj.cardAttributes);
		} else {
			$graveyardTopCard.data("cardId", null);
			$graveyardTopCard.data("cardName", null);
			$graveyardTopCard.data("cardText", null);
			$graveyardTopCard.data("cardRarity", null);
			$graveyardTopCard.data("cardEffect", null);
			$graveyardTopCard.data("cardCost", null);
			$graveyardTopCard.data("cardAttributes", null);
			$graveyardTopCard.remove();
			$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.bottom')
				.after('<img class="anime-cb-card-graveyard-deck player-enemy top">');
		}
	}

	_self.increaseYourCardsInHandDensity();

	_self.takeCardTimeout = setTimeout(function() {
		$(_self.GAME_SCREEN_CLASS).off('mouseout');
  	$(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
		  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
		  $(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
		});
  	$('*').off('DOMMouseScroll mousewheel');
  	$(_self.CARDS_IN_HAND_CLASS).on('DOMMouseScroll mousewheel', _self.noScrollOnCardHover);
  	$(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("animation", "");
  	$(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("-webkit-animation", "");
  	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "hidden");

  	_self.showCardOnScreen(cardObj, _self.PLAYER_YOU_CLASS, _self.shuffleCardsInHandYou.bind(_self, callback));
	}, 550);
};

gameController.prototype.takeCardFromYourGraveyardEnemyAnimation = function (cardObj, callback) {
	var _self = this;

	var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];
	var cardInGraveyardIdx = cardObj.cardInGraveyardIdx;
	var cardId = cardObj.cardId;
	var cardName = cardObj.cardName;
	var cardText = cardObj.cardText;
	var cardImg = cardObj.cardImg;
	var cardRarity = cardObj.cardRarity;
	var cardEffect = cardObj.cardEffect;
	var cardCost = cardObj.cardCost;
	var cardAttributes = cardObj.cardAttributes;

	var cardsInHandCount = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).length;
  var drawFromDeckAnimationCount = cardsInHandCount + 1;

  if (cardsInHandCount >= 10 && cardsInHandCount <= 15) {
  	drawFromDeckAnimationCount = 10;
  } else if (cardsInHandCount > 15) {
  	drawFromDeckAnimationCount = 11;
  }

  _self.disableScroll();

  $(_self.GAME_SCREEN_CLASS).off('mouseout');
  $(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
	});

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).css("overflow", "visible");
  $(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("animation", "");
  $(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("-webkit-animation", "");
  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).append('<img style="animation: take-card-from-your-graveyard-enemy-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; -webkit-animation: take-card-from-your-graveyard-enemy-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;" class="anime-cb-card player-enemy" '
  		+ 'src="/imgs/player_cards/card_back.png">');

	if (cardInGraveyardIdx == (playerStateEnemy.cardsInGraveyardArr.length - 1)) {
		var $graveyardTopCard = $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top');
		if (playerStateEnemy.cardsInGraveyardArr.length > 1) {
			var prevCardObj = playerStateEnemy.cardsInGraveyardArr[playerStateEnemy.cardsInGraveyardArr.length - 2];
			$graveyardTopCard.attr("src", "/imgs/player_cards/" + prevCardObj.cardImg);
			$graveyardTopCard.data("cardId", prevCardObj.cardId);
			$graveyardTopCard.data("cardName", prevCardObj.cardName);
			$graveyardTopCard.data("cardText", prevCardObj.cardText);
			$graveyardTopCard.data("cardRarity", prevCardObj.cardRarity);
			$graveyardTopCard.data("cardEffect", prevCardObj.cardEffect);
			$graveyardTopCard.data("cardCost", prevCardObj.cardCost);
			$graveyardTopCard.data("cardAttributes", prevCardObj.cardAttributes);
		} else {
			$graveyardTopCard.data("cardId", null);
			$graveyardTopCard.data("cardName", null);
			$graveyardTopCard.data("cardText", null);
			$graveyardTopCard.data("cardRarity", null);
			$graveyardTopCard.data("cardEffect", null);
			$graveyardTopCard.data("cardCost", null);
			$graveyardTopCard.data("cardAttributes", null);
			$graveyardTopCard.remove();
			$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.bottom')
				.after('<img class="anime-cb-card-graveyard-deck player-enemy top">');
		}
	}

	_self.increaseEnemyCardsInHandDensity();

	_self.takeCardTimeout = setTimeout(function() {
		$(_self.GAME_SCREEN_CLASS).off('mouseout');
  	$(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
		  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
		  $(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
		});
  	$('*').off('DOMMouseScroll mousewheel');
  	$(_self.CARDS_IN_HAND_CLASS).on('DOMMouseScroll mousewheel', _self.noScrollOnCardHover);
  	$(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("animation", "");
  	$(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("-webkit-animation", "");
  	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).css("overflow", "hidden");

  	_self.showCardOnScreen(cardObj, _self.PLAYER_ENEMY_CLASS, _self.shuffleCardsInHandEnemy.bind(_self, callback));
	}, 550);
};

gameController.prototype.takeCardFromEnemyGraveyardEnemyAnimation = function (cardObj, callback) {
	var _self = this;

	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];
	var cardInGraveyardIdx = cardObj.cardInGraveyardIdx;
	var cardId = cardObj.cardId;
	var cardName = cardObj.cardName;
	var cardText = cardObj.cardText;
	var cardImg = cardObj.cardImg;
	var cardRarity = cardObj.cardRarity;
	var cardEffect = cardObj.cardEffect;
	var cardCost = cardObj.cardCost;
	var cardAttributes = cardObj.cardAttributes;

	var cardsInHandCount = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).length;
  var drawFromDeckAnimationCount = cardsInHandCount + 1;

  if (cardsInHandCount >= 10 && cardsInHandCount <= 15) {
  	drawFromDeckAnimationCount = 10;
  } else if (cardsInHandCount > 15) {
  	drawFromDeckAnimationCount = 11;
  }

  _self.disableScroll();

  $(_self.GAME_SCREEN_CLASS).off('mouseout');
  $(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
	});

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).css("overflow", "visible");
  $(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("animation", "");
  $(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("-webkit-animation", "");
  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).append('<img style="animation: take-card-from-your-graveyard-enemy-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; -webkit-animation: take-card-from-your-graveyard-enemy-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;" class="anime-cb-card player-enemy" '
  		+ 'src="/imgs/player_cards/card_back.png">');

	if (cardInGraveyardIdx == playerStateYou.cardsInGraveyardArr.length) {
		var $graveyardTopCard = $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top');
		if (playerStateYou.cardsInGraveyardArr.length > 0) {
			var prevCardObj = playerStateYou.cardsInGraveyardArr[playerStateYou.cardsInGraveyardArr.length - 1];
			$graveyardTopCard.attr("src", "/imgs/player_cards/" + prevCardObj.cardImg);
			$graveyardTopCard.data("cardId", prevCardObj.cardId);
			$graveyardTopCard.data("cardName", prevCardObj.cardName);
			$graveyardTopCard.data("cardText", prevCardObj.cardText);
			$graveyardTopCard.data("cardRarity", prevCardObj.cardRarity);
			$graveyardTopCard.data("cardEffect", prevCardObj.cardEffect);
			$graveyardTopCard.data("cardCost", prevCardObj.cardCost);
			$graveyardTopCard.data("cardAttributes", prevCardObj.cardAttributes);
		} else {
			$graveyardTopCard.data("cardId", null);
			$graveyardTopCard.data("cardName", null);
			$graveyardTopCard.data("cardText", null);
			$graveyardTopCard.data("cardRarity", null);
			$graveyardTopCard.data("cardEffect", null);
			$graveyardTopCard.data("cardCost", null);
			$graveyardTopCard.data("cardAttributes", null);
			$graveyardTopCard.remove();
			$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.bottom')
				.after('<img class="anime-cb-card-graveyard-deck player-you top">');
		}
	}

	_self.increaseEnemyCardsInHandDensity();

	_self.takeCardTimeout = setTimeout(function() {
		$(_self.GAME_SCREEN_CLASS).off('mouseout');
  	$(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
		  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
		  $(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
		});
  	$('*').off('DOMMouseScroll mousewheel');
  	$(_self.CARDS_IN_HAND_CLASS).on('DOMMouseScroll mousewheel', _self.noScrollOnCardHover);
  	$(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("animation", "");
  	$(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("-webkit-animation", "");
  	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).css("overflow", "hidden");

  	_self.showCardOnScreen(cardObj, _self.PLAYER_ENEMY_CLASS, _self.shuffleCardsInHandEnemy.bind(_self, callback));
	}, 550);
};

gameController.prototype.showCardOnScreen = function (cardObj, playerSelectorClass, callback) {
	var _self = this;

	$('.anime-cb-card-activate-show').attr("src", "/imgs/player_cards/" + cardObj.cardImg);
	$('.anime-cb-card-activate-show').css("animation", "show-card-on-screen-"
		+ (playerSelectorClass.substr(1)) + " 1.5s both");

	_self.showCardTimeout = setTimeout(function() {
		$('.anime-cb-card-activate-show').css("animation", "");
		if (typeof callback === "function") {
			callback();
		}
	}, 1500);
};

gameController.prototype.shuffleCardsInHandYou = function (callback) {
	var _self = this;

	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];

	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS)
		.css("animation", "slide-bottom-top 1s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");

	_self.shuffleTimeout2 = setTimeout(function() {
		_self._cardsInHandArr.forEach(function(card, cardIdx) {
			var $currCardEl = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS
				+ ':nth-child(' + (cardIdx + 1));
			$currCardEl.attr("src", "/imgs/player_cards/" + card.cardImg);
		  $currCardEl.data("cardId", card.cardId);
		  $currCardEl.data("cardName", card.cardName);
		  $currCardEl.data("cardText", card.cardText);
		  $currCardEl.data("cardRarity", card.cardRarity);
		  $currCardEl.data("cardEffect", card.cardEffect);
		  $currCardEl.data("cardCost", card.cardCost);
		  $currCardEl.data("cardAttributes", card.cardAttributes);
		});
	}, 500);

	_self.shuffleTimeout = setTimeout(function() {
		$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS)
			.css("animation", "");
		if (typeof callback === "function") {
			callback();
		}
	}, 1000);
};

gameController.prototype.shuffleCardsInHandEnemy = function (callback) {
	var _self = this;

	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS)
		.css("animation", "slide-top-bottom 1s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");

	_self.shuffleTimeout = setTimeout(function() {
		$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS)
			.css("animation", "");
		if (typeof callback === "function") {
			callback();
		}
	}, 1000);
};

gameController.prototype.increaseYourCardsInHandDensity = function() {
	var _self = this;

	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS
		+ ':nth-child(1)').css("margin-left", "0px");
  var baseMarginLeft = parseInt($(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS
  	+ ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS + ':nth-child(2)').css("margin-left"));

  if (baseMarginLeft >= -96)
  {
  	baseMarginLeft -= 8;
  }

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS
  	+ ':not(:first)').css("margin-left", baseMarginLeft + "px");
};

gameController.prototype.decreaseYourCardsInHandDensity = function() {
	var _self = this;

	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS
		+ ':nth-child(1)').css("margin-left", "0px");
  var baseMarginLeft = parseInt($(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS
  	+ ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS + ':nth-child(2)').css("margin-left"));

  if ($(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).length <= 13)
  {
  	baseMarginLeft += 8;
  }

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS
  	+ ':not(:first)').css("margin-left", baseMarginLeft + "px");
};

gameController.prototype.increaseEnemyCardsInHandDensity = function() {
	var _self = this;

	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS
		+ ':nth-child(1)').css("margin-left", "0px");
  var baseMarginLeft = parseInt($(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS
  	+ ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS + ':nth-child(2)').css("margin-left"));

  if (baseMarginLeft >= -96)
  {
  	baseMarginLeft -= 8;
  }

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS
  	+ ':not(:first)').css("margin-left", baseMarginLeft + "px");
};

gameController.prototype.decreaseEnemyCardsInHandDensity = function() {
	var _self = this;

	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS
		+ ':nth-child(1)').css("margin-left", "0px");
  var baseMarginLeft = parseInt($(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS
  	+ ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS + ':nth-child(2)').css("margin-left"));

  if ($(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).length <= 13)
  {
  	baseMarginLeft += 8;
  }

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS
  	+ ':not(:first)').css("margin-left", baseMarginLeft + "px");
};

gameController.prototype.updateGameStatusInfo = function () {
	var _self = this;

	if ((!_self._gameplayData) || (!_self._yourUserId)) {
		return;
	}

	var gameState = _self._gameplayData.gameState;
	var playerYouStatus = gameState.playersState[_self._yourUserId];
	var playerEnemyStatus = gameState.playersState[_self._enemyUserId];

	var lastEnergy = +$(_self.ENERGY_POINTS_TEXT_CLASS + _self.PLAYER_YOU_CLASS).text().split("/")[0];
	console.log('My last energy: ' + lastEnergy);
	console.log('Curr energy: ' + playerYouStatus.energyPoints);
	if (playerYouStatus.energyPoints != lastEnergy) {
		_self.showEnergyChangeAnimation(_self._yourUserId, _self.PLAYER_YOU_CLASS, playerYouStatus.energyPoints - lastEnergy);
	}

	console.log('Enemy last energy: ' + lastEnergy);
	console.log('Curr energy: ' + playerEnemyStatus.energyPoints);
	lastEnergy = +$(_self.ENERGY_POINTS_TEXT_CLASS + _self.PLAYER_ENEMY_CLASS).text().split("/")[0];
	if (playerEnemyStatus.energyPoints != lastEnergy) {
		_self.showEnergyChangeAnimation(_self._enemyUserId, _self.PLAYER_ENEMY_CLASS, playerEnemyStatus.energyPoints - lastEnergy);
	}

	$(_self.ENERGY_POINTS_TEXT_CLASS + _self.PLAYER_YOU_CLASS).html(playerYouStatus.energyPoints + "/" + playerYouStatus.maxEnergyPoints);
	$(_self.ENERGY_POINTS_TEXT_CLASS + _self.PLAYER_ENEMY_CLASS).html(playerEnemyStatus.energyPoints + "/" + playerEnemyStatus.maxEnergyPoints);

	var statusContent = "Your status: <br>";

	statusContent += "- Max cards in hand: " + playerYouStatus.maxCardsInHand + "<br>";
	statusContent += "- Cards to Draw: " + playerYouStatus.cardsToDraw + "<br>";
	statusContent += "- Cards to discard: " + playerYouStatus.cardsToDiscard + "<br>";
	statusContent += "- Die to roll: " + playerYouStatus.canRollDiceBoardCount + "<br>";
	statusContent += "- Can summon any: " + (playerYouStatus.cardsSummonConstraints.cardsCanSummonAny ? "Yes" : "No") + "<br>";
	statusContent += "- Can summon common: " + (playerYouStatus.cardsSummonConstraints.cardsCanSummonCommon ? "Yes" : "No") + "<br>";
	statusContent += "- Can summon rare: " + (playerYouStatus.cardsSummonConstraints.cardsCanSummonRare ? "Yes" : "No") + "<br>";
	statusContent += "- Can summon epic: " + (playerYouStatus.cardsSummonConstraints.cardsCanSummonEpic ? "Yes" : "No") + "<br>";

	statusContent += "Enemy status: <br>";

	statusContent += "- Max cards in hand: " + playerEnemyStatus.maxCardsInHand + "<br>";
	statusContent += "- Cards to Draw: " + playerEnemyStatus.cardsToDraw + "<br>";
	statusContent += "- Cards to discard: " + playerEnemyStatus.cardsToDiscard + "<br>";
	statusContent += "- Die to roll: " + playerEnemyStatus.canRollDiceBoardCount + "<br>";
	statusContent += "- Can summon any: " + (playerEnemyStatus.cardsSummonConstraints.cardsCanSummonAny ? "Yes" : "No") + "<br>";
	statusContent += "- Can summon common: " + (playerEnemyStatus.cardsSummonConstraints.cardsCanSummonCommon ? "Yes" : "No") + "<br>";
	statusContent += "- Can summon rare: " + (playerEnemyStatus.cardsSummonConstraints.cardsCanSummonRare ? "Yes" : "No") + "<br>";
	statusContent += "- Can summon epic: " + (playerEnemyStatus.cardsSummonConstraints.cardsCanSummonEpic ? "Yes" : "No") + "<br>";

	$(_self.GAME_STATUS_CONTENT_CLASS).html(statusContent);
};

gameController.prototype.updateCardsStatusText = function () {
	var _self = this;

	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).each(function() {
		$(this).data("cardText", _self._cardsInHandArr[ $(this).index() ].cardText);
		$(this).data("cardCost", _self._cardsInHandArr[ $(this).index() ].cardCost);
	});

	$(_self.CARD_ON_FIELD_CLASS + _self.PLAYER_YOU_CLASS).each(function() {
		var cardEl = this;
		_self._gameplayData.gameState.playersState[_self._yourUserId].cardsOnFieldArr.forEach(function(card) {
			if ($(cardEl).data("cardId") == card.cardId) {
				$(cardEl).data("cardText", card.cardText);
			}
		});
	});

	$(_self.CARD_ON_FIELD_CLASS + _self.PLAYER_ENEMY_CLASS).each(function() {
		var cardEl = this;
		_self._gameplayData.gameState.playersState[_self._enemyUserId].cardsOnFieldArr.forEach(function(card) {
			if ($(cardEl).data("cardId") == card.cardId) {
				$(cardEl).data("cardText", card.cardText);
			}
		});
	});
};

gameController.prototype.playSound = function (soundFile) {
	var _self = this;
  var audio = new Audio("/sounds/" + soundFile);

  if (!_self.client.logInSignUpController._settings.sound) {
  	return;
  }

 	audio.volume = (_self.client.logInSignUpController._settings.soundVolume || 0) / 100;
  audio.play();
};

gameController.prototype.isSpecialBoardSpaceNegative = function (boardSpace) {
	var _self = this;

	if ([
		_self.BOARD_FIELDS.ROLL_AGAIN_BACKWARDS_1,
		_self.BOARD_FIELDS.ROLL_AGAIN_BACKWARDS_2,
		_self.BOARD_FIELDS.ROLL_AGAIN_BACKWARDS_3,
		_self.BOARD_FIELDS.CARD_DISCARD_1,
		_self.BOARD_FIELDS.CARD_DISCARD_2,
		_self.BOARD_FIELDS.CARD_DISCARD_3
		].includes(boardSpace)) {
		return true;
	}

	return false;
};

gameController.prototype.showQuickGameInfo = function (showMsg) {
	var _self = this;

	_self.quickGameInfoEnabled = false;

	$(_self.GAME_SCREEN_CLASS).append('<div class="anime-cb-quick-game-info">' + showMsg + '</div>');
	var $lastQuickGameInfoEl = $(_self.QUICK_GAME_INFO_CLASS).last();
	var $gameInfoElement = $lastQuickGameInfoEl.css("margin-right", "-" + ($lastQuickGameInfoEl.outerWidth() / 2) + "px");

	_self.quickGameInfoRemoveElementTimeout = setTimeout(function() {
		$lastQuickGameInfoEl.remove();
	}, 3000);

	_self.quickGameInfoShowSwitchTimeout = setTimeout(function() {
		_self.quickGameInfoEnabled = true;
	}, 1000);
};

var noop = function(){};