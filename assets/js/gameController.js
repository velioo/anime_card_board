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
	  ROLL_AGAIN_BACKWARDS: 5,
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
};

gameController.prototype.initListeners = function() {
	var _self = this;

	$(_self.GAME_SCREEN_CLASS).on('click', _self.SURRENDER_BTN_ID, function(e) {
		if (confirm('Are you sure you want to surrender ?')) {
		  _self.processChangeScreen(_self.MAIN_MENU_SCREEN_CLASS);
		  window.removeEventListener("beforeunload", _self.beforeUnload);
		}
	});

	$(_self.GAME_SCREEN_CLASS).on('mousemove mouseover', _self.CARD_ON_FIELD_CLASS, function(e) {
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

	_self._gameplayData = null;
	_self._roomData = null;
	_self._yourName = null;
	_self._enemyName = null;
	_self_enemyUserId = null;
	_self._yourUserId = null;
	$(_self.GAME_SCREEN_CLASS + "*").off();
	clearInterval(_self.yourTurnTimer);
	clearInterval(_self.enemyTurnTimer);
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
	clearTimeout(_self.drawCardFromDeckYouAnimationTimeout);
	clearTimeout(_self.drawCardFromDeckEnemyAnimationTimeout);
	clearTimeout(_self.discardCardTimeout);
	$(_self.BOARD_COLUMN_CLASS).off("click");
	$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-you");
	$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-enemy");
	_self.timeLeftSecondsEnemy = null;
	_self.timeLeftSecondsYou = null;
	_self.timerPauseEnemy = false;
	_self.timerPauseYou = false;
	clearTimeout(_self.winGameEnemyTimeout);
};

gameController.prototype.setLeaveButton = function () {
	var _self = this;

	_self.resetGameState();
	_self.initListeners();

	$(_self.GAME_SCREEN_CLASS).off("click", _self.SURRENDER_BTN_ID);
	$(_self.SURRENDER_BTN_ID).text("Return to Menu");
	$(_self.GAME_SCREEN_CLASS).on('click', _self.SURRENDER_BTN_ID, function(e) {
	 	_self.processChangeScreen(_self.MAIN_MENU_SCREEN_CLASS);
	});

	_self.client.generalClient.roomController.resetRoomsInterval.call(_self.client.generalClient.roomController);
	_self.client.generalClient.sendLeaveRoomRequest.call(_self.client.generalClient,
		{ roomId: _self.client.generalClient.roomController._roomId,
		userId: _self.client.generalClient.logInSignUpController._userId });
};

gameController.prototype.processWinGameFormallyResponse = function (data) {
	logger.info('processWinGameFormallyResponse');
	console.log('processWinGameFormallyResponse');
	console.log('data: ', data);

	var _self = this;

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
	}

	if (!_self._gameplayData) {
		return;
	}

	_self.showEventsInfo("YOU WIN !!!");
	_self.setLeaveButton();
};

gameController.prototype.processStartGameResponse = function (data) {
	console.log('processStartGameResponse');
	console.log('data: ', data);

	var _self = this;

	assert(ajv.validate(startGameResponse, data), 'startGameResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	_self.disableScroll();
	_self.resetGameState();
	_self.initListeners();
	_self.renderGameField();
	_self.initGameData(data);
	_self.setRoomName();
	_self.setPlayerNames();
	_self.setTimerValues();
	_self.renderBoard();

	setTimeout(function() {
		if (_self._gameplayData)
		{
			_self.processChangeScreen(_self.GAME_SCREEN_CLASS);
			_self.showEventsInfo("Game Start");
			_self.hideAllSpinner();
			_self.hideEventsInfo(null, 2000);
			_self.drawStartCards();
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

	console.log('hide venets seconmds: ' + seconds);

	_self.hideEventsInfoTimeout = setTimeout(function() {
	  $(_self.EVENTS_INFO_ID).css("-webkit-animation", "hide-event-popup 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) both");
	  $(_self.EVENTS_INFO_ID).css("animation", "hide-event-popup 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) both");
	  $(_self.EVENTS_INFO_ID).css("z-index", 1);
	  if (typeof callback === "function") {
	  	callback.call(_self);
	  }
	}, seconds);
};

gameController.prototype.showEventsInfo = function (infoText) {
	var _self = this;

	$(_self.EVENTS_INFO_ID).css("z-index", 20);
	$(_self.EVENTS_INFO_TEXT_ID).text(infoText);
  $(_self.EVENTS_INFO_ID).css("-webkit-animation", "show-event-popup-slide-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");
  $(_self.EVENTS_INFO_ID).css("animation", "show-event-popup-slide-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");
};

gameController.prototype.renderGameField = function () {
	var _self = this;

	$(_self.GAME_SCREEN_CLASS).html('<div class="anime-cb-title-page-game"><p id="anime-cb-title-page-game-room-name"></p></div><div id="anime-cb-card-info-card-name"></div><div id="anime-cb-card-info-wrapper"><div id="anime-cb-card-info-subwrapper"><img id="anime-cb-card-info-card" src="/imgs/player_cards/card_back.png"></div></div><div id="anime-cb-card-info-text"></div><div class="anime-cb-card-graveyard-wrapper player-enemy"><p class="anime-cb-card-graveyard-text player-enemy">Enemy Graveyard</p><img class="anime-cb-card-graveyard-deck player-enemy bottom"><img class="anime-cb-card-graveyard-deck player-enemy top"></div><div id="anime-cb-card-global-deck-wrapper"><img id="anime-cb-card-global-deck" src="/imgs/player_cards/card_back.png"><p id="anime-cb-card-global-deck-text">Global Deck</p></div><div id="anime-cb-game-events-info"><p id="anime-cb-game-events-info-text"></p></div><div class="anime-cb-turn-timer player-enemy"><p class="anime-cb-turn-timer-text player-enemy"></p></div><div class="anime-cb-turn-timer player-you"><p class="anime-cb-turn-timer-text player-you"></p></div><table id="anime-cb-phases-wrapper"><tr class="anime-cb-phase-row"><td id="anime-cb-phase-draw" class="anime-cb-phase-column next" data-phase-text="Draw Phase">DP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-standby" class="anime-cb-phase-column next" data-phase-text="Standby Phase">SP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-main" class="anime-cb-phase-column next" data-phase-text="Main Phase">MP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-roll" class="anime-cb-phase-column next" data-phase-text="Roll Phase">RP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-end" class="anime-cb-phase-column next" data-phase-text="End Phase">EP</td></tr></table><div class="center-screen"><div class="anime-cb-cards-in-hand-wrapper player-enemy"><div class="anime-cb-cards-in-hand player-enemy"></div></div><div class="anime-cb-board-player-label player-enemy"></div><div class="anime-cb-card-field-wrapper"><table class="anime-cb-card-field player-enemy"><tr><td></td><td></td><td></td><td></td><td></td></tr></table></div><div id="anime-cb-board-wrapper"><table id="anime-cb-board"></table></div><div class="anime-cb-card-field-wrapper"><table class="anime-cb-card-field player-you"><tr><td></td><td></td><td></td><td></td><td></td></tr></table></div><div class="anime-cb-board-player-label player-you"></div><div class="anime-cb-cards-in-hand-wrapper player-you"><div class="anime-cb-cards-in-hand player-you"></div></div></div><div class="anime-cb-card-graveyard-wrapper player-you"><img class="anime-cb-card-graveyard-deck player-you bottom"><img class="anime-cb-card-graveyard-deck player-you top"><p class="anime-cb-card-graveyard-text player-you">Your Graveyard</p></div><div class="anime-cb-screen_footer-game"><button id="anime-cb-surrender" type="button" class="btn btn-primary anime-cb-button-stateless anime-cb-btn-main-menu">Surrender</button></div><div class="anime-cb-player-status-wrapper"><p class="anime-cb-player-status-title">Game Status</p><div class="anime-cb-player-status-content"></div></div><div id="anime-cb-dice-wrapper-player-you"></div><div id="anime-cb-dice-wrapper-player-enemy"></div><div class="modal graveyard-modal player-you"> <div class="modal-content"> <div class="modal-header player-you"> <span class="close">&times;</span> <h2>Your Graveyard</h2> </div> <div class="modal-body"> </div> <div class="modal-footer player-you"> <h3>Your Graveyard</h3> </div> </div></div><div class="modal graveyard-modal player-enemy"> <div class="modal-content"> <div class="modal-header player-enemy"> <span class="close">&times;</span> <h2>Enemy Graveyard</h2> </div> <div class="modal-body"> </div> <div class="modal-footer player-enemy"> <h3>Enemy Graveyard</h3> </div> </div></div>');
};

gameController.prototype.initGameData = function (data) {
	logger.info('initGameData');
	console.log('initGameData');
	console.log('Data: ', data);

	var _self = this;

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;

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
      	if (boardRowIdx == player1StartIndexRow && boardColumnIdx == player1StartIndexColumn)
      	{
      		if (_self._roomData.player1Id == _self._yourUserId) {
      			boardRowHtml += '<td class="anime-cb-column active"><span class="anime-cb-player-position" id="anime-cb-player-you-position"></span></td>';
      		} else {
      			boardRowHtml += '<td class="anime-cb-column active"><span class="anime-cb-player-position" id="anime-cb-player-enemy-position"></span></td>';
      		}
      	} else if (boardRowIdx == player2StartIndexRow && boardColumnIdx == player2StartIndexColumn) {
      		if (_self._roomData.player2Id == _self._yourUserId) {
      			boardRowHtml += '<td class="anime-cb-column active"><span class="anime-cb-player-position" id="anime-cb-player-you-position"></span></td>';
      		} else {
      			boardRowHtml += '<td class="anime-cb-column active"><span class="anime-cb-player-position" id="anime-cb-player-enemy-position"></span></td>';
      		}
      	} else if (boardColumn == _self.BOARD_FIELDS.NORMAL) {
      	  boardRowHtml += '<td class="anime-cb-column active"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.ROLL_AGAIN_1) {
      		boardRowHtml += '<td class="anime-cb-column active roll-again-1"><img class="anime-cb-board-img" src="/imgs/roll_again_1.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.ROLL_AGAIN_2) {
      		boardRowHtml += '<td class="anime-cb-column active roll-again-2"><img class="anime-cb-board-img" src="/imgs/roll_again_2.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.ROLL_AGAIN_3) {
      		boardRowHtml += '<td class="anime-cb-column active roll-again-3"><img class="anime-cb-board-img" src="/imgs/roll_again_3.png"></td>';
      	} else if (boardColumn == _self.BOARD_FIELDS.ROLL_AGAIN_BACKWARDS) {
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

		_self.setBoardPieces();
  });

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

	_self.animationsFinishedPollInterval = setInterval(function() {
		if (_self.drawCardAnimationsFinishedYou && _self.drawCardAnimationsFinishedEnemy) {
			clearInterval(_self.animationsFinishedPollInterval);
			if (typeof callback == "function") {
				callback.call(_self);
			}
		}
	}, 500);
};

gameController.prototype.drawCard = function () {
	var _self = this;

	var cardsToDraw = _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw;

	if (cardsToDraw > 0) {
		_self.drawCardAnimationsFinishedYou = false;
		console.log('Sending draw card request');
		_self.client.drawCard({ roomId: _self._roomData.id });
	} else {
		_self.drawCardAnimationsFinishedYou = true;
	}
};

gameController.prototype.processDrawCard = function (data) {
	console.log('processDrawCard');
	console.log('processDrawCard data: ', data);

	var _self = this;

	assert(ajv.validate(drawCardResponse, data), 'drawCardResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
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
			}, 600);
		}
	} else {
		_self._cardsDrawnEnemy++;
		if (!_self.checkForCardEnemyIntervalEnabled) {
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
					// _self.hideEventsInfo(null, 0);
				} else {
					clearInterval(_self.checkForCardEnemy);
					_self.checkForCardEnemyIntervalEnabled = false;
				}
			}, 600);
		}
	}
};

