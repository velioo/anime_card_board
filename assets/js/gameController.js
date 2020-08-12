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
	_self.MODAL_GRAVEYARD_CLASS = '.graveyard-modal';

	_self.GAME_STATUS_CONTENT_CLASS = '.anime-cb-player-status-content';
	_self.ENERGY_POINTS_TEXT_CLASS = '.anime-cb-energy-points-text';
	_self.CARD_FIELD_CHARGES_WRAPPER_CLASS = '.anime-cb-card-field-charges-status-wrapper';
	_self.CARD_FIELD_CHARGES_CLASS = '.anime-cb-card-field-charges-status';
	_self.CHOOSE_CARD_EFFECT_CLASS = '.anime-cb-choose-card-effect';
	_self.CHOOSE_CARD_EFFECT_CHOICE_CLASS = '.anime-cb-choose-card-effect-choice';
	_self.ENERGY_REGEN_CLASS = '.anime-cb-energy-points-regen';
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

	_self._postGame = true;
	setTimeout(function() {
		_self._postGame = false;
	}, 500);
};

gameController.prototype.setLeaveButton = function () {
	var _self = this;

	_self.populateGraveyard(_self._yourUserId, _self.PLAYER_YOU_CLASS);
	_self.populateGraveyard(_self._enemyUserId, _self.PLAYER_ENEMY_CLASS);
	_self.resetGameState();
	_self.initListeners();

	$(_self.GAME_SCREEN_CLASS).off("click", _self.SURRENDER_BTN_ID);
	$(_self.SURRENDER_BTN_ID).text("Return to Menu");
	$(_self.GAME_SCREEN_CLASS).on('click', _self.SURRENDER_BTN_ID, function(e) {
	 	_self.processChangeScreen(_self.MAIN_MENU_SCREEN_CLASS);
	});

	_self.client.generalClient.roomController.resetRoomsInterval.call(_self.client.generalClient.roomController);
	_self.client.generalClient.sendLeaveRoomRequest.call(_self.client.generalClient,
		{ roomId: _self.client.generalClient.roomController._roomId });
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

	_self.showEventsInfo("YOU WIN !!!");
	_self.setLeaveButton();
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

	_self.setLeaveButton();
};

