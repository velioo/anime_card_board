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
		"gameplayData": { "type": "object" },
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
		},
	},
	"required": [ "errors", "isSuccessful", "gameplayData", "roomData" ],
};