gameController.prototype.processDrawCardYou = function (data) {
	console.log('processDrawCardYou');
	console.log('processDrawCardYou data: ', data);

	var _self = this;

	assert(ajv.validate(drawCardYouResponse, data), 'drawCardYouResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		_self.drawCard();
		return;
	}

	_self._cardsDrawnYou.push(data.cardDrawn);
};

gameController.prototype.startTurn = function () {
	var _self = this;

	_self.setTimerValues();
	_self.timerPauseYou = false;
	_self.timerPauseEnemy = false;

	if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
		_self.setYourTurnFieldStyle();
		_self.startDrawPhase();
		_self.timerPauseEnemy = true;
	} else {
		_self.setEnemyTurnFieldStyle();
		_self.timerPauseYou = true;
	}

	_self.startYourTimer();
	_self.startEnemyTimer();
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

	_self.client.drawPhase({ roomId: _self._roomData.id });
};

gameController.prototype.processDrawPhase = function (data) {
	console.log('processDrawPhase');
	console.log('processDrawPhase data: ', data);

	var _self = this;

	assert(ajv.validate(drawPhaseResponse, data), 'drawPhaseResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
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

	assert(ajv.validate(standByPhaseResponse, data), 'standByPhaseResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self.updateGameStatusInfo();

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

	assert(ajv.validate(mainPhaseResponse, data), 'mainPhaseResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
		_self.startMainPhaseAnimationYou();
	} else {
		_self.startMainPhaseAnimationEnemy();
	}
};

gameController.prototype.summonCard = function (card) {
	logger.info("Trying to summon card: ", card);
	console.log('Trying to summoncard: ', card);

	var _self = this;

	var playerState = _self._gameplayData.gameState.playersState[_self._yourUserId];
	var cardsOnFieldCount = playerState.cardsOnFieldArr.length;
	var cardRarity = $(card).data("cardRarity");
	var cardId = $(card).data("cardId");
	var cardIdx = $(card).index();
	var retrySummon = false;

	if (cardsOnFieldCount + 1 > playerState.maxCardsOnField
		|| ! playerState.cardsSummonConstraints.cardsCanSummonAny) {
		retrySummon = true;
	}

	switch(cardRarity) {
		case _self.CARD_RARITIES.COMMON:
			if (! playerState.cardsSummonConstraints.cardsCanSummonCommon
				|| playerState.cardsSummonConstraints.cardsCanSummonCommonCount <= 0) {
				retrySummon = true;
			}
			break;
		case _self.CARD_RARITIES.RARE:
			if (! playerState.cardsSummonConstraints.cardsCanSummonRare
				|| playerState.cardsSummonConstraints.cardsCanSummonRareCount <= 0) {
				retrySummon = true;
			}
			break;
		case _self.CARD_RARITIES.EPIC:
					if (! playerState.cardsSummonConstraints.cardsCanSummonEpic
						|| playerState.cardsSummonConstraints.cardsCanSummonEpicCount <= 0) {
				retrySummon = true;
			}
			break;
	}

	if (retrySummon) {
		_self.enableMainPhaseActions();
	} else {
		logger.info("Sending summon card request to server...");
		_self.client.summonCard({ roomId: _self._roomData.id, cardId: cardId, cardIdx: cardIdx });
	}
};

gameController.prototype.processSummonCard = function (data) {
	console.log('processSummonCard');
	console.log('processSummonCard data: ', data);

	var _self = this;

	assert(ajv.validate(summonCardResponse, data), 'summonCardResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.playerIdSummonedCard == _self._yourUserId) {
		_self.summonCardFromHandAnimationYou(_self._gameplayData.gameState.cardSummoned, _self.performCardEffectYou
			.bind(_self, _self._gameplayData.gameState.cardSummoned));
	} else {
		_self.summonCardFromHandAnimationEnemy(_self._gameplayData.gameState.cardSummoned, _self.performCardEffectEnemy
			.bind(_self, _self._gameplayData.gameState.cardSummoned));
	}
};

gameController.prototype.processRollPhase = function (data) {
	console.log('processRollPhase');
	console.log('processRollPhase data: ', data);

	var _self = this;

	assert(ajv.validate(rollPhaseResponse, data), 'rollPhaseResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
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

	assert(ajv.validate(rollDiceBoardResponse, data), 'rollDiceBoardResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
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
			_self.rollDiceEnemy(_self._gameplayData.gameState.rollDiceBoard.rollDiceValue, _self.moveEnemyCharacter, _self.checkIfEnemyIsOnSpecialSpace);
		}
	}
};

gameController.prototype.processEndPhase = function (data) {
	console.log('processEndPhase');
	console.log('processEndPhase data: ', data);

	var _self = this;

	assert(ajv.validate(endPhaseResponse, data), 'endPhaseResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self.updateGameStatusInfo();

	clearTimeout(_self.winGameEnemyTimeout);
	clearInterval(_self.yourTurnTimer);
	clearInterval(_self.enemyTurnTimer);

	_self.startEndPhaseAnimation(_self.nextTurn);
};

gameController.prototype.discardCard = function (card) {
	logger.info("Trying to discard card");

	var _self = this;

	var cardId = $(card).data("cardId");
	var cardIdx = $(card).index();

	logger.info("Sending discard card request to server...");
	_self.discardCardFromHandYou(card);
	_self.client.discardCard({ roomId: _self._roomData.id, cardId: cardId, cardIdx: cardIdx });
};

gameController.prototype.processDiscardCard = function (data) {
	console.log('processDiscardCard');
	console.log('processDiscardCard data: ', data);

	var _self = this;

	assert(ajv.validate(discardCardResponse, data), 'discardCardResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.playerIdDiscardedCard == _self._yourUserId) {
		if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
			_self.discardCardTimeout = setTimeout(function() {
				if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.ROLL) {
					_self.enableMainPhaseActions();
				} else if (_self._gameplayData.gameState.nextPhase == _self.TURN_PHASES.END) {
					_self.enableRollPhaseActions();
				}
			}, 700);
		} else {
			_self.discardCardTimeout = setTimeout(function() {
				_self.enableActionsInEnemyPhase();
			}, 700);
		}
	} else {
		_self.discardCardFromHandEnemy(_self._gameplayData.gameState.cardDiscarded);
		_self.discardCardTimeout = setTimeout(function() {
			if (_self._gameplayData.gameState.currPlayerId == _self._enemyUserId) {
				_self.waitForEnemyActions();
			} else {
				_self.checkIfEnemyIsOnSpecialSpace();
			}
		}, 700);
	}
};

gameController.prototype.processFinishCardEffect = function (data) {
	console.log('processFinishCardEffect');
	console.log('processFinishCardEffect data: ', data);

	var _self = this;

	assert(ajv.validate(finishCardEffectResponse, data), 'finishCardEffectResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		return;
	}

	_self._gameplayData = data.gameplayData;
	_self._roomData = data.roomData;
	_self.updateGameStatusInfo();

	if (_self._gameplayData.gameState.playerIdFinishCard == _self._yourUserId) {
		_self.performCardEffectYou(_self._gameplayData.gameState.cardFinish);
	} else {
		_self.performCardEffectEnemy(_self._gameplayData.gameState.cardFinish);
	}
};

gameController.prototype.startDrawPhaseAnimationYou = function () {
	var _self = this;

	_self.switchPhaseYou(_self.PHASE_DRAW_ID);
};

gameController.prototype.startDrawPhaseAnimationEnemy = function () {
	var _self = this;

	_self.switchPhaseEnemy(_self.PHASE_DRAW_ID, _self.waitForEnemyActions);
};

gameController.prototype.startStandByPhaseAnimationYou = function () {
	var _self = this;

	_self.switchPhaseYou(_self.PHASE_STANDBY_ID);
};

gameController.prototype.startStandByPhaseAnimationEnemy = function () {
	var _self = this;

	_self.switchPhaseEnemy(_self.PHASE_STANDBY_ID);
};

gameController.prototype.startMainPhaseAnimationYou = function () {
	var _self = this;

	_self.switchPhaseYou(_self.PHASE_MAIN_ID);
};

gameController.prototype.startMainPhaseAnimationEnemy = function () {
	var _self = this;

	_self.switchPhaseEnemy(_self.PHASE_MAIN_ID, _self.waitForEnemyActions);
};

gameController.prototype.startRollPhaseAnimationYou = function () {
	var _self = this;

	_self.switchPhaseYou(_self.PHASE_ROLL_ID);
};

gameController.prototype.startRollPhaseAnimationEnemy = function () {
	var _self = this;

	_self.switchPhaseEnemy(_self.PHASE_ROLL_ID, _self.waitForEnemyActions);
};

gameController.prototype.startEndPhaseAnimation = function (callback) {
	var _self = this;

	_self.switchPhaseEnemy(_self.PHASE_END_ID, callback);
};

gameController.prototype.startStandByPhase = function () {
	var _self = this;

	_self.client.standByPhase({ roomId: _self._roomData.id });
};

gameController.prototype.startMainPhase = function () {
	var _self = this;

	_self.client.mainPhase({ roomId: _self._roomData.id });
};

gameController.prototype.startRollPhase = function () {
	var _self = this;

	_self.client.rollPhase({ roomId: _self._roomData.id });
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
  		_self.setCardDrawListener();
	  	_self.startDrawCardAnimationsFinishedPoll(_self.startStandByPhase);
	  } else if (currPhaseIdSelector == _self.PHASE_STANDBY_ID) {
	  	_self.startMainPhase();
	  } else if (currPhaseIdSelector == _self.PHASE_MAIN_ID) {
	  	_self.enableMainPhaseActions();
  	} else if (currPhaseIdSelector == _self.PHASE_ROLL_ID) {
	    _self.enableRollPhaseActions();
	  } else if (currPhaseIdSelector == _self.PHASE_END_ID) {
	  	$(currPhaseIdSelector).removeClass("active");
	  	$(currPhaseIdSelector).addClass("ended");
	  }
  }.bind(this), 2000);
};

