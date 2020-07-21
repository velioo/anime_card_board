const logger = require('../helpers/logger');
const pg = require('../db/pg');
const utils = require('../helpers/utils');

const assert = require('assert');
const {
  TURN_PHASES,
  CARD_RARITIES,
  BOARD_FIELDS,
} = require('../constants/constants');

module.exports = {
	drawPhaseHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;

		gameState.playersState[ctx.session.userData.userId].cardsToDraw++;
	},
	standyPhaseHook: async (ctx) => {

	},
	mainPhaseHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;

		gameState.playersState[ctx.session.userData.userId].cardsSummonConstraints.cardsCanSummonCommonCount = 2;
	},
	rollPhaseHook: async(ctx) => {
		let gameState = ctx.gameplayData.gameState;

		gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCount = 1;
	},
	endPhaseHook: async (ctx) => {

	},
	drawCardHook: async (ctx) => {

	},
	summonCardHook: async (ctx, card) => {

	},
	rollDiceBoardHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;

		gameState.rollDiceBoard.rollDiceValue = utils.getRandomInt(1, 6);

	  let boardPath = gameState.boardData.boardDataPlayers.boardPath;
	  let boardMatrix = gameState.boardData.boardMatrix;
    let currBoardIndex = gameState.playersState[ctx.session.userData.userId].currBoardIndex;
    let rollDiceValue = gameState.rollDiceBoard.rollDiceValue;

    gameState.playersState[ctx.session.userData.userId].lastBoardIndex = currBoardIndex;

    if (ctx.roomData.player1Id == ctx.session.userData.userId && boardPath[currBoardIndex + rollDiceValue]) {
      gameState.playersState[ctx.session.userData.userId].currBoardIndex = currBoardIndex + rollDiceValue;
    } else if (ctx.roomData.player2Id == ctx.session.userData.userId && currBoardIndex - rollDiceValue >= 0) {
      gameState.playersState[ctx.session.userData.userId].currBoardIndex = currBoardIndex - rollDiceValue;
    }

    currBoardIndex = gameState.playersState[ctx.session.userData.userId].currBoardIndex;

    let rowIndex = boardPath[currBoardIndex][0];
    let columnIndex = boardPath[currBoardIndex][1];

    if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ROLL_AGAIN) {
    	gameState.playersState[ctx.session.userData.userId].rollAgain = true;
    	gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCount++;
    }

    logger.info("playerState: %o", gameState.playersState[ctx.session.userData.userId]);
	},
};