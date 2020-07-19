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
  drawCard: async (ctx, next) => {
    await gameController.drawCard (ctx, next);
  },
  drawPhase: async (ctx, next) => {
    await gameController.drawPhase (ctx, next);
  },
  standByPhase: async (ctx, next) => {
    await gameController.standByPhase (ctx, next);
  },
  mainPhase: async (ctx, next) => {
    await gameController.mainPhase (ctx, next);
  },
  summonCard: async (ctx, next) => {
    await gameController.summonCard (ctx, next);
  },
};