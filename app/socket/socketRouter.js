const logger = require('../helpers/logger');
const pg = require('../db/pg');
const utils = require('../helpers/utils');
const gameServer = require('./gameServer.js');
const generalServer = require('./generalServer.js');

const self = module.exports = {
  routeRequest: async (ctx, next) => {
  	console.log('routeRequest');

	  const socket = ctx.socket;

	  console.log('socket id: ' + socket.id);

	  socket.on('signUp', async (ctx) => {
	  	try {
		  	console.log('Client data: ', ctx.data);

		  	await generalServer.signUp(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	console.log('Errors: ', ctx.errors);

		  	socket.emit('signUp', {
		  		errors: ctx.errors,
		  		userMessage: ctx.userMessage,
		  		isSuccessful: isSuccessful
		  	});
	  	} catch(err) {
	  		socket.emit('serverError', err);
	  		logger.error("Error: %o", err);
	  	}
	  });

	  socket.on('login', async (ctx) => {
	  	try {
		  	console.log('Client data: ', ctx.data);

		  	await generalServer.login(ctx, next);

		  	let isSuccessful = ctx.errors.length ? false : true;

		  	console.log('Errors: ', ctx.errors);

		  	socket.emit('login', {
		  		errors: ctx.errors,
		  		userMessage: ctx.userMessage,
		  		isSuccessful: isSuccessful
		  	});
	  	} catch(err) {
	  		socket.emit('serverError', err);
	  		logger.error("Error: %o", err);
	  	}
	  });
  },
};