const {
	MIN_USER_EMAIL_LEN,
  MAX_USER_EMAIL_LEN,
  MAX_USER_PASSWORD_LEN,
  MIN_USER_NAME_LEN,
  MAX_USER_NAME_LEN,
  MIN_USER_PASSWORD_LEN,
  MIN_ROOM_NAME_LEN,
  MAX_ROOM_NAME_LEN,
} = require('../constants/constants');

const _SIGN_UP = {
  "type": "object",
  "properties": {
		"username": { "type": "string", "minLength": MIN_USER_NAME_LEN, "maxLength": MAX_USER_NAME_LEN },
		"password": { "type": "string", "minLength": MIN_USER_PASSWORD_LEN, "maxLength": MAX_USER_PASSWORD_LEN },
		"conf_password": { const: { $data: '1/password' } },
		"email": { "type": "string", "minLength": MIN_USER_EMAIL_LEN, "maxLength": MAX_USER_EMAIL_LEN, "format": "email" },
  },
  "required": [ "username", "password", "conf_password", "email"],
  "errorMessage": {
    "properties": {
      "username": `Username should be between ${MIN_USER_NAME_LEN} and ${MAX_USER_NAME_LEN} characters`,
      "password": `Password should be at least ${MIN_USER_PASSWORD_LEN} characters long`,
      "conf_password": `Passwords don't match`,
      "email": `The entered email should be valid and at least ${MIN_USER_EMAIL_LEN} characters long`,
    },
    "required": {
      "username": 'You must enter a username',
      "password": 'You must enter a password',
      "conf_password": 'You must confirm your password',
      "email": 'You must enter an email',
    },
  }
};

const _LOGIN = {
  "type": "object",
  "properties": {
    "username": { "type": "string" },
    "password": { "type": "string" },
  },
  "required": [ "username", "password" ],
  "errorMessage": {
    "required": {
      "username": 'You must enter a username',
      "password": 'You must enter a password',
    },
  }
};

const _CREATE_ROOM = {
  "type": "object",
  "properties": {
    "room_name": { "type": "string", "minLength": MIN_ROOM_NAME_LEN, "maxLength": MAX_ROOM_NAME_LEN },
    "board_id": { "type": "integer" },
  },
  "required": [ "room_name", "board_id" ],
  "errorMessage": {
    "properties" : {
      "room_name": `Room name should be between ${MIN_USER_NAME_LEN} and ${MAX_USER_NAME_LEN} characters`,
      "board_id": `Invalid board !`,
    },
    "required": {
      "room_name": 'You must enter a room name',
      "board_id": 'Invalid board !',
    },
  }
};

const _GET_ROOM_DATA = {
  "type": "object",
  "properties": {
    "roomId": { "type": "integer" },
  },
  "required": [ "roomId" ],
  "errorMessage": {
    "properties" : {
      "roomId": `Room id should be an integer`,
    },
    "required": {
      "roomId": 'No roomId is specified',
    },
  }
};

const _JOIN_ROOM_DATA = _GET_ROOM_DATA;

const _WIN_GAME_FORMALLY = {
  "type": "object",
  "properties": {
    "roomId": { "type": "integer" },
  },
  "required": [ "roomId" ],
  "errorMessage": {
    "properties" : {
      "roomId": `Room id should be an integer`,
    },
    "required": {
      "roomId": 'No roomId is specified',
    },
  }
};

const _START_GAME = {
  "type": "object",
  "properties": {
    "roomId": { "type": "integer" },
    "player1Id": { "type": "integer" },
    "player2Id": { "type": "integer" },
  },
  "required": [ "roomId", "player1Id", "player2Id" ],
  "errorMessage": {
    "properties" : {
      "roomId": `Room id should be an integer`,
      "player1Id": `Player 1 id should be an integer`,
      "player2Id": `Player 2 id should be an integer`,
    },
    "required": {
      "roomId": 'No roomId is specified',
      "player1Id": 'No player1Id is specified',
      "player2Id": 'No player2Id is specified',
    },
  }
};

const _JOIN_ROOM_EVENT = {
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
  },
  "required": [ "errors", "isSuccessful", "isUserLoggedIn", "result" ],
};

const _DRAW_CARD = {
  "type": "object",
  "properties": {
    "roomId": { "type": "integer" },
  },
  "required": [ "roomId" ],
};