gameController.prototype.enableMainPhaseActions = function () {
	var _self = this;

	if (_self._gameplayData.gameState.playersState[_self._yourUserId].canRollDiceBoardInRollPhase
		&& _self._gameplayData.gameState.playersState[_self._yourUserId].canRollDiceBoardCount > 0) {
		var eventInfoText = "Roll dice";

		if (_self._gameplayData.gameState.playersState[_self._yourUserId].moveBackwardsOnNextRoll) {
			eventInfoText += "...backwards";
		} else {
			eventInfoText += " " + _self._gameplayData.gameState.playersState[_self._yourUserId].canRollDiceBoardCount + " times";
		}

		_self.showEventsInfo(eventInfoText);
		_self.enableRollDiceBoard();
		return;
	} else if (_self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw > 0) {
		var eventInfoText = "Draw " + _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw + " card/s from the deck";

		_self.showEventsInfo(eventInfoText);
		_self.setCardDrawListener();
	  _self.startDrawCardAnimationsFinishedPoll(_self.enableMainPhaseActions);
  	return;
	} else if (_self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDiscard > 0) {
		_self.showEventsInfo("You must discard "
			+ _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDiscard + " card/s from your hand");

		$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).on('click', function(e) {
			$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).off();
			_self.discardCard.call(_self, this);
			_self.hideEventsInfo(null, 0);
		});
	} else {
		$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).on("click", function(e) {
			_self.disableMainPhaseActions();
			console.log('SUMMON CARD ON CLICK: ', this);
			_self.summonCard.call(_self, this);
		});

		$(_self.PHASE_ROLL_ID).addClass("selectable");

		$(_self.PHASE_ROLL_ID).on("click", function(e) {
			_self.disableMainPhaseActions();
			console.log('ROL PHASE CLICK: ', this);
			_self.startRollPhase();
		});
	}
};

