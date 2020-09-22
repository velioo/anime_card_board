const logger = require('../helpers/logger');
const pg = require('../db/pg');
const utils = require('../helpers/utils');

const assert = require('assert');
const {
  TURN_PHASES,
  CARD_RARITIES,
  BOARD_FIELDS,
  BOARD_FIELDS_TIERS,
  DIRECTIONS,
} = require('../constants/constants');
const SCHEMAS = require('../schemas/schemas');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, $data: true, jsonPointers: true });
const ajvErrors = require('ajv-errors')(ajv);

var self = module.exports = {
	startGameCharacterEffectsHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let player1State = gameState.playersState[ctx.roomData.player1Id];
		let player2State = gameState.playersState[ctx.roomData.player2Id];

		applyCharacterEffect(ctx, player1State, ctx.roomData.player1Character);
		applyCharacterEffect(ctx, player2State, ctx.roomData.player2Character);
	},
	initValidateData: async (ctx, command) => {
    assert(ctx.session.userData && ctx.session.userData.userId);
   	ctx.data.roomId = parseInt(ctx.data.roomId);
   	ctx.data.cardId = parseInt(ctx.data.cardId);
    ctx.data.cardIdx = parseInt(ctx.data.cardIdx);
    ctx.data.playerIdGraveyard = parseInt(ctx.data.playerIdGraveyard);

   	const isSchemaValid = ajv.validate(SCHEMAS[command], ctx.data);
   	assert(isSchemaValid);

    let queryStatus = await utils.lockRowById({ table: 'games', field: 'room_id', queryArg: ctx.data.roomId });

    assert(queryStatus.rows[0].player1_id == ctx.session.userData.userId
      || queryStatus.rows[0].player2_id == ctx.session.userData.userId);

    ctx.gameplayData = JSON.parse(queryStatus.rows[0].data_json);
    ctx.roomData = JSON.parse(queryStatus.rows[0].room_data_json);
    ctx.cardsInDeckArr = JSON.parse(queryStatus.rows[0].deck_json);

    let gameState = ctx.gameplayData.gameState;
    let playerState = gameState.playersState[ctx.session.userData.userId];
    let yourUserId = ctx.session.userData.userId;
    let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
    let playerStateEnemy = gameState.playersState[enemyUserId];

    if (gameState.nextPhase != TURN_PHASES.DRAW) {
    	assert(gameState.activePlayerId == yourUserId);
    }

    switch(command) {
    	case "DRAW_CARD":
    		assert(playerState.cardsToDraw > 0);
    		assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));
    		break;
    	case "DRAW_PHASE":
    		assert(gameState.currPlayerId == yourUserId);
      	assert(gameState.nextPhase == TURN_PHASES.DRAW);
    		assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));
    		break;
    	case "STANDBY_PHASE":
	      assert(gameState.currPlayerId == yourUserId);
	      assert(gameState.nextPhase == TURN_PHASES.STANDBY);
    		assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));
    		break;
    	case "MAIN_PHASE":
	      assert(gameState.currPlayerId == yourUserId);
	      assert(gameState.nextPhase == TURN_PHASES.MAIN);
    		assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));
    		break;
    	case "SUMMON_CARD":
    		{
		      assert(playerState.cardsOnFieldArr.length
		        < playerState.maxCardsOnField);
		      assert(playerState.cardsSummonConstraints.cardsCanSummonAny
		        || ((playerState.chainObj.cardsToChain) && (playerState.chainObj.cardsToChain.length > 0)));

		      playerState.cardsOnFieldArr.forEach(function(card, cardIdx) {
		        assert(card.cardId != ctx.data.cardId);
		      });

		      let cardSelected = playerState.cardsInHandArr[ctx.data.cardIdx];
		      assert(cardSelected && (cardSelected.cardId == ctx.data.cardId));

		      assert(playerState.energyPoints >= cardSelected.cardCost);
		      playerState.energyPoints -= cardSelected.cardCost;

		      switch(cardSelected.cardRarity) {
		        case CARD_RARITIES.COMMON:
		          assert(playerState.cardsSummonConstraints.cardsCanSummonCommon);
		          playerState.cardsSummonedThisTurnCount.common++;
		          break;
		        case CARD_RARITIES.RARE:
		          assert(playerState.cardsSummonConstraints.cardsCanSummonRare);
		          playerState.cardsSummonedThisTurnCount.rare++;
		          break;
		        case CARD_RARITIES.EPIC:
		          assert(playerState.cardsSummonConstraints.cardsCanSummonEpic);
		          playerState.cardsSummonedThisTurnCount.epic++;
		          break;
		        default:
		          assert(0, "Invalid card rarity: " + cardRarity);
		          break;
		      }

		      if (playerState.chainObj && playerState.chainObj.cardsToChain
		        && playerState.chainObj.cardsToChain.length > 0) {
		        let canChainCard = false;
		        let cardChainIdx;
		        let cardsToChain = [];
		        playerState.chainObj.cardsToChain.forEach(function(card, cardIdx) {
		          if (card.cardId == cardSelected.cardId && !canChainCard) {
		            canChainCard = true;
		            cardChainIdx = cardIdx;
		            return;
		          }

		          if (card.cardCost <= playerState.energyPoints) {
		            cardsToChain.push(card);
		          }
		        });

		        assert(canChainCard && cardChainIdx >= 0);

		        playerState.chainObj.cardsToChain = cardsToChain;
		      }
		    }
	    	break;
	  	case "DRAW_CARD_FROM_ENEMY_HAND":
	      assert(playerState.cardsToDrawFromEnemyHand > 0);
	      assert((ctx.data.cardIdx >= 0) && (ctx.data.cardIdx < playerStateEnemy.cardsInHandArr.length));
	      assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));
    		break;
    	case "TAKE_CARD_FROM_GRAVEYARD":
	      assert(ctx.data.cardIdx >= 0);
	      assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));

	      if (ctx.data.playerIdGraveyard == yourUserId) {
	        assert(playerState.cardsToTakeFromYourGraveyard > 0);
	        assert(playerState.cardsInGraveyardArr.length > 0);
	        assert(ctx.data.cardIdx < playerState.cardsInGraveyardArr.length);
	      } else if (ctx.data.playerIdGraveyard == enemyUserId) {
	        assert(playerState.cardsToTakeFromEnemyGraveyard > 0);
	        assert(playerStateEnemy.cardsInGraveyardArr.length > 0);
	        assert(ctx.data.cardIdx < playerStateEnemy.cardsInGraveyardArr.length);
	      } else {
	        assert(0);
	      }
    		break;
    	case "DESTROY_CARD_FROM_ENEMY_FIELD":
	      assert(playerState.cardsToDestroyFromEnemyField > 0);
	      assert(playerStateEnemy.cardsOnFieldArr.length > 0);
	      assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));

	      await self.preDestroyCardFromEnemyFieldHook(ctx);

	      for (let i = 0; i < playerStateEnemy.cardsOnFieldArr.length; i++) {
	        if (playerStateEnemy.cardsOnFieldArr[i].cardId == ctx.data.cardId) {
	          ctx.cardToDestroy = playerStateEnemy.cardsOnFieldArr[i];
	          ctx.cardIdx = i;
	          break;
	        }
	      }

	      assert(ctx.cardToDestroy && ctx.cardIdx >= 0);
    		break;
    	case "ROLL_PHASE":
	      assert(gameState.currPlayerId == yourUserId);
	      assert(gameState.nextPhase == TURN_PHASES.ROLL);
	      assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));
    		break;
    	case "ROLL_DICE_BOARD":
      	assert(playerState.canRollDiceBoardCount > 0);
	      assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));

	      if (gameState.nextPhase == TURN_PHASES.ROLL) {
	        assert(playerState.canRollDiceBoardInRollPhase);
	      }
    		break;
    	case "END_PHASE":
	      assert(gameState.currPlayerId == yourUserId);
	      assert(gameState.nextPhase == TURN_PHASES.END);
	      assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));
	      break;
	   	case "DISCARD_CARD":
	   	  assert(playerState.cardsToDiscard > 0);
	      assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));

	     	{
		      let cardSelected = playerState.cardsInHandArr[ctx.data.cardIdx];
		      assert(cardSelected && cardSelected.cardId == ctx.data.cardId);
		    }
	      break;
	   	case "FINISH_CARD":
	   	  assert(ctx.data.finishData);
	      assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));

	      for (let i = 0; i < playerState.cardsOnFieldArr.length; i++) {
	        if (playerState.cardsOnFieldArr[i].cardId == ctx.data.cardId) {
	          ctx.cardFinish = playerState.cardsOnFieldArr[i];
	          ctx.cardIdx = i;
	        }
	      }

	      assert(ctx.cardFinish);
	      assert(ctx.cardIdx >= 0);
	      assert((ctx.cardFinish.cardId == ctx.data.cardId) && (!ctx.cardFinish.cardEffect.isFinished));
	      break;
	   	case "ACTIVATE_CARD_EFFECT":
	      assert(gameState.currPlayerId == yourUserId);
	      assert(gameState.nextPhase == TURN_PHASES.ROLL);
	      assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));

	      for (let i = 0; i < playerState.cardsOnFieldArr.length; i++) {
	        if (playerState.cardsOnFieldArr[i].cardId == ctx.data.cardId) {
	          ctx.cardActivated = playerState.cardsOnFieldArr[i];
	          break;
	        }
	      }

	      assert(ctx.cardActivated);
	      assert((ctx.cardActivated.cardId == ctx.data.cardId) && (!ctx.cardActivated.cardEffect.isFinished));
	      break;
	   	case "FINISH_CARD_CONTINUOUS":
	   		assert(ctx.data.finishData);
	      assert((!playerState.chainObj.chainTrigger) && (!playerStateEnemy.chainObj.chainTrigger));

	      for (let i = 0; i < playerState.cardsOnFieldArr.length; i++) {
	        if (playerState.cardsOnFieldArr[i].cardId == ctx.data.cardId) {
	          ctx.cardFinishContinuous = playerState.cardsOnFieldArr[i];
	          ctx.cardIdx = i;
	        }
	      }

	      assert(ctx.cardFinishContinuous);
	      assert(ctx.cardIdx >= 0);
	      assert((ctx.cardFinishContinuous.cardId == ctx.data.cardId) && (!ctx.cardFinishContinuous.cardEffect.isFinished));
	      break;
	   	case "FINISH_CHAIN_EFFECT":
	   		assert(playerState.chainObj && playerState.chainObj.chainTrigger);
	      break;
    	default:
    		assert(0);
    }
	},
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

		  	await checkIfCardExpired(ctx, cardsOnFieldCopy[i], i, playerState, playerStateEnemy, cardsOnFieldCopy);
		  }
		}

		updateCardsStatus(ctx);
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

		  	await checkIfCardExpired(ctx, cardsOnFieldCopy[i], i, playerState, playerStateEnemy, cardsOnFieldCopy);
		  }
		}

		playerState.cardsSummonConstraints.cardsCanSummonAny = true;

		if ((playerState.energyPoints + playerState.energyPerTurnGain) > playerState.maxEnergyPoints) {
			playerState.energyPoints = playerState.maxEnergyPoints;
		} else {
			playerState.energyPoints += playerState.energyPerTurnGain;
		}

		updateCardsStatus(ctx);
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

		  	await checkIfCardExpired(ctx, cardsOnFieldCopy[i], i, playerState, playerStateEnemy, cardsOnFieldCopy);
		  }
		}

		playerState.cardsSummonConstraints.cardsCanSummonAny = false;

		playerState.canRollDiceBoardCount++;

		if (playerState.cardsInHand > playerState.maxCardsInHand) {
			playerState.cardsToDiscard += (playerState.cardsInHand - playerState.maxCardsInHand);
		}

		updateCardsStatus(ctx);
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

		  	await checkIfCardExpired(ctx, cardsOnFieldCopy[i], i, playerState, playerStateEnemy, cardsOnFieldCopy);
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

    updateCardsStatus(ctx);
	},
	drawCardHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let yourUserId = ctx.session.userData.userId;
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
			  	await self.putCardInGraveyard(ctx, cardsOnFieldCopy[i].cardId, playerState);
			  	playerState.cardsOnFieldArr.splice(cardsOnFieldCopy.length - 1 - i, 1);
			  }
			}
		}

		let playerCharacter = yourUserId == ctx.roomData.player1Id ? ctx.roomData.player1Character : ctx.roomData.player2Character;
		if (playerCharacter.characterEffect.effect == "increaseContinuousFieldCardsCharges") {
			if (ctx.cardDrawn.cardAttributes.includes("field")) {
				ctx.cardDrawn.cardEffect.effectChargesCount += playerCharacter.characterEffect.effectValue;
			}
		}

		updateCardsStatus(ctx);
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
				await self.putCardInGraveyard(ctx, card.cardId, playerState);
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
		  } else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialYou") {
		  	let closestBoardSpaceBoardForwardSpacesCount = 0;
		  	let closestBoardSpaceBoardBackwardSpacesCount = 0;
		  	let closestBoardSpaceForwardAvailable = false;
		  	let closestBoardSpaceBackwardAvailable = false;

				for(let i = currBoardIndexYou + 1; i < boardPath.length; i++) {
					closestBoardSpaceBoardForwardSpacesCount++;
					if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > BOARD_FIELDS.NORMAL) {
						closestBoardSpaceForwardAvailable = true;
						break;
					}
				}

				for(let i = currBoardIndexYou - 1; i >= 0; i--) {
					closestBoardSpaceBoardBackwardSpacesCount++;
					if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > BOARD_FIELDS.NORMAL) {
						closestBoardSpaceBackwardAvailable = true;
						break;
					}
				}

				assert((closestBoardSpaceForwardAvailable && closestBoardSpaceBoardForwardSpacesCount > 0)
					|| (closestBoardSpaceBackwardAvailable && closestBoardSpaceBoardBackwardSpacesCount > 0));

				card.cardEffect.specialBoardSpaceForwardAvailable = closestBoardSpaceForwardAvailable;
				card.cardEffect.specialBoardSpaceBackwardAvailable = closestBoardSpaceBackwardAvailable;
		  } else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialEnemy") {
		  	let closestBoardSpaceBoardForwardSpacesCount = 0;
		  	let closestBoardSpaceBoardBackwardSpacesCount = 0;
		  	let closestBoardSpaceForwardAvailable = false;
		  	let closestBoardSpaceBackwardAvailable = false;

				for(let i = currBoardIndexEnemy + 1; i < boardPath.length; i++) {
					closestBoardSpaceBoardForwardSpacesCount++;
					if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > BOARD_FIELDS.NORMAL) {
						closestBoardSpaceForwardAvailable = true;
						break;
					}
				}

				for(let i = currBoardIndexEnemy - 1; i >= 0; i--) {
					closestBoardSpaceBoardBackwardSpacesCount++;
					if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > BOARD_FIELDS.NORMAL) {
						closestBoardSpaceBackwardAvailable = true;
						break;
					}
				}

				assert((closestBoardSpaceForwardAvailable && closestBoardSpaceBoardForwardSpacesCount > 0)
					|| (closestBoardSpaceBackwardAvailable && closestBoardSpaceBoardBackwardSpacesCount > 0));

				card.cardEffect.specialBoardSpaceForwardAvailable = closestBoardSpaceForwardAvailable;
				card.cardEffect.specialBoardSpaceBackwardAvailable = closestBoardSpaceBackwardAvailable;
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
		  } else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceYou") {
		  	assert(boardMatrix[boardPath[currBoardIndexYou][0]][boardPath[currBoardIndexYou][1]] > BOARD_FIELDS.NORMAL);
		  	checkForSpecialBoardSpace(ctx, boardPath[currBoardIndexYou][0], boardPath[currBoardIndexYou][1]);
		  } else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemy") {
		  	assert(boardMatrix[boardPath[currBoardIndexEnemy][0]][boardPath[currBoardIndexEnemy][1]] > BOARD_FIELDS.NORMAL);
		  	ctx.session.userData.userId = enemyUserId;
		  	checkForSpecialBoardSpace(ctx, boardPath[currBoardIndexEnemy][0], boardPath[currBoardIndexEnemy][1]);
		  	ctx.session.userData.userId = yourUserId;
		  } else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemyYou") {
		  	assert(boardMatrix[boardPath[currBoardIndexEnemy][0]][boardPath[currBoardIndexEnemy][1]] > BOARD_FIELDS.NORMAL);
		  	checkForSpecialBoardSpace(ctx, boardPath[currBoardIndexEnemy][0], boardPath[currBoardIndexEnemy][1]);

		  	if (playerState.chainObj && playerState.chainObj.cardsToChain) {
		  		playerState.chainObj.nullifySpecialBoardSpace = true;
		  	}
		  } else if (card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceYouEnemy") {
		  	assert(boardMatrix[boardPath[currBoardIndexYou][0]][boardPath[currBoardIndexYou][1]] > BOARD_FIELDS.NORMAL);
		  	ctx.session.userData.userId = enemyUserId;
		  	checkForSpecialBoardSpace(ctx, boardPath[currBoardIndexYou][0], boardPath[currBoardIndexYou][1]);
		  	ctx.session.userData.userId = yourUserId;

		  	if (playerState.chainObj && playerState.chainObj.cardsToChain) {
		  		playerState.chainObj.nullifySpecialBoardSpace = true;
		  	}
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
		  } else if (card.cardEffect.effect == "chooseAttributeVariation2") {
		  	playerState.cardsToDraw += card.cardEffect.effectValue;
		  } else if (card.cardEffect.effect == "destroySpecialBoardSpacesAllRadius") {
		  	assert(playerState.energyPoints >= card.cardEffect.effectValue);

		  	let availableSpace = false;
		  	let maxRadius = Math.floor(playerState.energyPoints / card.cardEffect.effectValue);
		  	let minEnergyToUse = 0;
		  	let maxEnergyToUse = 0;

		  	if (isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexYou][0]][boardPath[currBoardIndexYou][1]])) {
		  		availableSpace = true;
		  		minEnergyToUse = card.cardEffect.effectValue;
		  		maxEnergyToUse = card.cardEffect.effectValue;
		  	}

		  	for(let i = 1; i <= maxRadius; i++) {
					if ((currBoardIndexYou + i) > (boardPath.length - 1)) {
						break;
					} else if (isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexYou + i][0]][boardPath[currBoardIndexYou + i][1]])) {
						availableSpace = true;
						minEnergyToUse = minEnergyToUse || (i * card.cardEffect.effectValue);
						maxEnergyToUse = (i * card.cardEffect.effectValue);
					}
				}

				for(let i = 1; i <= maxRadius; i++) {
					if ((currBoardIndexYou - i) < 0) {
						break;
					} else if (isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexYou - i][0]][boardPath[currBoardIndexYou - i][1]])) {
						availableSpace = true;
						minEnergyToUse = minEnergyToUse || (i * card.cardEffect.effectValue);

						if (maxEnergyToUse < (i * card.cardEffect.effectValue)) {
							maxEnergyToUse = (i * card.cardEffect.effectValue);
						}
					}
				}

				assert(availableSpace);
				assert(minEnergyToUse > 0);
				assert(maxEnergyToUse > 0);

				card.cardEffect.minEnergyToUse = minEnergyToUse;
				card.cardEffect.maxEnergyToUse = maxEnergyToUse;
		  } else if (card.cardEffect.effect == "moveSpecialBoardSpace") {
		  	var availableSpecialSpace = false;
		  	var availableEmptySpace = false;
				for(var i = 0; i < boardPath.length; i++) {
					if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > BOARD_FIELDS.NORMAL) {
						availableSpecialSpace = true;
					} else if (boardMatrix[boardPath[i][0]][boardPath[i][1]] == BOARD_FIELDS.NORMAL) {
						availableEmptySpace = true;
					}

					if (availableSpecialSpace && availableEmptySpace) {
						break;
					}
				}

				assert(availableSpecialSpace && availableEmptySpace);
		  }
		} else {
			if (card.cardEffect.maxUsesPerTurn) {
				card.cardEffect.activationsCountThisTurn = 0;
			}

			if (card.cardEffect.effectChargesCount) {
				card.cardEffect.chargesUsedTotal = 0;
			}
		}

		updateCardsStatus(ctx);

		playerStateEnemy.cardsOnFieldArr.forEach(function(_card) {
			if (_card.cardEffect.effect == "nullifyCardsFieldSummon") {
				assert(!card.cardAttributes.includes("field"));
			}
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
    let currBoardIndexEnemy = gameState.playersState[enemyUserId].currBoardIndex;

    await self.putCardInGraveyard(ctx, card.cardId, playerState);

		if (card.cardEffect.effect == "moveSpacesForwardUpTo") {
			assert((finishData.effectValueChosen > 0) && (finishData.effectValueChosen <= card.cardEffect.effectValue));
			card.cardEffect.effectValueChosen = finishData.effectValueChosen;
			await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValueChosen, moveIfCan: false });
	  } else if (card.cardEffect.effect == "moveSpacesBackwardsUpToEnemy") {
	  	assert((finishData.effectValueChosen > 0) && (finishData.effectValueChosen <= card.cardEffect.effectValue));
	  	card.cardEffect.effectValueChosen = finishData.effectValueChosen;
	  	await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValueChosen,
	  		userId: enemyUserId, moveBackwardsOnNextRoll: true, moveIfCan: false });
	  } else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToYou") {
	  	assert((finishData.effectValueChosen > 0) && (finishData.effectValueChosen <= card.cardEffect.effectValue));
	  	assert("moveBackward" in finishData);
	  	card.cardEffect.effectValueChosen = finishData.effectValueChosen;
	  	await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValueChosen,
	  		userId: yourUserId, moveBackwardsOnNextRoll: finishData.moveBackward, moveIfCan: false });
	  } else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToEnemy") {
	  	assert((finishData.effectValueChosen > 0) && (finishData.effectValueChosen <= card.cardEffect.effectValue));
	  	assert("moveBackward" in finishData);
	  	card.cardEffect.effectValueChosen = finishData.effectValueChosen;
	  	await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValueChosen,
	  		userId: enemyUserId, moveBackwardsOnNextRoll: finishData.moveBackward, moveIfCan: false });
	  } else if (card.cardEffect.effect.match("createSpecialBoardSpaceForwardTier")) {
	  	assert((finishData.rowIndex >= 0) && (finishData.columnIndex >= 0)
				&& (finishData.rowIndex <= (boardMatrix.length - 1))
				&& (finishData.columnIndex <= (boardMatrix[0].length - 1)));
			assert(boardMatrix[finishData.rowIndex][finishData.columnIndex] == BOARD_FIELDS.NORMAL);
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
			assert(boardMatrix[finishData.rowIndex][finishData.columnIndex] > BOARD_FIELDS.NORMAL);

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
			card.cardEffect.successfullyGuessed = false;

			if (finishData.chosenAttribute == "field") {
				if (lastCardDrawn.cardAttributes.includes("field")) {
					await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValue1_MoveSpacesForward,
	  				userId: yourUserId, moveBackwardsOnNextRoll: false, moveIfCan: true });

					card.cardEffect.moveSpaces = card.cardEffect.effectValue1_MoveSpacesForward;
					card.cardEffect.successfullyGuessed = true;
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
					card.cardEffect.successfullyGuessed = true;
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
					card.cardEffect.successfullyGuessed = true;
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
		} else if (card.cardEffect.effect == "chooseAttributeVariation2") {
			assert(finishData.chosenAttribute);

			let lastCardDrawn = playerState.cardsInHandArr[playerState.cardsInHandArr.length - 1];
			card.cardEffect.successfullyGuessed = false;

			if (finishData.chosenAttribute == "field") {
				if (lastCardDrawn.cardAttributes.includes("field")) {
					await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValue1_MoveSpacesBackwardEnemy,
	  				userId: enemyUserId, moveBackwardsOnNextRoll: true, moveIfCan: true });

					card.cardEffect.moveSpaces = card.cardEffect.effectValue1_MoveSpacesBackwardEnemy;
					card.cardEffect.successfullyGuessed = true;
				} else {
					await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValue1_MoveSpacesForwardEnemy,
	  				userId: enemyUserId, moveBackwardsOnNextRoll: false, moveIfCan: true });

					card.cardEffect.moveSpaces = card.cardEffect.effectValue1_MoveSpacesForwardEnemy;
				}
			} else if (finishData.chosenAttribute == "cards") {
				if (lastCardDrawn.cardAttributes.includes("cards")) {
					if ((playerStateEnemy.cardsInHand - playerStateEnemy.cardsToDiscard - card.cardEffect.effectValue2_DiscardCardsEnemy) >= 0) {
						playerStateEnemy.cardsToDiscard += card.cardEffect.effectValue2_DiscardCardsEnemy;
					} else {
						playerStateEnemy.cardsToDiscard = playerStateEnemy.cardsInHand;
					}

					card.cardEffect.cardsToDiscard = true;
					card.cardEffect.successfullyGuessed = true;
				} else {
					playerStateEnemy.cardsToDraw += card.cardEffect.effectValue2_DrawCardsFromDeckEnemy;
					card.cardEffect.cardsToDraw = true;
				}
			} else if (finishData.chosenAttribute == "energy") {
				if (lastCardDrawn.cardAttributes.includes("energy")) {
					if ((playerStateEnemy.maxEnergyPoints - card.cardEffect.effectValue3_DecreaseMaxEnergyEnemy) < playerStateEnemy.minMaxEnergyPoints) {
						playerStateEnemy.maxEnergyPoints = playerStateEnemy.minMaxEnergyPoints;
					} else {
						playerStateEnemy.maxEnergyPoints -= card.cardEffect.effectValue3_DecreaseMaxEnergyEnemy;
					}

					if ((playerStateEnemy.energyPoints - card.cardEffect.effectValue3_EnergyLoseEnemy) < 0) {
						playerStateEnemy.energyPoints = 0;
					} else {
						playerStateEnemy.energyPoints -= card.cardEffect.effectValue3_EnergyLoseEnemy;
					}

					card.cardEffect.loseEnergy = true;
					card.cardEffect.successfullyGuessed = true;
				} else {
					if ((playerStateEnemy.energyPoints + card.cardEffect.effectValue3_EnergyGainEnemy) > playerStateEnemy.maxEnergyPoints) {
						playerStateEnemy.energyPoints = playerStateEnemy.maxEnergyPoints;
					} else {
						playerStateEnemy.energyPoints += card.cardEffect.effectValue3_EnergyGainEnemy;
					}

					card.cardEffect.gainEnergy = true;
				}
			}

			assert(card.cardEffect.moveSpaces || card.cardEffect.cardsToDraw
				|| card.cardEffect.cardsToDiscard || card.cardEffect.gainEnergy || card.cardEffect.loseEnergy);
		} else if (card.cardEffect.effect == "destroySpecialBoardSpacesAllRadius") {
	  	assert((finishData.energyChosen >= card.cardEffect.effectValue)
	  		&& (finishData.energyChosen % card.cardEffect.effectValue == 0)
	  		&& (finishData.energyChosen >= card.cardEffect.minEnergyToUse));
	  	assert(playerState.energyPoints >= finishData.energyChosen);

	  	playerState.energyPoints -= finishData.energyChosen;

	  	let availableSpace = false;
	  	let maxRadius = finishData.energyChosen / card.cardEffect.effectValue;
	  	let destroyedBoardSpacesPositions = [];

	  	if (isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexYou][0]][boardPath[currBoardIndexYou][1]])) {
	  		availableSpace = true;
	  		destroyedBoardSpacesPositions.push({ rowIndex: boardPath[currBoardIndexYou][0], columnIndex: boardPath[currBoardIndexYou][1] });
	  		boardMatrix[boardPath[currBoardIndexYou][0]][boardPath[currBoardIndexYou][1]] = BOARD_FIELDS.NORMAL;
	  	}

	  	for(let i = 1; i <= maxRadius; i++) {
				if ((currBoardIndexYou + i) > (boardPath.length - 1)) {
					break;
				} else if (isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexYou + i][0]][boardPath[currBoardIndexYou + i][1]])) {
					availableSpace = true;
					destroyedBoardSpacesPositions.push({ rowIndex: boardPath[currBoardIndexYou + i][0],
						columnIndex: boardPath[currBoardIndexYou + i][1] });
					boardMatrix[boardPath[currBoardIndexYou + i][0]][boardPath[currBoardIndexYou + i][1]] = BOARD_FIELDS.NORMAL;
				}
			}

			for(let i = 1; i <= maxRadius; i++) {
				if ((currBoardIndexYou - i) < 0) {
					break;
				} else if (isSpecialBoardSpaceNegative(boardMatrix[boardPath[currBoardIndexYou - i][0]][boardPath[currBoardIndexYou - i][1]])) {
					availableSpace = true;
					destroyedBoardSpacesPositions.push({ rowIndex: boardPath[currBoardIndexYou - i][0],
						columnIndex: boardPath[currBoardIndexYou - i][1] });
					boardMatrix[boardPath[currBoardIndexYou - i][0]][boardPath[currBoardIndexYou - i][1]] = BOARD_FIELDS.NORMAL;
				}
			}

			assert(availableSpace);

			card.finishData = {
				destroyedBoardSpacesPositions: destroyedBoardSpacesPositions,
			};
		} else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialYou") {
			assert("moveBackward" in finishData);

	  	let closestBoardSpaceBoardForwardSpacesCount = 0;
	  	let closestBoardSpaceBoardBackwardSpacesCount = 0;
	  	let closestBoardSpaceForwardAvailable = false;
	  	let closestBoardSpaceBackwardAvailable = false;

			for(let i = currBoardIndexYou + 1; i < boardPath.length; i++) {
				closestBoardSpaceBoardForwardSpacesCount++;
				if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > BOARD_FIELDS.NORMAL) {
					closestBoardSpaceForwardAvailable = true;
					break;
				}
			}

			for(let i = currBoardIndexYou - 1; i >= 0; i--) {
				closestBoardSpaceBoardBackwardSpacesCount++;
				if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > BOARD_FIELDS.NORMAL) {
					closestBoardSpaceBackwardAvailable = true;
					break;
				}
			}

			let moveSpaces;
			let goBackward = false;
			if (yourUserId == ctx.roomData.player1Id) {
				if (finishData.moveBackward) {
					assert(closestBoardSpaceBackwardAvailable && closestBoardSpaceBoardBackwardSpacesCount > 0);
					moveSpaces = closestBoardSpaceBoardBackwardSpacesCount;
					goBackward = true;
				} else {
					assert(closestBoardSpaceForwardAvailable && closestBoardSpaceBoardForwardSpacesCount > 0);
					moveSpaces = closestBoardSpaceBoardForwardSpacesCount;
					goBackward = false;
				}
			} else {
				if (finishData.moveBackward) {
					assert(closestBoardSpaceForwardAvailable && closestBoardSpaceBoardForwardSpacesCount > 0);
					moveSpaces = closestBoardSpaceBoardForwardSpacesCount;
					goBackward = true;
				} else {
					assert(closestBoardSpaceBackwardAvailable && closestBoardSpaceBoardBackwardSpacesCount > 0);
					moveSpaces = closestBoardSpaceBoardBackwardSpacesCount;
					goBackward = false;
				}
			}

			assert(moveSpaces && moveSpaces > 0);

			await self.rollDiceBoardHook(ctx, { rollDiceValue: moveSpaces,
	  		userId: yourUserId, moveBackwardsOnNextRoll: goBackward, moveIfCan: false });

			card.finishData = {
				moveSpaces: moveSpaces,
			};
		} else if (card.cardEffect.effect == "moveSpacesClosestBoardSpaceSpecialEnemy") {
			assert("moveBackward" in finishData);

			let closestBoardSpaceBoardForwardSpacesCount = 0;
	  	let closestBoardSpaceBoardBackwardSpacesCount = 0;
	  	let closestBoardSpaceForwardAvailable = false;
	  	let closestBoardSpaceBackwardAvailable = false;

			for(let i = currBoardIndexEnemy + 1; i < boardPath.length; i++) {
				closestBoardSpaceBoardForwardSpacesCount++;
				if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > BOARD_FIELDS.NORMAL) {
					closestBoardSpaceForwardAvailable = true;
					break;
				}
			}

			for(let i = currBoardIndexEnemy - 1; i >= 0; i--) {
				closestBoardSpaceBoardBackwardSpacesCount++;
				if (boardMatrix[boardPath[i][0]][boardPath[i][1]] > BOARD_FIELDS.NORMAL) {
					closestBoardSpaceBackwardAvailable = true;
					break;
				}
			}

			let moveSpaces;
			let goBackward = false;
			if (enemyUserId == ctx.roomData.player1Id) {
				if (finishData.moveBackward) {
					assert(closestBoardSpaceBackwardAvailable && closestBoardSpaceBoardBackwardSpacesCount > 0);
					moveSpaces = closestBoardSpaceBoardBackwardSpacesCount;
					goBackward = true;
				} else {
					assert(closestBoardSpaceForwardAvailable && closestBoardSpaceBoardForwardSpacesCount > 0);
					moveSpaces = closestBoardSpaceBoardForwardSpacesCount;
					goBackward = false;
				}
			} else {
				if (finishData.moveBackward) {
					assert(closestBoardSpaceForwardAvailable && closestBoardSpaceBoardForwardSpacesCount > 0);
					moveSpaces = closestBoardSpaceBoardForwardSpacesCount;
					goBackward = true;
				} else {
					assert(closestBoardSpaceBackwardAvailable && closestBoardSpaceBoardBackwardSpacesCount > 0);
					moveSpaces = closestBoardSpaceBoardBackwardSpacesCount;
					goBackward = false;
				}
			}

			assert(moveSpaces && moveSpaces > 0);

			await self.rollDiceBoardHook(ctx, { rollDiceValue: moveSpaces,
	  		userId: enemyUserId, moveBackwardsOnNextRoll: goBackward, moveIfCan: false });

			card.finishData = {
				moveSpaces: moveSpaces,
			};
		} else if (card.cardEffect.effect == "moveSpecialBoardSpace") {
			assert((finishData.moveFromRowIndex >= 0) && (finishData.moveFromColumnIndex >= 0)
				&& (finishData.moveFromRowIndex <= (boardMatrix.length - 1))
				&& (finishData.moveFromColumnIndex <= (boardMatrix[0].length - 1)));
			assert((finishData.moveToRowIndex >= 0) && (finishData.moveToColumnIndex >= 0)
				&& (finishData.moveToRowIndex <= (boardMatrix.length - 1))
				&& (finishData.moveToColumnIndex <= (boardMatrix[0].length - 1)));
			assert(boardMatrix[finishData.moveFromRowIndex][finishData.moveFromColumnIndex] > BOARD_FIELDS.NORMAL);
			assert(boardMatrix[finishData.moveToRowIndex][finishData.moveToColumnIndex] == BOARD_FIELDS.NORMAL);
			assert((finishData.moveToRowIndex != finishData.moveFromRowIndex)
				|| (finishData.moveToColumnIndex != finishData.moveFromColumnIndex));

			boardMatrix[finishData.moveToRowIndex][finishData.moveToColumnIndex]
				= boardMatrix[finishData.moveFromRowIndex][finishData.moveFromColumnIndex];
			boardMatrix[finishData.moveFromRowIndex][finishData.moveFromColumnIndex] = BOARD_FIELDS.NORMAL;

			let spaceType = utils.getKeyByValue(BOARD_FIELDS, boardMatrix[finishData.moveToRowIndex][finishData.moveToColumnIndex]);
			assert(spaceType);

			card.finishData = {
				moveToRowIndex: finishData.moveToRowIndex,
				moveToColumnIndex: finishData.moveToColumnIndex,
				spaceType: spaceType,
				moveFromRowIndex: finishData.moveFromRowIndex,
				moveFromColumnIndex: finishData.moveFromColumnIndex,
			};
		}

		updateCardsStatus(ctx);
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
		} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToYou") {
		} else if (card.cardEffect.effect == "decreaseChargesContinousCardAll") {
			assert((playerState.cardsOnFieldArr.length > 1) || (playerStateEnemy.cardsOnFieldArr.length > 0));
		}

		updateCardsStatus(ctx);

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
			assert(boardMatrix[finishData.rowIndex][finishData.columnIndex] > BOARD_FIELDS.NORMAL);

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
	  } else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToYou") {
	  	assert((finishData.effectValueChosen > 0) && (finishData.effectValueChosen <= card.cardEffect.effectValue));
	  	assert("moveBackward" in finishData);
	  	card.cardEffect.effectValueChosen = finishData.effectValueChosen;
	  	await self.rollDiceBoardHook(ctx, { rollDiceValue: card.cardEffect.effectValueChosen,
	  		userId: yourUserId, moveBackwardsOnNextRoll: finishData.moveBackward, moveIfCan: false });

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

			await checkIfCardExpired(ctx, cardSelected, cardIdx, playerStateCurr, playerStateCurrEnemy, cardsOnFieldCopy);
			card.finishData = {
				fieldChosen: finishData.fieldChosen,
				cardChosen: cardSelected,
			};
	  }

	  if ("effectChargesCount" in card.cardEffect && card.cardEffect.chargesUsedTotal >= card.cardEffect.effectChargesCount) {
			card.cardEffect.isFinished = true;
			playerState.cardsOnFieldArr.splice(ctx.cardIdx, 1);
			await self.putCardInGraveyard(ctx, card.cardId, playerState);
		} else {
			if ("energyPerUseIncrement" in card.cardEffect) {
				let operator = card.cardEffect.energyPerUseIncrement.charAt(0);
				let incrementValue = card.cardEffect.energyPerUseIncrement.substr(1);
		  	card.cardEffect.energyPerUse = updateFieldValue[operator](card.cardEffect.energyPerUse, incrementValue);
	  	}
	  }

	  updateCardsStatus(ctx);
	},
	rollDiceBoardHook: async (ctx, overwriteParams) => {
		let gameState = ctx.gameplayData.gameState;

	  let boardPath = gameState.boardData.boardDataPlayers.boardPath;
	  let boardMatrix = gameState.boardData.boardMatrix;
	  let yourUserId = ctx.session.userData.userId;
	  let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
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
		} else {
			let playerCharacter = yourUserId == ctx.roomData.player1Id ? ctx.roomData.player1Character : ctx.roomData.player2Character;

			if ((playerCharacter.characterEffect.effect == "rollDiceAgainForwardOnNumber")
				&& (rollDiceValue == playerCharacter.characterEffect.rollDiceAgainForwardNumber)
				&& (!gameState.playersState[yourUserId].moveBackwardsOnNextRoll)) {
				gameState.playersState[yourUserId].canRollDiceBoardCount += playerCharacter.characterEffect.effectValue;
				gameState.playersState[yourUserId].rollAgain = true;
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
	    let currPlayerId = gameState.currPlayerId;
	    let playerIdMovedOnBoard = ctx.session.userData.userId;

			let cardsToChainYou = [];
			gameState.playersState[yourUserId].cardsInHandArr.forEach(function(card) {
				let canChainCard = canChainCardSpecialBoardSpace(ctx, card, yourUserId, playerIdMovedOnBoard);

				if (canChainCard) {
					cardsToChainYou.push(card);
				}
			});

			let cardsToChainEnemy = [];
			gameState.playersState[enemyUserId].cardsInHandArr.forEach(function(card) {
				let canChainCard = canChainCardSpecialBoardSpace(ctx, card, enemyUserId, playerIdMovedOnBoard);

				if (canChainCard) {
					cardsToChainEnemy.push(card);
				}
			});

			if ((cardsToChainYou.length > 0) || (cardsToChainEnemy.length > 0)) {
				if (cardsToChainYou.length > 0) {
					gameState.playersState[yourUserId].chainObj = {
						playerIdBoardSpace: ctx.session.userData.userId,
						rowIndex: rowIndex,
						columnIndex: columnIndex,
						cardsToChain: cardsToChainYou,
						chainTrigger: "movedToSpecialBoardSpace",
						nullifySpecialBoardSpace: false,
					};
				}

				if (cardsToChainEnemy.length > 0) {
					gameState.playersState[enemyUserId].chainObj = {
						playerIdBoardSpace: ctx.session.userData.userId,
						rowIndex: rowIndex,
						columnIndex: columnIndex,
						cardsToChain: cardsToChainEnemy,
						chainTrigger: "movedToSpecialBoardSpace",
						nullifySpecialBoardSpace: false,
					};
				}
			} else {
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

		updateCardsStatus(ctx);
	},
	activePlayerHook: async (ctx, card) => {
		let gameState = ctx.gameplayData.gameState;

    let currPlayerId = gameState.currPlayerId;
    let notCurrPlayerId = currPlayerId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;

		if ((gameState.playersState[notCurrPlayerId].canRollDiceBoardCount > 0
			|| gameState.playersState[notCurrPlayerId].cardsToDraw > 0
			|| gameState.playersState[notCurrPlayerId].cardsToDiscard > 0
			|| gameState.playersState[notCurrPlayerId].cardsToDrawFromEnemyHand > 0
			|| gameState.playersState[notCurrPlayerId].cardsToDestroyFromEnemyField > 0
			|| gameState.playersState[notCurrPlayerId].cardsToTakeFromYourGraveyard > 0
			|| gameState.playersState[notCurrPlayerId].cardsToTakeFromEnemyGraveyard > 0
			|| gameState.playersState[notCurrPlayerId].cardsSummonConstraints.cardsCanSummonAny
			|| (gameState.playersState[notCurrPlayerId].chainObj
				&& gameState.playersState[notCurrPlayerId].chainObj.chainTrigger))
			&& (!(gameState.playersState[currPlayerId].chainObj
					&& gameState.playersState[currPlayerId].chainObj.chainTrigger)
				|| ((gameState.playersState[notCurrPlayerId].chainObj
						&& gameState.playersState[notCurrPlayerId].chainObj.chainTrigger)
					&& (gameState.playersState[notCurrPlayerId].chainObj.playerIdBoardSpace &&
						gameState.playersState[notCurrPlayerId].chainObj.playerIdBoardSpace == notCurrPlayerId)))) {
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

		updateCardsStatus(ctx);
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

		updateCardsStatus(ctx);
	},
	takeCardFromGraveyardHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let yourUserId = ctx.session.userData.userId;
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
			  	await self.putCardInGraveyard(ctx, cardsOnFieldCopy[i].cardId, playerState);
			  	playerState.cardsOnFieldArr.splice(cardsOnFieldCopy.length - 1 - i, 1);
			  }
			}
		}

		playerState.cardsInHandArr = utils.shuffle(playerState.cardsInHandArr);

		let playerCharacter = yourUserId == ctx.roomData.player1Id ? ctx.roomData.player1Character : ctx.roomData.player2Character;
		if (playerCharacter.characterEffect.effect == "increaseContinuousFieldCardsCharges") {
			if (gameState.cardTakenFromGraveyard.cardAttributes.includes("field")) {
				gameState.cardTakenFromGraveyard.cardEffect.effectChargesCount += playerCharacter.characterEffect.effectValue;
			}
		}

		updateCardsStatus(ctx);
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

	  let playerWinRow = await updateUserLevelStatus(ctx, playerIdWin, playerIdWin, playerWinXp);
	  let playerLoseRow = await updateUserLevelStatus(ctx, playerIdLose, playerIdWin, playerLoseXp);

	  ctx.roomData.player1StatusRow = playerIdWin == ctx.roomData.player1Id ? playerWinRow : playerLoseRow;
		ctx.roomData.player2StatusRow = playerIdWin == ctx.roomData.player2Id ? playerWinRow : playerLoseRow;

	  return true;
	},
	putCardInGraveyard: async (ctx, cardId, playerState) => {
		let queryStatus = await utils.selectRowById({ table: 'cards', field: 'id', queryArg: cardId });
		let cardRow = queryStatus.rows[0];

		var cardEffect = JSON.parse(cardRow.effect_json);
		cardEffect.effectValueOriginal = cardEffect.effectValue;

		if (cardEffect.continuous) {
	  	cardEffect.energyPerUseOriginal = cardEffect.energyPerUse;
	  }

		playerState.cardsInGraveyardArr.push({
			cardId: cardRow.id,
	    cardName: cardRow.name,
	    cardText: cardRow.description,
	    cardTextOriginal: cardRow.description,
	    cardImg: cardRow.image,
	    cardRarity: cardRow.rarity_id,
	    cardEffect: cardEffect,
	    cardCost: cardRow.cost,
	    cardCostOriginal: cardRow.cost,
	    cardAttributes: cardRow.attributes,
	    cardSounds: JSON.parse(cardRow.sounds_json),
	  });
	},
	chainFinishHook: async (ctx) => {
		let gameState = ctx.gameplayData.gameState;
		let boardPath = gameState.boardData.boardDataPlayers.boardPath;
		let boardMatrix = gameState.boardData.boardMatrix;
		let playerState = gameState.playersState[ctx.session.userData.userId];
		let yourUserId = ctx.session.userData.userId;
		let enemyUserId = ctx.session.userData.userId == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;
		let playerStateEnemy = gameState.playersState[enemyUserId];
		let chainObj = playerState.chainObj;
		let chainObjEnemy = playerStateEnemy.chainObj;

		ctx.session.userData.userId = chainObj.playerIdBoardSpace;

		if ((chainObj.chainTrigger == "movedToSpecialBoardSpace")) {
			if (chainObj.nullifySpecialBoardSpace && chainObjEnemy.chainTrigger) {
				chainObjEnemy.nullifySpecialBoardSpace = chainObj.nullifySpecialBoardSpace;
			}

			if (!chainObj.nullifySpecialBoardSpace && (!chainObjEnemy.chainTrigger)) {
				assert((chainObj.rowIndex >= 0) && (chainObj.columnIndex >= 0)
					&& (chainObj.rowIndex <= (boardMatrix.length - 1))
					&& (chainObj.columnIndex <= (boardMatrix[0].length - 1)));
				checkForSpecialBoardSpace(ctx, chainObj.rowIndex, chainObj.columnIndex);
			}
		}

		ctx.session.userData.userId = yourUserId;
		playerState.chainObj = {};

		updateCardsStatus(ctx);
	},
	generateRandomBoard: (ctx, boardData) => {
		let cols = boardData.columns;
		let rows = boardData.rows;
		let boardMatrix = [];
		let boardDataPlayers = { player1StartBoardIndex: 0, boardPath: [] };

		for (let row = 0; row < rows; row++) {
			boardMatrix[row] = [];
			for (let col = 0; col < cols; col++) {
				boardMatrix[row][col] = 0;
			}
		}

		let boardStartPositionRow = utils.getRandomInt(0, rows - 1);
		let boardStartPositionCol = 0;
		boardDataPlayers.boardPath[0] = [boardStartPositionRow, boardStartPositionCol];
		boardMatrix[boardStartPositionRow][boardStartPositionCol] = generateRandomBoardSpace();

		let currBoardIndex = 1;
		let canMoveUp = true;
		let canMoveRight = true;
		let canMoveDown = true;
		let canMoveLeft = true;

		while(1) {
			let randNum = utils.getRandomInt(1, 4);

			let prevRow = boardDataPlayers.boardPath[currBoardIndex - 1][0];
			let prevCol = boardDataPlayers.boardPath[currBoardIndex - 1][1];
			let movedCurrLoop = false;

			switch(randNum) {
				case DIRECTIONS.UP:
					if (!canMoveUp
						|| (prevRow <= 0)
						|| (boardMatrix[prevRow - 1][prevCol] > 0)
						|| (((prevCol - 1) >= 0) && (boardMatrix[prevRow - 1][prevCol - 1] > 0))
						|| (((prevCol + 1) < cols) && (boardMatrix[prevRow - 1][prevCol + 1] > 0))
						|| ((prevRow - 2 >= 0) && (boardMatrix[prevRow - 2][prevCol] > 0))) {
						canMoveUp = false;
						break;
					}
 
					boardDataPlayers.boardPath[currBoardIndex] = [ prevRow - 1, prevCol ];

					boardMatrix[prevRow - 1][prevCol] = generateRandomBoardSpace();

					currBoardIndex++;
					movedCurrLoop = true;
					break;
				case DIRECTIONS.RIGHT:
					if (!canMoveRight
						|| (prevCol >= (cols - 1))
						|| (boardMatrix[prevRow][prevCol + 1] > 0)
						|| (((prevRow - 1) >= 0) && (boardMatrix[prevRow - 1][prevCol + 1] > 0))
						|| (((prevRow + 1) < rows) && (boardMatrix[prevRow + 1][prevCol + 1] > 0))
						|| ((prevCol + 2 < cols) && (boardMatrix[prevRow][prevCol + 2] > 0))) {
						canMoveRight = false;
						break;
					}

					boardDataPlayers.boardPath[currBoardIndex] = [ prevRow, prevCol + 1 ];
					boardMatrix[prevRow][prevCol + 1] = generateRandomBoardSpace();
					currBoardIndex++;
					movedCurrLoop = true;
					break;
				case DIRECTIONS.DOWN:
					if (!canMoveDown
						|| (prevRow >= (rows - 1))
						|| (boardMatrix[prevRow + 1][prevCol] > 0)
						|| (((prevCol - 1) >= 0) && (boardMatrix[prevRow + 1][prevCol - 1] > 0))
						|| (((prevCol + 1) < cols) && (boardMatrix[prevRow + 1][prevCol + 1] > 0))
						|| ((prevRow + 2 < rows) && (boardMatrix[prevRow + 2][prevCol] > 0))) {
						canMoveDown = false;
						break;
					}

					boardDataPlayers.boardPath[currBoardIndex] = [ prevRow + 1, prevCol ];
					boardMatrix[prevRow + 1][prevCol] = generateRandomBoardSpace();
					currBoardIndex++;
					movedCurrLoop = true;
					break;
				case DIRECTIONS.LEFT:
					if (!canMoveLeft
						|| (prevCol <= 0)
						|| (boardMatrix[prevRow][prevCol - 1] > 0)
						|| (((prevRow - 1) >= 0) && (boardMatrix[prevRow - 1][prevCol - 1] > 0))
						|| (((prevRow + 1) < rows) && (boardMatrix[prevRow + 1][prevCol - 1] > 0))
						|| ((prevCol - 2 >= 0) && (boardMatrix[prevRow][prevCol - 2] > 0))) {
						canMoveLeft = false;
						break;
					}

					boardDataPlayers.boardPath[currBoardIndex] = [ prevRow, prevCol - 1 ];
					boardMatrix[prevRow][ prevCol - 1] = generateRandomBoardSpace();
					currBoardIndex++;
					movedCurrLoop = true;
					break;
			}

			if (movedCurrLoop) {
				canMoveUp = true;
				canMoveRight = true;
				canMoveDown = true;
				canMoveLeft = true;
			}

			if (!canMoveUp && !canMoveRight && !canMoveDown && !canMoveLeft) {
				boardDataPlayers.player2StartBoardIndex = currBoardIndex - 1;
				break;
			}
		}

		return [boardMatrix, boardDataPlayers];
	},
};

