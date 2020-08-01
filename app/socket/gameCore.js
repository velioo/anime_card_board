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
		let playerState = gameState.playersState[ctx.session.userData.userId];

		playerState.cardsSummonConstraints.cardsCanSummonAny = true;
		playerState.energyPoints = playerState.maxEnergyPoints;
	},
	rollPhaseHook: async(ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];

		playerState.cardsSummonConstraints.cardsCanSummonAny = false;
		playerState.energyPoints = 0;
		playerState.canRollDiceBoardCount++;

		if (playerState.cardsInHand > playerState.maxCardsInHand) {
			playerState.cardsToDiscard += (playerState.cardsInHand
				- playerState.maxCardsInHand);
		}
	},
	endPhaseHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];

    assert(playerState.canRollDiceBoardCount == 0);
    assert(playerState.cardsToDiscard == 0);
    assert(playerState.cardsToDraw == 0);
	},
	drawCardHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];

		let cardsStatus = await utils.getAllFromTable({ table: 'cards' });
		let randNum = utils.getRandomInt(0, cardsStatus.rowCount - 1);
		let cardSelected = cardsStatus.rows[randNum];

		ctx.cardDrawn = {
	    cardId: cardSelected.id,
	    cardName: cardSelected.name,
	    cardText: cardSelected.description,
	    cardImg: cardSelected.image,
	    cardRarity: cardSelected.rarity_id,
	    cardEffect: JSON.parse(cardSelected.effect_json),
	    cardCost: cardSelected.cost,
    };

		if (gameState.nextPhase == TURN_PHASES.END) {
			if (gameState.playersState[ctx.session.userData.userId].cardsInHand > gameState.playersState[ctx.session.userData.userId].maxCardsInHand) {
				gameState.playersState[ctx.session.userData.userId].cardsToDiscard++;
			}
		}
	},
	summonCardHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];

		let card = ctx.gameplayData.gameState.cardSummoned;
    let cardsOnFieldArr = playerState.cardsOnFieldArr;
    let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
    let yourUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player1Id : ctx.roomData.player2Id;

    card.cardEffect.isFinished = false;

		if (!card.cardEffect.continuous) {
			if (card.cardEffect.autoEffect) {
    		playerState.cardsInGraveyard.push(card);
    		playerState.cardsOnFieldArr.pop();
				card.cardEffect.isFinished = true;
			}

			if (card.cardEffect.effect == "moveSpacesForward") {
				await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValue, moveIfCan: false });
		  }

		  if (card.cardEffect.effect == "moveSpacesBackwardsEnemy") {
		  	await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValue,
		  		userId: enemyUserId, moveBackwardsOnNextRoll: true, moveIfCan: false });
		  }
		} else {
			if (card.cardEffect.maxUsesPerTurn) {
				card.cardEffect.activationsCountThisTurn = 0;
			}

			if (card.cardEffect.effectChargesCount) {
				card.cardEffect.chargesUsedTotal = 0;
			}
		}
	},
	cardFinishHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];

		let card = ctx.gameplayData.gameState.cardFinish;
    let finishData = ctx.data.finishData;
    let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
    let yourUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player1Id : ctx.roomData.player2Id;

		playerState.cardsInGraveyard.push(card);

		if (card.cardEffect.effect == "moveSpacesForwardUpTo") {
			assert((finishData.effectValueChosen > 0) && (finishData.effectValueChosen <= card.cardEffect.effectValue));
			card.cardEffect.effectValueChosen = finishData.effectValueChosen;
			await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValueChosen, moveIfCan: false });
	  } else if (card.cardEffect.effect == "moveSpacesBackwardsUpToEnemy") {
	  	assert((finishData.effectValueChosen > 0) && (finishData.effectValueChosen <= card.cardEffect.effectValue));
	  	card.cardEffect.effectValueChosen = finishData.effectValueChosen;
	  	await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValueChosen,
	  		userId: enemyUserId, moveBackwardsOnNextRoll: true, moveIfCan: false });
	  } else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpTo") {
	  	assert((finishData.effectValueChosen > 0) && (finishData.effectValueChosen <= card.cardEffect.effectValue));
	  	assert("moveBackward" in finishData);
	  	card.cardEffect.effectValueChosen = finishData.effectValueChosen;
	  	await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValueChosen,
	  		userId: yourUserId, moveBackwardsOnNextRoll: finishData.moveBackward, moveIfCan: false });
	  }
	},
	activateCardEffectHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];

		let card = ctx.gameplayData.gameState.cardActivated;
		let boardPath = gameState.boardData.boardDataPlayers.boardPath;
	  let boardMatrix = gameState.boardData.boardMatrix;
	  let currBoardIndexYou = gameState.playersState[ctx.session.userData.userId].currBoardIndex;

	  if ("maxUsesPerTurn" in card.cardEffect) {
			assert(card.cardEffect.activationsCountThisTurn < card.cardEffect.maxUsesPerTurn);
			card.cardEffect.activationsCountThisTurn++;
	  }

	  if ("effectChargesCount" in card.cardEffect) {
			assert(card.cardEffect.chargesUsedTotal < card.cardEffect.effectChargesCount);
			card.cardEffect.chargesUsedTotal++;
	  }

		if (card.cardEffect.energyPerUse) {
			assert(playerState.energyPoints >= card.cardEffect.energyPerUse);
			playerState.energyPoints -= card.cardEffect.energyPerUse;
		}

		if (card.cardEffect.effect == "copySpecialSpacesUpTo") {
			let availableSpecialSpaces = card.cardEffect.effectValue;
			if (ctx.session.userData.userId == ctx.roomData.player1Id) {
				for(let i = 0; i < card.cardEffect.copySpecialSpacesUpTo; i++) {
					if ((currBoardIndexYou + i) > (boardPath.length - 1)) {
						availableSpecialSpaces--;
					} else if (boardMatrix[boardPath[currBoardIndexYou + i][0]][boardPath[currBoardIndexYou + i][1]] <= 1) {
						availableSpecialSpaces--;
					}
				}
			} else {
				for(let i = 0; i < card.cardEffect.effectValue; i++) {
					if ((currBoardIndexYou - i) < 0) {
						availableSpecialSpaces--;
					} else if (boardMatrix[boardPath[currBoardIndexYou - i][0]][boardPath[currBoardIndexYou - i][1]] <= 1) {
						availableSpecialSpaces--;
					}
				}
			}

			assert(availableSpecialSpaces > 0);
		} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToEnemy") {
			// do nothing
		}
	},
	cardFinishContinuousHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];

		let card = ctx.gameplayData.gameState.cardFinishContinuous;
    let finishData = ctx.data.finishData;
		let boardPath = gameState.boardData.boardDataPlayers.boardPath;
	  let boardMatrix = gameState.boardData.boardMatrix;
	  let currBoardIndexYou = gameState.playersState[ctx.session.userData.userId].currBoardIndex;
    let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
    let yourUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player1Id : ctx.roomData.player2Id;

		if (card.cardEffect.effect == "copySpecialSpacesUpTo") {
			assert((finishData.rowIndex > 0) && (finishData.columnIndex > 0)
				&& (finishData.rowIndex <= (boardMatrix.length - 1))
				&& (finishData.columnIndex <= (boardMatrix[0].length - 1)));
			assert(boardMatrix[finishData.rowIndex][finishData.columnIndex] > 1);

			let validSpace = false;
			if (ctx.session.userData.userId == ctx.roomData.player1Id) {
				for(let i = 1; i <= card.cardEffect.effectValue; i++) {
					if (((currBoardIndexYou + i) <= (boardPath.length - 1)) && (boardPath[currBoardIndexYou + i][0] == finishData.rowIndex)
						&& (boardPath[currBoardIndexYou + i][1] == finishData.columnIndex)) {
						validSpace = true
					}
				}
			} else {
				for(let i = 1; i <= card.cardEffect.effectValue; i++) {
					if ((currBoardIndexYou - i >= 0) && (boardPath[currBoardIndexYou - i][0] == finishData.rowIndex)
						&& (boardPath[currBoardIndexYou - i][1] == finishData.columnIndex)) {
						validSpace = true
					}
				}
			}

			assert(validSpace);
			checkForSpecialBoardSpace(ctx, finishData.rowIndex, finishData.columnIndex);
	  } else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToEnemy") {
	  	assert((finishData.effectValueChosen > 0) && (finishData.effectValueChosen <= card.cardEffect.effectValue));
	  	assert("moveBackward" in finishData);
	  	card.cardEffect.effectValueChosen = finishData.effectValueChosen;
	  	await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValueChosen,
	  		userId: enemyUserId, moveBackwardsOnNextRoll: finishData.moveBackward, moveIfCan: false });
	  }

	  if ("effectChargesCount" in card.cardEffect && card.cardEffect.chargesUsedTotal >= card.cardEffect.effectChargesCount) {
			card.cardEffect.isFinished = true;
			playerState.cardsOnFieldArr.splice(ctx.cardIdx, 1);
			playerState.cardsInGraveyard.push(card);
		}
	},
	rollDiceBoardHook: async (ctx, overwriteParams) => {
		let gameState = ctx.gameplayData.gameState;

	  let boardPath = gameState.boardData.boardDataPlayers.boardPath;
	  let boardMatrix = gameState.boardData.boardMatrix;
	  let userId = ctx.session.userData.userId;
	  let moveIfCan = true;
    let rollDiceValue;

		gameState.rollDiceBoard.rollDiceValue = utils.getRandomInt(1, 6);
		rollDiceValue = gameState.rollDiceBoard.rollDiceValue;

		if (overwriteParams) {
			if ("rollDiceValue" in overwriteParams) {
				rollDiceValue = overwriteParams.rollDiceValue;
			}
			if ("userId" in overwriteParams) {
				ctx.session.userData.userId = overwriteParams.userId;
			}
			if ("moveBackwardsOnNextRoll" in overwriteParams) {
				gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll = overwriteParams.moveBackwardsOnNextRoll;
			}
			if ("moveIfCan" in overwriteParams) {
				moveIfCan = overwriteParams.moveIfCan;
			}
		}

    let currBoardIndex = gameState.playersState[ctx.session.userData.userId].currBoardIndex;
    gameState.playersState[ctx.session.userData.userId].lastBoardIndex = currBoardIndex;

    if (ctx.roomData.player1Id == ctx.session.userData.userId) {
    	if (!gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
    		if (moveIfCan)
    		{
      		moveBoardForwardIfCan(ctx, rollDiceValue);
    		} else {
    			moveBoardForward(ctx, rollDiceValue);
    		}
    	} else if (gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
    		if (moveIfCan)
    		{
    			moveBoardBackwardsIfCan(ctx, rollDiceValue);
    		} else {
    			moveBoardBackwards(ctx, rollDiceValue);
    		}
    	}
    } else if (ctx.roomData.player2Id == ctx.session.userData.userId) {
    	if (!gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
    		if (moveIfCan)
    		{
      		moveBoardBackwardsIfCan(ctx, rollDiceValue);
      	} else {
      		moveBoardBackwards(ctx, rollDiceValue);
      	}
    	} else if (gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
    		if (moveIfCan)
    		{
    			moveBoardForwardIfCan(ctx, rollDiceValue);
    		} else {
    			moveBoardForward(ctx, rollDiceValue);
    		}
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

    if (!onSameBoardSpace) {
    	checkForSpecialBoardSpace(ctx, rowIndex, columnIndex);
    }

   	if (checkWin(ctx)) {
      ctx.gameplayData.gameState.playerIdWinGame = ctx.session.userData.userId;
      let success = await winGame(ctx);
      assert(success === true);
    }

    ctx.session.userData.userId = userId;
	},
	discardCardHook: async (ctx, card) => {

	},
	activePlayerHook: async (ctx, card) => {
		let gameState = ctx.gameplayData.gameState;

    let currPlayerId = gameState.currPlayerId;
    let notCurrPlayerId = currPlayerId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;

		if (gameState.playersState[notCurrPlayerId].canRollDiceBoardCount > 0
			|| gameState.playersState[notCurrPlayerId].cardsToDraw > 0
			|| gameState.playersState[notCurrPlayerId].cardsToDiscard > 0
			|| gameState.playersState[notCurrPlayerId].energyPoints > 0) {
			ctx.gameplayData.gameState.activePlayerId = notCurrPlayerId;
			ctx.sessions[notCurrPlayerId].pausedTimer = false;
			ctx.sessions[currPlayerId].pausedTimer = true;
		} else {
			ctx.gameplayData.gameState.activePlayerId = currPlayerId;
			ctx.sessions[notCurrPlayerId].pausedTimer = true;
			ctx.sessions[currPlayerId].pausedTimer = false;
		}
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

let moveBoardForward = (ctx, count) => {
	let currBoardIndex = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex;

	assert(ctx.gameplayData.gameState.boardData.boardDataPlayers.boardPath[currBoardIndex + count]);
  ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex = currBoardIndex + count;
};

let moveBoardBackwards = (ctx, count) => {
	let currBoardIndex = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex;

	assert(currBoardIndex - count >= 0);
  ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex = currBoardIndex - count;
};

let checkForSpecialBoardSpace = (ctx, rowIndex, columnIndex) => {
	let boardMatrix = ctx.gameplayData.gameState.boardData.boardMatrix;

	var boardFieldsFuncs = [rollAgain, rollAgainBackwards, cardDraw, cardDiscard];
	var randNum = utils.getRandomInt(0, boardFieldsFuncs.length - 1);

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
	if (ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsInHand
		- ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].cardsToDiscard - count >= 0) {
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