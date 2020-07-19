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

	  socket.on('disconnect', async (ctx) => {
	  	try {
		  	console.log('Client disconnected');

		  	await gameServer.processDisconnect(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	console.log('Errors: ', ctx.errors);
	  	} catch(err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  socket.on('leaveRoom', async (ctx) => {
	  	try {
		  	console.log('Client sent leave room event');
		  	console.log('Data: ', ctx.data);

		  	await gameServer.leaveRoom(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	console.log('Errors: ', ctx.errors);

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
		  	console.log('joinRoom');
		  	console.log('Data: ', ctx.data);

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
		  	console.log('startGame');
		  	console.log('Data: ', ctx.data);

		  	await gameServer.startGame(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	console.log('Errors: ', ctx.errors);

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
		  	console.log('drawCard');
		  	console.log('Data: ', ctx.data);

		  	await gameServer.drawCard(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	console.log('Errors: ', ctx.errors);

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

	  socket.on('drawPhase', async (ctx) => {
	  	try {
		  	console.log('drawPhase');
		  	console.log('Data: ', ctx.data);

		  	await gameServer.drawPhase(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	console.log('Errors: ', ctx.errors);

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
		  	console.log('standByPhase');
		  	console.log('Data: ', ctx.data);

		  	await gameServer.standByPhase(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	console.log('Errors: ', ctx.errors);

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
		  	console.log('mainPhase');
		  	console.log('Data: ', ctx.data);

		  	await gameServer.mainPhase(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	console.log('Errors: ', ctx.errors);

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
		  	console.log('summonCard');
		  	console.log('Data: ', ctx.data);

		  	await gameServer.summonCard(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	console.log('Errors: ', ctx.errors);

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

	  socket.on('winGameFormally', async (ctx) => {
	  	try {
		  	console.log('winGameFormally');
		  	console.log('Data: ', ctx.data);

		  	await gameServer.winGameFormally(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	console.log('Errors: ', ctx.errors);

		  	socket.emit('winGameFormally', {
			  	errors: ctx.errors,
			  	isSuccessful: isSuccessful
			  });
	  	} catch (err) {
	  		socket.emit('serverError', err);
	  		logger.error('Error: %o', err);
	  	}
	  });

	  // socket.on('login', async (ctx) => {
	  // 	try {
		 //  	console.log('Client data: ', ctx.data);
		 //  	console.log('Is Logged in: ', ctx.isUserLoggedIn);

		 //  	await generalServer.login(ctx, next);

		 //  	let isSuccessful = ctx.errors.length ? false : true;

		 //  	console.log('Errors: ', ctx.errors);

		 //  	socket.emit('login', {
		 //  		errors: ctx.errors,
		 //  		userMessage: ctx.userMessage,
		 //  		isSuccessful: isSuccessful
		 //  	});
	  // 	} catch(err) {
	  // 		socket.emit('serverError', err);
	  // 		logger.error("Error: %o", err);
	  // 	}
	  // });
  },
};