gameController.prototype.processStartGameResponse = function (data) {
	console.log('processStartGameResponse');
	console.log('data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self.client.generalClient.roomController._hostId) {
				_self.client.generalClient.roomController.startGame();
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
			_self.client.generalClient.roomController._matchmaking = false;
		}
	}, 500);

	_self.updateGameStatusInfo();
	window.addEventListener("beforeunload", _self.beforeUnload);
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

	$(_self.GAME_SCREEN_CLASS).html('<div class="anime-cb-title-page-game"><p id="anime-cb-title-page-game-room-name"></p></div><div id="anime-cb-card-info-card-name"></div><div id="anime-cb-card-info-wrapper"><div id="anime-cb-card-info-subwrapper"><img id="anime-cb-card-info-card" src="/imgs/player_cards/card_back.png"></div></div><div id="anime-cb-card-info-text"></div><div class="anime-cb-card-graveyard-wrapper player-enemy"><p class="anime-cb-card-graveyard-text player-enemy">Enemy Graveyard</p><img class="anime-cb-card-graveyard-deck player-enemy bottom"><img class="anime-cb-card-graveyard-deck player-enemy top"></div><div id="anime-cb-card-global-deck-wrapper"><img id="anime-cb-card-global-deck" src="/imgs/player_cards/card_back.png"><p id="anime-cb-card-global-deck-text">Global Deck</p></div><div id="anime-cb-game-events-info"><p id="anime-cb-game-events-info-text"></p></div><div class="anime-cb-turn-timer player-enemy"><p class="anime-cb-turn-timer-text player-enemy"></p></div><div class="anime-cb-turn-timer player-you"><p class="anime-cb-turn-timer-text player-you"></p></div><div class="anime-cb-energy-points-wrapper player-you"><p class="anime-cb-energy-points-title player-you">Energy</p><p class="anime-cb-energy-points-text player-you"></p></div><div class="anime-cb-energy-points-wrapper player-enemy"><p class="anime-cb-energy-points-title player-enemy">Energy</p><p class="anime-cb-energy-points-text player-enemy"></p></div><div class="anime-cb-energy-points-regen player-you"></div><div class="anime-cb-energy-points-regen player-enemy"></div><table id="anime-cb-phases-wrapper"><tr class="anime-cb-phase-row"><td id="anime-cb-phase-draw" class="anime-cb-phase-column next" data-phase-text="Draw Phase">DP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-standby" class="anime-cb-phase-column next" data-phase-text="Standby Phase">SP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-main" class="anime-cb-phase-column next" data-phase-text="Main Phase">MP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-roll" class="anime-cb-phase-column next" data-phase-text="Roll Phase">RP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-end" class="anime-cb-phase-column next" data-phase-text="End Phase">EP</td></tr></table><div class="center-screen"><div class="anime-cb-cards-in-hand-wrapper player-enemy"><div class="anime-cb-cards-in-hand player-enemy"></div></div><div class="anime-cb-board-player-label player-enemy"></div><div class="anime-cb-card-field-wrapper"><div class="anime-cb-card-field-charges-label player-enemy">Charges | Energy</div><table class="anime-cb-card-field-charges-status-wrapper player-enemy"><tr><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td></tr></table><table class="anime-cb-card-field player-enemy"><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></table></div><div id="anime-cb-board-wrapper"><table id="anime-cb-board"></table></div><div class="anime-cb-card-field-wrapper"><table class="anime-cb-card-field player-you"><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></table><table class="anime-cb-card-field-charges-status-wrapper player-you"><tr><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td><td class="anime-cb-card-field-charges-status"></td></tr></table><div class="anime-cb-card-field-charges-label player-you">Charges | Energy</div></div><div class="anime-cb-board-player-label player-you"></div><div class="anime-cb-cards-in-hand-wrapper player-you"><div class="anime-cb-cards-in-hand player-you"></div></div></div><div class="anime-cb-card-graveyard-wrapper player-you"><img class="anime-cb-card-graveyard-deck player-you bottom"><img class="anime-cb-card-graveyard-deck player-you top"><p class="anime-cb-card-graveyard-text player-you">Your Graveyard</p></div><div class="anime-cb-screen_footer-game"><button id="anime-cb-surrender" type="button" class="btn btn-primary anime-cb-button-stateless anime-cb-btn-main-menu">Surrender</button></div><div class="anime-cb-player-status-wrapper"><p class="anime-cb-player-status-title">Game Status</p><div class="anime-cb-player-status-content"></div></div><div id="anime-cb-dice-wrapper-player-you"></div><div id="anime-cb-dice-wrapper-player-enemy"></div><div class="modal graveyard-modal player-you"> <div class="modal-content"> <div class="modal-header player-you"> <span class="close">&times;</span> <h2>Your Graveyard</h2> </div> <div class="modal-body"> </div> <div class="modal-footer player-you"> <h3>Your Graveyard</h3> </div> </div></div><div class="modal graveyard-modal player-enemy"> <div class="modal-content"> <div class="modal-header player-enemy"> <span class="close">&times;</span> <h2>Enemy Graveyard</h2> </div> <div class="modal-body"> </div> <div class="modal-footer player-enemy"> <h3>Enemy Graveyard</h3> </div> </div></div><img class="anime-cb-card-activate-show"><div class="center-screen anime-cb-choose-card-effect"><div></div></div>');
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

	assert(_self.client.generalClient.roomController._roomId == _self._roomData.id);
	assert(_self.client.generalClient.logInSignUpController._userId == _self._roomData.player1Id
		|| _self.client.generalClient.logInSignUpController._userId == _self._roomData.player2Id);

	_self._yourName = _self.client.generalClient.logInSignUpController._username;
	_self._enemyName = _self.client.generalClient.logInSignUpController._userId == _self._roomData.player1Id
		? _self._roomData.player2Name : _self._roomData.player1Name;

	_self._yourUserId = _self.client.generalClient.logInSignUpController._userId;
	_self._enemyUserId = _self.client.generalClient.logInSignUpController._userId == _self._roomData.player1Id
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
  	$(_self.BOARD_PLAYER_YOU_ID).css("background-image", 'url("/imgs/player_pieces/Lelouch.jpg")');
  	$(_self.BOARD_PLAYER_ENEMY_ID).css("background-image", 'url("/imgs/player_pieces/CC.jpg")');
  } else {
		$(_self.BOARD_PLAYER_YOU_ID).css("background-image", 'url("/imgs/player_pieces/CC.jpg")');
		$(_self.BOARD_PLAYER_ENEMY_ID).css("background-image", 'url("/imgs/player_pieces/Lelouch.jpg")');
  }
};

