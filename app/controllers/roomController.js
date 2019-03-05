const logger = require('../helpers/logger');
const pg = require('../db/pg');
const utils = require('../helpers/utils');

const {} = require('../constants/constants');
const SCHEMAS = require('../schemas/schemas');

const assert = require('assert');
const _ = require('lodash/lang');
const Validations = require('../helpers/validations');
const sha256 = require('js-sha256').sha256;
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, $data: true, jsonPointers: true });
const ajvErrors = require('ajv-errors')(ajv);

var self = module.exports = {
	createRoom: async (ctx, next) => {
		await next();

		console.log('createRoom roomController');
		ctx.errors = [];

    const isSchemaValid = ajv.validate(SCHEMAS.CREATE_ROOM, ctx.request.body.data);

    if (!isSchemaValid) {
      ajv.errors.forEach((el) => {
        ctx.errors.push(el);
      })
    }

    await validateCreateRoomFields(ctx);

    ctx.result = {
    	roomName: ctx.request.body.data.room_name,
    	player1Name: ctx.session.userData.username,
	  };

    if (ctx.errors.length) {
      return self.sendResponse(ctx, next);
    }

   	const roomData = getRoomData(ctx);

    logger.info('Room Data = %o', roomData);

    const roomDbData = Object.keys(roomData).map((fieldName) => roomData[ fieldName ]);
    const roomDbFields = Object.keys(roomData).join(', ');

    await pg.pool.query('BEGIN');

    try {
    	let queryStatus = await pg.pool.query(`

        DELETE FROM rooms
        WHERE player1_id = $1

      `, [ ctx.session.userData.userId ]);

      console.log('destroyRoom status: ', queryStatus);

	    queryStatus = await pg.pool.query(`

	    	INSERT INTO rooms (${roomDbFields})
	      VALUES ($1, $2)
	      RETURNING id

	    `, roomDbData);

			assert(queryStatus.rows[0].id);
	    const roomId = queryStatus.rows[0].id;

	    await pg.pool.query('COMMIT');
	  } catch(err) {
	  	ctx.errors.push({ dataPath: '/room_name', message: 'There was a problem creating your room. Please try again later.' });
      await pg.pool.query('ROLLBACK');

      logger.info('Failed to create room: %o', err);
	  }

	  return self.sendResponse(ctx, next);
	},
/*	destroyRoom: async (ctx, next) => {
		// await next();

		console.log('destroyRoom roomController');
		ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
	    const queryStatus = await pg.pool.query(`

	    	DELETE FROM rooms
	    	WHERE player1_id = $1

	    `, [ ctx.session.userData.userId ]);

	    console.log('queryStatus: ', queryStatus);

	    await pg.pool.query('COMMIT');
	  } catch(err) {
	  	// ctx.errors.push({ dataPath: '/room_name', message: 'There was a problem destroying the room. Please try again later.' });
      await pg.pool.query('ROLLBACK');

      logger.info('Failed to destroy room: %o', err);
	  }

	  // return self.sendResponse(ctx, next);
	},*/
	 sendResponse: async (ctx, next) => {
    ctx.body = {
      errors: ctx.errors,
      isSuccessful: ctx.errors.length ? false : true,
      isUserLoggedIn: ctx.session.isUserLoggedIn,
    };

    if (ctx.userMessage) {
      ctx.body.userMessage = ctx.userMessage;
    }

    if (ctx.result) {
    	ctx.body.result = ctx.result;
    }
  },
};

let validateCreateRoomFields = async (ctx) => {
  if (await Validations.roomExists(ctx)) {
    ctx.errors.push({ dataPath: '/room_name', message: 'Room name already exists.' });
  }
};

let getRoomData = (ctx) => {
  return {
    'name': ctx.request.body.data.room_name,
    'player1_id': ctx.session.userData.userId,
  };
};