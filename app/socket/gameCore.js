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
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];
    let yourUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player1Id : ctx.roomData.player2Id;

		playerState.cardsToDraw++;

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	if (card.cardEffect.effect == "nullifyDrawPhaseEnemy") {
    		playerState.cardsToDraw = 0;
    	}
		});
	},
	standbyPhaseHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];
    let yourUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player1Id : ctx.roomData.player2Id;

    playerState.cardsExpired = [];

		let cardsOnFieldCopy = playerState.cardsOnFieldArr.slice().reverse();
		for (let i = 0; i < cardsOnFieldCopy.length; i++) {
		  if ((cardsOnFieldCopy[i].cardEffect.continuousEffectType == "passive") && (cardsOnFieldCopy[i].cardEffect.chargeConsumedPhase == "standby")) {
		  	cardsOnFieldCopy[i].cardEffect.chargesUsedTotal++;

		  	await checkIfCardExpired(cardsOnFieldCopy[i], i, playerState, playerStateEnemy, cardsOnFieldCopy);
		  }
		}

		playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});
	},
	mainPhaseHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];

		let lastEnergy = playerState.energyPoints;
		playerState.cardsExpired = [];

		let cardsOnFieldCopy = playerState.cardsOnFieldArr.slice().reverse();
		for (let i = 0; i < cardsOnFieldCopy.length; i++) {
		  if ((cardsOnFieldCopy[i].cardEffect.continuousEffectType == "passive") && (cardsOnFieldCopy[i].cardEffect.chargeConsumedPhase == "main")) {
		  	cardsOnFieldCopy[i].cardEffect.chargesUsedTotal++;

		  	if (cardsOnFieldCopy[i].cardEffect.effect == "energyRegen") {
		  		playerState.energyPoints += cardsOnFieldCopy[i].cardEffect.effectValue;
		  	}

		  	await checkIfCardExpired(cardsOnFieldCopy[i], i, playerState, playerStateEnemy, cardsOnFieldCopy);
		  }
		}

		playerState.cardsSummonConstraints.cardsCanSummonAny = true;

		if ((playerState.energyPoints + playerState.energyPerTurnGain) > playerState.maxEnergyPoints) {
			playerState.energyPoints = playerState.maxEnergyPoints;
		} else {
			playerState.energyPoints += playerState.energyPerTurnGain;
		}

		playerState.energyRegen = playerState.energyPoints - lastEnergy;

		playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});
	},
	rollPhaseHook: async(ctx) => {
	let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];
    let yourUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player1Id : ctx.roomData.player2Id;

    playerState.cardsOnFieldArr.forEach(function(card) {
    	if (card.cardEffect.effect == "rollDiceRollPhase") {
    		playerState.canRollDiceBoardCount += card.cardEffect.effectValue;
    	}
		});

    playerState.cardsExpired = [];

		let cardsOnFieldCopy = playerState.cardsOnFieldArr.slice().reverse();
		for (let i = 0; i < cardsOnFieldCopy.length; i++) {
		  if ((cardsOnFieldCopy[i].cardEffect.continuousEffectType == "passive")
		  	&& (cardsOnFieldCopy[i].cardEffect.chargeConsumedPhase == "roll")) {
		  	cardsOnFieldCopy[i].cardEffect.chargesUsedTotal++;

		  	await checkIfCardExpired(cardsOnFieldCopy[i], i, playerState, playerStateEnemy, cardsOnFieldCopy);
		  }
		}

		playerState.cardsSummonConstraints.cardsCanSummonAny = false;

		playerState.canRollDiceBoardCount++;

		if (playerState.cardsInHand > playerState.maxCardsInHand) {
			playerState.cardsToDiscard += (playerState.cardsInHand - playerState.maxCardsInHand);
		}

		playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});
	},
	endPhaseHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];
    let yourUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player1Id : ctx.roomData.player2Id;

		playerState.cardsExpired = [];

		let cardsOnFieldCopy = playerState.cardsOnFieldArr.slice().reverse();
		for (let i = 0; i < cardsOnFieldCopy.length; i++) {
		  if ((cardsOnFieldCopy[i].cardEffect.continuousEffectType == "passive") && (cardsOnFieldCopy[i].cardEffect.chargeConsumedPhase == "end")) {
		  	cardsOnFieldCopy[i].cardEffect.chargesUsedTotal++;

		  	await checkIfCardExpired(cardsOnFieldCopy[i], i, playerState, playerStateEnemy, cardsOnFieldCopy);
		  }
		}

    assert(playerState.canRollDiceBoardCount == 0);
    assert(playerState.canRollDiceBoardCountBackward == 0);
    assert(playerState.cardsToDiscard == 0);
    assert(playerState.cardsToDraw == 0);
    assert(playerState.cardsToDrawFromEnemyHand == 0);
    assert(playerState.cardsToDestroyFromEnemyField == 0);
    assert(playerState.cardsToTakeFromYourGraveyard == 0);
    assert(playerState.cardsToTakeFromEnemyGraveyard == 0);

    playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});
	},
	drawCardHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];

		if (ctx.cardsInDeckArr.length <= 0) {
			let cardsStatus = await utils.getAllFromTable({ table: 'cards' });
			cardsStatus.rows.forEach(function(cardRow) {
				ctx.cardsInDeckArr.push({
					cardId: cardRow.id,
			    cardName: cardRow.name,
			    cardText: cardRow.description,
			    cardTextOriginal: cardRow.description,
			    cardImg: cardRow.image,
			    cardRarity: cardRow.rarity_id,
			    cardEffect: JSON.parse(cardRow.effect_json),
			    cardCost: cardRow.cost,
			    cardAttributes: cardRow.attributes,
			    cardSounds: JSON.parse(cardRow.sounds_json),
			  });
			});
		}

		let randNum = utils.getRandomInt(0, ctx.cardsInDeckArr.length - 1);
		ctx.cardDrawn = ctx.cardsInDeckArr[randNum];
		ctx.cardsInDeckArr.splice(randNum, 1);

		assert(ctx.cardDrawn);

		playerState.cardsInHandArr.push(ctx.cardDrawn);

    ctx.cardDrawn.cardEffect.effectValueOriginal = ctx.cardDrawn.cardEffect.effectValue;
    ctx.cardDrawn.cardCostOriginal = ctx.cardDrawn.cardCost;

    if (ctx.cardDrawn.cardEffect.continuous) {
    	ctx.cardDrawn.cardEffect.energyPerUseOriginal = ctx.cardDrawn.cardEffect.energyPerUse;
    }

		if (gameState.nextPhase == TURN_PHASES.END) {
			if (gameState.playersState[ctx.session.userData.userId].cardsInHand > gameState.playersState[ctx.session.userData.userId].maxCardsInHand) {
				gameState.playersState[ctx.session.userData.userId].cardsToDiscard++;
			}
		}

		if (playerState.cardsToDraw <= 0) {
			let cardsOnFieldCopy = playerState.cardsOnFieldArr.slice().reverse();
			for (let i = 0; i < cardsOnFieldCopy.length; i++) {
			  if (!cardsOnFieldCopy[i].cardEffect.continuous
			  	&& cardsOnFieldCopy[i].cardEffect.effect == "drawCardFromDeckYouEnemy") {
			  	playerStateEnemy.cardsToDraw += cardsOnFieldCopy[i].cardEffect.effectValueEnemy;
			  	await putCardInGraveyard(cardsOnFieldCopy[i], playerState);
			  	playerState.cardsOnFieldArr.splice(cardsOnFieldCopy.length - 1 - i, 1);
			  }
			}
		}

		playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});
	},
	summonCardHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];

		let card = ctx.gameplayData.gameState.cardSummoned;
    let cardsOnFieldArr = playerState.cardsOnFieldArr;
    let boardPath = gameState.boardData.boardDataPlayers.boardPath;
	  let boardMatrix = gameState.boardData.boardMatrix;
    let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];
    let yourUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player1Id : ctx.roomData.player2Id;
	  let currBoardIndexYou = playerState.currBoardIndex;
	  let currBoardIndexEnemy = playerStateEnemy.currBoardIndex;

    card.cardEffect.isFinished = false;

		if (!card.cardEffect.continuous) {
			if (card.cardEffect.autoEffect) {
				await putCardInGraveyard(card, playerState);
    		playerState.cardsOnFieldArr.pop();
				card.cardEffect.isFinished = true;
			}

			if (card.cardEffect.effect == "moveSpacesForward") {
				await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValue, moveIfCan: false });
		  } else if (card.cardEffect.effect == "moveSpacesBackwardsEnemy") {
		  	await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValue,
		  		userId: enemyUserId, moveBackwardsOnNextRoll: true, moveIfCan: false });
		  } else if (card.cardEffect.effect.match("createSpecialBoardSpaceForwardTier")) {
		  	checkForEmptyBoardSpaces(ctx, card.cardEffect.effectValue, yourUserId);
		  } else if (card.cardEffect.effect == "destroySpecialBoardSpaceForward") {
		  	checkForSpecialBoardSpaces(ctx, card.cardEffect.effectValue, yourUserId);
		  } else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecial") {
		  	let closestBoardSpaceBoardForwardSpacesCount = 0;
		  	let closestBoardSpaceBoardBackwardSpacesCount = 0;
		  	let closestBoardSpaceForwardAvailable = false;
		  	let closestBoardSpaceBackwardAvailable = false;

				for(let i = currBoardIndexYou + 1; i < boardPath.length; i++) {
					closestBoardSpaceBoardForwardSpacesCount++;
					if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > 1) {
						closestBoardSpaceForwardAvailable = true;
						break;
					}
				}

				for(let i = currBoardIndexYou - 1; i >= 0; i--) {
					closestBoardSpaceBoardBackwardSpacesCount++;
					if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > 1) {
						closestBoardSpaceBackwardAvailable = true;
						break;
					}
				}

				assert((closestBoardSpaceForwardAvailable && closestBoardSpaceBoardForwardSpacesCount > 0)
					|| (closestBoardSpaceBackwardAvailable && closestBoardSpaceBoardBackwardSpacesCount > 0));

				let moveSpaces;
				let goBackward = false;
				if (closestBoardSpaceForwardAvailable && closestBoardSpaceBackwardAvailable) {
					if (closestBoardSpaceBoardForwardSpacesCount > closestBoardSpaceBoardBackwardSpacesCount) {
						moveSpaces = closestBoardSpaceBoardBackwardSpacesCount;
						goBackward = yourUserId == ctx.roomData.player1Id ? true : false;
					} else if (closestBoardSpaceBoardForwardSpacesCount < closestBoardSpaceBoardBackwardSpacesCount) {
						moveSpaces = closestBoardSpaceBoardForwardSpacesCount;
						goBackward = yourUserId == ctx.roomData.player1Id ? false : true;
					} else {
						moveSpaces = closestBoardSpaceBoardForwardSpacesCount;
						goBackward = false;
					}
				} else if (closestBoardSpaceForwardAvailable) {
					moveSpaces = closestBoardSpaceBoardForwardSpacesCount;
					goBackward = yourUserId == ctx.roomData.player1Id ? false : true;
				} else {
					moveSpaces = closestBoardSpaceBoardBackwardSpacesCount;
					goBackward = yourUserId == ctx.roomData.player1Id ? true : false;
				}

				assert(moveSpaces && moveSpaces > 0);

				await self.rollDiceBoardHook(ctx, { rollDiceValue: moveSpaces,
		  		userId: yourUserId, moveBackwardsOnNextRoll: goBackward, moveIfCan: false });

				card.finishData = {
					moveSpaces: moveSpaces,
				};
		  } else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialEnemy") {
		  	let closestBoardSpaceBoardForwardSpacesCount = 0;
		  	let closestBoardSpaceBoardBackwardSpacesCount = 0;
		  	let closestBoardSpaceForwardAvailable = false;
		  	let closestBoardSpaceBackwardAvailable = false;

				for(let i = currBoardIndexEnemy + 1; i < boardPath.length; i++) {
					closestBoardSpaceBoardForwardSpacesCount++;
					if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > 1) {
						closestBoardSpaceForwardAvailable = true;
						break;
					}
				}

				for(let i = currBoardIndexEnemy - 1; i >= 0; i--) {
					closestBoardSpaceBoardBackwardSpacesCount++;
					if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > 1) {
						closestBoardSpaceBackwardAvailable = true;
						break;
					}
				}

				assert((closestBoardSpaceForwardAvailable && closestBoardSpaceBoardForwardSpacesCount > 0)
					|| (closestBoardSpaceBackwardAvailable && closestBoardSpaceBoardBackwardSpacesCount > 0));

				let moveSpaces;
				let goBackward = false;
				if (closestBoardSpaceForwardAvailable && closestBoardSpaceBackwardAvailable) {
					if (closestBoardSpaceBoardForwardSpacesCount > closestBoardSpaceBoardBackwardSpacesCount) {
						moveSpaces = closestBoardSpaceBoardBackwardSpacesCount;
						goBackward = enemyUserId == ctx.roomData.player1Id ? true : false;
					} else if (closestBoardSpaceBoardForwardSpacesCount < closestBoardSpaceBoardBackwardSpacesCount) {
						moveSpaces = closestBoardSpaceBoardForwardSpacesCount;
						goBackward = enemyUserId == ctx.roomData.player1Id ? false : true;
					} else {
						moveSpaces = closestBoardSpaceBoardForwardSpacesCount;
						goBackward = true;
					}
				} else if (closestBoardSpaceForwardAvailable) {
					moveSpaces = closestBoardSpaceBoardForwardSpacesCount;
					goBackward = enemyUserId == ctx.roomData.player1Id ? false : true;
				} else {
					moveSpaces = closestBoardSpaceBoardBackwardSpacesCount;
					goBackward = enemyUserId == ctx.roomData.player1Id ? true : false;
				}

				assert(moveSpaces && moveSpaces > 0);

				await self.rollDiceBoardHook(ctx, { rollDiceValue: moveSpaces,
		  		userId: enemyUserId, moveBackwardsOnNextRoll: goBackward, moveIfCan: false });

				card.finishData = {
					moveSpaces: moveSpaces,
				};
		  } else if (card.cardEffect.effect == "drawCardFromEnemyHand") {
		  	assert(playerStateEnemy.cardsInHandArr.length > 0);

		  	playerState.cardsToDrawFromEnemyHand = playerState.cardsToDrawFromEnemyHand ? playerState.cardsToDrawFromEnemyHand : 0;
		  	if (playerStateEnemy.cardsInHandArr.length < (card.cardEffect.effectValue + playerState.cardsToDrawFromEnemyHand)) {
		  		playerState.cardsToDrawFromEnemyHand = playerStateEnemy.cardsInHandArr.length;
		  	} else {
		  		playerState.cardsToDrawFromEnemyHand += card.cardEffect.effectValue;
		  	}
		  } else if (card.cardEffect.effect == "drawCardFromEnemyYourHand") {
		  	assert(playerStateEnemy.cardsInHandArr.length > 0);
		  	assert(playerState.cardsInHandArr.length > 0);

		  	playerState.cardsToDrawFromEnemyHand = playerState.cardsToDrawFromEnemyHand ? playerState.cardsToDrawFromEnemyHand : 0;
		  	if (playerStateEnemy.cardsInHandArr.length < (card.cardEffect.effectValue + playerState.cardsToDrawFromEnemyHand)) {
		  		playerState.cardsToDrawFromEnemyHand = playerStateEnemy.cardsInHandArr.length;
		  	} else {
		  		playerState.cardsToDrawFromEnemyHand += card.cardEffect.effectValue;
		  	}

		  	playerStateEnemy.cardsToDrawFromEnemyHand = playerStateEnemy.cardsToDrawFromEnemyHand ? playerStateEnemy.cardsToDrawFromEnemyHand : 0;
		  	if (playerState.cardsInHandArr.length < (card.cardEffect.effectValue + playerStateEnemy.cardsToDrawFromEnemyHand)) {
		  		playerStateEnemy.cardsToDrawFromEnemyHand = playerState.cardsInHandArr.length;
		  	} else {
		  		playerStateEnemy.cardsToDrawFromEnemyHand += card.cardEffect.effectValue;
		  	}
		  } else if (card.cardEffect.effect == "destroyCardFromEnemyField") {
		  	assert(playerStateEnemy.cardsOnFieldArr.length > 0);

		  	playerState.cardsToDestroyFromEnemyField = playerState.cardsToDestroyFromEnemyField ? playerState.cardsToDestroyFromEnemyField : 0;
		  	if (playerStateEnemy.cardsOnFieldArr.length < (card.cardEffect.effectValue + playerState.cardsToDestroyFromEnemyField)) {
		  		playerState.cardsToDestroyFromEnemyField = playerStateEnemy.cardsOnFieldArr.length;
		  	} else {
		  		playerState.cardsToDestroyFromEnemyField += card.cardEffect.effectValue;
		  	}
		  } else if (card.cardEffect.effect == "drawCardFromDeckYouEnemy") {
		  	playerState.cardsToDraw += card.cardEffect.effectValue;
		  } else if (card.cardEffect.effect == "takeCardFromYourGraveyard") {
		  	assert(playerState.cardsInGraveyardArr.length > 0);

		  	playerState.cardsToTakeFromYourGraveyard = playerState.cardsToTakeFromYourGraveyard ? playerState.cardsToTakeFromYourGraveyard : 0;
		  	if (playerState.cardsInGraveyardArr.length < (card.cardEffect.effectValue + playerState.cardsToTakeFromYourGraveyard)) {
		  		playerState.cardsToTakeFromYourGraveyard = playerState.cardsInGraveyardArr.length;
		  	} else {
		  		playerState.cardsToTakeFromYourGraveyard += card.cardEffect.effectValue;
		  	}
		  } else if (card.cardEffect.effect == "takeCardFromEnemyGraveyard") {
		  	assert(playerStateEnemy.cardsInGraveyardArr.length > 0);

		  	playerState.cardsToTakeFromEnemyGraveyard = playerState.cardsToTakeFromEnemyGraveyard ? playerState.cardsToTakeFromEnemyGraveyard : 0;
		  	if (playerStateEnemy.cardsInGraveyardArr.length < (card.cardEffect.effectValue + playerState.cardsToTakeFromEnemyGraveyard)) {
		  		playerState.cardsToTakeFromEnemyGraveyard = playerStateEnemy.cardsInGraveyardArr.length;
		  	} else {
		  		playerState.cardsToTakeFromEnemyGraveyard += card.cardEffect.effectValue;
		  	}
		  } else if (card.cardEffect.effect == "drawCardFromDeckYouDiscardCardYou") {
		  	playerState.cardsToDraw += card.cardEffect.effectValue1;
		  	playerState.cardsToDiscard += card.cardEffect.effectValue2;
		  } else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpace") {
		  	assert(boardMatrix[boardPath[currBoardIndexYou][0]][boardPath[currBoardIndexYou][1]] > 1);
		  	checkForSpecialBoardSpace(ctx, boardPath[currBoardIndexYou][0], boardPath[currBoardIndexYou][1]);
		  } else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemy") {
		  	assert(boardMatrix[boardPath[currBoardIndexEnemy][0]][boardPath[currBoardIndexEnemy][1]] > 1);
		  	ctx.session.userData.userId = enemyUserId;
		  	checkForSpecialBoardSpace(ctx, boardPath[currBoardIndexEnemy][0], boardPath[currBoardIndexEnemy][1]);
		  	ctx.session.userData.userId = yourUserId;
		  } else if (card.cardEffect.effect == "increaseChargesContinousCard") {
		  	assert(playerState.cardsOnFieldArr.length > 0);
		  } else if (card.cardEffect.effect == "rollDiceForwardBackward") {
		  	playerState.canRollDiceBoardCountBackward += card.cardEffect.effectValue1;
		  	playerState.canRollDiceBoardCount += card.cardEffect.effectValue2 + card.cardEffect.effectValue1;
		  	playerState.moveBackwardsOnNextRoll = true;
		  } else if (card.cardEffect.effect == "moveSpacesForwardNonSpecial") {
		  	checkForEmptyBoardSpaces(ctx, boardPath.length - 1, yourUserId);
		  } else if (card.cardEffect.effect == "discardCardTakeCardFromYourGraveyard") {
		  	playerState.cardsToDiscard += card.cardEffect.effectValue1;
		  	playerState.cardsToTakeFromYourGraveyard += card.cardEffect.effectValue2;
		  	assert(playerState.cardsInHandArr.length >= playerState.cardsToDiscard);
		  	assert(playerState.cardsInGraveyardArr.length >= playerState.cardsToTakeFromYourGraveyard);
		  } else if (card.cardEffect.effect == "energyGain") {
		  	if ((playerState.energyPoints + card.cardEffect.effectValue) > playerState.maxEnergyPoints) {
					playerState.energyPoints = playerState.maxEnergyPoints;
				} else {
					playerState.energyPoints += card.cardEffect.effectValue;
				}
		  } else if (card.cardEffect.effect == "chooseAttributeVariation1") {
		  	playerState.cardsToDraw += card.cardEffect.effectValue;
		  }
		} else {
			if (card.cardEffect.maxUsesPerTurn) {
				card.cardEffect.activationsCountThisTurn = 0;
			}

			if (card.cardEffect.effectChargesCount) {
				card.cardEffect.chargesUsedTotal = 0;
			}
		}

		playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(_card) {
			if (_card.cardEffect.effect == "nullifyCardsFieldSummon") {
				assert(!card.cardAttributes.includes("field"));
			}

    	updateCardEffectValueStatus(_card, playerStateEnemy);
		});
	},
	cardFinishHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];

		let card = ctx.gameplayData.gameState.cardFinish;
    let finishData = ctx.data.finishData;
    let boardPath = gameState.boardData.boardDataPlayers.boardPath;
	  let boardMatrix = gameState.boardData.boardMatrix;
    let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];
    let yourUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player1Id : ctx.roomData.player2Id;
    let currBoardIndexYou = gameState.playersState[yourUserId].currBoardIndex;

    await putCardInGraveyard(card, playerState);

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
	  } else if (card.cardEffect.effect.match("createSpecialBoardSpaceForwardTier")) {
	  	assert((finishData.rowIndex >= 0) && (finishData.columnIndex >= 0)
				&& (finishData.rowIndex <= (boardMatrix.length - 1))
				&& (finishData.columnIndex <= (boardMatrix[0].length - 1)));
			assert(boardMatrix[finishData.rowIndex][finishData.columnIndex] == 1);
			assert("specialSpaceType" in finishData);

			let cardTier = (+card.cardEffect.effect.slice(-1));
			let spaceTypeStr;

			let isValidSpecialSpace = false;
			for (var spaceType in BOARD_FIELDS) {
				if (spaceType.endsWith("_" + cardTier) && ((+finishData.specialSpaceType) == BOARD_FIELDS[spaceType])) {
					isValidSpecialSpace = true;
					spaceTypeStr = spaceType;
				}
			}

			assert(isValidSpecialSpace);

			checkForEmptyBoardSpaces(ctx, card.cardEffect.effectValue, yourUserId);

			boardMatrix[finishData.rowIndex][finishData.columnIndex] = finishData.specialSpaceType;
			card.finishData = {
				rowIndex: finishData.rowIndex,
				columnIndex: finishData.columnIndex,
				spaceType: spaceTypeStr,
			};
		} else if (card.cardEffect.effect.match("destroySpecialBoardSpaceForward")) {
	  	assert((finishData.rowIndex >= 0) && (finishData.columnIndex >= 0)
				&& (finishData.rowIndex <= (boardMatrix.length - 1))
				&& (finishData.columnIndex <= (boardMatrix[0].length - 1)));
			assert(boardMatrix[finishData.rowIndex][finishData.columnIndex] > 1);

			checkForSpecialBoardSpaces(ctx, card.cardEffect.effectValue, yourUserId);

			let energyReturned;
			if ("energyReturnedTier1" in card.cardEffect &&
				utils.getKeyByValue(BOARD_FIELDS, boardMatrix[finishData.rowIndex][finishData.columnIndex]).endsWith("_1")) {
				energyReturned = card.cardEffect.energyReturnedTier1;
			}

			if ("energyReturnedTier2" in card.cardEffect &&
				utils.getKeyByValue(BOARD_FIELDS, boardMatrix[finishData.rowIndex][finishData.columnIndex]).endsWith("_2")) {
				energyReturned = card.cardEffect.energyReturnedTier2;
			}

			if (energyReturned) {
				if ((playerState.energyPoints + energyReturned) > playerState.maxEnergyPoints) {
					playerState.energyPoints = playerState.maxEnergyPoints;
				} else {
					playerState.energyPoints += energyReturned;
				}
			}

			boardMatrix[finishData.rowIndex][finishData.columnIndex] = BOARD_FIELDS.NORMAL;
			card.finishData = {
				rowIndex: finishData.rowIndex,
				columnIndex: finishData.columnIndex,
			};
		} else if (card.cardEffect.effect == "moveSpacesForwardMoveSpacesBackwardEnemyX") {
			assert("effectValueDependentOn" in card.cardEffect);
			assert("effectValueIncrement" in card.cardEffect);

			if (card.cardEffect.effectValueDependentOn == "diceRoll") {
				let operator = card.cardEffect.effectValueIncrement.charAt(0);
				let incrementValue = card.cardEffect.effectValueIncrement.substr(1);
				let diceValue = utils.getRandomInt(1, 6);
				diceValue = updateFieldValue[operator](diceValue, incrementValue);

				let successfullyMovedYou = await self.rollDiceBoardHook(ctx, { rollDiceValue: diceValue,
	  			userId: yourUserId, moveBackwardsOnNextRoll: false, moveIfCan: true });
				let successfullyMovedEnemy = await self.rollDiceBoardHook(ctx, { rollDiceValue: diceValue,
	  			userId: enemyUserId, moveBackwardsOnNextRoll: true, moveIfCan: true });

				card.cardEffect.effectValueChosen = diceValue;
				card.playerYouMovedSuccessfully = successfullyMovedYou;
				card.playerEnemyMovedSuccessfully = successfullyMovedEnemy;
			}
		} else if (card.cardEffect.effect == "increaseChargesContinousCard") {
			assert(finishData.cardId);
			assert(playerState.cardsOnFieldArr.length > 0);

			let cardSelected;
			playerState.cardsOnFieldArr.every(function(cardOnField) {
    		if (cardOnField.cardId == finishData.cardId) {
    			cardSelected = cardOnField;

    			var selectable = false;
    			cardSelected.cardAttributes.forEach(function(attribute) {
						if (card.cardEffect.allowedAttributes.includes(attribute)) {
							selectable = true;
						}
					});

					assert(selectable);

    			return false;
    		}

    		return true;
			});

			assert(cardSelected);

			cardSelected.cardEffect.effectChargesCount += card.cardEffect.effectValue;
		} else if (card.cardEffect.effect == "moveSpacesForwardNonSpecial") {
			assert("effectValueDependentOn" in card.cardEffect);
			assert("effectValueIncrement" in card.cardEffect);

			let spacesCountArr = [];
			if (yourUserId == ctx.roomData.player1Id) {
				for(let i = 1; i <= boardPath.length - 1; i++) {
					if ((currBoardIndexYou + i) > (boardPath.length - 1)) {
						break;
					} else if (boardMatrix[boardPath[currBoardIndexYou + i][0]][boardPath[currBoardIndexYou + i][1]] == 1) {
						spacesCountArr.push(i);
					}
				}
			} else {
				for(let i = 1; i <= boardPath.length - 1; i++) {
					if ((currBoardIndexYou - i) < 0) {
						break;
					} else if (boardMatrix[boardPath[currBoardIndexYou - i][0]][boardPath[currBoardIndexYou - i][1]] == 1) {
						spacesCountArr.push(i);
					}
				}
			}

			assert(spacesCountArr.length > 0);

			if (card.cardEffect.effectValueDependentOn == "diceRoll") {
				let operator = card.cardEffect.effectValueIncrement.charAt(0);
				let incrementValue = card.cardEffect.effectValueIncrement.substr(1);
				let diceValue = utils.getRandomInt(1, 6);
				diceValue = updateFieldValue[operator](diceValue, incrementValue);

				let moveSpaces = spacesCountArr[diceValue - 1]
					|| spacesCountArr[spacesCountArr.length - 1];

				await self.rollDiceBoardHook(ctx, { rollDiceValue: moveSpaces,
	  			userId: yourUserId, moveBackwardsOnNextRoll: false, moveIfCan: true });

				card.cardEffect.effectValueChosen = diceValue;
				card.cardEffect.moveSpaces = moveSpaces;
			}
		} else if (card.cardEffect.effect == "chooseAttributeVariation1") {
			assert(finishData.chosenAttribute);

			let lastCardDrawn = playerState.cardsInHandArr[playerState.cardsInHandArr.length - 1];

			if (finishData.chosenAttribute == "field") {
				if (lastCardDrawn.cardAttributes.includes("field")) {
					await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValue1_MoveSpacesForward,
	  				userId: yourUserId, moveBackwardsOnNextRoll: false, moveIfCan: true });

					card.cardEffect.moveSpaces = card.cardEffect.effectValue1_MoveSpacesForward;
				} else {
					await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValue1_MoveSpacesBackward,
	  				userId: yourUserId, moveBackwardsOnNextRoll: true, moveIfCan: true });

					card.cardEffect.moveSpaces = card.cardEffect.effectValue1_MoveSpacesBackward;
				}
			} else if (finishData.chosenAttribute == "cards") {
				if (lastCardDrawn.cardAttributes.includes("cards")) {
					playerState.maxCardsInHand += card.cardEffect.effectValue2_IncreaseMaxCardsInHand;
					playerState.cardsToDraw += card.cardEffect.effectValue2_DrawCardsFromDeck;

					card.cardEffect.cardsToDraw = true;
				} else {
					if ((playerState.cardsInHand - playerState.cardsToDiscard - card.cardEffect.effectValue2_DiscardCards) >= 0) {
						playerState.cardsToDiscard += card.cardEffect.effectValue2_DiscardCards;
					} else {
						playerState.cardsToDiscard = playerState.cardsInHand;
					}

					card.cardEffect.cardsToDiscard = true;
				}
			} else if (finishData.chosenAttribute == "energy") {
				if (lastCardDrawn.cardAttributes.includes("energy")) {
					playerState.maxEnergyPoints += card.cardEffect.effectValue3_IncreaseMaxEnergy;
					if ((playerState.energyPoints + card.cardEffect.effectValue3_EnergyGain) > playerState.maxEnergyPoints) {
						playerState.energyPoints = playerState.maxEnergyPoints;
					} else {
						playerState.energyPoints += card.cardEffect.effectValue3_EnergyGain;
					}

					card.cardEffect.gainEnergy = true;
				} else {
					if ((playerState.energyPoints - card.cardEffect.effectValue3_EnergyLose) < 0) {
						playerState.energyPoints = 0;
					} else {
						playerState.energyPoints -= card.cardEffect.effectValue3_EnergyLose;
					}

					card.cardEffect.loseEnergy = true;
				}
			}

			assert(card.cardEffect.moveSpaces || card.cardEffect.cardsToDraw
				|| card.cardEffect.cardsToDiscard || card.cardEffect.gainEnergy || card.cardEffect.loseEnergy);
		}

		playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});
	},
	activateCardEffectHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];

		let card = ctx.gameplayData.gameState.cardActivated;
		let boardPath = gameState.boardData.boardDataPlayers.boardPath;
	  let boardMatrix = gameState.boardData.boardMatrix;
	  let currBoardIndexYou = gameState.playersState[ctx.session.userData.userId].currBoardIndex;
	  let yourUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player1Id : ctx.roomData.player2Id;
	  let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];

	  if ("maxUsesPerTurn" in card.cardEffect) {
			assert(card.cardEffect.activationsCountThisTurn < card.cardEffect.maxUsesPerTurn);
			card.cardEffect.activationsCountThisTurn++;
	  }

		if (card.cardEffect.energyPerUse) {
			assert(playerState.energyPoints >= card.cardEffect.energyPerUse);
			playerState.energyPoints -= card.cardEffect.energyPerUse;
		}

		if (card.cardEffect.effect == "copySpecialSpacesUpTo") {
			checkForSpecialBoardSpaces(ctx, card.cardEffect.effectValue, yourUserId);
		} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToEnemy") {
		} else if (card.cardEffect.effect == "decreaseChargesContinousCardAll") {
			assert((playerState.cardsOnFieldArr.length > 1) || (playerStateEnemy.cardsOnFieldArr.length > 0));
		}

		playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		if ("effectChargesCount" in card.cardEffect) {
			assert(card.cardEffect.chargesUsedTotal < card.cardEffect.effectChargesCount);
			card.cardEffect.chargesUsedTotal++;
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
    let playerStateEnemy = gameState.playersState[enemyUserId];
    let yourUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player1Id : ctx.roomData.player2Id;

		if (card.cardEffect.effect == "copySpecialSpacesUpTo") {
			assert((finishData.rowIndex >= 0) && (finishData.columnIndex >= 0)
				&& (finishData.rowIndex <= (boardMatrix.length - 1))
				&& (finishData.columnIndex <= (boardMatrix[0].length - 1)));
			assert(boardMatrix[finishData.rowIndex][finishData.columnIndex] > 1);

			let validSpace = false;
			let spacesCount;
			if (ctx.session.userData.userId == ctx.roomData.player1Id) {
				for(let i = 1; i <= card.cardEffect.effectValue; i++) {
					if (((currBoardIndexYou + i) <= (boardPath.length - 1)) && (boardPath[currBoardIndexYou + i][0] == finishData.rowIndex)
						&& (boardPath[currBoardIndexYou + i][1] == finishData.columnIndex)) {
						validSpace = true;
						spacesCount = i;
					}
				}
			} else {
				for(let i = 1; i <= card.cardEffect.effectValue; i++) {
					if ((currBoardIndexYou - i >= 0) && (boardPath[currBoardIndexYou - i][0] == finishData.rowIndex)
						&& (boardPath[currBoardIndexYou - i][1] == finishData.columnIndex)) {
						validSpace = true;
						spacesCount = i;
					}
				}
			}

			assert(validSpace);
			checkForSpecialBoardSpace(ctx, finishData.rowIndex, finishData.columnIndex);
			checkForEnergyReturn(ctx, card, spacesCount);
	  } else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToEnemy") {
	  	assert((finishData.effectValueChosen > 0) && (finishData.effectValueChosen <= card.cardEffect.effectValue));
	  	assert("moveBackward" in finishData);
	  	card.cardEffect.effectValueChosen = finishData.effectValueChosen;
	  	await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValueChosen,
	  		userId: enemyUserId, moveBackwardsOnNextRoll: finishData.moveBackward, moveIfCan: false });

	  	checkForEnergyReturn(ctx, card, finishData.effectValueChosen);
	  } else if (card.cardEffect.effect == "decreaseChargesContinousCardAll") {
	  	assert(("fieldChosen" in finishData) && (finishData.fieldChosen == "your" || finishData.fieldChosen == "enemy")
	  		&& finishData.cardId);

	  	let playerStateCurr;
	  	let playerStateCurrEnemy;
	  	if (finishData.fieldChosen == "your") {
	  		assert(playerState.cardsOnFieldArr.length > 1);
	  		assert(card.cardId != finishData.cardId);
	  		playerStateCurr = playerState;
	  		playerStateCurrEnemy = playerStateEnemy;
	  	} else {
				assert(playerStateEnemy.cardsOnFieldArr.length > 0);
	  		playerStateCurr = playerStateEnemy;
	  		playerStateCurrEnemy = playerState;

  			let availableTargets = [];
		    playerStateEnemy.cardsOnFieldArr.forEach(function(cardOnField) {
		      if (cardOnField.cardEffect.effect == "taunt") {
		        availableTargets.push(cardOnField);
		      }
		    });

		    let canDestroyCard = false;
		    if (availableTargets.length > 0) {
		      availableTargets.forEach(function(cardTarget) {
		        if (finishData.cardId == cardTarget.cardId) {
		          canDestroyCard = true;
		        }
		      });
		    } else {
		      canDestroyCard = true;
		    }

		    assert(canDestroyCard);
	  	}

	  	let cardSelected;
	  	let cardIdx = null;
	  	for (let i = 0; i < playerStateCurr.cardsOnFieldArr.length; i++) {
	  		if (playerStateCurr.cardsOnFieldArr[i].cardId == finishData.cardId) {
	  			cardSelected = playerStateCurr.cardsOnFieldArr[i];
	  			cardIdx = playerStateCurr.cardsOnFieldArr.length - i - 1;

	  			var selectable = false;
    			cardSelected.cardAttributes.forEach(function(attribute) {
						if (card.cardEffect.allowedAttributes.includes(attribute)) {
							selectable = true;
						}
					});

					assert(selectable);
	  		}
	  	}

			assert(cardSelected);
			assert(cardIdx != null && cardIdx >= 0);

			checkForEnergyReturn(ctx, card,
				cardSelected.cardEffect.effectChargesCount - cardSelected.cardEffect.chargesUsedTotal - card.cardEffect.effectValue);
			cardSelected.cardEffect.effectChargesCount -= card.cardEffect.effectValue;

			playerStateCurr.cardsExpired = [];

			let cardsOnFieldCopy = playerStateCurr.cardsOnFieldArr.slice().reverse();

			await checkIfCardExpired(cardSelected, cardIdx, playerStateCurr, playerStateCurrEnemy, cardsOnFieldCopy);
			card.finishData = {
				fieldChosen: finishData.fieldChosen,
				cardChosen: cardSelected,
			};
	  }

	  if ("effectChargesCount" in card.cardEffect && card.cardEffect.chargesUsedTotal >= card.cardEffect.effectChargesCount) {
			card.cardEffect.isFinished = true;
			playerState.cardsOnFieldArr.splice(ctx.cardIdx, 1);
			await putCardInGraveyard(card, playerState);
		} else {
			if ("energyPerUseIncrement" in card.cardEffect) {
				let operator = card.cardEffect.energyPerUseIncrement.charAt(0);
				let incrementValue = card.cardEffect.energyPerUseIncrement.substr(1);
		  	card.cardEffect.energyPerUse = updateFieldValue[operator](card.cardEffect.energyPerUse, incrementValue);
	  	}
	  }

	  playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});
	},
	rollDiceBoardHook: async (ctx, overwriteParams) => {
		let gameState = ctx.gameplayData.gameState;

	  let boardPath = gameState.boardData.boardDataPlayers.boardPath;
	  let boardMatrix = gameState.boardData.boardMatrix;
	  let yourUserId = ctx.session.userData.userId;
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
    let successfullyMoved = true;
    gameState.playersState[ctx.session.userData.userId].lastBoardIndex = currBoardIndex;

    if (ctx.roomData.player1Id == ctx.session.userData.userId) {
    	if (!gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
    		if (moveIfCan)
    		{
      		successfullyMoved = moveBoardForwardIfCan(ctx, rollDiceValue);
    		} else {
    			moveBoardForward(ctx, rollDiceValue);
    		}
    	} else if (gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
    		if (moveIfCan)
    		{
    			successfullyMoved = moveBoardBackwardsIfCan(ctx, rollDiceValue);
    		} else {
    			moveBoardBackwards(ctx, rollDiceValue);
    		}
    	}
    } else if (ctx.roomData.player2Id == ctx.session.userData.userId) {
    	if (!gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
    		if (moveIfCan)
    		{
      		successfullyMoved = moveBoardBackwardsIfCan(ctx, rollDiceValue);
      	} else {
      		moveBoardBackwards(ctx, rollDiceValue);
      	}
    	} else if (gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll) {
    		if (moveIfCan)
    		{
    			successfullyMoved = moveBoardForwardIfCan(ctx, rollDiceValue);
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

    	if (gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCountBackward > 0) {
    		gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCountBackward--;
    		if (gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCountBackward > 0) {
    			gameState.playersState[ctx.session.userData.userId].moveBackwardsOnNextRoll = true;
    		}
    	}
    }

    let rowIndex = boardPath[currBoardIndex][0];
    let columnIndex = boardPath[currBoardIndex][1];

    let onSameBoardSpace = currBoardIndex == gameState.playersState[ctx.session.userData.userId].lastBoardIndex ? true : false;

    if (!onSameBoardSpace) {
    	let canActivateSpecialBoardSpaces = true;
  		gameState.playersState[ctx.session.userData.userId].cardsOnFieldArr.forEach(function(card) {
  			if (card.cardEffect.effect == "nullifyAllSpecialBoardSpaces") {
  				canActivateSpecialBoardSpaces = false;
  			}
  		});

 			if (canActivateSpecialBoardSpaces) {
    		checkForSpecialBoardSpace(ctx, rowIndex, columnIndex);
 			}
    }

   	if (checkWin(ctx)) {
      ctx.gameplayData.gameState.playerIdWinGame = ctx.session.userData.userId;
      let playerIdLose = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;

      let success;
      await pg.pool.query('BEGIN');
      try {
      	success = await self.winGame(ctx, ctx.session.userData.userId, playerIdLose, ctx.roomData.id);
      	assert(success);

      	await pg.pool.query('COMMIT');
      } catch(err) {
      	await pg.pool.query('ROLLBACK');
      	logger.info("Failed to win game: %o", err);
      }

      assert(success === true);
    }

    ctx.session.userData.userId = yourUserId;

    return successfullyMoved;
	},
	discardCardHook: async (ctx, card) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];

		playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});
	},
	activePlayerHook: async (ctx, card) => {
		let gameState = ctx.gameplayData.gameState;

    let currPlayerId = gameState.currPlayerId;
    let notCurrPlayerId = currPlayerId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;

		if (gameState.playersState[notCurrPlayerId].canRollDiceBoardCount > 0
			|| gameState.playersState[notCurrPlayerId].cardsToDraw > 0
			|| gameState.playersState[notCurrPlayerId].cardsToDiscard > 0
			|| gameState.playersState[notCurrPlayerId].cardsToDrawFromEnemyHand > 0
			|| gameState.playersState[notCurrPlayerId].cardsToDestroyFromEnemyField > 0
			|| gameState.playersState[notCurrPlayerId].cardsToTakeFromYourGraveyard > 0
			|| gameState.playersState[notCurrPlayerId].cardsToTakeFromEnemyGraveyard > 0
			|| gameState.playersState[notCurrPlayerId].cardsSummonConstraints.cardsCanSummonAny) {
			ctx.gameplayData.gameState.activePlayerId = notCurrPlayerId;
			ctx.sessions[notCurrPlayerId].pausedTimer = false;
			ctx.sessions[currPlayerId].pausedTimer = true;
		} else {
			ctx.gameplayData.gameState.activePlayerId = currPlayerId;
			ctx.sessions[notCurrPlayerId].pausedTimer = true;
			ctx.sessions[currPlayerId].pausedTimer = false;
		}
	},
	drawCardFromEnemyHandHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];

		playerState.cardsInHandArr = utils.shuffle(playerState.cardsInHandArr);

		playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});
	},
	preDestroyCardFromEnemyFieldHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];

	  let availableTargets = [];
    playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
      if (card.cardEffect.effect == "taunt") {
        availableTargets.push(card);
      }
    });

    let canDestroyCard = false;
    if (availableTargets.length > 0) {
      availableTargets.forEach(function(card) {
        if (ctx.data.cardId == card.cardId) {
          canDestroyCard = true;
        }
      });
    } else {
      canDestroyCard = true;
    }

    assert(canDestroyCard);
	},
	destroyCardFromEnemyFieldHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];

		playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});
	},
	takeCardFromGraveyardHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];

		if (playerState.cardsToTakeFromYourGraveyard <= 0 && playerState.cardsToTakeFromEnemyGraveyard <= 0) {
			let cardsOnFieldCopy = playerState.cardsOnFieldArr.slice().reverse();
			for (let i = 0; i < cardsOnFieldCopy.length; i++) {
			  if (!cardsOnFieldCopy[i].cardEffect.continuous
			  	&& playerState.cardsToTakeFromYourGraveyard <= 0
			  	&& playerState.cardsToTakeFromEnemyGraveyard <= 0
			  	&& ((cardsOnFieldCopy[i].cardEffect.effect == "takeCardFromYourGraveyard")
			  		|| (cardsOnFieldCopy[i].cardEffect.effect == "discardCardTakeCardFromYourGraveyard")
			  		|| (cardsOnFieldCopy[i].cardEffect.effect == "takeCardFromEnemyGraveyard"))) {
			  	await putCardInGraveyard(cardsOnFieldCopy[i], playerState);
			  	playerState.cardsOnFieldArr.splice(cardsOnFieldCopy.length - 1 - i, 1);
			  }
			}
		}

		playerState.cardsInHandArr = utils.shuffle(playerState.cardsInHandArr);

		playerState.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsInHandArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});

		playerState.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerState);
		});

		playerStateEnemy.cardsOnFieldArr.forEach(function(card) {
    	updateCardEffectValueStatus(card, playerStateEnemy);
		});
	},
	winGame: async (ctx, playerIdWin, playerIdLose, roomId) => {
	  let queryStatus = await pg.pool.query(`

	    UPDATE games
	    SET status_id = 2,
	      winning_player_id = $1,
	      finished_at = now()
	    WHERE room_id = $2
	      AND status_id = 1
	    RETURNING id

	  `, [ playerIdWin, roomId ]);

	  if (queryStatus.rowCount != 1) {
	  	return false;
	  }

		let playerWinXp = await calculateXp(ctx, playerIdWin, playerIdWin);
		let playerLoseXp = await calculateXp(ctx, playerIdLose, playerIdWin);

	  await updateUserLevelStatus(ctx, playerIdWin, playerIdWin, playerWinXp);
	  await updateUserLevelStatus(ctx, playerIdLose, playerIdWin, playerLoseXp);

	  return true;
	},
};