gameController.prototype.setBoardPiecesRotated = function () {
	var _self = this;

	$(_self.BOARD_PLAYER_YOU_ID).css("transform", "rotate(180deg)");
	$(_self.BOARD_PLAYER_ENEMY_ID).css("transform", "rotate(180deg)");

  if (_self._roomData.player1Id == _self._yourUserId) {
  	$(_self.BOARD_PLAYER_YOU_ID).css("background-image", 'url("/imgs/player_pieces/Lelouch.jpg")');
  	$(_self.BOARD_PLAYER_ENEMY_ID).css("background-image", 'url("/imgs/player_pieces/CC.jpg")');
  } else {
		$(_self.BOARD_PLAYER_YOU_ID).css("background-image", 'url("/imgs/player_pieces/CC.jpg")');
		$(_self.BOARD_PLAYER_ENEMY_ID).css("background-image", 'url("/imgs/player_pieces/Lelouch.jpg")');
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
				var eventInfoText =  _self._enemyName + " draws "
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
	var cardRarity;
	var cardEffect;
	var cardCost;
	var cardAttributes;

	var cardEffect;
  _self._cardsInHandArr.forEach(function(card, idx) {
		if (card.cardId == cardId) {
			cardEffect = card.cardEffect;
			cardRarity = card.cardRarity;
			cardCost = card.cardCost;
			cardAttributes = card.cardAttributes;
		}
	});

	if ((!cardEffect) || (!cardRarity) || (!cardCost)) {
		canSummonCard = false;
	}

	if (cardsOnFieldCount + 1 > playerStateYou.maxCardsOnField
		|| ! playerStateYou.cardsSummonConstraints.cardsCanSummonAny
		|| playerStateYou.energyPoints < cardCost) {
		canSummonCard = false;
	}

	switch(cardRarity) {
		case _self.CARD_RARITIES.COMMON:
			if (! playerStateYou.cardsSummonConstraints.cardsCanSummonCommon) {
				canSummonCard = false;
			}
			break;
		case _self.CARD_RARITIES.RARE:
			if (! playerStateYou.cardsSummonConstraints.cardsCanSummonRare) {
				canSummonCard = false;
			}
			break;
		case _self.CARD_RARITIES.EPIC:
					if (! playerStateYou.cardsSummonConstraints.cardsCanSummonEpic) {
				canSummonCard = false;
			}
			break;
	}

	if (cardEffect.effect == "moveSpacesForward") {
		if (_self._yourUserId == _self._roomData.player1Id) {
			if (!boardPath[currBoardIndexYou + cardEffect.effectValue]) {
				canSummonCard = false;
			}
		} else if (currBoardIndexYou - cardEffect.effectValue < 0) {
				canSummonCard = false;
		}
	} else if (cardEffect.effect == "moveSpacesBackwardsUpToEnemy") {
		if (_self._enemyUserId == _self._roomData.player2Id) {
			if (currBoardIndexEnemy >= _self._gameplayData.gameState.boardData.boardDataPlayers.player2StartBoardIndex) {
				canSummonCard = false;
			}
		} else if (currBoardIndexEnemy <= _self._gameplayData.gameState.boardData.boardDataPlayers.player1StartBoardIndex) {
				canSummonCard = false;
		}
	} else if (cardEffect.effect == "moveSpacesBackwardsEnemy") {
		if (_self._enemyUserId == _self._roomData.player2Id) {
			if (!boardPath[currBoardIndexEnemy + cardEffect.effectValue]) {
				canSummonCard = false;
			}
		} else if (currBoardIndexEnemy - cardEffect.effectValue < 0) {
				canSummonCard = false;
		}
	} else if (cardEffect.effect.match("createSpecialBoardSpaceForwardTier")) {
		var availableSpaces = 0;
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
		  	availableSpaces++;
			}
		}

		if (availableSpaces <= 0) {
			canSummonCard = false;
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
			canSummonCard = false;
		}
	} else if (cardEffect.effect == "drawCardFromEnemyHand") {
		if (playerStateEnemy.cardsInHand <= 0) {
			canSummonCard = false;
		}
	} else if (cardEffect.effect == "destroyCardFromEnemyField") {
		if (playerStateEnemy.cardsOnFieldArr.length <= 0) {
			canSummonCard = false;
		}
	} else if (cardEffect.effect == "takeCardFromYourGraveyard") {
		if (playerStateYou.cardsInGraveyardArr.length <= 0) {
			canSummonCard = false;
		}
	} else if (cardEffect.effect == "moveSpacesClosestBoardSpaceSpecial") {
		var availableSpace = false;
		for(var i = 0; i < boardPath.length; i++) {
			if ((boardMatrix[boardPath[i][0]][boardPath[i][1]] > 1) && (i != currBoardIndexYou)) {
				availableSpace = true;
				break;
			}
		}

		if (!availableSpace) {
			canSummonCard = false;
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
			canSummonCard = false;
		}
	} else if (cardEffect.effect == "reapplyCurrentSpecialBoardSpace") {
		if (boardMatrix[boardPath[currBoardIndexYou][0]][boardPath[currBoardIndexYou][1]] <= 1) {
			canSummonCard = false;
		}
	} else if (cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemy") {
		if (boardMatrix[boardPath[currBoardIndexEnemy][0]][boardPath[currBoardIndexEnemy][1]] <= 1) {
			canSummonCard = false;
		}
	}

	playerStateYou.cardsOnFieldArr.forEach(function(card, idx) {
		if (card.cardId == cardId) {
			canSummonCard = false;
		}
	});

	playerStateEnemy.cardsOnFieldArr.forEach(function(card, idx) {
		if ((card.cardEffect.effect == "nullifyCardsFieldSummon") && (cardAttributes.includes("field"))) {
			canSummonCard = false;
		}
	});

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
			_self.rollDiceYou(_self._gameplayData.gameState.rollDiceBoard.rollDiceValue, _self.moveYourCharacter, _self.enableActionsInEnemyPhase);
		}
	} else {
		_self.hideEventsInfo(null, 0);
		if (_self._gameplayData.gameState.currPlayerId == _self._enemyUserId) {
			_self.rollDiceEnemy(_self._gameplayData.gameState.rollDiceBoard.rollDiceValue, _self.moveEnemyCharacter, _self.waitForEnemyActions);
		} else {
			_self.rollDiceEnemy(_self._gameplayData.gameState.rollDiceBoard.rollDiceValue, _self.moveEnemyCharacter, _self.checkIfEnemyHasToDoAction
				.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self)));
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

