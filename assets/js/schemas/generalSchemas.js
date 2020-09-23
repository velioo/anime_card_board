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
		"settings": { "type": ["object", "null"] },
		"level": { "type": ["integer", "null"] },
		"currentLevelXp": { "type": ["integer", "null"] },
		"maxLevelXp": { "type": ["integer", "null"] },
		"winsCount": { "type": ["integer", "null"] },
		"losesCount": { "type": ["integer", "null"] },
	},
	"required": [ "errors", "isSuccessful", "userId", "username", "settings", "level",
		"currentLevelXp", "maxLevelXp", "winsCount", "losesCount" ],
};

var contactResponse = {
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
		"userMessage": { "type": ["string", "null"] },
	},
	"required": [ "errors", "isSuccessful" ],
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
		"settings": { "type": ["object", "null"] },
		"level": { "type": ["integer", "null"] },
		"currentLevelXp": { "type": ["integer", "null"] },
		"maxLevelXp": { "type": ["integer", "null"] },
		"winsCount": { "type": ["integer", "null"] },
		"losesCount": { "type": ["integer", "null"] },
	},
	"required": [ "isSuccessful", "isUserLoggedIn", "userId", "username", "settings", "level",
		"currentLevelXp", "maxLevelXp", "winsCount", "losesCount" ],
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
				"roomId": { "type": ["integer"] },
				"roomSettings": {
					"type": "object",
					"properties": {
						"boardId": { "type": "integer" },
						"boardName": { "type": "string" },
						"player1Character": {
							"type": "object",
							"properties": {
								"id": { "type": "integer" },
								"name": { "type": "string" },
								"image": { "type": "string" },
							},
							"required": [ "id", "name", "image" ],
						},
					},
					"required": [ "boardId", "boardName", "player1Character" ],
				},
			},
			"required": [ "player1Name", "roomName", "roomId", "roomSettings" ],
		},
	},
	"required": [ "errors", "isSuccessful", "isUserLoggedIn", "result" ],
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
				"roomSettings": {
					"type": ["object", "null"],
					"properties": {
						"boardId": { "type": "integer" },
						"boardName": { "type": "string" },
						"player1Character": {
							"type": "object",
							"properties": {
								"id": { "type": "integer" },
								"name": { "type": "string" },
								"image": { "type": "string" },
							},
							"required": [ "id", "name", "image" ],
						},
						"player2Character": {
							"type": "object",
							"properties": {
								"id": { "type": "integer" },
								"name": { "type": "string" },
								"image": { "type": "string" },
							},
							"required": [ "id", "name", "image" ],
						},
					},
					"required": [ "boardId", "boardName", "player1Character" ],
				},
			},
			"required": [ "id", "name", "player1Name", "player2Name", "player1Id", "player2Id", "roomSettings" ],
		},
		"userMessage": { "type": "string" },
	},
	"required": [ "errors", "isSuccessful", "isUserLoggedIn", "result" ],
};

var matchmakeResponse = {
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
				"player1Id": { "type": "integer" },
				"player2Name": { "type": "string" },
				"player2Id": { "type": "integer" },
				"roomId": { "type": "integer" },
				"roomSettings": {
					"type": "object",
					"properties": {
						"boardId": { "type": "integer" },
						"boardName": { "type": "string" },
						"player1Character": {
							"type": "object",
							"properties": {
								"id": { "type": "integer" },
								"name": { "type": "string" },
								"image": { "type": "string" },
							},
							"required": [ "id", "name", "image" ],
						},
						"player2Character": {
							"type": "object",
							"properties": {
								"id": { "type": "integer" },
								"name": { "type": "string" },
								"image": { "type": "string" },
							},
							"required": [ "id", "name", "image" ],
						},
					},
					"required": [ "boardId", "boardName", "player1Character", "player2Character" ],
				},
			},
			"required": [ "player1Name", "player1Id", "player2Name", "player2Id", "roomId", "roomSettings" ],
		},
	},
	"required": [ "errors", "isSuccessful", "isUserLoggedIn", "result" ],
};

var settingsResponse = {
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
		"settings": { "type": ["object", "null"] },
	},
	"required": [ "errors", "isSuccessful", "userMessage", "settings" ],
};

var joinRoomResponse = _.cloneDeep(getCurrentRoomDataResponse);
joinRoomResponse.properties.result.properties.roomSettings.required.push("player2Character");