let updateCardsStatus = function (ctx) {
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

	playerState.cardsInGraveyardArr.forEach(function(card) {
		if ("effectValueIncrement" in card.cardEffect) {
  		updateCardEffectValueStatus(card, playerState);
		}
	});

	playerStateEnemy.cardsInGraveyardArr.forEach(function(card) {
		if ("effectValueIncrement" in card.cardEffect) {
  		updateCardEffectValueStatus(card, playerStateEnemy);
		}
	});
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
	let gameState = ctx.gameplayData.gameState;
	let boardMatrix = gameState.boardData.boardMatrix;

	let activateNegativeBoardSpace = true;
	gameState.playersState[ctx.session.userData.userId].cardsOnFieldArr.forEach(function(card) {
		if (card.cardEffect.effect == "nullifyAllNegativeSpecialBoardSpaces") {
			if (isSpecialBoardSpaceNegative(boardMatrix[rowIndex][columnIndex])) {
				activateNegativeBoardSpace = false;
			}
		}
	});

	if (!activateNegativeBoardSpace) {
		return;
	}

	var boardFieldsFuncs = [rollAgain, rollAgainBackwards, cardDraw, cardDiscard, energyGain, energyLose];
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
  } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ENERGY_GAIN_1) {
  	energyGain(ctx, 1);
  } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ENERGY_GAIN_2) {
  	energyGain(ctx, 2);
  } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ENERGY_GAIN_3) {
  	energyGain(ctx, 3);
  } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ENERGY_LOSE_1) {
  	energyLose(ctx, 1);
  } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ENERGY_LOSE_2) {
  	energyLose(ctx, 2);
  } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.ENERGY_LOSE_3) {
  	energyLose(ctx, 3);
  } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.RANDOM_1) {
  	boardFieldsFuncs[randNum](ctx, 1);
  } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.RANDOM_2) {
  	boardFieldsFuncs[randNum](ctx, 2);
  } else if (boardMatrix[rowIndex][columnIndex] == BOARD_FIELDS.RANDOM_3) {
  	boardFieldsFuncs[randNum](ctx, 3);
  }
};

