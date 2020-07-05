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
  },
  "required": [ "room_name" ],
  "errorMessage": {
    "properties" : {
      "room_name": `Room name should be between ${MIN_USER_NAME_LEN} and ${MAX_USER_NAME_LEN} characters`,
    },
    "required": {
      "room_name": 'You must enter a room name',
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

module.exports = {
  SIGN_UP: _SIGN_UP,
  LOGIN: _LOGIN,
  CREATE_ROOM: _CREATE_ROOM,
  GET_ROOM_DATA: _GET_ROOM_DATA,
  JOIN_ROOM_DATA: _JOIN_ROOM_DATA,
};