gameController.prototype.disableMainPhaseActions = function () {
	var _self = this;

	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).off("click");
	$(_self.PHASE_ROLL_ID).off("click");
	$(_self.PHASE_ROLL_ID).removeClass("selectable");
};

gameController.prototype.enableActionsInEnemyPhase = function () {
	var _self = this;

	if (_self._gameplayData.gameState.playersState[_self._yourUserId].canRollDiceBoardInRollPhase
		&& _self._gameplayData.gameState.playersState[_self._yourUserId].canRollDiceBoardCount > 0) {
		var eventInfoText = "Roll dice";

		if (_self._gameplayData.gameState.playersState[_self._yourUserId].moveBackwardsOnNextRoll) {
			eventInfoText += "...backwards";
		} else {
			eventInfoText += " " + _self._gameplayData.gameState.playersState[_self._yourUserId].canRollDiceBoardCount + " times";
		}

		_self.showEventsInfo(eventInfoText);
		_self.enableRollDiceBoard();
		return;
	} else if (_self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw > 0) {
		var eventInfoText = "Draw " + _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw + " card/s from the deck";

		_self.showEventsInfo(eventInfoText);
		_self.setCardDrawListener();
	  _self.startDrawCardAnimationsFinishedPoll(_self.enableActionsInEnemyPhase);
  	return;
	} else if (_self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDiscard > 0) {
		_self.showEventsInfo("You must discard "
			+ _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDiscard + " card/s from your hand");

		$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).on('click', function(e) {
			$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).off();
			_self.discardCard.call(_self, this);
			_self.hideEventsInfo(null, 0);
		});
	} else {
		_self.hideEventsInfo(null, 0);
		_self.pauseTimerYou();
		_self.resumeTimerEnemy();
	}
};

