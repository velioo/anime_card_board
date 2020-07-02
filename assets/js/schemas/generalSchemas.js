var signUpResponse = {
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
		"userMessage": { "type": "string" },
	},
	"required": [ "errors", "isSuccessful" ],
};

var logInResponse = signUpResponse;

var logOutResponse = {
	"type": "object",
	"properties": {
		"isSuccessful": { "type": "boolean" },
		"userMessage": { "type": "string" },
	},
	"required": [ "isSuccessful" ],
};

var isUserLoggedInResponse = {
	"type": "object",
	"properties": {
		"isSuccessful": { "type": "boolean" },
		"isUserLoggedIn": { "type": "boolean" },
	},
	"required": [ "isSuccessful", "isUserLoggedIn" ],
};

var createRoomResponse = {
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
				"required": [ "dataPath", "message" ],
			}
		},
		"isSuccessful": { "type": "boolean" },
		"isUserLoggedIn": { "type": "boolean" },
		"result": {
			"type": "object",
			"properties": {
				"player1Name": { "type": "string" },
				"roomName": { "type": "string" },
				"roomId": { "type": ["integer", "null"] },
			},
			"required": [ "player1Name", "roomName", "roomId" ],
		},
	},
	"required": [ "errors", "isSuccessful", "isUserLoggedIn", "result" ],
};

var destroyRoomResponse = {
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
	},
	"required": [ "errors", "isSuccessful" ],
};

var browseRoomsResponse = {
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
		"isUserLoggedIn": { "type": "boolean" },
		"result": {
			"type": "object",
			"properties": {
				"roomsData": {
					"type": "array",
					"items": {
						"type": "object",
						"properties": {
							"id": { "type": "integer" },
							"name": { "type": "string" },
							"player1_id": { "type": "integer" },
							"player2_id": { "type": ["integer", "null"] }
						},
						"required": [ "id", "name", "player1_id", "player2_id" ],
					},
				},
			},
			"required": [ "roomsData" ],
		},
	},
	"required": [ "errors", "isSuccessful", "isUserLoggedIn", "result" ],
};

var getCurrentRoomDataResponse = {
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
		"isUserLoggedIn": { "type": "boolean" },
		"result": {
			"type": "object",
			"properties": {
				"id": { "type": ["integer", "null"] },
				"name": { "type": ["string", "null"] },
				"player1Name": { "type": ["string", "null"] },
				"player2Name": { "type": ["string", "null"] }
			},
			"required": [ "id", "name", "player1Name", "player2Name" ],
		},
	},
	"required": [ "errors", "isSuccessful", "isUserLoggedIn", "result" ],
};