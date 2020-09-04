const logger = require('../helpers/logger');
const pg = require('../db/pg');
const utils = require('../helpers/utils');

const {
  ROOT,
  SERVICE_EMAIL_PROVIDER,
  SERVICE_EMAIL,
  EMAIL_PASS,
} = require('../constants/constants');
const SCHEMAS = require('../schemas/schemas');

const assert = require('assert');
const _ = require('lodash/lang');
const Validations = require('../helpers/validations');
const sha256 = require('js-sha256').sha256;
const Nodemailer = require('nodemailer');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, $data: true, jsonPointers: true });
const ajvErrors = require('ajv-errors')(ajv);

module.exports = {
  leaveRoomAll: async (ctx, next) => {
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      if (!ctx.session.userData) {
        return;
      }

      assert(ctx.session.userData && ctx.session.userData.userId);

      if (ctx.sessions[ctx.session.userData.userId]) {
        clearInterval(ctx.sessions[ctx.session.userData.userId].turnInterval);
        ctx.sessions[ctx.session.userData.userId].roomId = null;
      }

      let queryStatus = await pg.pool.query(`

        DELETE FROM rooms
        WHERE player1_id = $1

      `, [ ctx.session.userData.userId ]);

      queryStatus = await pg.pool.query(`

        UPDATE rooms
        SET player2_id = null
        WHERE player2_id = $1

      `, [ ctx.session.userData.userId ]);

      await pg.pool.query('COMMIT');
    } catch(err) {
      ctx.errors.push({ dataPath: '/room_name', message: 'There was a problem leaving the room. Please try again later.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to leave room: %o', err);
    }
  },
  leaveRoom: async (ctx, next) => {
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      if (!ctx.data.roomId) {
        return;
      }

      ctx.data.roomId = parseInt(ctx.data.roomId);

      assert(ctx.session.userData && ctx.session.userData.userId);

      if (ctx.sessions[ctx.session.userData.userId]) {
        clearInterval(ctx.sessions[ctx.session.userData.userId].turnInterval);
        ctx.sessions[ctx.session.userData.userId].roomId = null;
      }

      let queryStatus = await pg.pool.query(`

        DELETE FROM rooms
        WHERE player1_id = $1
        AND id = $2

      `, [ ctx.session.userData.userId, ctx.data.roomId ]);

      queryStatus = await pg.pool.query(`

        UPDATE rooms
        SET player2_id = null
        WHERE player2_id = $1
        AND id = $2

      `, [ ctx.session.userData.userId, ctx.data.roomId ]);

      await pg.pool.query('COMMIT');
    } catch(err) {
      ctx.errors.push({ dataPath: '/room_name', message: 'There was a problem leaving the room. Please try again later.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to leave room: %o', err);
    }
  },
  matchmake: async (ctx, next) => {
    ctx.errors = [];

    try {
      ctx.data.board_id = parseInt(ctx.data.board_id);
      ctx.data.character_id = parseInt(ctx.data.character_id);

      const isSchemaValid = ajv.validate(SCHEMAS.MATCHMAKE, ctx.data);
      assert(isSchemaValid);

      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatusCharacters = await pg.pool.query(`

        SELECT * FROM characters WHERE id = $1

      `, [ ctx.data.character_id ]);

      assert(queryStatusCharacters.rowCount == 1);

      queryStatusBoards = await pg.pool.query(`

        SELECT * FROM boards WHERE id = $1

      `, [ ctx.data.board_id ]);

      assert(queryStatusBoards.rowCount == 1);

      const settingsJson = {
        boardId: queryStatusBoards.rows[0].id,
        boardName: queryStatusBoards.rows[0].name,
        playerCharacter: {
          id: queryStatusCharacters.rows[0].id,
          name: queryStatusCharacters.rows[0].name,
          image: queryStatusCharacters.rows[0].image,
        },
      };

      let queryStatus = await pg.pool.query(`

        INSERT INTO matchmaking (user_id, settings_json)
        VALUES ($1, $2) ON CONFLICT(user_id) DO NOTHING

      `, [ ctx.session.userData.userId, JSON.stringify(settingsJson) ]);

    } catch(err) {
      ctx.errors.push({ dataPath: '/matchmake', message: 'There was a problem while matchmaking. Please try again later.' });

      logger.info('Failed to matchmake player: %o', err);
    }
  },
  removeFromMatchmaking: async (ctx, next) => {
    ctx.errors = [];

    try {
      assert(ctx.session.userData && ctx.session.userData.userId);

      let queryStatus = await pg.pool.query(`

        DELETE FROM matchmaking WHERE user_id = $1

      `, [ ctx.session.userData.userId ]);

    } catch(err) {
      ctx.errors.push({ dataPath: '/remove_from_matchmake', message: 'There was a problem while removing player from matchmaking.' });

      logger.info('Failed to remove player from matchmaking: %o', err);
    }
  },
};