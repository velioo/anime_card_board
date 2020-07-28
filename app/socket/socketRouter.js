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

const self = module.exports = {
  routeRequest: async (ctx, next) => {
  	console.log('routeRequest');

	  const socket = ctx.socket;

	  console.log('socket id: ' + socket.id);
	  logger.info('Sessions: %o', ctx.sessions);

	  socket.on('disconnect', async (ctx) => {
	  	try {
		  	logger.info('Client disconnected: %o', ctx.session.userData);
		  	console.log('Client disconnected: ', ctx.session.userData);

		  	if (ctx.session.userData && ctx.session.userData.userId) {
		  		ctx.sessions[ctx.session.userData.userId] = null;
		  	}

		  	ctx.disconnectTimeout = setTimeout(async () => {
		  		if (ctx.sessions[ctx.session.userData.userId]) {
		  			return;
		  		}

		  		await gameServer.processDisconnect(ctx, next);
		  	}, 5000);

		  	// let isSuccessful = ctx.errors.length ? false : true;

		  	// console.log('Errors: ', ctx.errors);
	  	} catch(err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('leaveRoom', async (ctx) => {
	  	try {
		  	await gameServer.leaveRoom(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	ctx.io.emit('leaveRoom', {
		  		errors: ctx.errors,
		  		isSuccessful: isSuccessful,
		  		roomId: ctx.data.roomId,
		  	});
	  	} catch(err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('joinRoom', async (ctx) => {
	  	try {
		  	ctx.data.result.id = parseInt(ctx.data.result.id);
		  	ctx.data.result.player1Id = parseInt(ctx.data.result.player1Id);
		  	ctx.data.result.player2Id = parseInt(ctx.data.result.player2Id);

		  	const isSchemaValid = ajv.validate(SCHEMAS.JOIN_ROOM_EVENT, ctx.data);

		  	assert(isSchemaValid);

		  	socket.broadcast('joinRoom', ctx.data);
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('startGame', async (ctx) => {
	  	try {
		  	await gameServer.startGame(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.broadcast('startGame', {
		  		errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx.gameplayData,
			  	roomData: ctx.roomData,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('drawCard', async (ctx) => {
	  	try {
		  	await gameServer.drawCard(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.emit('drawCardYou', {
		  		errors: ctx.errors,
		  		isSuccessful: isSuccessful,
		  		cardDrawn: ctx.cardDrawn,
		  		roomData: ctx.roomData,
		  	});

		  	socket.broadcast('drawCard', {
		  		errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx.gameplayData,
			  	roomData: ctx.roomData,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('discardCard', async (ctx) => {
	  	try {
		  	await gameServer.discardCard(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.broadcast('discardCard', {
		  		errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx.gameplayData,
			  	roomData: ctx.roomData,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('drawPhase', async (ctx) => {
	  	try {
		  	await gameServer.drawPhase(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.broadcast('drawPhase', {
		  		errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx.gameplayData,
			  	roomData: ctx.roomData,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('standByPhase', async (ctx) => {
	  	try {
		  	await gameServer.standByPhase(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.broadcast('standByPhase', {
		  		errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx.gameplayData,
			  	roomData: ctx.roomData,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('mainPhase', async (ctx) => {
	  	try {
		  	await gameServer.mainPhase(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.broadcast('mainPhase', {
		  		errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx.gameplayData,
			  	roomData: ctx.roomData,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('summonCard', async (ctx) => {
	  	try {
		  	await gameServer.summonCard(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.broadcast('summonCard', {
		  		errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx.gameplayData,
			  	roomData: ctx.roomData,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('finishCardEffect', async (ctx) => {
	  	try {
		  	await gameServer.finishCardEffect(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.broadcast('finishCardEffect', {
		  		errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx.gameplayData,
			  	roomData: ctx.roomData,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('rollPhase', async (ctx) => {
	  	try {
		  	await gameServer.rollPhase(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.broadcast('rollPhase', {
		  		errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx.gameplayData,
			  	roomData: ctx.roomData,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('rollDiceBoard', async (ctx) => {
	  	try {
		  	await gameServer.rollDiceBoard(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.broadcast('rollDiceBoard', {
		  		errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx.gameplayData,
			  	roomData: ctx.roomData,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('endPhase', async (ctx) => {
	  	try {
		  	await gameServer.endPhase(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.broadcast('endPhase', {
		  		errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  	gameplayData: ctx.gameplayData,
			  	roomData: ctx.roomData,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('winGameFormally', async (ctx) => {
	  	try {
		  	await gameServer.winGameFormally(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.emit('winGameFormally', {
			  	errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	 	socket.on('winGameEnemyTimeout', async (ctx) => {
	  	try {
		  	await gameServer.winGameEnemyTimeout(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	socket.emit('winGameFormally', {
			  	errors: ctx.errors,
			  	isSuccessful: isSuccessful,
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });
  },
};