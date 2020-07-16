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
	_self.DICE_THROW_CONTAINER_PLAYER_YOU_ID = '#anime-cb-dice-wrapper-player-you';
	_self.DICE_THROW_CONTAINER_PLAYER_ENEMY_ID = '#anime-cb-dice-wrapper-player-enemy';

	_self.CARD_INFO_IMG_ID = '#anime-cb-card-info-card';
	_self.CARD_INFO_NAME_ID = '#anime-cb-card-info-card-name';
	_self.CARD_INFO_TEXT_ID = '#anime-cb-card-info-text';
	_self.CARD_ON_FIELD_CLASS = '.anime-cb-card-onfield';
	_self.CARD_CLASS = '.anime-cb-card';
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
};

gameController.prototype.initElements = function() {
	var _self = this;
};

gameController.prototype.initListeners = function() {
	var _self = this;

	$(_self.GAME_SCREEN_CLASS).on('click', _self.SURRENDER_BTN_ID, function(e) {
		logger.info('Surrendering...');
		console.log('LEAVE ROOM SURRENDER');

		if (confirm('Are you sure you want to surrender ?')) {
		  _self.processChangeScreen(_self.MAIN_MENU_SCREEN_CLASS);
		}
	});

	$(_self.GAME_SCREEN_CLASS).on('mousemove mouseover', _self.CARD_ON_FIELD_CLASS, function(e) {
 		_self.fillInfoCard(this);
	});

	$(_self.GAME_SCREEN_CLASS).on('mousemove mouseover', _self.CARD_CLASS, _self.handleCardHover);

	$(_self.GAME_SCREEN_CLASS).on('mouseout', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
	  $(_self.CARDS_IN_HAND_CLASS).css("overflow", "hidden");
	});

	$(_self.GAME_SCREEN_CLASS).on('mousedown', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(0.9) rotateX(0) rotateY(0)");
	});

	$(_self.GAME_SCREEN_CLASS).on('mouseup', _self.CARD_CLASS, function() {
	  $(this).css("transform", "perspective(500px) scale(1.1) rotateX(0) rotateY(0)");
	});

	$(_self.CARDS_IN_HAND_CLASS).on('DOMMouseScroll mousewheel', _self.noScrollOnCardHover);

	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS).on("click", function() {
  	$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS).show();
	});

	$(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS + ' .close').on('click', function() {
	  $(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_YOU_CLASS).hide();
	});

	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS).on("click", function() {
	  $(_self.MODAL_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS).show();
	});

	$(_self.DECK_GRAVEYARD_CLASS + _self.PLAYER_ENEMY_CLASS + ' .close').on('click', function() {
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
	$(_self.GAME_SCREEN_CLASS + "*").off();
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

	window.alert("The other player has surrendered or left the room. You win, congratulations !");
	_self.processChangeScreen(_self.MAIN_MENU_SCREEN_CLASS);
};

gameController.prototype.processStartGameResponse = function (data) {
	logger.info('processStartGameResponse');
	console.log('processStartGameResponse');
	console.log('data: ', data);

	var _self = this;

	assert(ajv.validate(startGameResponse, data), 'startGameResponse is invalid' +
  	JSON.stringify(ajv.errors, null, 2));

	if (!data.isSuccessful) {
		assert(data.errors.length > 0);

		_self.showAlertError(data.errors[0].message);
		_self.startGame();
		return;
	}

	_self.resetGameState();
	_self.initListeners();
	_self.renderGameField();
	_self.initGameData(data);
	_self.setRoomName();
	_self.setPlayerNames();
	_self.setTimerValues();
	_self.renderBoard();
	_self.processChangeScreen(_self.GAME_SCREEN_CLASS);
	_self.hideAllSpinner();
};

gameController.prototype.renderGameField = function () {
	var _self = this;

	$(_self.GAME_SCREEN_CLASS).html('<div class="anime-cb-title-page-game"><p id="anime-cb-title-page-game-room-name"></p></div><div id="anime-cb-card-info-card-name"></div><div id="anime-cb-card-info-wrapper"><div id="anime-cb-card-info-subwrapper"><img id="anime-cb-card-info-card" src="/imgs/player_cards/card_back.png"></div></div><div id="anime-cb-card-info-text"></div><div class="anime-cb-card-graveyard-wrapper player-enemy"><p class="anime-cb-card-graveyard-text player-enemy">Enemy Graveyard</p><img class="anime-cb-card-graveyard-deck player-enemy" src="/imgs/player_cards/card_back.png"></div><div id="anime-cb-card-global-deck-wrapper"><img id="anime-cb-card-global-deck" src="/imgs/player_cards/card_back.png"><p id="anime-cb-card-global-deck-text">Global Deck</p></div><div id="anime-cb-game-events-info"><p id="anime-cb-game-events-info-text">Draw Phase</p></div><div class="anime-cb-turn-timer player-enemy"><p class="anime-cb-turn-timer-text player-enemy"></p></div><div class="anime-cb-turn-timer player-you"><p class="anime-cb-turn-timer-text player-you"></p></div><table id="anime-cb-phases-wrapper"><tr class="anime-cb-phase-row"><td id="anime-cb-phase-draw" class="anime-cb-phase-column next" data-phase-text="Draw Phase">DP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-standby" class="anime-cb-phase-column next" data-phase-text="Standy Phase">SP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-main" class="anime-cb-phase-column next" data-phase-text="Main Phase">MP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-roll" class="anime-cb-phase-column next" data-phase-text="Roll Phase">RP</td></tr><tr class="anime-cb-phase-row"><td id="anime-cb-phase-end" class="anime-cb-phase-column next" data-phase-text="End Phase">EP</td></tr></table><div class="center-screen"><div class="anime-cb-cards-in-hand-wrapper player-enemy"><div class="anime-cb-cards-in-hand player-enemy"></div></div><div class="anime-cb-board-player-label player-enemy"></div><table class="anime-cb-card-field player-enemy"><tr><td></td><td></td><td></td><td></td><td></td></tr></table><div id="anime-cb-board-wrapper"><table id="anime-cb-board"></table></div><div><table class="anime-cb-card-field player-you"><tr><td></td><td></td><td></td><td></td><td></td></tr></table></div><div class="anime-cb-board-player-label player-you"></div><div class="anime-cb-cards-in-hand-wrapper player-you"><div class="anime-cb-cards-in-hand player-you"></div></div></div><div class="anime-cb-card-graveyard-wrapper player-you"><img class="anime-cb-card-graveyard-deck player-you" src="/imgs/player_cards/card_back.png"><p class="anime-cb-card-graveyard-text player-you">Your Graveyard</p></div><div class="anime-cb-screen_footer-game"><button id="anime-cb-surrender" type="button" class="btn btn-primary anime-cb-button-stateless anime-cb-btn-main-menu">Surrender</button></div><div id="anime-cb-dice-wrapper-player1"></div><div id="anime-cb-dice-wrapper-player2"></div><div class="modal graveyard-modal player-you"> <div class="modal-content"> <div class="modal-header player-you"> <span class="close">&times;</span> <h2>Your Graveyard</h2> </div> <div class="modal-body"> </div> <div class="modal-footer player-you"> <h3>Your Graveyard</h3> </div> </div></div><div class="modal graveyard-modal player-enemy"> <div class="modal-content"> <div class="modal-header player-enemy"> <span class="close">&times;</span> <h2>Enemy Graveyard</h2> </div> <div class="modal-body"> </div> <div class="modal-footer player-enemy"> <h3>Enemy Graveyard</h3> </div> </div></div>');
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

	var player1StartIndexRow = _self._gameplayData.gameState.boardData.boardDataPlayers.player1StartIndexRow;
  var player1StartIndexColumn = _self._gameplayData.gameState.boardData.boardDataPlayers.player1StartIndexColumn;
  var player2StartIndexRow = _self._gameplayData.gameState.boardData.boardDataPlayers.player2StartIndexRow;
  var player2StartIndexColumn = _self._gameplayData.gameState.boardData.boardDataPlayers.player2StartIndexColumn;
  var boardMatrix = _self._gameplayData.gameState.boardData.boardMatrix;

  boardMatrix.forEach(function(boardRow, boardRowIdx) {
    var boardRowHtml = '<tr class="anime-cb-board-row">';
      boardRow.forEach(function(boardColumn, boardColumnIdx) {
      	if (boardRowIdx == player1StartIndexRow && boardColumnIdx == player1StartIndexColumn)
      	{
      		if (_self._roomData.player1Id == _self._yourUserId) {
      			boardRowHtml += '<td class="anime-cb-column active"><span id="anime-cb-player-you-position"></span></td>';
      		} else {
      			boardRowHtml += '<td class="anime-cb-column active"><span id="anime-cb-player-enemy-position"></span></td>';
      		}
      	} else if (boardRowIdx == player2StartIndexRow && boardColumnIdx == player2StartIndexColumn) {
      		if (_self._roomData.player2Id == _self._yourUserId) {
      			boardRowHtml += '<td class="anime-cb-column active"><span id="anime-cb-player-you-position"></span></td>';
      		} else {
      			boardRowHtml += '<td class="anime-cb-column active"><span id="anime-cb-player-enemy-position"></span></td>';
      		}
      	} else if (boardColumn == 1) {
      	  boardRowHtml += '<td class="anime-cb-column active"></td>';
      	} else {
          boardRowHtml += '<td class="anime-cb-column"></td>';
      	}
      });

    boardRowHtml += '</tr>';

    $(_self.BOARD_ID).append(boardRowHtml);

    if (_self._roomData.player1Id == _self._yourUserId) {
    	$(_self.BOARD_PLAYER_YOU_ID).css("background-image", 'url("../imgs/player_pieces/Lelouch.jpg")');
    	$(_self.BOARD_PLAYER_ENEMY_ID).css("background-image", 'url("../imgs/player_pieces/CC.jpg")');
    } else {
 			$(_self.BOARD_PLAYER_YOU_ID).css("background-image", 'url("../imgs/player_pieces/CC.jpg")');
 			$(_self.BOARD_PLAYER_ENEMY_ID).css("background-image", 'url("../imgs/player_pieces/Lelouch.jpg")');
    }
  });
};

gameController.prototype.fillInfoCard = function (card) {
	var _self = this;

  $(_self.CARD_INFO_IMG_ID).attr("src", $(card).attr("src"));
  $(_self.CARD_INFO_IMG_ID).css("border", "1px solid white");
  $(_self.CARD_INFO_TEXT_ID).text($(card).data("cardText") || "");
  $(_self.CARD_INFO_NAME_ID).text($(card).data("cardName") || "");
};

gameController.prototype.handleCardHover = function (e) {
  const xVal = e.offsetX;
  const yVal = e.offsetY;

  const height = $(this).height();
  const width = $(this).width();

  const yRotation = 20 * ((xVal - width / 2) / width);
  const xRotation = -20 * ((yVal - height / 2) / height);

  const string = 'perspective(500px) scale(1.1) rotateX(' + xRotation + 'deg) rotateY(' + yRotation + 'deg)';

  $(this).css("transform", string);

  fillInfoCard(this);

  $('.anime-cb-cards-in-hand').css("overflow", "visible");
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

gameController.prototype.moveYourCharacter = function (diceResult) {
	var _self = this;

  // $(_self.PHASE_ROLL_ID).removeClass("selectable");
  setTimeout(function() {
    var diceRoll = diceResult[0];

    var rowIndex = _self._gameplayData.gameState.playersState[_self._yourUserId].currBoardRow;
    var columnIndex = _self._gameplayData.gameState.playersState[_self._yourUserId].currBoardColumn;
    var currBoardIndex;

    for (var k = 0; k < boardPath.length; k++) {
  	  var boardPos = boardPath[k];

  	  if (rowIndex == boardPos[0] && columnIndex == boardPos[1]) {
  			currBoardIndex = k;

  			if (boardPath[currBoardIndex + diceRoll] === undefined) {
  				return;
  			}

	  		for (var i = 0; i < diceRoll; i++) {
				  if (boardPath[currBoardIndex + 1][0] != rowIndex) {
				    if (boardPath[currBoardIndex + 1][0] < rowIndex) {
				  	  $(_self.BOARD_PLAYER_YOU_ID).animate({'margin-top': '-=50px'}, 400, null, incrementAnimsUpdateBoard);
				  	} else {
				  	  $(_self.BOARD_PLAYER_YOU_ID).animate({'margin-top': '+=50px'}, 400, null, incrementAnimsUpdateBoard);
				  	}
				  }

				  if (boardPath[currBoardIndex + 1][1] != columnIndex) {
				    if (boardPath[currBoardIndex + 1][1] < columnIndex) {
				      $(_self.BOARD_PLAYER_YOU_ID).animate({'margin-left': '-=50px'}, 400, null, incrementAnimsUpdateBoard);
				    } else {
				      $(_self.BOARD_PLAYER_YOU_ID).animate({'margin-left': '+=50px'}, 400, null, incrementAnimsUpdateBoard);
				  	}
				  }

				  rowIndex = boardPath[currBoardIndex + 1][0];
				  columnIndex = boardPath[currBoardIndex + 1][1];
				  currBoardIndex++;
		 		}

		 	 	break;
  	  }
    }

    var animsCounter = 0;

    function incrementAnimsUpdateBoard() {
  	  animsCounter++;

  	  if (animsCounter == diceRoll) {
				$(_self.BOARD_PLAYER_YOU_ID).remove();

				var currPlayerTd = document.getElementById('anime-cb-board').rows[rowIndex].cells[columnIndex];
				$(currPlayerTd).html('<span id="anime-cb-player-you-position"></span>');

				// $(_self.PHASE_END_ID).addClass("selectable");
				// $(_self.PHASE_END_ID).on('click', switchPhase);
	  	}
    }
  }, 2000);
}

gameController.prototype.moveEnemyCharacter = function (diceResult) {
	var _self = this;

  setTimeout(function() {
    var diceRoll = diceResult[0];

    var rowIndex = _self._gameplayData.gameState.playersState[_self._enemyUserId].currBoardRow;
    var columnIndex = _self._gameplayData.gameState.playersState[_self._enemyUserId].currBoardColumn;
    var currBoardIndex;

    for (var k = 0; k < boardPath.length; k++) {
  	  var boardPos = boardPath[k];

  	  if (rowIndex == boardPos[0] && columnIndex == boardPos[1]) {
	  		currBoardIndex = k;

	  		if (currBoardIndex - diceRoll < 0) {
	  			return;
	  		}

	  		for (var i = 0; i < diceRoll; i++) {
				  if (boardPath[currBoardIndex - 1][0] != rowIndex) {
				    if (boardPath[currBoardIndex - 1][0] < rowIndex) {
				  	  $(_self.BOARD_PLAYER_ENEMY_ID).animate({'margin-top': '-=50px'}, 400, null, incrementAnimsUpdateBoard);
				  	} else {
				  	  $(_self.BOARD_PLAYER_ENEMY_ID).animate({'margin-top': '+=50px'}, 400, null, incrementAnimsUpdateBoard);
				  	}
				  }

				  if (boardPath[currBoardIndex - 1][1] != columnIndex) {
				    if (boardPath[currBoardIndex - 1][1] < columnIndex) {
				      $(_self.BOARD_PLAYER_ENEMY_ID).animate({'margin-left': '-=50px'}, 400, null, incrementAnimsUpdateBoard);
				    } else {
				      $(_self.BOARD_PLAYER_ENEMY_ID).animate({'margin-left': '+=50px'}, 400, null, incrementAnimsUpdateBoard);
				  	}
				  }

				  rowIndex = boardPath[currBoardIndex - 1][0];
				  columnIndex = boardPath[currBoardIndex - 1][1];
				  currBoardIndex--;
		 		}

		 	 	break;
  	  }
    }

    var animsCounter = 0;

    function incrementAnimsUpdateBoard() {
  	  animsCounter++;

  	  if (animsCounter == diceRoll) {
				$(_self.BOARD_PLAYER_ENEMY_ID).remove();

				var currPlayerTd = document.getElementById('anime-cb-board').rows[rowIndex].cells[columnIndex];
				$(currPlayerTd).html('<span id="anime-cb-player-enemy-position"></span>');
  	  }
    }
  }, 2000);
}

gameController.prototype.rollDiceYou = function (diceValue) {
	var _self = this;

  var diceContainer = $(_self.DICE_THROW_CONTAINER_PLAYER_YOU_ID)[0];
  var numberOfDice = 1;
  var options = {
    diceContainer,
    numberOfDice,
    delay: 1500,
    values: [diceValue],
    callback: moveYourCharacter.bind(_self)
  };

  rollADie(options);
};

gameController.prototype.rollDiceEnemy = function (diceValue) {
	var _self = this;

  var diceContainer = $(_self.DICE_THROW_CONTAINER_PLAYER_ENEMY_ID)[0];
  var numberOfDice = 1;
  var options = {
    diceContainer,
    numberOfDice,
    delay: 1500,
    values: [diceValue],
    callback: moveEnemyCharacter.bind(_self)
  };

  rollADie(options);
};

gameController.prototype.summonCardYou = function (e) {
	var cardId = $(this).data("id");

	// find card date by cardId in _self._gameplayData
	//var cardInfo = ...

	var cardSrc = $(this).attr("src");
	var cardText = $(this).data("cardText");
	var cardName = $(this).data("cardName");
	var card = this;

	$('.anime-cb-card-field.player-you td').each(function(idx) {
		if (!$(this).find('img').length) {
			$(this).css("-webkit-animation", "summon-your-card 0.6s ease-out both");
			$(this).css("animation", "summon-your-card 0.6s ease-out both");
			// put data-id on card too
			$(this).html('<img class="anime-cb-card-onfield hover player-you" data-card-text="' + cardText + '" data-card-name="' + cardName + '" src="' + cardSrc + '">');
			$('.anime-cb-cards-in-hand').css("overflow", "hidden");
			$(card).remove();

			decreaseYourCardsInHandDensity();

			setTimeout(function() {
				$(this).css("animation", "");
				$(this).css("-webkit-animation", "");
			}.bind(this), 500);

			return false;
		}
	});
};

gameController.prototype.summonCardEnemy = function (cardInfo) {
	// receive info which card did the other player summon -> cardInfo and populate the card with it
	// var cardSrc = $(this).attr("src");
	// var cardText = $(this).data("cardText");
	// var cardName = $(this).data("cardName");
	// var card = this;

	// $('.anime-cb-card-field.player-enemy td').each(function(idx) {
	// 	if (!$(this).find('img').length) {
	// 		$(this).css("-webkit-animation", "summon-enemy-card 0.6s ease-out both");
	// 		$(this).css("animation", "summon-enemy-card 0.6s ease-out both");
	// 		$(this).html('<img class="anime-cb-card-onfield hover player-enemy" src="' + cardSrc + '">');
	// 		$('.anime-cb-cards-in-hand').css("overflow", "hidden");
	// 		$(card).remove();

	// 		decreaseEnemyCardsInHandDensity();

	// 		setTimeout(function() {
	// 			$(this).css("animation", "");
	// 			$(this).css("-webkit-animation", "");
	// 		}.bind(this), 500);

	// 		return false;
	// 	}
	// });
};

// $('.anime-cb-cards-in-hand-wrapper.player-you').on('click', '.anime-cb-card', summonCardYou;

gameController.prototype.selectNextPhase = function (e) {
	// split this into two function -> click on roll phase and click on end phase
	$('#anime-cb-phase-roll, #anime-cb-phase-end').off("click");

  var phaseText = $(this).data("phaseText");

  $('#anime-cb-phase-roll, #anime-cb-phase-end').removeClass("selectable");
  $('.anime-cb-phase-column').removeClass("active");
  $(this).parent().prevAll().find('.anime-cb-phase-column').removeClass('next');
  $(this).parent().prevAll().find('.anime-cb-phase-column').addClass('ended');
  $(this).removeClass("next");
  $(this).addClass("active");

  $('#anime-cb-game-events-info-text').text(phaseText);
  $('#anime-cb-game-events-info').css("-webkit-animation", "show-event-popup-slide-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");
  $('#anime-cb-game-events-info').css("animation", "show-event-popup-slide-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both");

  setTimeout(function() {
    $('#anime-cb-game-events-info').css("-webkit-animation", "hide-event-popup 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) both");
  $('#anime-cb-game-events-info').css("animation", "hide-event-popup 1s cubic-bezier(0.165, 0.840, 0.440, 1.000) both");
  }.bind(this), 2000);

  setTimeout(function() {
  if ($(this).is($('#anime-cb-phase-roll'))) {
    $(this).addClass("selectable");
    $('#anime-cb-phase-roll').one("click", rollDiceWithValues);
  }

  // if end phase -> end turn
  }.bind(this), 3000);
};

gameController.prototype.startYourTimer = function () {
	var timeLeftSeconds = _self._gameplayData.gameState.timerSeconds;

	var turnTimer = setInterval(function() {
	  if (timeLeftSeconds <= 0) {
	  	clearTimeout(turnTimer);
	  	// lose game -> emit timer out event
	  	return;
	  }

	  timeLeftSeconds--;
	  $('.anime-cb-turn-timer-text.player-you').text(timeLeftSeconds);
	  // $('.anime-cb-turn-timer-text.player-enemy').text(timeLeftSeconds);
	}, 1000);
};

gameController.prototype.startEnemyTimer = function () {
	var timeLeftSeconds = _self._gameplayData.gameState.timerSeconds;

	var turnTimer = setInterval(function() {
	  if (timeLeftSeconds <= 0) {
	  	clearTimeout(turnTimer);
	  	// if it runs out -> wait for event from server
	  	return;
	  }

	  timeLeftSeconds--;
	  $('.anime-cb-turn-timer-text.player-enemy').text(timeLeftSeconds);
	}, 1000);
};

gameController.prototype.drawCardFromDeckYou = function (card) {
	var _self = this;

	// get this info from server instead of the html
  var cardsInHandCount = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS
  	+ ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS).length;
  var drawFromDeckAnimationCount = cardsInHandCount + 1;

  if (cardsInHandCount >= 10 && cardsInHandCount <= 15) {
  	drawFromDeckAnimationCount = 10;
  } else if (cardsInHandCount > 15) {
  	drawFromDeckAnimationCount = 11;
  }

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "visible");
  // populate card info from server
  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).append('<img style="animation: draw-from-deck-you-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; -webkit-animation: draw-from-deck-you-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;" class="anime-cb-card player-you"\
  		 data-card-text="This is Misaka" data-card-name="Misaka" src="imgs/player_cards/Misaka.jpg">');

  increaseYourCardsInHandDensity();

  $('*').on('DOMMouseScroll mousewheel', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.returnValue = false;
    return false;
  });

  setTimeout(function() {
  	$('*').off('DOMMouseScroll mousewheel');
  	$(_self.CARDS_IN_HAND_CLASS).on('DOMMouseScroll mousewheel', _self.noScrollOnCardHover);
  	$(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("animation", "");
  	$(_self.CARD_CLASS + _self.PLAYER_YOU_CLASS).css("-webkit-animation", "");
  	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS).css("overflow", "hidden");
  }, 600);
};