let moveBoardForwardIfCan = (ctx, count) => {
	let currBoardIndex = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex;

	if (ctx.gameplayData.gameState.boardData.boardDataPlayers.boardPath[currBoardIndex + count]) {
  	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex = currBoardIndex + count;
  	return true;
	}

	return false;
};

let moveBoardBackwardsIfCan = (ctx, count) => {
	let currBoardIndex = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex;

	if (currBoardIndex - count >= 0) {
  	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].currBoardIndex = currBoardIndex - count;
  	return true;
	}

	return false;
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
  } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ROLL_AGAIN_BACKWARDS_1) {
  	rollAgainBackwards(ctx, 1);
  } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ROLL_AGAIN_BACKWARDS_2) {
  	rollAgainBackwards(ctx, 2);
  } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ROLL_AGAIN_BACKWARDS_3) {
  	rollAgainBackwards(ctx, 3);
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

let rollAgainBackwards = (ctx, count) => {
	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].rollAgain = true;
	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCount += count;
	ctx.gameplayData.gameState.playersState[ctx.session.userData.userId].canRollDiceBoardCountBackward += count;
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

let updateFieldValue = {
	'+': function (x, y) { return (+x) + (+y); },
	'-': function (x, y) { return (+x) - (+y); },
	'x': function (x, y) { return (+x) * (+y); },
};

let updateEnergyReturnedValueBoardSpaces = {
	'+': function(card, value) {
		return (card.cardEffect.energyPerUse - 1)
			- (Math.floor((value - 1) / card.cardEffect.effectValueOriginal) * card.cardEffect.energyReturnedPerLowerTierUsed);
	},
	'x': function(card, value) {
		let energyReturned = -1;
		let efffectRange = card.cardEffect.effectValueOriginal;

		console.log('efffectRange: ' + efffectRange);
		console.log('value: ' + value);

		for (let i = 0; i < card.cardEffect.chargesUsedTotal; i++) {
			console.log('for loop effectRange: ' + efffectRange);
			if (value <= efffectRange) {
				energyReturned++;
			}

			efffectRange *= card.cardEffect.effectValueOriginal;
		}

		console.log('energyReturned: ' + energyReturned);

		return energyReturned * card.cardEffect.energyReturnedPerLowerTierUsed;
	},
};

let checkIfCardExpired = async (card, cardIdx, playerState, playerStateEnemy, cardsOnFieldArrCopy) => {
	if (card.cardEffect.chargesUsedTotal >= card.cardEffect.effectChargesCount) {
		await putCardInGraveyard(card, playerState);
 		playerState.cardsOnFieldArr.splice(cardsOnFieldArrCopy.length - 1 - cardIdx, 1);
		playerState.cardsExpired.push(card);

		if ("effectExpire" in card.cardEffect) {
			assert("effectValueExpire" in card.cardEffect);

			if (card.cardEffect.effectExpire == "drawCardFromDeckYou") {
				playerState.cardsToDraw += card.cardEffect.effectValueExpire;
			} else if (card.cardEffect.effectExpire == "increaseMaxEnergy") {
				playerState.maxEnergyPoints += card.cardEffect.effectValueExpire;
			} else if (card.cardEffect.effectExpire == "discardCardEnemy") {
				if (playerStateEnemy.cardsInHand - playerStateEnemy.cardsToDiscard - card.cardEffect.effectValueExpire >= 0) {
					playerStateEnemy.cardsToDiscard += card.cardEffect.effectValueExpire;
				} else {
					playerStateEnemy.cardsToDiscard = playerStateEnemy.cardsInHand;
				}
			}
		}

		return true;
	}

	return false;
};

let updateCardEffectValueStatus = (card, playerState) => {
	if (("effectValueIncrement" in card.cardEffect) && (!("effectValueDependentOn" in card.cardEffect))) {
  	assert(card.cardEffect.effectValueIncrement.match(/[+\-x]\d+/));
		assert("effectValueOriginal" in card.cardEffect);
		assert("effectValueMax" in card.cardEffect);
  	assert("effectValueIncrementCondition" in card.cardEffect);
		assert("effectValueIncrementConditionFilter" in card.cardEffect);

  	let operator = card.cardEffect.effectValueIncrement.charAt(0);
  	let incrementValue = card.cardEffect.effectValueIncrement.substr(1);

  	let forEveryCount;
  	if (card.cardEffect.effectValueIncrementCondition == "cardsInYourGraveyard") {
  		forEveryCount = playerState.cardsInGraveyardArr.length
  	} else if (card.cardEffect.effectValueIncrementCondition == "totalUsedCharges") {
  		forEveryCount = card.cardEffect.chargesUsedTotal ? card.cardEffect.chargesUsedTotal : 0;
  	}

  	assert((forEveryCount !== null) && (forEveryCount !== undefined));

		if (card.cardEffect.effectValueIncrementConditionFilter.match(/every\d+/)) {
			let everyCount = card.cardEffect.effectValueIncrementConditionFilter.substr(5);
			let resultValue = (Math.floor(forEveryCount / everyCount));

			if (operator == "x") {
				let loopsCount = resultValue;
				resultValue = 1;

				for (let i = 0; i < loopsCount; i++) {
					resultValue *= card.cardEffect.effectValueOriginal;
				}

				if (resultValue == 0) {
					resultValue = 1;
				}
			} else {
				resultValue *= incrementValue;
			}

			card.cardEffect.effectValue = updateFieldValue[operator](card.cardEffect.effectValueOriginal, resultValue);

			if (card.cardEffect.effectValue > card.cardEffect.effectValueMax) {
				card.cardEffect.effectValue = card.cardEffect.effectValueMax;
			}

			card.cardText = card.cardTextOriginal.replace(/\|X\|/, card.cardEffect.effectValue);
		}
	}

	if ("energyPerUseIncrement" in card.cardEffect) {
		assert(card.cardEffect.effectValueIncrement.match(/[+\-x]\d+/));
		assert("energyPerUseOriginal" in card.cardEffect);
		assert("energyPerUseMax" in card.cardEffect);
		assert("energyPerUseIncrementCondition" in card.cardEffect);
		assert("energyPerUseIncrementConditionFilter" in card.cardEffect);

		let operator = card.cardEffect.energyPerUseIncrement.charAt(0);
		let incrementValue = card.cardEffect.energyPerUseIncrement.substr(1);

  	let forEveryCount;
  	if (card.cardEffect.energyPerUseIncrementCondition == "totalUsedCharges") {
  		forEveryCount = card.cardEffect.chargesUsedTotal ? card.cardEffect.chargesUsedTotal : 0;
  	}

  	assert((forEveryCount !== null) && (forEveryCount !== undefined));

		if (card.cardEffect.energyPerUseIncrementConditionFilter.match(/every\d+/)) {
			let everyCount = card.cardEffect.energyPerUseIncrementConditionFilter.substr(5);
			let resultValue = Math.floor(forEveryCount / everyCount);

			if (operator == "x") {
				let loopsCount = resultValue;
				resultValue = 1;

				for (let i = 0; i < loopsCount; i++) {
					resultValue *= card.cardEffect.energyPerUseOriginal;
				}

				if (resultValue == 0) {
					resultValue = 1;
				}
			} else {
				resultValue *= incrementValue;
			}

			card.cardEffect.energyPerUse = updateFieldValue[operator](card.cardEffect.energyPerUseOriginal, resultValue);

			if (card.cardEffect.energyPerUse > card.cardEffect.energyPerUseMax) {
				card.cardEffect.energyPerUse = card.cardEffect.energyPerUseMax;
			}
		}
	}

	if ("costIncrement" in card.cardEffect) {
		assert(card.cardEffect.costIncrement.match(/[+\-x]\d+/));
		assert("cardCostOriginal" in card);
		assert("costMax" in card.cardEffect);
		assert("costIncrementCondition" in card.cardEffect);
		assert("costIncrementConditionFilter" in card.cardEffect);

		let operator = card.cardEffect.costIncrement.charAt(0);
		let incrementValue = card.cardEffect.costIncrement.substr(1);

  	let forEveryCount;
  	if (card.cardEffect.costIncrementCondition == "cardsInYourGraveyard") {
  		forEveryCount = playerState.cardsInGraveyardArr.length;
  	}

  	assert((forEveryCount !== null) && (forEveryCount !== undefined));

		if (card.cardEffect.costIncrementConditionFilter.match(/every\d+/)) {
			let everyCount = card.cardEffect.costIncrementConditionFilter.substr(5);
			let resultValue = (Math.floor(forEveryCount / everyCount)) * incrementValue;

			if (operator == "x" && resultValue == 0) {
				resultValue = 1;
			}

			card.cardCost = updateFieldValue[operator](card.cardCostOriginal, resultValue);

			if (card.cardCost > card.cardEffect.costMax) {
				card.cardCost = card.cardEffect.costMax;
			}
		}
	}
};

let checkForEnergyReturn = (ctx, card, chosenValue) => {
	let energyReturned;
	let playerState = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId];

	if ((!"energyReturnedPerLowerTierUsed" in card.cardEffect) || (!"effectValueIncrement" in card.cardEffect))
	{
		return;
	}

	let operator = card.cardEffect.effectValueIncrement.charAt(0);

	if (card.cardEffect.effect == "copySpecialSpacesUpTo") {
		energyReturned = updateEnergyReturnedValueBoardSpaces[operator](card, chosenValue);
	} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToEnemy") {
		energyReturned = updateEnergyReturnedValueBoardSpaces[operator](card, chosenValue);
	} else if (card.cardEffect.effect == "decreaseChargesContinousCardAll") {
		if (chosenValue < 0) {
			energyReturned = Math.abs(chosenValue);
		}
	}

	if (energyReturned && energyReturned > 0) {
		if ((playerState.energyPoints + energyReturned) > playerState.maxEnergyPoints) {
			playerState.energyPoints = playerState.maxEnergyPoints;
		} else {
			playerState.energyPoints += energyReturned;
		}
	}
};

