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
			},
			"required": [ "player1Name", "roomName" ],
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