gameController.prototype.drawCardFromDeckEnemy = function(card) {
	// get this data from server
  var cardsInHandCount = $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS
  	+ ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).length;
  var drawFromDeckAnimationCount = cardsInHandCount + 1;

  if (cardsInHandCount >= 10 && cardsInHandCount <= 15) {
  	drawFromDeckAnimationCount = 10;
  } else if (cardsInHandCount > 15) {
  	drawFromDeckAnimationCount = 11;
  }

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).css("overflow", "visible");
  // populate card info from server
  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).append('<img style="animation: draw-from-deck-enemy-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; -webkit-animation: draw-from-deck-enemy-'
  	+ drawFromDeckAnimationCount + ' 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;" class="anime-cb-card player-enemy"\
  		data-card-text="This is Misaka" data-card-name="Misaka" src="imgs/player_cards/Misaka.jpg">');

  increaseEnemyCardsInHandDensity();

  $('*').on('DOMMouseScroll mousewheel', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.returnValue = false;
    return false;
  });

  setTimeout(function() {
  	$('*').off('DOMMouseScroll mousewheel');
  	$(_self.CARDS_IN_HAND_CLASS).on('DOMMouseScroll mousewheel', noScrollOnCardHover);
  	$(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("animation", "");
  	$(_self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS).css("-webkit-animation", "");
  	$(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS).css("overflow", "hidden");
  }, 600);
};

