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