gameController.prototype.takeCardFromYourGraveyard = function (card) {
	logger.info("Trying to take card from your graveyard");

	var _self = this;
	var cardIdx = _self._gameplayData.gameState.playersState[_self._yourUserId].cardsInGraveyardArr.length - ($(card).index() + 1);

	_self._lastClientData = { roomId: _self._roomData.id, cardIdx: cardIdx };
	_self.client.takeCardFromYourGraveyard(_self._lastClientData);
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
			callback = _self.enableActionsInEnemyPhase.bind(_self);
		}

		_self.discardCardFromHandYou(_self._gameplayData.gameState.cardDiscarded, callback);
	} else {
		if (_self._gameplayData.gameState.currPlayerId == _self._enemyUserId) {
			callback = _self.waitForEnemyActions.bind(_self);
		} else {
			callback = _self.checkIfEnemyHasToDoAction.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
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
		_self.showEnergyRegenAnimation.bind(_self, _self._enemyUserId, _self.PLAYER_ENEMY_CLASS),
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
	  	_self.showEnergyRegenAnimation(_self._yourUserId, _self.PLAYER_YOU_CLASS);
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

gameController.prototype.showEnergyRegenAnimation = function (playerId, playerSelectorClass) {
	var _self = this;

	var playerState = _self._gameplayData.gameState.playersState[playerId];
	$(_self.ENERGY_REGEN_CLASS + playerSelectorClass).html("+" + playerState.energyRegen);
	$(_self.ENERGY_REGEN_CLASS + playerSelectorClass).css("animation", "energy-regen-" + (playerSelectorClass.substr(1)) + " 2s ease-out")
	$(_self.ENERGY_REGEN_CLASS + playerSelectorClass).css("-webkit-animation", "energy-regen-" + (playerSelectorClass.substr(1)) + " 2s ease-out")

	setTimeout(function() {
		$(_self.ENERGY_REGEN_CLASS + playerSelectorClass).css("animation", "");
		$(_self.ENERGY_REGEN_CLASS + playerSelectorClass).css("-webkit-animation", "");
	}, 2000);
};

gameController.prototype.enableMainPhaseActions = function () {
	var _self = this;

	_self.updateCardChargesStatuses();
	_self.updateCardsStatusText();

	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];

	if (playerStateYou.cardsToDraw > 0) {
		_self.setCardDrawListener();
	  _self.startDrawCardAnimationsFinishedPoll(_self.checkIfEnemyHasToDoAction
	  	.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self)));
  	return;
	} else if (playerStateYou.cardsToDrawFromEnemyHand > 0) {
		_self.setDrawCardFromEnemyHandListener();
	} else if (playerStateYou.cardsToTakeFromYourGraveyard > 0) {
		_self.setTakeCardFromYourGraveyardListener();
	} else if (playerStateYou.cardsToDiscard > 0) {
		_self.setCardDiscardListener();
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

		$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).each(function() {
			if (!_self.canSummonCard(this)) {
				return;
			}

			$(this).attr("data-tooltip", "summonCard");
			$(this).on("click", function(e) {
				$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).removeAttr("data-tooltip");
				_self.disableMainPhaseActions();
				_self.disableContinuousCardOnClickListener();
				_self.summonCard.call(_self, this);
			});
		});

		$(_self.PHASE_ROLL_ID).on("click", function(e) {
			$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).removeAttr("data-tooltip");
			_self.disableMainPhaseActions();
			_self.disableContinuousCardOnClickListener();
			_self.startRollPhase();
		});
	}
};

gameController.prototype.disableMainPhaseActions = function () {
	var _self = this;

	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).off("click");
	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).removeAttr("data-tooltip");
	$(_self.PHASE_ROLL_ID).off("click");
	$(_self.PHASE_ROLL_ID).removeClass("selectable");
	_self.disableContinuousCardOnClickListener();
};

gameController.prototype.enableActionsInEnemyPhase = function () {
	var _self = this;

	_self.updateCardChargesStatuses();
	_self.updateCardsStatusText();

	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];

	if (playerStateYou.cardsToDraw > 0) {
		_self.setCardDrawListener();
	  _self.startDrawCardAnimationsFinishedPoll(_self.enableActionsInEnemyPhase);
  	return;
	} else if (playerStateYou.cardsToDrawFromEnemyHand > 0) {
		_self.setDrawCardFromEnemyHandListener();
	} else if (playerStateYou.cardsToTakeFromYourGraveyard > 0) {
		_self.setTakeCardFromYourGraveyardListener();
	} else if (playerStateYou.cardsToDiscard > 0) {
		_self.setCardDiscardListener();
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
		} else if (card.cardEffect.effect == "destroyCardFromEnemyField") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "drawCardFromDeckYouEnemy") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "takeCardFromYourGraveyard") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "moveSpacesForwardMoveSpacesBackwardEnemyX") {
			if (card.cardEffect.isFinished) {
				_self.rollDiceYou(card.cardEffect.effectValueChosen, noop);
				_self.moveSpacesTimeout = setTimeout(function() {
					_self.moveYourCharacter(card.cardEffect.effectValueChosen, null, 0);
					_self.moveEnemyCharacter(card.cardEffect.effectValueChosen,
						_self.destroyCardAnimationYou.bind(_self, card, _self.checkIfEnemyHasToDoAction
							.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self))), 0);
				}, 2000);
			} else {
				_self.setRollDiceCardListener(card);
			}
		} else if (card.cardEffect.effect == "drawCardFromDeckYouDiscardCardYou") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecial") {
			_self.moveYourCharacter(card.finishData.moveSpaces,
				_self.destroyCardAnimationYou.bind(_self, card, _self.enableMainPhaseActions.bind(_self)), 500);
		} else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialEnemy") {
			_self.moveEnemyCharacter(card.finishData.moveSpaces,
				_self.destroyCardAnimationYou.bind(_self, card, _self.checkIfEnemyHasToDoAction
					.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self))), 500);
		} else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpace") {
			_self._postDestroyCard = card;
			_self.enableMainPhaseActions();
		} else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemy") {
			_self._postDestroyCard = card;
			_self.checkIfEnemyHasToDoAction(_self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
		}
	} else if (card.cardEffect.continuous) {
		_self.enableMainPhaseActions();
	}
};