gameController.prototype.performCardEffectYou = function (card) {
	var _self = this;

	if (card.cardEffect.instantEffect) {
		if (card.cardEffect.moveSpacesForwardUpTo) {
			if (card.cardEffect.isFinished) {
				_self.moveYourCharacter(card.cardEffect.moveSpacesForward,
					_self.destroyCardAnimationYou.bind(_self, card, _self.enableMainPhaseActions), 0);
			} else {
				_self.setBoardSpaceListener(card);
			}
		} else if (card.cardEffect.moveSpacesBackwardsUpToEnemy) {
			if (card.cardEffect.isFinished) {
				_self.moveEnemyCharacter(card.cardEffect.moveSpacesBackwardsEnemy,
					_self.destroyCardAnimationYou.bind(_self, card, _self.checkIfEnemyIsOnSpecialSpace), 0);
			} else {
				_self.setBoardSpaceListener(card);
			}
		}	else if (card.cardEffect.moveSpacesForward) {
			_self.moveYourCharacter(card.cardEffect.moveSpacesForward,
				_self.destroyCardAnimationYou.bind(_self, card, _self.enableMainPhaseActions), 1000);
		}
	}
};

gameController.prototype.checkIfEnemyIsOnSpecialSpace = function () {
	var _self = this;

	if (_self._gameplayData.gameState.playersState[_self._enemyUserId].canRollDiceBoardCount > 0
		|| _self._gameplayData.gameState.playersState[_self._enemyUserId].cardsToDraw > 0
		|| _self._gameplayData.gameState.playersState[_self._enemyUserId].cardsToDiscard > 0) {
		_self.waitForEnemyActions();
		_self.pauseTimerYou();
		_self.resumeTimerEnemy();
	} else {
		_self.hideEventsInfo(null, 0);
		_self.enableMainPhaseActions();
		_self.resumeTimerYou();
		_self.pauseTimerEnemy();
	}
};

gameController.prototype.checkIfYouAreOnSpecialSpace = function () {
	var _self = this;

	if (_self._gameplayData.gameState.playersState[_self._yourUserId].canRollDiceBoardCount > 0
		|| _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw > 0
		|| _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDiscard > 0) {
		_self.enableActionsInEnemyPhase();
		_self.resumeTimerYou();
		_self.pauseTimerEnemy();
	}
};

gameController.prototype.setBoardSpaceListener = function (card) {
	var _self = this;

	if (card.cardEffect.moveSpacesForwardUpTo) {
		_self.setBoardSpaceListenerMoveSpacesForwardsUpToYou(card);
	} else if (card.cardEffect.moveSpacesBackwardsUpToEnemy) {
		_self.setBoardSpaceListenerMoveSpacesBackwardsUpToEnemyYou(card);
	}
};

gameController.prototype.setBoardSpaceListenerMoveSpacesForwardsUpToYou = function (card) {
	var _self = this;

	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[_self._yourUserId].currBoardIndex;
  var rowIndex;
  var columnIndex;

  var moveBoardForward = true;
  if (_self._yourUserId == _self._roomData.player2Id) {
  	moveBoardForward = false;
  }

	$(_self.BOARD_ID).css("z-index", 4);
	for (var i = 0; i < card.cardEffect.moveSpacesForwardUpTo; i++) {
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

	  var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndex + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
			+ ':nth-child(' + (columnIndex + 1) + ')';
	  $(selectorTd).data("moveSpacesForward", i + 1);
	  $(selectorTd).addClass("selectable-you");
		$(selectorTd).on("click", function () {
			$(_self.BOARD_COLUMN_CLASS).off("click");
			$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-you");
			$(_self.BOARD_ID).css("z-index", 1);

			var finishData = { moveSpacesForward: $(this).data("moveSpacesForward") };
			_self.client.finishCardEffect({ roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData });
		});
	}

	if (i == 0) {
		_self.client.finishCardEffect({ roomId: _self._roomData.id, cardId: card.cardId,
			finishData: { moveSpacesForward: 0 } });
		$(_self.BOARD_ID).css("z-index", 1);
	}
};

gameController.prototype.setBoardSpaceListenerMoveSpacesBackwardsUpToEnemyYou = function (card) {
	var _self = this;

	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[_self._enemyUserId].currBoardIndex;
  var rowIndex;
  var columnIndex;

  var moveBoardForward = false;
  if (_self._enemyUserId == _self._roomData.player2Id) {
  	moveBoardForward = true;
  }

	$(_self.BOARD_ID).css("z-index", 4);
	for (var i = 0; i < card.cardEffect.moveSpacesBackwardsUpToEnemy; i++) {
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

	  var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndex + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
			+ ':nth-child(' + (columnIndex + 1) + ')';
	  $(selectorTd).data("moveSpacesBackwardsEnemy", i + 1);
	  $(selectorTd).addClass("selectable-you");
		$(selectorTd).on("click", function () {
			$(_self.BOARD_COLUMN_CLASS).off("click");
			$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-you");
			$(_self.BOARD_ID).css("z-index", 1);

			var finishData = { moveSpacesBackwardsEnemy: $(this).data("moveSpacesBackwardsEnemy") };
			_self.client.finishCardEffect({ roomId: _self._roomData.id, cardId: card.cardId, finishData: finishData });
		});
	}

	if (i == 0) {
		_self.client.finishCardEffect({ roomId: _self._roomData.id, cardId: card.cardId,
			finishData: { moveSpacesBackwardsEnemy: 0 } });
		$(_self.BOARD_ID).css("z-index", 1);
	}
};

gameController.prototype.setBoardSpaceListenerEnemy = function (card) {
	var _self = this;

	if (card.cardEffect.moveSpacesForwardUpTo) {
		_self.setBoardSpaceListenerMoveSpacesForwardsUpToEnemy(card);
	} else if (card.cardEffect.moveSpacesBackwardsUpToEnemy) {
		_self.setBoardSpaceListenerMoveSpacesBackwardsUpToEnemyEnemy(card);
	}
};