let rollAgain = (ctx, count) => {
	let playerState = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId];

	playerState.rollAgain = true;
	playerState.canRollDiceBoardCount += count;
};

let rollAgainBackwards = (ctx, count) => {
	let playerState = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId];

	playerState.rollAgain = true;
	playerState.canRollDiceBoardCount += count;
	playerState.canRollDiceBoardCountBackward += count;
	playerState.moveBackwardsOnNextRoll = true;
};

let cardDraw = (ctx, count) => {
	let playerState = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId];

	playerState.cardsToDraw += count;
};

let cardDiscard = (ctx, count) => {
	let playerState = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId];

	if (playerState.cardsInHand
		- playerState.cardsToDiscard - count >= 0) {
		playerState.cardsToDiscard += count;
	} else {
		playerState.cardsToDiscard
			= playerState.cardsInHand;
	}
};

let energyGain = (ctx, count) => {
	let playerState = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId];

	if ((playerState.energyPoints + count) > playerState.maxEnergyPoints) {
		playerState.energyPoints = playerState.maxEnergyPoints;
	} else {
		playerState.energyPoints += count;
	}
};

let energyLose = (ctx, count) => {
	let playerState = ctx.gameplayData.gameState.playersState[ctx.session.userData.userId];

	if ((playerState.energyPoints - count) < 0) {
		playerState.energyPoints = 0;
	} else {
		playerState.energyPoints -= count;
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

		for (let i = 0; i < card.cardEffect.chargesUsedTotal; i++) {
			if (value <= efffectRange) {
				energyReturned++;
			}

			efffectRange *= card.cardEffect.effectValueOriginal;
		}

		return energyReturned * card.cardEffect.energyReturnedPerLowerTierUsed;
	},
};

