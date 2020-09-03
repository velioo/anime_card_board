var cardObjProperties = {
  "cardName": { "type": "string" },
  "cardText": { "type": "string" },
  "cardTextOriginal": { "type": "string" },
  "cardImg": { "type": "string" },
  "cardId": { "type": "integer" },
  "cardRarity": { "type": "string" },
  "cardEffect": { "type": "object" },
  "cardCost": { "type": "integer" },
  "cardAttributes": { "type": "array" },
};

var cardObjRequiredFields = [ "cardName", "cardText", "cardImg", "cardId", "cardRarity", "cardEffect", "cardCost", "cardAttributes" ];

var cardObj = {
	"type": "object",
  "properties": cardObjProperties,
 	"required": cardObjRequiredFields,
};

var startGameResponse = {
	"type": "object",
	"properties": {
		"errors" : {
			"type": "array",
			"items": {
				"type": "object",
				"properties": {
					"dataPath": { "type": "string", "pattern": "/.+"  },
					"message": { "type": "string" },
				},
				"required": [ "dataPath", "message" ]
			}
		},
		"isSuccessful": { "type": "boolean" },
		"roomData": {
			"type": "object",
			"properties": {
				"id": { "type": "integer" },
				"name": { "type": "string" },
				"player1Id": { "type": "integer" },
				"player2Id": { "type": "integer" },
				"player1Name": { "type": "string" },
				"player2Name": { "type": "string" },
				"player1Level": { "type": "integer" },
				"player2Level": { "type": "integer" },
				"player1CurrLevelXp": { "type": "integer" },
				"player2CurrLevelXp": { "type": "integer" },
				"player1MaxLevelXp": { "type": "integer" },
				"player2MaxLevelXp": { "type": "integer" },
			},
			"required": [ "id", "name", "player1Id", "player2Id", "player1Name",
				"player2Name", "player1Level", "player2Level", "player1CurrLevelXp",
				"player2CurrLevelXp", "player1MaxLevelXp", "player2MaxLevelXp" ],
		},
		"gameplayData": {
			"type": "object",
			"properties": {
				"gameState": {
					"type": "object",
					"properties": {
						"currPlayerId": { "type": "integer" },
						"roomId": { "type": "integer" },
						"boardData": {
							"type": "object",
							"properties": {
								"id": { "type": "integer" },
								"boardMatrix": { "type": "array" },
								"boardDataPlayers": { "type": "object" },
							},
						},
						"timerSeconds": { "type": "integer" },
						"nextPhase": { "type": "integer" },
						"playerIdDrawnCard": { "type": ["integer", "null"] },
						"playerIdSummonedCard": { "type": ["integer", "null"] },
						"cardSummoned": {
							"type": ["object", "null"],
							"properties": cardObjProperties,
							"required": cardObjRequiredFields,
						},
						"cardSummonedIdxInPlayerHand": { "type": ["integer", "null"] },
						"rollDiceBoard": {
							"type": "object",
							"properties": {
								"playerIdRollDice": { "type": ["integer", "null"] },
								"rollDiceValue": { "type": ["integer", "null"] },
							},
							"required": [ "playerIdRollDice", "rollDiceValue" ],
						},
						"rollDiceCard": {
							"type": "object",
							"properties": {
								"playerIdRollDice": { "type": ["integer", "null"] },
								"cardId": { "type": ["integer", "null"] },
								"rollDiceValue": { "type": ["integer", "null"] },
							},
							"required": [ "playerIdRollDice", "cardId", "rollDiceValue" ],
						},
						"playerIdDiscardedCard": { "type": ["integer", "null"] },
						"cardDiscarded": {
							"type": ["object", "null"],
							"properties": cardObjProperties,
							"required": cardObjRequiredFields,
						},
						"cardFinish": {
							"type": ["object", "null"],
							"properties": cardObjProperties,
							"required": cardObjRequiredFields,
						},
						"playerIdFinishCard": { "type": ["integer", "null"] },
						"cardActivated": {
							"type": ["object", "null"],
							"properties": cardObjProperties,
							"required": cardObjRequiredFields,
						},
						"playerIdActivatedCard": { "type": ["integer", "null"] },
						"cardFinishContinuous": {
							"type": ["object", "null"],
							"properties": cardObjProperties,
							"required": cardObjRequiredFields,
						},
						"playerIdFinishCardContinuous": { "type": ["integer", "null"] },
						"playerIdDrawnCardFromEnemyHand": { "type": ["integer", "null"] },
						"cardDrawnFromEnemyHand": {
							"type": ["object", "null"],
							"properties": cardObjProperties,
							"required": cardObjRequiredFields,
						},
						"playerIdDestroyedCardFromEnemyField": { "type": ["integer", "null"] },
						"cardDestroyedFromEnemyField": {
							"type": ["object", "null"],
							"properties": cardObjProperties,
							"required": cardObjRequiredFields,
						},
						"playerIdTakenCardFromGraveyard": { "type": ["integer", "null"] },
						"cardTakenFromGraveyard": {
							"type": ["object", "null"],
							"properties": cardObjProperties,
							"required": cardObjRequiredFields,
						},
						"activePlayerId": { "type": "integer" },
						"playerIdWinGame": { "type": ["integer", "null"] },
						"playersState": {
							"type": "object",
							"patternProperties": {
								"^[1-9]\\d*$": {
									"name": { "type": "string" },
									"currBoardIndex": { "type": "integer" },
									"lastBoardIndex": { "type": "integer" },
									"cardsInHand": { "type": "integer" },
									"cardsToDraw": { "type": "integer" },
									"cardsToDrawFromEnemyHand": { "type": "integer" },
									"cardsToDestroyFromEnemyField": { "type": "integer" },
									"cardsToTakeFromYourGraveyard": { "type": "integer" },
									"cardsToTakeFromEnemyGraveyard": { "type": "integer" },
									"playerIdGraveyard": { "type": ["integer", "null"] },
									"cardsSummonConstraints": {
										"type": "object",
										"properties": {
											"cardsCanSummonAny": { "type": "boolean" },
											"cardsCanSummonCommon": { "type": "boolean" },
											"cardsCanSummonRare": { "type": "boolean" },
											"cardsCanSummonEpic": { "type": "boolean" },
										},
									},
									"cardsSummonedThisTurnCount": {
										"type": "object",
										"properties": {
											"common": { "type": "integer" },
											"rare": { "type": "integer" },
											"epic": { "type": "integer" },
										},
									},
									"cardsOnFieldArr": {
										"type": "array",
										"items": cardObj,
									},
									"cardsInHandArr": { "type": "null" },
									"maxCardsOnField": { "type": "integer" },
									"canRollDiceBoardInRollPhase": { "type": "boolean" },
									"canRollDiceBoardCount": { "type": ["integer", "null"] },
									"canRollDiceBoardCountBackward": { "type": ["integer", "null"] },
									"rollAgain": { "type": "boolean" },
									"moveBackwards": { "type": ["boolean", "null"] },
									"moveBackwardsOnNextRoll": { "type": ["boolean", "null"] },
									"maxCardsInHand": { "type": "integer" },
									"cardsToDiscard": { "type": "integer" },
									"cardsInGraveyardArr": {
										"type": "array",
										"items": cardObj,
									},
									"energyPoints": { "type": "integer" },
									"maxEnergyPoints": { "type": "integer" },
									"minMaxEnergyPoints": { "type": "integer" },
									"energyPerTurnGain": { "type": "integer" },
									"energyRegen": { "type": "integer" },
									"cardsExpired": {
										"type": "array",
										"items": cardObj,
									},
									"canChainCards": { "type": "boolean", },
								},
							},
							"additionalProperties": false,
						},
					},
					"required": [ "currPlayerId", "roomId", "boardData", "timerSeconds", "playersState" ],
				},
			},
			"required": [ "gameState" ],
		},
		"cardsInHandArr": {
			"type": "array",
			"items": cardObj,
		},
	},
	"required": [ "errors", "isSuccessful", "gameplayData", "roomData", "cardsInHandArr" ],
};