gameController.prototype.setRollDiceCardListener = function (card) {
	var _self = this;

	var eventInfoText = "Roll dice for " + card.cardName;
	_self.showEventsInfo(eventInfoText);

	$(_self.PHASE_ROLL_ID).addClass("selectable");
	$(_self.PHASE_ROLL_ID).on("click", function() {
		$(_self.PHASE_ROLL_ID).off("click");
		$(_self.PHASE_ROLL_ID).removeClass("selectable");
		_self.hideEventsInfo(null, 0);
		var finishData = { diceValueDummy: 0 };
		_self._lastClientData = { roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData };
		_self.client.finishCardEffect(_self._lastClientData);
	});
};

gameController.prototype.setRollDiceCardListenerEnemy = function (card) {
	var _self = this;

	var eventInfoText = _self._enemyName + " rolls dice for " + card.cardName;
	_self.showEventsInfo(eventInfoText);
};

gameController.prototype.performCardEffectContinuousYou = function (card) {
	var _self = this;

	_self.updateCardChargesStatuses();
	if (card.cardEffect.continuous) {
		if (card.cardEffect.effect == "copySpecialSpacesUpTo"
			|| card.cardEffect.effect ==  "moveSpacesForwardOrBackwardUpToEnemy") {
			_self.setBoardSpaceListener(card);
		}
	}
};

gameController.prototype.performCardEffectContinuousEnemy = function (card) {
	var _self = this;

	_self.updateCardChargesStatuses();
	if (card.cardEffect.continuous) {
		if (card.cardEffect.effect == "copySpecialSpacesUpTo"
			|| card.cardEffect.effect ==  "moveSpacesForwardOrBackwardUpToEnemy") {
			_self.setBoardSpaceListenerEnemy(card);
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
		} else {
			_self.waitForEnemyActions();
		}
	}
};

