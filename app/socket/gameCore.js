const logger = require('../helpers/logger');
const pg = require('../db/pg');
const utils = require('../helpers/utils');

const assert = require('assert');
const {
  TURN_PHASES,
  CARD_RARITIES,
  BOARD_FIELDS,
} = require('../constants/constants');

var self = module.exports = {
	drawPhaseHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;

		gameState.playersState[ctx.session.userData.userId].cardsToDraw++;
	},
	standyPhaseHook: async (ctx) => {

	},
	mainPhaseHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;

		gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonAny = true;
		gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonCommonCount = 2;
	},
	rollPhaseHook: async(ctx) => {
		let gameState = ctx.gameplayData.gameState;

		gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonAny = false;
		gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCount++;

		if (gameState.playersState[ctx.session.userData.userId].cardsInHand > gameState.playersState[ctx.session.userData.userId].maxCardsInHand) {
			gameState.playersState[ctx.session.userData.userId].cardsToDiscard += (gameState.playersState[ctx.session.userData.userId].cardsInHand
				- gameState.playersState[ctx.session.userData.userId].maxCardsInHand);
		}
	},
	endPhaseHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;

    assert(gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCount == 0);
    assert(gameState.playersState[ctx.session.userData.userId].cardsToDiscard == 0);
    assert(gameState.playersState[ctx.session.userData.userId].cardsToDraw == 0);
	},
	drawCardHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;

		let cardsStatus = await utils.getAllFromTable({ table: 'cards' });
		let randNum = utils.getRandomInt(0, cardsStatus.rowCount - 1);
		let cardSelected = cardsStatus.rows[randNum];

		ctx.cardDrawn = {
	    cardId: cardSelected.id,
	    cardName: cardSelected.name,
	    cardText: cardSelected.description ,
	    cardImg: cardSelected.image,
	    cardRarity: cardSelected.rarity_id,
	    cardEffect: JSON.parse(cardSelected.effect_json),
    };

		if (gameState.nextPhase == TURN_PHASES.END) {
			if (gameState.playersState[ctx.session.userData.userId].cardsInHand > gameState.playersState[ctx.session.userData.userId].maxCardsInHand) {
				gameState.playersState[ctx.session.userData.userId].cardsToDiscard++;
			}
		}
	},
	summonCardHook: async (ctx, card) => {
		let gameState = ctx.gameplayData.gameState;

		let boardPath = gameState.boardData.boardDataPlayers.boardPath;
	  let boardMatrix = gameState.boardData.boardMatrix;
    let currBoardIndex = gameState.playersState[ctx.session.userData.userId].currBoardIndex;

    ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsInGraveyard.push(card);

		if (card.cardEffect.instantEffect) {
			if (card.cardEffect.moveSpacesForward) {
				await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.moveSpacesForward });
		  }
		}
	},
	rollDiceBoardHook: async (ctx, overwriteParams) => {
		let gameState = ctx.gameplayData.gameState;

	  let boardPath = gameState.boardData.boardDataPlayers.boardPath;
	  let boardMatrix = gameState.boardData.boardMatrix;
    let currBoardIndex = gameState.playersState[ctx.session.userData.userId].currBoardIndex;
    let rollDiceValue;

		gameState.rollDiceBoard.rollDiceValue = utils.getRandomInt(1, 6);
		rollDiceValue = gameState.rollDiceBoard.rollDiceValue;

		if (overwriteParams && overwriteParams.rollDiceValue) {
			rollDiceValue = overwriteParams.rollDiceValue;
		}

    gameState.playersState[ctx.session.userData.userId].lastBoardIndex = currBoardIndex;

    if (ctx.roomData.player1Id == ctx.session.userData.userId) {
    	if (!gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
      	moveBoardForwardIfCan(ctx, rollDiceValue);
    	} else if (gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
    		moveBoardBackwardsIfCan(ctx, rollDiceValue);
    	}
    } else if (ctx.roomData.player2Id == ctx.session.userData.userId) {
    	if (!gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
      	moveBoardBackwardsIfCan(ctx, rollDiceValue);
    	} else if (gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
    		moveBoardForwardIfCan(ctx, rollDiceValue);
    	}
    }

    currBoardIndex = gameState.playersState[ctx.session.userData.userId].currBoardIndex;

    if (gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCount > 0
    	&& gameState.playersState[ctx.session.userData.userId].rollAgain) {
    	gameState.playersState[ctx.session.userData.userId].rollAgain = true;
    } else {
			gameState.playersState[ctx.session.userData.userId].rollAgain = false;
    }

		gameState.playersState[ctx.session.userData.userId].moveBackwards = false;

    if (gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
    	gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll = false;
    	gameState.playersState[ctx.session.userData.userId].moveBackwards = true;
    }

    let rowIndex = boardPath[currBoardIndex][0];
    let columnIndex = boardPath[currBoardIndex][1];

    let onSameBoardSpace = currBoardIndex == gameState.playersState[ctx.session.userData.userId].lastBoardIndex ? true : false;
    var boardFieldsFuncs = [rollAgain, rollAgainBackwards, cardDraw, cardDiscard];
    var randNum = utils.getRandomInt(0, boardFieldsFuncs.length - 1);

    if (!onSameBoardSpace) {
	    if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ROLL_AGAIN_1) {
	    	rollAgain(ctx, 1);
	    } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ROLL_AGAIN_2) {
	    	rollAgain(ctx, 2);
	    } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ROLL_AGAIN_3) {
	    	rollAgain(ctx, 3);
	    } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ROLL_AGAIN_BACKWARDS) {
	    	rollAgainBackwards(ctx, null);
	    } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.CARD_DRAW_1) {
	    	cardDraw(ctx, 1);
	    } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.CARD_DRAW_2) {
	    	cardDraw(ctx, 2);
	    } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.CARD_DRAW_3) {
	    	cardDraw(ctx, 3);
	    } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.CARD_DISCARD_1) {
	    	cardDiscard(ctx, 1);
	    } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.CARD_DISCARD_2) {
	    	cardDiscard(ctx, 2);
	    } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.CARD_DISCARD_3) {
	    	cardDiscard(ctx, 3);
	    } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.RANDOM_1) {
	    	boardFieldsFuncs[randNum](ctx, 1);
	    } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.RANDOM_2) {
	    	boardFieldsFuncs[randNum](ctx, 2);
	    } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.RANDOM_3) {
	    	boardFieldsFuncs[randNum](ctx, 3);
	    }
    }

   	if (checkWin(ctx)) {
      ctx.gameplayData.gameState.playerIdWinGame = ctx.session.userData.userId;
      let success = await winGame(ctx);
      assert(success === true);
    }
	},
	discardCardHook: async (ctx, card) => {

	},
};