var drawCardResponse = startGameResponse;
var drawPhaseResponse = startGameResponse;
var standByPhaseResponse = startGameResponse;
var mainPhaseResponse = startGameResponse;
var summonCardResponse = startGameResponse;
var rollPhaseResponse = startGameResponse;
var rollDiceBoardResponse = startGameResponse;
var endPhaseResponse = startGameResponse;
var discardCardResponse = startGameResponse;
var finishCardEffectResponse = startGameResponse;
// var winGameResponse = {
// 	"type": "object",
// 	"properties": {
// 		"errors" : {
// 			"type": "array",
// 			"items": {
// 				"type": "object",
// 				"properties": {
// 					"dataPath": { "type": "string", "pattern": "/.+"  },
// 					"message": { "type": "string" },
// 				},
// 				"required": [ "dataPath", "message" ]
// 			}
// 		},
// 		"isSuccessful": { "type": "boolean" },
// 		"roomData": {
// 			"type": "object",
// 			"properties": {
// 				"id": { "type": "integer" },
// 				"name": { "type": "string" },
// 				"player1Id": { "type": "integer" },
// 				"player2Id": { "type": "integer" },
// 				"player1Name": { "type": "string" },
// 				"player2Name": { "type": "string" },
// 				"player1Level": { "type": "integer" },
// 				"player2Level": { "type": "integer" },
// 				"player1CurrLevelXp": { "type": "integer" },
// 				"player2CurrLevelXp": { "type": "integer" },
// 				"player1MaxLevelXp": { "type": "integer" },
// 				"player2MaxLevelXp": { "type": "integer" },
// 			},
// 			"required": [ "id", "name", "player1Id", "player2Id", "player1Name",
// 				"player2Name", "player1Level", "player2Level", "player1CurrLevelXp",
// 				"player2CurrLevelXp", "player1MaxLevelXp", "player2MaxLevelXp" ],
// 		},
// 		"playerIdWinGame": { "type": ["integer", "null"] },
// 	},
// };

var activateCardEffectResponse = startGameResponse;
var finishCardEffectContinuousResponse = startGameResponse;
var drawCardFromEnemyHandResponse = startGameResponse;
var destroyCardFromEnemyFieldResponse = startGameResponse;
var takeCardFromGraveyardResponse = startGameResponse;
var finishChainEffectResponse = startGameResponse;

var drawCardYouResponse = {
	"type": "object",
	"properties": {
		"cardDrawn": cardObj,
	},
	"required": [ "cardDrawn" ],
};
