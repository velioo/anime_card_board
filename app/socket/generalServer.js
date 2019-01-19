const logger = require('../helpers/logger');
const pg = require('../db/pg');
const utils = require('../helpers/utils');
const usersController = require('../controllers/usersControllerSocket');

const self = module.exports = {
  signUp: async (ctx, next) => {
  	await usersController.signUp(ctx, next);
  },
  login: async (ctx, next) => {
  	await usersController.login(ctx, next);
  },
};