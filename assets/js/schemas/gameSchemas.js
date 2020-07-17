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
						"startPlayerId": { "type": "integer" },
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
						"playersState": {
							"type": "object",
							"patternProperties": {
								"^[1-9]\d*$": {
									"name": { "type": "string" },
									"currBoardRow": { "type": "integer" },
									"currBoardColumn": { "type": "integer" },
									"cardsInHand": "integer",
									"cardsToDraw": "integer",
									"cardsInHandObj": { "type": ["array", "null"] },
								},
							},
							"additionalProperties": false,
						},
						"playerIdDrawnCard": { "type": "integer" },
					},
					"required": [ "startPlayerId", "roomId", "boardData", "timerSeconds", "playersState" ],
				},
			},
			"required": [ "gameState" ],
		},
	},
	"required": [ "errors", "isSuccessful", "gameplayData", "roomData" ],
};

var drawCardResponse = startGameResponse;

var drawCardYouResponse = {
	"type": "object",
	"properties": {
		"cardDrawn": {
			"type": "object",
	    "properties": {
	      "cardName": { "type": "string" },
	      "cardText": { "type": "string" },
	      "cardImg": { "type": "string" },
	      "cardId": { "type": "integer" },
	    },
	   "required": [ "cardName", "cardText", "cardImg", "cardId" ],
		},
	},
	"required": [ "cardDrawn" ],
};