const _DRAW_PHASE = _DRAW_CARD;
const _STANDBY_PHASE = _DRAW_CARD;
const _MAIN_PHASE = _DRAW_CARD;
const _SUMMON_CARD = {
  "type": "object",
  "properties": {
    "roomId": { "type": "integer" },
    "cardId": { "type": "integer" },
    "cardIdx": { "type": "integer" },
  },
  "required": [ "roomId", "cardId", "cardIdx" ],
};

const _ROLL_PHASE = _DRAW_CARD;
const _END_PHASE = _DRAW_CARD;
const _DISCARD_CARD = _SUMMON_CARD;
const _FINISH_CARD = {
  "type": "object",
  "properties": {
    "roomId": { "type": "integer" },
    "cardId": { "type": "integer" },
  },
  "required": [ "roomId", "cardId" ],
};

const _ACTIVATE_CARD_EFFECT = _FINISH_CARD;
const _FINISH_CARD_CONTINUOUS = _FINISH_CARD;
const _WIN_GAME_ENEMY_TIMEOUT = _WIN_GAME_FORMALLY;
const _MATCHMAKE = {
  "type": "object",
  "properties": {
    "board_id": { "type": "integer" },
  },
  "required": [ "board_id" ],
  "errorMessage": {
    "properties" : {
      "board_id": `Invalid board !`,
    },
    "required": {
      "board_id": 'Invalid board !',
    },
  }
};

const _SETTINGS = {
  "type": "object",
  "properties": {
    "sound": { "type": "boolean" },
    "soundVolume": { "type": "number", "minimum": 1, "maximum": 100 },
    "backgroundSound": { "type": "boolean" },
    "cardBoardEffectSounds": { "type": "boolean" },
  },
  "required": [ "sound", "soundVolume", "backgroundSound", "cardBoardEffectSounds" ],
};

const _DRAW_CARD_FROM_ENEMY_HAND = {
  "type": "object",
  "properties": {
    "roomId": { "type": "integer" },
    "cardIdx": { "type": "integer" },
  },
  "required": [ "roomId", "cardIdx" ],
};

const _DESTROY_CARD_FROM_ENEMY_FIELD = {
  "type": "object",
  "properties": {
    "roomId": { "type": "integer" },
    "cardId": { "type": "integer" },
  },
  "required": [ "roomId", "cardId" ],
};

const _TAKE_CARD_FROM_GRAVEYARD = {
  "type": "object",
  "properties": {
    "roomId": { "type": "integer" },
    "cardIdx": { "type": "integer" },
    "playerIdGraveyard": { "type": "integer" },
  },
  "required": [ "roomId", "cardIdx", "playerIdGraveyard" ],
};

module.exports = {
  SIGN_UP: _SIGN_UP,
  LOGIN: _LOGIN,
  CREATE_ROOM: _CREATE_ROOM,
  GET_ROOM_DATA: _GET_ROOM_DATA,
  JOIN_ROOM_DATA: _JOIN_ROOM_DATA,
  MATCHMAKE: _MATCHMAKE,
  WIN_GAME_FORMALLY: _WIN_GAME_FORMALLY,
  START_GAME: _START_GAME,
  JOIN_ROOM_EVENT: _JOIN_ROOM_EVENT,
  DRAW_CARD: _DRAW_CARD,
  DRAW_PHASE: _DRAW_PHASE,
  STANDBY_PHASE: _STANDBY_PHASE,
  MAIN_PHASE: _MAIN_PHASE,
  SUMMON_CARD: _SUMMON_CARD,
  ROLL_PHASE: _ROLL_PHASE,
  END_PHASE: _END_PHASE,
  DISCARD_CARD: _DISCARD_CARD,
  FINISH_CARD: _FINISH_CARD,
  WIN_GAME_ENEMY_TIMEOUT: _WIN_GAME_ENEMY_TIMEOUT,
  FINISH_CARD_CONTINUOUS: _FINISH_CARD_CONTINUOUS,
  ACTIVATE_CARD_EFFECT: _ACTIVATE_CARD_EFFECT,
  SETTINGS: _SETTINGS,
  DRAW_CARD_FROM_ENEMY_HAND: _DRAW_CARD_FROM_ENEMY_HAND,
  DESTROY_CARD_FROM_ENEMY_FIELD: _DESTROY_CARD_FROM_ENEMY_FIELD,
  TAKE_CARD_FROM_GRAVEYARD: _TAKE_CARD_FROM_GRAVEYARD,
};