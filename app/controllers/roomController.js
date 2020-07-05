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
      roomId: null,
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

      ctx.result.roomId = roomId;

	    await pg.pool.query('COMMIT');
	  } catch(err) {
	  	ctx.errors.push({ dataPath: '/room_name', message: 'There was a problem creating your room. Please try again later.' });
      await pg.pool.query('ROLLBACK');

      logger.info('Failed to create room: %o', err);
	  }

	  return self.sendResponse(ctx, next);
	},
  browseRooms: async (ctx, next) => {
    await next();

    console.log('browseRooms roomController');
    ctx.errors = [];

    try {
      let queryStatus = await pg.pool.query(`

        SELECT * FROM rooms

      `);

      console.log('browseRooms rows count: ', queryStatus.rows.length);
      ctx.result = {
        roomsData: queryStatus.rows,
      };
    } catch(err) {
      ctx.errors.push({ dataPath: '/browse-rooms-table', message: 'There was a problem getting rooms data. Please try again later.' });

      logger.info('Failed to get rooms data: %o', err);
    }

    return self.sendResponse(ctx, next);
  },
  getRoomData: async (ctx, next) => {
    await next();

    console.log('getRoomData roomController');
    ctx.errors = [];

    ctx.result = {
      id: null,
      name: null,
      player1Name: null,
      player2Name: null,
      player1Id: null,
      player2Id: null,
    };

    try {
      ctx.request.body.data.roomId = parseInt(ctx.request.body.data.roomId);

      const isSchemaValid = ajv.validate(SCHEMAS.GET_ROOM_DATA, ctx.request.body.data);
      console.log(ctx.request.body.data);

      assert(isSchemaValid);

      let queryStatus = await pg.pool.query(`

        SELECT
          R.*, U1.username as player1_name, U2.username as player2_name
        FROM rooms as R
        JOIN users as U1 ON U1.id = R.player1_id
        LEFT JOIN users as U2 ON U2.id = R.player2_id
        WHERE R.id = $1

      `, [ ctx.request.body.data.roomId ]);

      console.log('getRoomData rows count: ', queryStatus.rows.length);

      if (queryStatus.rows.length > 0) {
        ctx.result = {
          id: queryStatus.rows[0].id,
          name: queryStatus.rows[0].name,
          player1Name: queryStatus.rows[0].player1_name,
          player2Name: queryStatus.rows[0].player2_name,
          player1Id: queryStatus.rows[0].player1_id,
          player2Id: queryStatus.rows[0].player2_id,
        };
      }
    } catch(err) {
      ctx.errors.push({ dataPath: '/anime-cb-players-lobby', message: 'There was a problem getting room data. Please try again later.' });

      logger.info('Failed to get room data: %o', err);
    }

    return self.sendResponse(ctx, next);
  },
  joinRoom: async (ctx, next) => {
    await next();

    console.log('joinRoom roomController');
    ctx.errors = [];

    ctx.result = {
      id: null,
      name: null,
      player1Name: null,
      player2Name: null,
      player1Id: null,
      player2Id: null,
    };

    await pg.pool.query('BEGIN');

    try {
      ctx.request.body.data.roomId = parseInt(ctx.request.body.data.roomId);

      const isSchemaValid = ajv.validate(SCHEMAS.JOIN_ROOM_DATA, ctx.request.body.data);
      console.log(ctx.request.body.data);
      console.log(ajv.errors);

      assert(isSchemaValid);

      let queryStatus = await pg.pool.query(`

        UPDATE rooms
        SET player2_id = $1
        WHERE rooms.id = $2
        RETURNING id

      `, [ ctx.session.userData.userId, ctx.request.body.data.roomId ]);

      console.log('joinRoom rows count: ', queryStatus.rows.length);

      if (queryStatus.rows.length <= 0) {
        logger.info('Could not find room to update, request body: %o', ctx.request.body.data);

        await pg.pool.query('ROLLBACK');
        return self.sendResponse(ctx, next);
      }

      queryStatus = await pg.pool.query(`

        SELECT
          R.*, U1.username as player1_name, U2.username as player2_name
        FROM rooms as R
        JOIN users as U1 ON U1.id = R.player1_id
        LEFT JOIN users as U2 ON U2.id = R.player2_id
        WHERE R.id = $1

      `, [ ctx.request.body.data.roomId ]);

      assert(queryStatus.rows.length === 1);

      ctx.result = {
        id: queryStatus.rows[0].id,
        name: queryStatus.rows[0].name,
        player1Name: queryStatus.rows[0].player1_name,
        player2Name: queryStatus.rows[0].player2_name,
        player1Id: queryStatus.rows[0].player1_id,
        player2Id: queryStatus.rows[0].player2_id,
      };

      await pg.pool.query('COMMIT');
    } catch(err) {
      ctx.errors.push({ dataPath: '/browse-rooms-table', message: 'There was a problem while joining the room. Please try again later.' });
      await pg.pool.query('ROLLBACK');

      logger.info('Failed to get room data: %o', err);
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