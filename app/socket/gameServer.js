const logger = require('../helpers/logger');
const gameCore = require('./gameCore.js');
const roomController = require('../controllers/roomControllerSocket');

const self = module.exports = {
	// Check if room exists before trying to delete it. Make the client emit a createRoom and store info in the socket session
  processDisconnect: async (ctx, next) => {
  	await roomController.leaveRoom(ctx, next);
  },
  leaveRoom: async (ctx, next) => {
  	await roomController.leaveRoom(ctx, next);
  },
  // login: async (ctx, next) => {
  // 	await usersController.login(ctx, next);
  // },
};