let moveBoardForwardIfCan = (ctx, count) => {
	let currBoardIndex = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex;

	if (ctx.gameplayData.gameState.boardData.boardDataPlayers.boardPath[currBoardIndex + count]) {
  	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex = currBoardIndex + count;
	}
};

let moveBoardBackwardsIfCan = (ctx, count) => {
	let currBoardIndex = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex;

	if (currBoardIndex - count >= 0) {
  	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex = currBoardIndex - count;
	}
};

let rollAgain = (ctx, count) => {
	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].rollAgain = true;
	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCount += count;
};

let rollAgainBackwards = (ctx, dummy) => {
	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].rollAgain = true;
	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCount++;
	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll = true;
};

let cardDraw = (ctx, count) => {
	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsToDraw += count;
};

let cardDiscard = (ctx, count) => {
	if (ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsInHand - count >= 0) {
		ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsToDiscard += count;
	} else {
		ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsToDiscard
			= ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsInHand;
	}
};

let checkWin = (ctx) => {
  let boardDataPlayers = ctx.gameplayData.gameState.boardData.boardDataPlayers;
  let boardPath = boardDataPlayers.boardPath;
  let currBoardIndex = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex;

  if (ctx.roomData.player1Id == ctx.session.userData.userId && currBoardIndex == boardDataPlayers.player2StartBoardIndex) {
    return true;
  } else if (ctx.roomData.player2Id == ctx.session.userData.userId && currBoardIndex == boardDataPlayers.player1StartBoardIndex) {
    return true;
  }

  return false;
};

let winGame = async (ctx) => {
  let queryStatus = await pg.pool.query(`

    UPDATE games
    SET status_id = 2,
      winning_player_id = $1,
      finished_at = now()
    WHERE room_id = $2
      AND status_id = 1
    RETURNING id

  `, [ ctx.session.userData.userId, ctx.roomData.id ]);

  assert(queryStatus.rows[0].id);

  return true;
};