gameController.prototype.increaseYourCardsInHandDensity = function () {
	var _self = this;

  var baseMarginLeft = parseInt($(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS
  	+ ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS + ':nth-child(2)').css("margin-left"));
  if (baseMarginLeft >= -96)
  {
  	baseMarginLeft -= 8;
  }

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS
  	+ ':not(:first)').css("margin-left", baseMarginLeft + "px");
};

function decreaseYourCardsInHandDensity() {
	var _self = this;

  var baseMarginLeft = parseInt($(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS
  	+ ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS + ':nth-child(2)').css("margin-left"));
  baseMarginLeft += 8;

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_YOU_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_YOU_CLASS
  	+ ':not(:first)').css("margin-left", baseMarginLeft + "px");
};

function increaseEnemyCardsInHandDensity() {
	var _self = this;

  var baseMarginLeft = parseInt($(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS
  	+ ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS + ':nth-child(2)').css("margin-left"));
  if (baseMarginLeft >= -96)
  {
  	baseMarginLeft -= 8;
  }

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS
  	+ ':not(:first)').css("margin-left", baseMarginLeft + "px");
};

function decreaseEnemyCardsInHandDensity() {
	var _self = this;

  var baseMarginLeft = parseInt($(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS
  	+ ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS + ':nth-child(2)').css("margin-left"));
  baseMarginLeft += 8;

  $(_self.CARDS_IN_HAND_CLASS + _self.PLAYER_ENEMY_CLASS + ' ' + _self.CARD_CLASS + _self.PLAYER_ENEMY_CLASS
  	+ ':not(:first)').css("margin-left", baseMarginLeft + "px");
};