gameController.prototype.setBoardSpaceListenerMoveSpacesForwardsUpToEnemy = function (card) {
	var _self = this;

	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[_self._enemyUserId].currBoardIndex;
  var rowIndex;
  var columnIndex;

  var moveBoardForward = true;
  if (_self._enemyUserId == _self._roomData.player2Id) {
  	moveBoardForward = false;
  }

	for (var i = 0; i < card.cardEffect.moveSpacesForwardUpTo; i++) {
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

	  var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndex + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
			+ ':nth-child(' + (columnIndex + 1) + ')';
	  $(selectorTd).addClass("selectable-enemy");
	}
};

gameController.prototype.setBoardSpaceListenerMoveSpacesBackwardsUpToEnemyEnemy = function (card) {
	var _self = this;

	var boardPath = _self._gameplayData.gameState.boardData.boardDataPlayers.boardPath;
  var currBoardIndex = _self._gameplayData.gameState.playersState[_self._yourUserId].currBoardIndex;
  var rowIndex;
  var columnIndex;

  var moveBoardForward = false;
  if (_self._yourUserId == _self._roomData.player2Id) {
  	moveBoardForward = true;
  }

	for (var i = 0; i < card.cardEffect.moveSpacesBackwardsUpToEnemy; i++) {
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

	  var selectorTd = _self.BOARD_ROW_CLASS + ':nth-child(' + (rowIndex + 1) + ')' + ' ' + _self.BOARD_COLUMN_CLASS
			+ ':nth-child(' + (columnIndex + 1) + ')';
	  $(selectorTd).addClass("selectable-enemy");
	}
};

gameController.prototype.performCardEffectEnemy = function (card) {
	var _self = this;

	if (card.cardEffect.instantEffect) {
		if (card.cardEffect.moveSpacesForwardUpTo) {
			if (card.cardEffect.isFinished) {
				$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-enemy");
				_self.moveEnemyCharacter(card.cardEffect.moveSpacesForward,
					_self.destroyCardAnimationEnemy.bind(_self, card, _self.waitForEnemyActions), 0);
			} else {
				_self.setBoardSpaceListenerEnemy(card);
			}
		} else if (card.cardEffect.moveSpacesBackwardsUpToEnemy) {
			if (card.cardEffect.isFinished) {
				$(_self.BOARD_COLUMN_CLASS).removeClass("selectable-enemy");
				_self.moveYourCharacter(card.cardEffect.moveSpacesBackwardsEnemy,
					_self.destroyCardAnimationEnemy.bind(_self, card, _self.checkIfYouAreOnSpecialSpace), 0);
			} else {
				_self.setBoardSpaceListenerEnemy(card);
			}
		} else if (card.cardEffect.moveSpacesForward) {
			_self.moveEnemyCharacter(card.cardEffect.moveSpacesForward,
				_self.destroyCardAnimationEnemy.bind(_self, card, _self.waitForEnemyActions), 1000);
		}
	}
};