gameController.prototype.checkIfEnemyHasToDoAction = function (callback, callback2) {
	var _self = this;

	var playerStateEnemy = _self._gameplayData.gameState.playersState[_self._enemyUserId];

	$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-enemy");
	if (playerStateEnemy.canRollDiceBoardCount > 0
		|| playerStateEnemy.cardsToDraw > 0
		|| playerStateEnemy.cardsToDiscard > 0
		|| playerStateEnemy.cardsToDrawFromEnemyHand > 0
		|| playerStateEnemy.cardsToDestroyFromEnemyField > 0
		|| playerStateEnemy.cardsToTakeFromYourGraveyard > 0) {
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
	if (playerStateYou.canRollDiceBoardCount > 0
		|| playerStateYou.cardsToDraw > 0
		|| playerStateYou.cardsToDiscard > 0
		|| playerStateYou.cardsToDrawFromEnemyHand > 0
		|| playerStateYou.cardsToDestroyFromEnemyField > 0
		|| playerStateYou.cardsToTakeFromYourGraveyard > 0) {
		console.log('I HAVE ACTION TO DO');
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

				$(_self.CHOOSE_CARD_EFFECT_CLASS + ' div:first-child').html("");

				for (var spaceType in _self.BOARD_FIELDS) {
					if (spaceType.endsWith("_" + cardTier)) {
						$(_self.CHOOSE_CARD_EFFECT_CLASS + ' div:first-child').append('<img class="anime-cb-choose-card-effect-choice"\
							src="/imgs/' + _self.BOARD_FIELDS_IMGS[spaceType] + '" data-special-space-type="'
							+ _self.BOARD_FIELDS[spaceType] +  '" style="width: 100px; height: 100px;">');
					}
				}

				$(_self.CHOOSE_CARD_EFFECT_CLASS).css("opacity", 1);
				$(_self.CHOOSE_CARD_EFFECT_CLASS).css("z-index", 1000);

				$(_self.CHOOSE_CARD_EFFECT_CLASS).on('click', _self.CHOOSE_CARD_EFFECT_CHOICE_CLASS, function() {
					$(_self.CHOOSE_CARD_EFFECT_CLASS).off("click");
					$(_self.CHOOSE_CARD_EFFECT_CLASS).css("opacity", 0);
					$(_self.CHOOSE_CARD_EFFECT_CLASS).css("z-index", -1);

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
		} else if (card.cardEffect.effect == "destroyCardFromEnemyField") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "drawCardFromDeckYouEnemy") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "takeCardFromYourGraveyard") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "moveSpacesForwardMoveSpacesBackwardEnemyX") {
			if (card.cardEffect.isFinished) {
				_self.hideEventsInfo(null, 0);
				_self.rollDiceEnemy(card.cardEffect.effectValueChosen, noop);
				_self.moveSpacesTimeout = setTimeout(function() {
					_self.moveEnemyCharacter(card.cardEffect.effectValueChosen, null, 0);
					_self.moveYourCharacter(card.cardEffect.effectValueChosen,
						_self.destroyCardAnimationEnemy.bind(_self, card, _self.checkIfYouHaveToDoAction
							.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self))), 0);
				}, 2000);
			} else {
				_self.setRollDiceCardListenerEnemy(card);
			}
		} else if (card.cardEffect.effect == "drawCardFromDeckYouDiscardCardYou") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecial") {
			_self.moveEnemyCharacter(card.finishData.moveSpaces,
				_self.destroyCardAnimationEnemy.bind(_self, card, _self.waitForEnemyActions.bind(_self)), 500);
		} else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialEnemy") {
			_self.moveYourCharacter(card.finishData.moveSpaces,
				_self.destroyCardAnimationEnemy.bind(_self, card, _self.checkIfYouHaveToDoAction
					.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self))), 500);
		} else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpace") {
			_self._postDestroyCard = card;
			_self.waitForEnemyActions();
		} else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemy") {
			_self._postDestroyCard = card;
			_self.checkIfYouHaveToDoAction(_self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self));
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

	if (playerStateYou.cardsToDraw > 0) {
		_self.setCardDrawListener();
	  _self.startDrawCardAnimationsFinishedPoll(_self.enableRollPhaseActions);
  	return;
	} else if (playerStateYou.cardsToDrawFromEnemyHand > 0) {
		_self.setDrawCardFromEnemyHandListener();
	} else if (playerStateYou.cardsToTakeFromYourGraveyard > 0) {
		_self.setTakeCardFromYourGraveyardListener();
	} else if (playerStateYou.cardsToDiscard > 0) {
		_self.setCardDiscardListener();
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
		$(_self.PHASE_END_ID).addClass("selectable");
		$(_self.PHASE_END_ID).on("click", function(e) {
			$(_self.PHASE_END_ID).off("click");
			$(_self.PHASE_END_ID).removeClass("selectable");
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

	if (playerStateEnemy.cardsToDraw > 0) {
		var eventInfoText =  _self._enemyName + " draws " + playerStateEnemy.cardsToDraw;
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
			_self.startDrawCardAnimationsFinishedPoll(_self.checkIfEnemyHasToDoAction
				.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self)));
		} else {
			_self.startDrawCardAnimationsFinishedPoll(_self.checkIfYouHaveToDoAction
				.bind(_self, _self.enableActionsInEnemyPhase.bind(_self), _self.waitForEnemyActions.bind(_self)));
		}
	} else if (playerStateEnemy.cardsToDrawFromEnemyHand > 0) {
		var eventInfoText = _self._enemyName + " draws " + playerStateEnemy.cardsToDrawFromEnemyHand;
		if (playerStateEnemy.cardsToDrawFromEnemyHand > 1) {
			eventInfoText += " cards from your hand";
		} else {
			eventInfoText += " card from your hand";
		}

		_self.showEventsInfo(eventInfoText);
	} else if (playerStateEnemy.cardsToTakeFromYourGraveyard > 0) {
		var eventInfoText = _self._enemyName + " takes " + playerStateEnemy.cardsToTakeFromYourGraveyard;
		if (playerStateEnemy.cardsToDrawFromEnemyHand > 1) {
			eventInfoText += " cards from his graveyard";
		} else {
			eventInfoText += " card from his graveyard";
		}

		_self.showEventsInfo(eventInfoText);
	} else if (playerStateEnemy.cardsToDiscard > 0) {
		var eventInfoText = _self._enemyName + " must discard " + playerStateEnemy.cardsToDiscard;
		if (playerStateEnemy.cardsToDiscard > 1) {
			eventInfoText += " cards from his hand";
		} else {
			eventInfoText += " card from his hand";
		}
		_self.showEventsInfo(eventInfoText);
	} else if (playerStateEnemy.cardsToDestroyFromEnemyField > 0) {
		var eventInfoText = _self._enemyName + " destroys " + playerStateEnemy.cardsToDestroyFromEnemyField;
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
			eventInfoText += _self._enemyName + " rolls dice again";
		} else {
			eventInfoText += _self._enemyName + " roll dice";
		}

		if (!playerStateEnemy.moveBackwardsOnNextRoll) {
			if (playerStateEnemy.canRollDiceBoardCount > 1) {
				eventInfoText += " " + playerStateEnemy.canRollDiceBoardCount + " times";
			} else {
				eventInfoText += " " + playerStateEnemy.canRollDiceBoardCount + " time";
			}
		} else {
			eventInfoText += "...backwards";
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

	$(_self.DECK_GLOBAL_ID).on('click', function(e) {
		$(_self.DECK_GLOBAL_ID).off("click");
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

	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).on('click', function(e) {
		$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).off();
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

	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).on('click', function(e) {
		$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).off();
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
			if (!_self.canDestroyCard(this)) {
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

			$(this).attr("data-tooltip", "takeCardFromGraveyard");
			$(this).on("click", function(e) {
				$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS).hide();
				_self.enableGraveyardPopulation();
				$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + ' .modal-body img').off("click");
				$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + ' .modal-body img').removeAttr("data-tooltip");
				_self.takeCardFromYourGraveyard.call(_self, this);
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

  return canDestroyCard;
};

gameController.prototype.enableRollDiceBoard = function () {
	var _self = this;

	var eventInfoText = "";
	var playerStateYou = _self._gameplayData.gameState.playersState[_self._yourUserId];

	if (playerStateYou.rollAgain) {
		eventInfoText += "Roll dice again";
	} else {
		eventInfoText += "Roll dice";
	}

	if (!playerStateYou.moveBackwardsOnNextRoll) {
		if (playerStateYou.canRollDiceBoardCount > 1) {
			eventInfoText += " " + playerStateYou.canRollDiceBoardCount + " times";
		} else {
			eventInfoText += " " + playerStateYou.canRollDiceBoardCount + " time";
		}
	} else {
		eventInfoText += "...backwards";
	}

	_self.showEventsInfo(eventInfoText);

	$(_self.PHASE_ROLL_ID).addClass("selectable");
	$(_self.PHASE_ROLL_ID).on("click", function(e) {
		$(_self.PHASE_ROLL_ID).off("click");
		$(_self.PHASE_ROLL_ID).removeClass("selectable");
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
	var cardCost = $(card).data("cardCost") || "";
	var cardAttributes = $(card).data("cardAttributes") || "";
	var cardEffect = $(card).data("cardEffect") || "";

	cardRarity = cardRarity ? cardRarity.toUpperCase() : cardRarity;
	cardCost = cardCost ? '<span title="' + cardCost + ' Energy cost">[' + cardCost + ']:</span> ' : cardCost;

	if ($(card).attr("src") != $(_self.CARD_INFO_IMG_ID).attr("src")) {
  	$(_self.CARD_INFO_IMG_ID).attr("src", $(card).attr("src"));
	}

  $(_self.CARD_INFO_IMG_ID).css("border", "1px solid white");
  $(_self.CARD_INFO_NAME_ID).text($(card).data("cardName") || "");

  var cardHtml = cardRarity + cardCost;
  if (cardEffect && cardEffect.continuous) {
  	cardHtml += '<img class="anime-cb-card-info-text-img" src="/imgs/continuous.png" title="Continuous card">';
  }

  if (cardAttributes) {
	  cardAttributes.forEach(function(cardAttr) {
	  	cardHtml += '<img class="anime-cb-card-info-text-img" src="/imgs/' + cardAttr
	  	+ '_attr.png" title="' + (cardAttr.charAt(0).toUpperCase() + cardAttr.slice(1)) + ' attribute">';
	  });
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

			_self.client.generalClient.roomController.resetRoomsInterval.call(_self.client.generalClient.roomController);
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

			_self.client.generalClient.roomController.resetRoomsInterval.call(_self.client.generalClient.roomController);
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
			_self.setLeaveButton();
			return;
		} else {
			var enemyName = _self._roomData.player1Id == _self._enemyUserId ? _self._roomData.player1Name : _self._roomData.player2Name;
			_self.showEventsInfo("YOU LOSE...");
			_self.setLeaveButton();
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
    noSound: !_self.client.generalClient.logInSignUpController._settings.sound,
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
    noSound: !_self.client.generalClient.logInSignUpController._settings.sound,
    callback: callback.bind(_self, diceValue, callback2, 2000)
  };

  rollADie(options);
};

gameController.prototype.summonCardFromHandAnimationYou = function (cardObj, callback) {
	var _self = this;

	var cardIdx = _self._gameplayData.gameState.cardSummonedIdxInPlayerHand + 1;
	var card = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS
		+ _self.PLAYER_YOU_CLASS + ':nth-child(' + cardIdx + ')');

	var cardId = cardObj.cardId;
	var cardName = cardObj.cardName;
	var cardText = cardObj.cardText;
	var cardImg = cardObj.cardImg;
	var cardRarity = cardObj.cardRarity;
	var cardEffect = cardObj.cardEffect;
	var cardCost = cardObj.cardCost;
	var cardAttributes = cardObj.cardAttributes;
	var cardSuccessfullySummoned = false;

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

	$('.anime-cb-card-activate-show').attr("src", "/imgs/player_cards/" + cardObj.cardImg);
	$('.anime-cb-card-activate-show').css("animation", "vibrate-card-activate-you 0.3s linear 5 both");

	_self.showCardTimeout = setTimeout(function() {
		$('.anime-cb-card-activate-show').css("animation", "");
		if (typeof callback === "function") {
			callback();
		}
	}, 1500);
};

gameController.prototype.showCardActivateOnScreenEnemy = function (cardObj, callback) {
	var _self = this;

	$('.anime-cb-card-activate-show').attr("src", "/imgs/player_cards/" + cardObj.cardImg);
	$('.anime-cb-card-activate-show').css("animation", "vibrate-card-activate-enemy 0.3s linear 5 both");

	_self.showCardTimeout = setTimeout(function() {
		$('.anime-cb-card-activate-show').css("animation", "");
		if (typeof callback === "function") {
			callback();
		}
	}, 1500);
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
		var cardEffect = $(this).data("cardEffect");
		if (cardEffect.continuous && cardEffect.continuousEffectType == "onClick") {
			if (!_self.canActivateCard(this)) {
				return;
			}
			$(this).attr("data-tooltip", "activateEffect");
			$(this).on("click", function(e) {
				_self.disableContinuousCardOnClickListener();
				_self.disableMainPhaseActions();
				_self.activateCardEffect(this);
			});
		}
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
		canActivateCard = false;
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
			canActivateCard = false;
		}
	}

	if (playerStateYou.energyPoints < cardEffect.energyPerUse) {
		canActivateCard = false;
	}

	if ("activationsCountThisTurn" in cardEffect && cardEffect.activationsCountThisTurn >= cardEffect.maxUsesPerTurn) {
		canActivateCard = false;
	}

	if ("effectChargesCount" in cardEffect && cardEffect.chargesUsedTotal >= cardEffect.effectChargesCount) {
		canActivateCard = false;
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
			callback = _self.enableActionsInEnemyPhase.bind(_self);
		}

		_self.drawCardFromEnemyHandYouAnimation(_self._gameplayData.gameState.cardDrawnFromEnemyHand, callback);
	} else {
		if (_self._gameplayData.gameState.currPlayerId == _self._enemyUserId) {
			callback = _self.waitForEnemyActions.bind(_self);
		} else {
			callback = _self.checkIfEnemyHasToDoAction.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
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
			callback = _self.enableActionsInEnemyPhase.bind(_self);
		}

		_self.destroyCardFromEnemyFieldYouAnimation(_self._gameplayData.gameState.cardDestroyedFromEnemyField, callback);
	} else {
		if (_self._gameplayData.gameState.currPlayerId == _self._enemyUserId) {
			callback = _self.waitForEnemyActions.bind(_self);
		} else {
			callback = _self.checkIfEnemyHasToDoAction.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
		}

		_self.destroyCardFromEnemyFieldEnemyAnimation(_self._gameplayData.gameState.cardDestroyedFromEnemyField, callback);
	}
};

