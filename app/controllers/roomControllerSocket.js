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
  leaveRoom: async (ctx, next) => {
    console.log('leaveRoom roomController');
    ctx.errors = [];

    await pg.pool.query('BEGIN');

    try {
      if (ctx.session.userData === undefined || ctx.session.userData === null)
      {
          return;
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

      console.log('queryStatus: ', queryStatus);

      await pg.pool.query('COMMIT');
    } catch(err) {
      ctx.errors.push({ dataPath: '/room_name', message: 'There was a problem leaving the room. Please try again later.' });

      await pg.pool.query('ROLLBACK');

      logger.info('Failed to leave room: %o', err);
    }
  },
};