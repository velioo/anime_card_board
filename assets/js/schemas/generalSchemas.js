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

var logInResponse = {
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
		"userId": { "type": ["integer", "null"] },
		"username": { "type": ["string", "null"] },
	},
	"required": [ "errors", "isSuccessful", "userId", "username" ],
};

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
		"userId": { "type": ["integer", "null"] },
		"username": { "type": ["string", "null"] },
	},
	"required": [ "isSuccessful", "isUserLoggedIn", "userId", "username" ],
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

var leaveRoomResponse = {
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
				"player2Name": { "type": ["string", "null"] },
				"player1Id": { "type": ["integer", "null"] },
				"player2Id": { "type": ["integer", "null"] },
			},
			"required": [ "id", "name", "player1Name", "player2Name", "player1Id", "player2Id" ],
		},
		"userMessage": { "type": "string" },
	},
	"required": [ "errors", "isSuccessful", "isUserLoggedIn", "result" ],
};

var joinRoomResponse = getCurrentRoomDataResponse;