let checkIfCardExpired = async (ctx, card, cardIdx, playerState, playerStateEnemy, cardsOnFieldArrCopy) => {
	if (card.cardEffect.chargesUsedTotal >= card.cardEffect.effectChargesCount) {
		await self.putCardInGraveyard(ctx, card.cardId, playerState);
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
	} else if (card.cardEffect.effect == "moveSpacesForwardOrBackwardUpToYou") {
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
			} else if (boardMatrix[boardPath[currBoardIndex + i][0]][boardPath[currBoardIndex + i][1]] == BOARD_FIELDS.NORMAL) {
				availableSpaces = true;
				break;
			}
		}
	} else {
		for(let i = 1; i <= cardValue; i++) {
			if ((currBoardIndex - i) < 0) {
				break;
			} else if (boardMatrix[boardPath[currBoardIndex - i][0]][boardPath[currBoardIndex - i][1]] == BOARD_FIELDS.NORMAL) {
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
			} else if (boardMatrix[boardPath[currBoardIndex + i][0]][boardPath[currBoardIndex + i][1]] > BOARD_FIELDS.NORMAL) {
				availableSpaces = true;
				break;
			}
		}
	} else {
		for(let i = 1; i <= cardValue; i++) {
			if ((currBoardIndex - i) < 0) {
				break;
			} else if (boardMatrix[boardPath[currBoardIndex - i][0]][boardPath[currBoardIndex - i][1]] > BOARD_FIELDS.NORMAL) {
				availableSpaces = true;
				break;
			}
		}
	}

	assert(availableSpaces);
};

