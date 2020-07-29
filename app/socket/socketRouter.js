const logger = require('../helpers/logger');
const pg = require('../db/pg');
const utils = require('../helpers/utils');
const gameServer = require('./gameServer.js');
const generalServer = require('./generalServer.js');
const assert = require('assert');
const SCHEMAS = require('../schemas/schemas');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, $data: true, jsonPointers: true });
const ajvErrors = require('ajv-errors')(ajv);
const _ = require('lodash/lang');

const self = module.exports = {
  routeRequest: async (ctx, next) => {
  	console.log('routeRequest');

	  const socket = ctx.socket;

	  console.log('socket id: ' + socket.id);
	  logger.info('Sessions: %o', ctx.sessions);

	  socket.on('disconnect', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
		  	logger.info('Client disconnected: %o', ctx_c.session.userData);
		  	console.log('Client disconnected: ', ctx_c.session.userData);

		  	if (ctx_c.session.userData && ctx_c.session.userData.userId && ctx_c.sessions[ctx_c.session.userData.userId]) {
		  		ctx_c.sessions[ctx_c.session.userData.userId].disconnected = true;
		  	}

		  	ctx_c.disconnectTimeout = setTimeout(async () => {
		  		if (ctx_c.session.userData && ctx_c.session.userData.userId &&
		  			ctx_c.sessions[ctx_c.session.userData.userId] && !ctx_c.sessions[ctx_c.session.userData.userId].disconnected) {
		  			return;
		  		}

		  		await gameServer.processDisconnect(ctx_c, next);

		  		if (ctx_c.session.userData && ctx_c.session.userData.userId && ctx_c.sessions[ctx_c.session.userData.userId]) {
		  			ctx_c.sessions[ctx_c.session.userData.userId] = null;
		  		}
		  	}, 5000);
	  	} catch(err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('player-reconnect', async (ctx) => {
	  	let ctx_c = _.clone(ctx);
	  	logger.info('Client reconnected: %o', ctx_c.session.userData);
	  	console.log('Client reconnected: ', ctx_c.session.userData);

	  	if (ctx_c.session.userData && ctx_c.session.userData.userId && ctx_c.sessions[ctx_c.session.userData.userId]) {
	  		ctx_c.sessions[ctx_c.session.userData.userId].disconnected = false;
	  	}
	  });

	  socket.on('leaveRoom', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
		  	await gameServer.leaveRoom(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	ctx_c.io.emit('leaveRoom', {
		  		errors: ctx_c.errors,
		  		isSuccessful: isSuccessful,
		  		roomId: ctx_c.data.roomId,
		  	});
	  	} catch(err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('joinRoom', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
		  	ctx_c.data.result.id = parseInt(ctx_c.data.result.id);
		  	ctx_c.data.result.player1Id = parseInt(ctx_c.data.result.player1Id);
		  	ctx_c.data.result.player2Id = parseInt(ctx_c.data.result.player2Id);

		  	const isSchemaValid = ajv.validate(SCHEMAS.JOIN_ROOM_EVENT, ctx_c.data);

		  	assert(isSchemaValid);

		  	socket.broadcast('joinRoom', ctx_c.data);
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('startGame', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
	  		ctx_c.socket = ctx.socket;

	  		logger.info('Start game data: %o', ctx_c.data);

		  	await gameServer.startGame(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	socket.broadcast('startGame', {
		  		errors: ctx_c.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx_c.gameplayData,
			  	roomData: ctx_c.roomData,
			  	roomId: ctx_c.sessions[ctx_c.session.userData.userId].roomId || ctx_c.data.roomId,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('drawCard', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
	  		logger.info('Draw card data: %o', ctx_c.data);

		  	await gameServer.drawCard(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	socket.emit('drawCardYou', {
		  		errors: ctx_c.errors,
		  		isSuccessful: isSuccessful,
		  		cardDrawn: ctx_c.cardDrawn,
		  		roomData: ctx_c.roomData,
		  		roomId: ctx_c.sessions[ctx_c.session.userData.userId].roomId || ctx_c.data.roomId,
		  	});

		  	socket.broadcast('drawCard', {
		  		errors: ctx_c.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx_c.gameplayData,
			  	roomData: ctx_c.roomData,
			  	roomId: ctx_c.sessions[ctx_c.session.userData.userId].roomId || ctx_c.data.roomId,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('discardCard', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
	  		logger.info('Discard card data: %o', ctx_c.data);

		  	await gameServer.discardCard(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	socket.broadcast('discardCard', {
		  		errors: ctx_c.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx_c.gameplayData,
			  	roomData: ctx_c.roomData,
			  	roomId: ctx_c.sessions[ctx_c.session.userData.userId].roomId || ctx_c.data.roomId,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('drawPhase', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
	  		ctx_c.socket = ctx.socket;

	  		logger.info('Draw phase data: %o', ctx_c.data);

		  	await gameServer.drawPhase(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	socket.broadcast('drawPhase', {
		  		errors: ctx_c.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx_c.gameplayData,
			  	roomData: ctx_c.roomData,
			  	roomId: ctx_c.sessions[ctx_c.session.userData.userId].roomId || ctx_c.data.roomId,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('standByPhase', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
	  		logger.info('Standby phase data: %o', ctx_c.data);

		  	await gameServer.standByPhase(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	socket.broadcast('standByPhase', {
		  		errors: ctx_c.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx_c.gameplayData,
			  	roomData: ctx_c.roomData,
			  	roomId: ctx_c.sessions[ctx_c.session.userData.userId].roomId || ctx_c.data.roomId,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('mainPhase', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
	  		logger.info('Main phase data: %o', ctx_c.data);

		  	await gameServer.mainPhase(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	socket.broadcast('mainPhase', {
		  		errors: ctx_c.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx_c.gameplayData,
			  	roomData: ctx_c.roomData,
			  	roomId: ctx_c.sessions[ctx_c.session.userData.userId].roomId || ctx_c.data.roomId,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('summonCard', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
	  		logger.info('Summon card data: %o', ctx_c.data);

		  	await gameServer.summonCard(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	socket.broadcast('summonCard', {
		  		errors: ctx_c.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx_c.gameplayData,
			  	roomData: ctx_c.roomData,
			  	roomId: ctx_c.sessions[ctx_c.session.userData.userId].roomId || ctx_c.data.roomId,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('finishCardEffect', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
	  		logger.info('Finish card data: %o', ctx_c.data);

		  	await gameServer.finishCardEffect(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	socket.broadcast('finishCardEffect', {
		  		errors: ctx_c.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx_c.gameplayData,
			  	roomData: ctx_c.roomData,
			  	roomId: ctx_c.sessions[ctx_c.session.userData.userId].roomId || ctx_c.data.roomId,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('rollPhase', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
	  		logger.info('Roll phase data: %o', ctx_c.data);

		  	await gameServer.rollPhase(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	socket.broadcast('rollPhase', {
		  		errors: ctx_c.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx_c.gameplayData,
			  	roomData: ctx_c.roomData,
			  	roomId: ctx_c.sessions[ctx_c.session.userData.userId].roomId || ctx_c.data.roomId,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('rollDiceBoard', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
	  		logger.info('Roll dice data: %o', ctx_c.data);

		  	await gameServer.rollDiceBoard(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	socket.broadcast('rollDiceBoard', {
		  		errors: ctx_c.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx_c.gameplayData,
			  	roomData: ctx_c.roomData,
			  	roomId: ctx_c.sessions[ctx_c.session.userData.userId].roomId || ctx_c.data.roomId,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('endPhase', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
	  		logger.info('End phase data: %o', ctx_c.data);

		  	await gameServer.endPhase(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	socket.broadcast('endPhase', {
		  		errors: ctx_c.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx_c.gameplayData,
			  	roomData: ctx_c.roomData,
			  	roomId: ctx_c.sessions[ctx_c.session.userData.userId].roomId || ctx_c.data.roomId,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('winGameFormally', async (ctx) => {
	  	try {
	  		let ctx_c = _.clone(ctx);
	  		logger.info('Win game formally data: %o', ctx_c.data);

		  	await gameServer.winGameFormally(ctx_c, next);

		  	let isSuccessful = ctx_c.errors.length ? false : true;

		  	socket.emit('winGameFormally', {
			  	errors: ctx_c.errors,
			  	isSuccessful: isSuccessful,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });
  },
};