gameController.prototype.processTakeCardFromYourGraveyard = function(data) {
	console.log('processTakeCardFromYourGraveyard');
	console.log('processTakeCardFromYourGraveyard data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.retryTimeout = setTimeout(function() {
			if (_self._gameplayData && _self._yourUserId &&
				_self._gameplayData.gameState.activePlayerId == _self._yourUserId) {
				_self.client.takeCardFromYourGraveyard(_self._lastClientData);
			}
		}, 1000);

		$(_self.GAME_STATUS_CONTENT_CLASS).html(data.errors[0].message);
		return;
	}

	clearTimeout(_self.retryTimeout);

	assert(ajv.validate(takeCardFromYourGraveyardResponse, data), 'takeCardFromYourGraveyardResponse is invalid' +
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
			callback = _self.enableActionsInEnemyPhase.bind(_self);
		}

		_self.takeCardFromYourGraveyardYouAnimation(_self._gameplayData.gameState.cardTakenFromGraveyard, callback);
	} else {
		if (_self._gameplayData.gameState.currPlayerId == _self._enemyUserId) {
			callback = _self.waitForEnemyActions.bind(_self);
		} else {
			callback = _self.checkIfEnemyHasToDoAction.bind(_self, _self.waitForEnemyActions.bind(_self), _self.enableMainPhaseActions.bind(_self));
		}

		_self.takeCardFromYourGraveyardEnemyAnimation(_self._gameplayData.gameState.cardTakenFromGraveyard, callback);
	}
};