let isSpecialBoardSpaceNegative = (boardSpace) => {
	if ([
		BOARD_FIELDS.ROLL_AGAIN_BACKWARDS_1,
		BOARD_FIELDS.ROLL_AGAIN_BACKWARDS_2,
		BOARD_FIELDS.ROLL_AGAIN_BACKWARDS_3,
		BOARD_FIELDS.CARD_DISCARD_1,
		BOARD_FIELDS.CARD_DISCARD_2,
		BOARD_FIELDS.CARD_DISCARD_3,
		BOARD_FIELDS.ENERGY_LOSE_1,
		BOARD_FIELDS.ENERGY_LOSE_2,
		BOARD_FIELDS.ENERGY_LOSE_3,
		].includes(boardSpace)) {
		return true;
	}

	return false;
};

let canChainCardSpecialBoardSpace = (ctx, card, playerIdChain, playerIdMovedOnBoard) => {
	let gameState = ctx.gameplayData.gameState;
	let boardMatrix = gameState.boardData.boardMatrix;
	let boardPath = gameState.boardData.boardDataPlayers.boardPath;
	let currBoardIndex = gameState.playersState[playerIdMovedOnBoard].currBoardIndex;
  let rowIndex = boardPath[currBoardIndex][0];
  let columnIndex = boardPath[currBoardIndex][1];
  let playerIdOther = playerIdChain == ctx.roomData.player1Id ? ctx.roomData.player2Id : ctx.roomData.player1Id;

  let canChainCard = false;
  if ((boardMatrix[rowIndex][columnIndex] <= 1)
  	|| (card.cardCost > gameState.playersState[playerIdChain].energyPoints)
  	|| ((gameState.playersState[playerIdChain].cardsOnFieldArr.length + 1)
			> gameState.playersState[playerIdChain].maxCardsOnField)
  	|| !("chainTrigger" in card.cardEffect)
  	|| (card.cardEffect.chainTrigger != "movedToSpecialBoardSpace")) {
  	return false;
  }

	gameState.playersState[playerIdOther].cardsOnFieldArr.forEach(function(card, idx) {
		if ((card.cardEffect.effect == "nullifyCardsFieldSummon") && (card.cardAttributes.includes("field"))) {
			canChainCard = false;
		}
	});

  if (playerIdChain == playerIdMovedOnBoard) {
  	if ((card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceYou")
  		&& !((gameState.playersState[playerIdChain].cardsOnFieldArr
				.find(card => card.cardEffect.effect == "nullifyAllNegativeSpecialBoardSpaces"))
					&& (isSpecialBoardSpaceNegative(boardMatrix[rowIndex][columnIndex])))) {
  		canChainCard = true;
  	} else if ((card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceYouEnemy")
			&& !((gameState.playersState[playerIdOther].cardsOnFieldArr
				.find(card => card.cardEffect.effect == "nullifyAllNegativeSpecialBoardSpaces"))
					&& (isSpecialBoardSpaceNegative(boardMatrix[rowIndex][columnIndex])))) {
  		canChainCard = true;
  	}
  } else {
  	if ((card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemy")
  		&& !((gameState.playersState[playerIdOther].cardsOnFieldArr
				.find(card => card.cardEffect.effect == "nullifyAllNegativeSpecialBoardSpaces"))
				&& (isSpecialBoardSpaceNegative(boardMatrix[rowIndex][columnIndex])))) {
  		canChainCard = true;
  	} else if ((card.cardEffect.effect == "reapplyCurrentSpecialBoardSpaceEnemyYou")
			&& !((gameState.playersState[playerIdChain].cardsOnFieldArr
				.find(card => card.cardEffect.effect == "nullifyAllNegativeSpecialBoardSpaces"))
					&& (isSpecialBoardSpaceNegative(boardMatrix[rowIndex][columnIndex])))) {
  		canChainCard = true;
  	}
  }

  return canChainCard;
}

let applyCharacterEffect = (ctx, playerState, playerCharacter) => {
	switch(playerCharacter.characterEffect.effect) {
		case "energyPerTurnGain":
			playerState.energyPerTurnGain += playerCharacter.characterEffect.effectValue;
			break;
		case "startBoostCombination1":
			playerState.maxCardsInHand += playerCharacter.characterEffect.effectValue_IncreaseMaxCardsInHand;
			playerState.cardsToDraw += playerCharacter.characterEffect.effectValue_CardsToDraw;
			playerState.energyPoints += playerCharacter.characterEffect.effectValue_EnergyPoints;
			break;
		case "increaseMaxEnergy":
			playerState.maxEnergyPoints += playerCharacter.characterEffect.effectValue;
			break;
		default:
			break;
	}
};

let calculateXp = async (ctx, userId, playerIdWon) => {
	let gameState = ctx.gameplayData.gameState;
	let playerState = gameState.playersState[userId];

	let totalXp = 0;
	let xpGameResult;
	let xpWinGame = 100;
	let xpLoseGame = 50;

	if (playerIdWon == userId) {
		totalXp += xpWinGame;
		xpGameResult = xpWinGame;
	} else {
		totalXp += xpLoseGame;
		xpGameResult = xpLoseGame;
	}

	let xpPerTurn = 10;
	let xpFromTurns = (playerState.totalTurns) * xpPerTurn;

	totalXp += xpFromTurns;

	let xpPerSpaceMoved = 1;
	let currBoardIndex = playerState.currBoardIndex;
	let spacesMoved = 0;
	if (userId == ctx.roomData.player1Id) {
		spacesMoved = currBoardIndex;
		ctx.roomData.player1SpacesMoved = spacesMoved;
	} else {
		spacesMoved = gameState.boardData.boardDataPlayers.boardPath.length - currBoardIndex - 1;
		ctx.roomData.player2SpacesMoved = spacesMoved;
	}

	let xpFromSpacesTraveled = Math.ceil(xpPerSpaceMoved * spacesMoved);
	totalXp += xpFromSpacesTraveled;

	let xpPerCardUsed = 2;
	let xpFromCardsUsed = (playerState.totalCardsUsed) * xpPerCardUsed;

	totalXp += xpFromCardsUsed;

	if (userId == ctx.roomData.player1Id) {
		ctx.roomData.player1XpGain = totalXp;
		ctx.roomData.player1XpGainTurns = xpFromTurns;
		ctx.roomData.player1XpGainSpaces = xpFromSpacesTraveled;
		ctx.roomData.player1XpGainCardsUsed = xpFromCardsUsed;
		ctx.roomData.player1XpGainGameResult = xpGameResult;
	} else {
		ctx.roomData.player2XpGain = totalXp;
		ctx.roomData.player2XpGainTurns = xpFromTurns;
		ctx.roomData.player2XpGainSpaces = xpFromSpacesTraveled;
		ctx.roomData.player2XpGainCardsUsed = xpFromCardsUsed;
		ctx.roomData.player2XpGainGameResult = xpGameResult;
	}

	ctx.roomData.xpPerTurn = xpPerTurn;
	ctx.roomData.xpPerSpaceMoved = xpPerSpaceMoved;

	return totalXp;
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

	return userRow;
};

let generateRandomBoardSpace = () => {
	let randNum = utils.getRandomInt(0, 1);

	if (!randNum) {
		return 1;
	}

	let tiersCount = Object.keys(BOARD_FIELDS_TIERS).length;
	randNum = utils.getRandomInt(1, 100);

	if (randNum <= 10) {
		randNum = utils.getRandomInt(0, BOARD_FIELDS_TIERS[tiersCount].length - 1);
		return BOARD_FIELDS_TIERS[tiersCount][randNum];
	} else if (randNum <= 50) {
		randNum = utils.getRandomInt(0, BOARD_FIELDS_TIERS[tiersCount - 1].length - 1);
		return BOARD_FIELDS_TIERS[tiersCount - 1][randNum];
	} else {
		randNum = utils.getRandomInt(0, BOARD_FIELDS_TIERS[tiersCount - 2].length - 1);
		return BOARD_FIELDS_TIERS[tiersCount - 2][randNum];
	}
};