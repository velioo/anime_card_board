const logger = require('../helpers/logger');
const roomController = require('../controllers/roomControllerSocket');
const gameController = require('../controllers/gameControllerSocket');

const self = module.exports = {
  processDisconnect: async (ctx, next) => {
  	await roomController.leaveRoomAll (ctx, next);
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
  rollPhase: async (ctx, next) => {
    await gameController.rollPhase (ctx, next);
  },
  rollDiceBoard: async (ctx, next) => {
    await gameController.rollDiceBoard (ctx, next);
  },
  endPhase: async (ctx, next) => {
    await gameController.endPhase (ctx, next);
  },
  discardCard: async (ctx, next) => {
    await gameController.discardCard (ctx, next);
  },
  finishCardEffect: async (ctx, next) => {
    await gameController.finishCardEffect (ctx, next);
  },
};