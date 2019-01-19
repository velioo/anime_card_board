const Utils = require('./utils');

module.exports = {
  emailExists: async (ctx) => {
    return Utils.rowExists({ table: 'users', field: 'email', queryArg: ctx.data.email });
  },
  usernameExists: async (ctx) => {
    return Utils.rowExists({ table: 'users', field: 'username', queryArg: ctx.data.username });
  },
};