let checkForEmptyBoardSpaces = (ctx, cardValue, userId) => {
	let gameState = ctx.gameplayData.gameState;
	let playerState = gameState.playersState[userId];
  let boardPath = gameState.boardData.boardDataPlayers.boardPath;
  let boardMatrix = gameState.boardData.boardMatrix;
  let currBoardIndex = gameState.playersState[userId].currBoardIndex;

	let availableSpaces = false;
	if (userId == ctx.roomData.player1Id) {
		for(let i = 1; i <= cardValue; i++) {
			if ((currBoardIndex + i) > (boardPath.length - 1)) {
				break;
			} else if (boardMatrix[boardPath[currBoardIndex + i][0]][boardPath[currBoardIndex + i][1]] == 1) {
				availableSpaces = true;
				break;
			}
		}
	} else {
		for(let i = 1; i <= cardValue; i++) {
			if ((currBoardIndex - i) < 0) {
				break;
			} else if (boardMatrix[boardPath[currBoardIndex - i][0]][boardPath[currBoardIndex - i][1]] == 1) {
				availableSpaces = true;
				break;
			}
		}
	}

	assert(availableSpaces);
};

let checkForSpecialBoardSpaces = (ctx, cardValue, userId) => {
	let gameState = ctx.gameplayData.gameState;
	let playerState = gameState.playersState[userId];
  let boardPath = gameState.boardData.boardDataPlayers.boardPath;
  let boardMatrix = gameState.boardData.boardMatrix;
  let currBoardIndex = gameState.playersState[userId].currBoardIndex;

	let availableSpaces = false;
	if (userId == ctx.roomData.player1Id) {
		for(let i = 1; i <= cardValue; i++) {
			if ((currBoardIndex + i) > (boardPath.length - 1)) {
				break;
			} else if (boardMatrix[boardPath[currBoardIndex + i][0]][boardPath[currBoardIndex + i][1]] > 1) {
				availableSpaces = true;
				break;
			}
		}
	} else {
		for(let i = 1; i <= cardValue; i++) {
			if ((currBoardIndex - i) < 0) {
				break;
			} else if (boardMatrix[boardPath[currBoardIndex - i][0]][boardPath[currBoardIndex - i][1]] > 1) {
				availableSpaces = true;
				break;
			}
		}
	}

	assert(availableSpaces);
};