gameController.prototype.summonCardFromHandAnimationEnemy = function (cardObj, callback) {
	var _self = this;

	var cardIdx = _self._gameplayData.gameState.cardSummonedIdxInPlayerHand + 1;
	var card = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS
		+ _self.PLAYER_ENEMY_CLASS + ':nth-last-child(' + cardIdx + ')');

	var cardId = cardObj.cardId;
	var cardName = cardObj.cardName;
	var cardText = cardObj.cardText;
	var cardImg = cardObj.cardImg;
	var cardRarity = cardObj.cardRarity;
	var cardEffect = cardObj.cardEffect;
	var cardCost = cardObj.cardCost;
	var cardAttributes = cardObj.cardAttributes;
	var cardSuccessfullySummoned = false;

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
  		callback();
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
  		callback();
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

	$(_self.ENERGY_POINTS_TEXT_CLASS + _self.PLAYER_YOU_CLASS).html(playerYouStatus.energyPoints + "/" + playerYouStatus.maxEnergyPoints);
	$(_self.ENERGY_POINTS_TEXT_CLASS + _self.PLAYER_ENEMY_CLASS).html(playerEnemyStatus.energyPoints + "/" + playerEnemyStatus.maxEnergyPoints);

	var statusContent = "Your status: <br>";

	statusContent += "- Cards to Draw: " + playerYouStatus.cardsToDraw + "<br>";
	statusContent += "- Cards to discard: " + playerYouStatus.cardsToDiscard + "<br>";
	statusContent += "- Dice to roll: " + playerYouStatus.canRollDiceBoardCount + "<br>";
	statusContent += "- Can summon any: " + (playerYouStatus.cardsSummonConstraints.cardsCanSummonAny ? "Yes" : "No") + "<br>";
	statusContent += "- Can summon common: " + (playerYouStatus.cardsSummonConstraints.cardsCanSummonCommon ? "Yes" : "No") + "<br>";
	statusContent += "- Can summon rare: " + (playerYouStatus.cardsSummonConstraints.cardsCanSummonRare ? "Yes" : "No") + "<br>";
	statusContent += "- Can summon epic: " + (playerYouStatus.cardsSummonConstraints.cardsCanSummonEpic ? "Yes" : "No") + "<br>";

	statusContent += "Enemy status: <br>";

	statusContent += "- Cards to Draw: " + playerEnemyStatus.cardsToDraw + "<br>";
	statusContent += "- Cards to discard: " + playerEnemyStatus.cardsToDiscard + "<br>";
	statusContent += "- Dice to roll: " + playerEnemyStatus.canRollDiceBoardCount + "<br>";
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

var noop = function(){};