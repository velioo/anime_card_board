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

		ctx.errors = [];
    ctx.request.body.data.board_id = parseInt(ctx.request.body.data.board_id);

    try {
      const isSchemaValid = ajv.validate(SCHEMAS.CREATE_ROOM, ctx.request.body.data);

      if (!isSchemaValid) {
        ajv.errors.forEach((el) => {
          ctx.errors.push(el);
        })

        return self.sendResponse(ctx, next);
      }

      await validateCreateRoomFields(ctx);

      ctx.result = {
      	roomName: ctx.request.body.data.room_name,
      	player1Name: ctx.session.userData.username,
        roomId: null,
        boardName: ctx.request.body.data.board_name,
  	  };

      if (ctx.errors.length) {
        return self.sendResponse(ctx, next);
      }

     	const roomData = getRoomData(ctx);

      logger.info('Room Data = %o', roomData);

      const roomDbData = Object.keys(roomData).map((fieldName) => roomData[ fieldName ]);
      const roomDbFields = Object.keys(roomData).join(', ');

      await pg.pool.query('BEGIN');

    	let queryStatus = await pg.pool.query(`

        DELETE FROM rooms
        WHERE player1_id = $1

      `, [ ctx.session.userData.userId ]);

      queryStatus = await pg.pool.query(`

        UPDATE rooms
        SET player2_id = null
        WHERE player2_id = $1

      `, [ ctx.session.userData.userId ]);

	    queryStatus = await pg.pool.query(`

	    	INSERT INTO rooms (${roomDbFields})
	      VALUES ($1, $2, $3, $4)
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

    ctx.errors = [];

    try {
      let queryStatus = await pg.pool.query(`

        SELECT * FROM rooms WHERE is_matchmade = false

      `);

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

      assert(isSchemaValid);

      let queryStatus = await pg.pool.query(`

        SELECT
          R.*, U1.username as player1_name, U2.username as player2_name
        FROM rooms as R
        JOIN users as U1 ON U1.id = R.player1_id
        LEFT JOIN users as U2 ON U2.id = R.player2_id
        WHERE R.id = $1

      `, [ ctx.request.body.data.roomId ]);

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

    ctx.errors = [];

    ctx.result = {
      id: null,
      name: null,
      player1Name: null,
      player2Name: null,
      player1Id: null,
      player2Id: null,
      boardName: null,
    };

    await pg.pool.query('BEGIN');

    try {
      ctx.request.body.data.roomId = parseInt(ctx.request.body.data.roomId);

      const isSchemaValid = ajv.validate(SCHEMAS.JOIN_ROOM_DATA, ctx.request.body.data);

      assert(isSchemaValid);

      let queryStatus = await pg.pool.query(`

        DELETE FROM rooms
        WHERE player1_id = $1

      `, [ ctx.session.userData.userId ]);

      queryStatus = await pg.pool.query(`

        UPDATE rooms
        SET player2_id = null
        WHERE player2_id = $1

      `, [ ctx.session.userData.userId ]);

      queryStatus = await pg.pool.query(`

        SELECT * FROM rooms
        WHERE id = $1

      `, [ ctx.request.body.data.roomId ]);

      if (queryStatus.rows.length <= 0) {
        logger.info('Room no longer exists, request body: %o', ctx.request.body.data);

        ctx.errors.push({ dataPath: '/browse-rooms-table', message: 'Room no longer exists.' });
        await pg.pool.query('COMMIT');
        return self.sendResponse(ctx, next);
      }

      if (queryStatus.rows[0].player2_id) {
        logger.info('Room is full');

        ctx.errors.push({ dataPath: '/browse-rooms-table', message: 'Room is full.' });
        await pg.pool.query('COMMIT');
        return self.sendResponse(ctx, next);
      }

      let roomSettings = JSON.parse(queryStatus.rows[0].settings_json);
      assert(roomSettings.board_id);

      queryStatus = await pg.pool.query(`

        UPDATE rooms
        SET player2_id = $1
        WHERE rooms.id = $2
        RETURNING id

      `, [ ctx.session.userData.userId, ctx.request.body.data.roomId ]);

      if (queryStatus.rows.length <= 0) {
        logger.info('Could not find room to update, request body: %o', ctx.request.body.data);

        await pg.pool.query('COMMIT');
        return self.sendResponse(ctx, next);
      }

      queryStatus = await pg.pool.query(`

        SELECT
          R.*, U1.username as player1_name, U2.username as player2_name,
            (SELECT name FROM boards WHERE id = $1) as board_name
        FROM rooms as R
        JOIN users as U1 ON U1.id = R.player1_id
        LEFT JOIN users as U2 ON U2.id = R.player2_id
        WHERE R.id = $2

      `, [ roomSettings.board_id, ctx.request.body.data.roomId ]);

      assert(queryStatus.rows.length === 1);

      ctx.result = {
        id: queryStatus.rows[0].id,
        name: queryStatus.rows[0].name,
        player1Name: queryStatus.rows[0].player1_name,
        player2Name: queryStatus.rows[0].player2_name,
        player1Id: queryStatus.rows[0].player1_id,
        player2Id: queryStatus.rows[0].player2_id,
        boardName: queryStatus.rows[0].board_name,
      };

      await pg.pool.query('COMMIT');
    } catch(err) {
      ctx.errors.push({ dataPath: '/browse-rooms-table', message: 'There was a problem while joining the room. Please try again later.' });
      await pg.pool.query('ROLLBACK');

      logger.info('Failed to get room data: %o', err);
    }

    return self.sendResponse(ctx, next);
  },
  matchmake: async (ctx) => {
    try {
      let queryStatusMatchmake = await pg.pool.query(`

        SELECT M.*, U.username FROM matchmaking M
        JOIN users U ON U.id = M.user_id

      `);

      for (let i = 0; i < queryStatusMatchmake.rowCount; i++) {
        if (!queryStatusMatchmake.rows[i]) {
          break;
        }

        let matchmakeSettings1 = JSON.parse(queryStatusMatchmake.rows[i].settings_json);

        for (let k = i + 1; k < queryStatusMatchmake.rowCount; k++) {
          if (!queryStatusMatchmake.rows[k]) {
            break;
          }

          let matchmakeSettings2 = JSON.parse(queryStatusMatchmake.rows[k].settings_json);

          if (matchmakeSettings1.board_id != matchmakeSettings2.board_id) {
            continue;
          }

          await pg.pool.query('BEGIN');

          try {
            let queryStatus = await pg.pool.query(`

              DELETE FROM rooms
              WHERE player1_id in ($1, $2)

            `, [ queryStatusMatchmake.rows[i].user_id, queryStatusMatchmake.rows[k].user_id ]);

            queryStatus = await pg.pool.query(`

              UPDATE rooms
              SET player2_id = null
              WHERE player2_id in ($1, $2)

            `, [ queryStatusMatchmake.rows[i].user_id, queryStatusMatchmake.rows[k].user_id ]);

            const roomName = utils.generateUniqueId(20);
            queryStatus = await pg.pool.query(`

              INSERT INTO rooms (name, player1_id, player2_id, settings_json, is_matchmade)
              VALUES ($1, $2, $3, $4, $5)
              RETURNING id

            `, [ roomName, queryStatusMatchmake.rows[i].user_id, queryStatusMatchmake.rows[k].user_id,
              JSON.stringify(matchmakeSettings1), true ]);

            assert(queryStatus.rows[0].id);
            const roomId = queryStatus.rows[0].id;

            queryStatus = await pg.pool.query(`

              DELETE FROM matchmaking WHERE user_id in ($1, $2)

            `, [ queryStatusMatchmake.rows[i].user_id, queryStatusMatchmake.rows[k].user_id ]);

            let result = {
              player1Name: queryStatusMatchmake.rows[i].username,
              player1Id: queryStatusMatchmake.rows[i].user_id,
              player2Name: queryStatusMatchmake.rows[k].username,
              player2Id: queryStatusMatchmake.rows[k].user_id,
              roomId: roomId,
            };

            logger.info('Sessions: %o', ctx.sessions);

            ctx.io.getSocket(ctx.sessions[result.player1Id].socketId).emit('matchmake', {
              errors: [],
              isSuccessful: true,
              isUserLoggedIn: true,
              result: result,
            });

            ctx.io.getSocket(ctx.sessions[result.player2Id].socketId).emit('matchmake', {
              errors: [],
              isSuccessful: true,
              isUserLoggedIn: true,
              result: result,
            });

            await pg.pool.query('COMMIT');
          } catch (err) {
            await pg.pool.query('ROLLBACK');
            logger.info('Failed to matchmake players: %o', err);
          }
        }
      }
    } catch(err) {
      logger.info('Matchmaker failed: %o', err);
    }

    setTimeout(async () => {
      await self.matchmake(ctx);
    }, 1000);
  },
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

  let boardRow = await Validations.boardExists(ctx);
  if (!boardRow) {
    ctx.errors.push({ dataPath: '/board_id', message: 'Invalid board !' });
  } else {
    ctx.request.body.data.board_name = boardRow.name;
  }
};

let getRoomData = (ctx) => {
  return {
    'name': ctx.request.body.data.room_name,
    'player1_id': ctx.session.userData.userId,
    'settings_json': '{"board_id":' + ctx.request.body.data.board_id + '}',
    'is_matchmade': false,
  };
};