let putCardInGraveyard = async (card, playerState) => {
	let queryStatus = await utils.selectRowById({ table: 'cards', field: 'id', queryArg: card.cardId });
	let cardRow = queryStatus.rows[0];
	playerState.cardsInGraveyardArr.push({
		cardId: cardRow.id,
    cardName: cardRow.name,
    cardText: cardRow.description,
    cardTextOriginal: cardRow.description,
    cardImg: cardRow.image,
    cardRarity: cardRow.rarity_id,
    cardEffect: JSON.parse(cardRow.effect_json),
    cardCost: cardRow.cost,
    cardAttributes: cardRow.attributes,
    cardSounds: JSON.parse(cardRow.sounds_json),
  });
};

let calculateXp = async (ctx, userId, playerIdWon) => {
	let gameState = ctx.gameplayData.gameState;
	let playerState = gameState.playersState[userId];

	let xp = 0;
	if (playerIdWon == userId) {
		xp += 100;
	} else {
		xp += 50;
	}

	let xpPerTurn = 10;

	xp += (playerState.totalTurns) * xpPerTurn;

	let xpPerSpaceMoved = 0.5;
	let currBoardIndex = playerState.currBoardIndex;
	let spacesMoved = 0;
	if (userId == ctx.roomData.player1Id) {
		spacesMoved = currBoardIndex;
	} else {
		spacesMoved = gameState.boardData.boardDataPlayers.boardPath.length - currBoardIndex - 1;
	}

	xp += Math.ceil(xpPerSpaceMoved * spacesMoved);

	return xp;
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

let updateUserLevelStatus = async (ctx, userId, userIdWin, xpGain) => {
	let queryStatus = await pg.pool.query(`

		SELECT * FROM users WHERE id = $1

	`, [userId]);

	assert(queryStatus.rowCount == 1);

	let userRow = queryStatus.rows[0];

	if ((userRow.current_level_xp + xpGain) < userRow.max_level_xp) {
		userRow.current_level_xp += xpGain;
	} else if ((userRow.current_level_xp + xpGain) >= userRow.max_level_xp) {
		userRow.current_level_xp = userRow.current_level_xp + xpGain - userRow.max_level_xp;
		userRow.max_level_xp = Math.floor(userRow.max_level_xp * 1.1);
		userRow.level++;
	}

	if (userId == userIdWin) {
		userRow.wins_count++;
	} else {
		userRow.loses_count++;
	}

	queryStatus = await pg.pool.query(`

		UPDATE users
		SET level = $1,
			current_level_xp = $2,
			max_level_xp = $3,
			wins_count = $4,
			loses_count = $5
		WHERE
			id = $6

	`, [userRow.level,
			userRow.current_level_xp,
			userRow.max_level_xp,
			userRow.wins_count,
			userRow.loses_count,
			userId]);

	assert(queryStatus.rowCount == 1);
};