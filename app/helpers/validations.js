const Utils = require('./utils');

module.exports = {
  emailExists: async (ctx) => {
    return Utils.rowExists({ table: 'users', field: 'email', queryArg: ctx.request.body.data.email });
  },
  usernameExists: async (ctx) => {
    return Utils.rowExists({ table: 'users', field: 'username', queryArg: ctx.request.body.data.username });
  },
  roomExists: async (ctx) => {
    return Utils.rowExists({ table: 'rooms', field: 'name', queryArg: ctx.request.body.data.room_name });
  },
  boardExists: async (ctx) => {
  	return Utils.rowExists({ table: 'boards', field: 'id', queryArg: ctx.request.body.data.board_id });
  },
  characterExists: async (ctx) => {
    return Utils.rowExists({ table: 'characters', field: 'id', queryArg: ctx.request.body.data.character_id });
  },
};