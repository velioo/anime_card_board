var cardObjProperties = {
  "cardName": { "type": "string" },
  "cardText": { "type": "string" },
  "cardImg": { "type": "string" },
  "cardId": { "type": "integer" },
  "cardRarity": { "type": "integer" },
};

var cardObjRequiredFields = [ "cardName", "cardText", "cardImg", "cardId", "cardRarity" ];

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
			},
			"required": [ "id", "name", "player1Id", "player2Id", "player1Name", "player2Name" ],
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
						"playerIdWinGame": { "type": ["integer", "null"] },
						"playersState": {
							"type": "object",
							"patternProperties": {
								"^[1-9]\d*$": {
									"name": { "type": "string" },
									"currBoardIndex": { "type": "integer" },
									"lastBoardIndex": { "type": "integer" },
									"cardsInHand": "integer",
									"cardsToDraw": "integer",
									"cardsSummonConstraints": {
										"type": "object",
										"properties": {
											"cardsCanSummonAny": { "type": "boolean" },
											"cardsCanSummonCommon": { "type": "boolean" },
											"cardsCanSummonRare": { "type": "boolean" },
											"cardsCanSummonEpic": { "type": "boolean" },
											"cardsCanSummonCommonCount": { "type": "integer" },
											"cardsCanSummonRareCount": { "type": "integer" },
											"cardsCanSummonEpicCount": { "type": "integer" },
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
	},
	"required": [ "errors", "isSuccessful", "gameplayData", "roomData" ],
};

var drawCardResponse = startGameResponse;
var drawPhaseResponse = startGameResponse;
var standByPhaseResponse = startGameResponse;
var mainPhaseResponse = startGameResponse;
var summonCardResponse = startGameResponse;
var rollPhaseResponse = startGameResponse;
var rollDiceBoardResponse = startGameResponse;
var endPhaseResponse = startGameResponse;

var drawCardYouResponse = {
	"type": "object",
	"properties": {
		"cardDrawn": cardObj,
	},
	"required": [ "cardDrawn" ],
};