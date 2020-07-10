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
							"borderData": {
								"type": "object",
								"properties": {
									"id": { "type": "integer" },
									"borderMatrix": { "type": "array" },
									"borderData": { "type": "object" },
								},
							},
						},
					},
					"player1State": {
						"type": "object",
						"properties": {
							"id": { "type": "integer" },
							"name": { "type": "string" },
						},
					},
					"player2State": { "$ref": "#/properties/gameplayData/properties/player1State" },
			},
			"required": [ "gameState", "player1State", "player2State" ],
		},
	},
	"required": [ "errors", "isSuccessful", "gameplayData", "roomData" ],
};