gameController.prototype.destroyCardAnimationYou = function (card, callback) {
	var _self = this;

	var cardEl = $(_self.CARD_FIELD_CLASS + _self.PLAYER_YOU_CLASS).find("[data-card-id='" + card.cardId + "']");
	console.log(cardEl);
	$(cardEl).css("animation", "fade-out 1.5s ease-in both");
  $(cardEl).css("-webkit-animation", "fade-out 1.5s ease-in both");
  $(cardEl).removeClass("hover");

  setTimeout(function() {
  	$(cardEl).remove();
  	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.bottom')
			.attr("src", $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top').attr("src"));
		$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top').attr("src", $(cardEl).attr("src"));

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

  setTimeout(function() {
  	$(cardEl).remove();
  	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.bottom')
			.attr("src", $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top').attr("src"));
		$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top').attr("src", $(cardEl).attr("src"));

  	if (typeof callback === "function") {
  		callback.call(_self);
  	}
  }, 1500);
};

gameController.prototype.enableRollPhaseActions = function () {
	var _self = this;

	if (_self._gameplayData.gameState.playersState[_self._yourUserId].canRollDiceBoardInRollPhase
		&& _self._gameplayData.gameState.playersState[_self._yourUserId].canRollDiceBoardCount > 0) {

		if (_self._gameplayData.gameState.playersState[_self._yourUserId].rollAgain) {
			var eventInfoText = "Roll again";

			if (_self._gameplayData.gameState.playersState[_self._yourUserId].moveBackwardsOnNextRoll) {
				eventInfoText += "...backwards";
			} else {
				eventInfoText += " " + _self._gameplayData.gameState.playersState[_self._yourUserId].canRollDiceBoardCount + " more times";
			}

			_self.showEventsInfo(eventInfoText);
			_self.enableRollDiceBoard();
			return;
		}

		_self.enableRollDiceBoard();
	} else if (_self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw > 0) {
		var eventInfoText = "Draw " + _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw + " card/s from the deck";

		_self.showEventsInfo(eventInfoText);
		_self.setCardDrawListener();
	  _self.startDrawCardAnimationsFinishedPoll(_self.enableRollPhaseActions);
  	return;
	} else if (_self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDiscard > 0) {
		_self.showEventsInfo("You must discard "
			+ _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDiscard + " card/s from your hand");

		$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).on('click', function(e) {
			$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).off();
			_self.discardCard.call(_self, this);
			_self.hideEventsInfo(null, 0);
		});
	} else {
		_self.hideEventsInfo(null, 0);
		$(_self.PHASE_ROLL_ID + ', ' + _self.PHASE_END_ID).removeClass("selectable");
		$(_self.PHASE_END_ID).addClass("selectable");
		$(_self.PHASE_END_ID).on("click", function(e) {
			$(_self.PHASE_END_ID).off("click");
			$(_self.PHASE_END_ID).removeClass("selectable");
			_self.client.endPhase({ roomId: _self._roomData.id });
		});
	}
};

gameController.prototype.waitForEnemyActions = function () {
	var _self = this;

	var enemyState = _self._gameplayData.gameState.playersState[_self._enemyUserId];

	if (enemyState.canRollDiceBoardInRollPhase
		&& enemyState.canRollDiceBoardCount > 0) {

		if (enemyState.rollAgain) {
			var eventInfoText = _self._enemyName + " rolls again";

			if (enemyState.moveBackwardsOnNextRoll) {
				eventInfoText += "...backwards";
			} else {
				eventInfoText += " " + enemyState.canRollDiceBoardCount + " more times";
			}

			_self.showEventsInfo(eventInfoText);
			return;
		}
	} else if (enemyState.cardsToDraw > 0) {
		var eventInfoText =  _self._enemyName + " draws "
			+ enemyState.cardsToDraw + " card/s from the deck";
		_self.showEventsInfo(eventInfoText);
		_self.drawCardAnimationsFinishedEnemy = false;
		if (_self._gameplayData.gameState.currPlayerId == _self._yourUserId) {
			_self.startDrawCardAnimationsFinishedPoll(_self.checkIfEnemyIsOnSpecialSpace);
		} else {
			_self.startDrawCardAnimationsFinishedPoll(_self.waitForEnemyActions);
		}
	} else if (enemyState.cardsToDiscard > 0) {
		_self.showEventsInfo( _self._enemyName + " must discard "
			+ enemyState.cardsToDiscard + " card/s from his hand");
	} else {
		_self.hideEventsInfo(null, 0);
	}
};

gameController.prototype.setCardDrawListener = function () {
	var _self = this;

	_self.drawCardAnimationsFinishedYou = false;
	_self.drawCardInteractive = true;

	var eventInfoText = "Draw " + _self._gameplayData.gameState.playersState[_self._yourUserId].cardsToDraw + " card/s from the deck";
	_self.showEventsInfo(eventInfoText);

	$(_self.DECK_GLOBAL_ID).on('click', function(e) {
		$(_self.DECK_GLOBAL_ID).off("click");
		_self.hideEventsInfo(null, 0);
		_self.drawCard();
	});
};

gameController.prototype.enableRollDiceBoard = function () {
	var _self = this;

	$(_self.PHASE_ROLL_ID).addClass("selectable");
	$(_self.PHASE_ROLL_ID).on("click", function(e) {
		$(_self.PHASE_ROLL_ID).off("click");
		$(_self.PHASE_ROLL_ID).removeClass("selectable");
		_self.hideEventsInfo(null, 0);
		_self.client.rollDiceBoard({ roomId: _self._roomData.id });
	});
};

gameController.prototype.switchPhaseEnemy = function (currPhaseIdSelector, callback) {
	var _self = this;

	console.log('switchPhaseEnemy');

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
  		callback.call(_self);
  	}
  }, 2000);
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

	var cardRarity = $(card).data("cardRarity") || "";
	var cardText = $(card).data("cardText") || "";
	cardRarity = cardRarity ? cardRarity.toUpperCase() + ': ' : cardRarity;

  $(_self.CARD_INFO_IMG_ID).attr("src", $(card).attr("src"));
  $(_self.CARD_INFO_IMG_ID).css("border", "1px solid white");
  $(_self.CARD_INFO_TEXT_ID).text(cardRarity + cardText);
  $(_self.CARD_INFO_NAME_ID).text($(card).data("cardName") || "");
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

	if (!playerId || !_self._gameplayData) {
		return;
	}

	var graveyardArr = _self._gameplayData.gameState.playersState[playerId].cardsInGraveyard;

	$(_self.MODAL_GRAVEYARD_CLASS + playerSelectorClass).find('.modal-body').html("");

	graveyardArr.forEach(function(card) {
		var cardId = card.cardId;
		var cardName = card.cardName;
		var cardText = card.cardText;
		var cardImg = card.cardImg;
		var cardRarity = card.cardRarity;

		$(_self.MODAL_GRAVEYARD_CLASS + playerSelectorClass).find('.modal-body')
			.prepend('<img class="anime-cb-card ' + playerSelectorClass.substr(1) + ' in-graveyard" data-card-text="' + cardText
				+ '" data-card-name="' + cardName + '" src="/imgs/player_cards/' + cardImg + '" data-card-id="' + cardId
				+ '" data-card-rarity="' + cardRarity +'">');
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
	var cardSuccessfullySummoned = false;

	$(_self.CARD_FIELD_CLASS + _self.PLAYER_YOU_CLASS + ' td').each(function(idx) {
		if (!$(this).find('img').length) {
			$(this).css("-webkit-animation", "summon-your-card 0.6s ease-out both");
			$(this).css("animation", "summon-your-card 0.6s ease-out both");
			$(this).html('<img class="anime-cb-card-onfield hover player-you" data-card-text="' + cardText
				+ '" data-card-name="' + cardName + '" src="/imgs/player_cards/' + cardImg + '" data-card-id="' + cardId
				+ '" data-card-rarity="' + cardRarity +'">');
			$(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
			$(card).remove();

			cardSuccessfullySummoned = true;

			_self.decreaseYourCardsInHandDensity();

			setTimeout(function() {
				$(this).css("animation", "");
				$(this).css("-webkit-animation", "");

				if (typeof callback === "function") {
					callback.call(_self);
				}
			}.bind(this), 600);

			return false;
		}
	});

	assert(cardSuccessfullySummoned);
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
	var cardSuccessfullySummoned = false;

	$($(_self.CARD_FIELD_CLASS + _self.PLAYER_ENEMY_CLASS + ' td').get().reverse()).each(function(idx) {
		if (!$(this).find('img').length) {
			$(this).css("-webkit-animation", "summon-enemy-card 0.6s ease-out both");
			$(this).css("animation", "summon-enemy-card 0.6s ease-out both");
			$(this).html('<img class="anime-cb-card-onfield hover player-enemy" data-card-text="' + cardText
				+ '" data-card-name="' + cardName + '" src="/imgs/player_cards/' + cardImg + '" data-card-id="' + cardId
				+ '" data-card-rarity="' + cardRarity +'">');
			$(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
			$(card).remove();

			_self.decreaseEnemyCardsInHandDensity();

			setTimeout(function() {
				$(this).css("animation", "");
				$(this).css("-webkit-animation", "");

				if (typeof callback === "function") {
					callback.call(_self);
				}
			}.bind(this), 600);

			return false;
		}
	});
};

gameController.prototype.startYourTimer = function () {
	var _self = this;

	_self.timeLeftSecondsYou = _self._gameplayData.gameState.timerSeconds;

	_self.yourTurnTimer = setInterval(function() {
		if (_self.timerPauseYou) {
			return;
		}
	  if (_self.timeLeftSecondsYou <= 0) {
	  	clearInterval(_self.yourTurnTimer);
	  	_self.client.generalClient.sendLeaveRoomRequest.call(_self.client.generalClient,
	  		{ roomId: _self.client.generalClient.roomController._roomId, userId: _self.client.generalClient.logInSignUpController._userId });
			_self.showEventsInfo("Your time is up, YOU LOSE...");
			_self.setLeaveButton();
	  	return;
	  }

	  _self.timeLeftSecondsYou--;
	  $('.anime-cb-turn-timer-text.player-you').text(_self.timeLeftSecondsYou);
	}, 1000);
};

gameController.prototype.startEnemyTimer = function () {
	var _self = this;

	_self.timeLeftSecondsEnemy = _self._gameplayData.gameState.timerSeconds;

	_self.enemyTurnTimer = setInterval(function() {
		if (_self.timerPauseEnemy) {
			return;
		}
	  if (_self.timeLeftSecondsEnemy <= 0) {
	  	clearInterval(_self.enemyTurnTimer);
	  	_self.winGameEnemyTimeout = setTimeout(function() {
	  		_self.client.winGameEnemyTimeout({ roomId: _self._roomData.id });
	  	}, 5000);
	  	return;
	  }

	  _self.timeLeftSecondsEnemy--;
	  $('.anime-cb-turn-timer-text.player-enemy').text(_self.timeLeftSecondsEnemy);
	}, 1000);
};

gameController.prototype.pauseTimerYou = function () {
	var _self = this;

	_self.timerPauseYou = true;
};

gameController.prototype.resumeTimerYou = function () {
	var _self = this;

	_self.timerPauseYou = false;
};

gameController.prototype.pauseTimerEnemy = function () {
	var _self = this;

	_self.timerPauseEnemy = true;
};

gameController.prototype.resumeTimerEnemy = function () {
	var _self = this;

	_self.timerPauseEnemy = false;
};

gameController.prototype.drawCardFromDeckYouAnimation = function (card) {
	var _self = this;

	var cardId = card.cardId;
	var cardName = card.cardName;
	var cardText = card.cardText;
	var cardImg = card.cardImg;
	var cardRarity = card.cardRarity;

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
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;" class="anime-cb-card player-you"\
  		 data-card-id="' + cardId + '" data-card-text="' + cardText + '" data-card-name="' + cardName + '" src="/imgs/player_cards/'
  		 + cardImg + '" data-card-rarity="' + cardRarity + '">');

  _self.increaseYourCardsInHandDensity();

  clearTimeout(_self.drawCardFromDeckYouAnimationTimeout);

  _self.drawCardFromDeckYouAnimationTimeout = setTimeout(function() {
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
  }, 700);
};

gameController.prototype.drawCardFromDeckEnemyAnimation = function(card) {
	var _self = this;
	// get this data from server
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
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;" class="anime-cb-card player-enemy"\
  		src="/imgs/player_cards/card_back.png">');

  _self.increaseEnemyCardsInHandDensity();

	clearTimeout(_self.drawCardFromDeckEnemyAnimationTimeout);

  _self.drawCardFromDeckEnemyAnimationTimeout = setTimeout(function() {
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
  }, 1000);
};

gameController.prototype.discardCardFromHandYou = function (card) {
	var _self = this;

	$(card).remove();

	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.bottom')
		.attr("src", $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top').attr("src"));
	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top')
		.css("-webkit-animation", "discard-card-from-hand-you 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");
	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top')
		.css("animation", "discard-card-from-hand-you 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");

	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top').attr("src", $(card).attr("src"));
	$(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");

	_self.decreaseYourCardsInHandDensity();

	setTimeout(function() {
		$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top').css("animation", "");
		$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + '.top').css("-webkit-animation", "");
	}, 600);
};

gameController.prototype.discardCardFromHandEnemy = function (card) {
	var _self = this;

	$(_self.CARDS_IN_HAND_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).last().remove();

	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.bottom')
		.attr("src", $(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top').attr("src"));
	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top')
		.css("-webkit-animation", "discard-card-from-hand-enemy 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");
	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top')
		.css("animation", "discard-card-from-hand-enemy 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");

	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top').attr("src", "/imgs/player_cards/" + card.cardImg);
	$(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");

	_self.decreaseEnemyCardsInHandDensity();

	setTimeout(function() {
		$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top').css("animation", "");
		$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + '.top').css("-webkit-animation", "");
	}, 600);
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
  baseMarginLeft += 8;

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
  baseMarginLeft += 8;

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS
  	+ ':not(:first)').css("margin-left", baseMarginLeft + "px");
};

gameController.prototype.updateGameStatusInfo = function () {
	var _self = this;

	var gameState = _self._gameplayData.gameState;
	var playerYouStatus = gameState.playersState[_self._yourUserId];
	var playerEnemyStatus = gameState.playersState[_self._enemyUserId];

	var statusContent = "Your status: <br>";

	statusContent += "- Cards to Draw: " + playerYouStatus.cardsToDraw + "<br>";
	statusContent += "- Cards to discard: " + playerYouStatus.cardsToDiscard + "<br>";
	statusContent += "- Dice to roll: " + playerYouStatus.canRollDiceBoardCount + "<br>";
	statusContent += "- Cards can summon any: " + (playerYouStatus.cardsSummonConstraints.cardsCanSummonAny ? "Yes" : "No") + "<br>";
	statusContent += "- Cards can summon common: " + playerYouStatus.cardsSummonConstraints.cardsCanSummonCommonCount + "<br>";
	statusContent += "- Cards can summon rare: " + playerYouStatus.cardsSummonConstraints.cardsCanSummonRareCount + "<br>";
	statusContent += "- Cards can summon epic: " + playerYouStatus.cardsSummonConstraints.cardsCanSummonEpicCount + "<br>";

	statusContent += "Enemy status: <br>";

	statusContent += "- Cards to Draw: " + playerEnemyStatus.cardsToDraw + "<br>";
	statusContent += "- Cards to discard: " + playerEnemyStatus.cardsToDiscard + "<br>";
	statusContent += "- Dice to roll: " + playerEnemyStatus.canRollDiceBoardCount + "<br>";
	statusContent += "- Cards can summon any: " + (playerEnemyStatus.cardsSummonConstraints.cardsCanSummonAny ? "Yes" : "No") + "<br>";
	statusContent += "- Cards can summon common: " + playerEnemyStatus.cardsSummonConstraints.cardsCanSummonCommonCount + "<br>";
	statusContent += "- Cards can summon rare: " + playerEnemyStatus.cardsSummonConstraints.cardsCanSummonRareCount + "<br>";
	statusContent += "- Cards can summon epic: " + playerEnemyStatus.cardsSummonConstraints.cardsCanSummonEpicCount + "<br>";

	$(_self.GAME_STATUS_CONTENT_CLASS).html(statusContent);
};