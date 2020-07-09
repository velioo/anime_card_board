const logger = require('../helpers/logger');
const gameCore = require('./gameCore.js');
const roomController = require('../controllers/roomControllerSocket');
const gameController = require('../controllers/gameControllerSocket');

const self = module.exports = {
  processDisconnect: async (ctx, next) => {
  	await roomController.leaveRoom (ctx, next);
  },
  leaveRoom: async (ctx, next) => {
  	await roomController.leaveRoom (ctx, next);
  },
  winGameFormally: async (ctx, next) => {
    await gameController.winGameFormally (ctx, next);
  },
  startGame: async (ctx, next) => {
    await gameController.startGame (ctx, next);
  },
};