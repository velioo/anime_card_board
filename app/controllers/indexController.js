const logger = require('../helpers/logger');
const pg = require('../db/pg');
const {
} = require('../constants/constants');

const assert = require('assert');
const _ = require('lodash/lang');

var self = module.exports = {
	renderHomeScreen: async (ctx) => {
    ctx.state.userMessage = ctx.request.query.msg || "";
		await ctx.render('./views/home.hbs');
	},
  renderTestGame: async (ctx) => {
    await ctx.render('./views/test.hbs');
  },
  confirmAccount: async (ctx, next) => {
    const userTempData = await pg.pool.query(`

      SELECT *
      FROM temp_codes
      WHERE
        hash = $1

    `, [ctx.params.code]);

    assert(userTempData.rowCount <= 1);

    if (userTempData.rowCount === 0) {
      ctx.state.userMessage = 'Link is invalid or has expired.';
      return ctx.redirect('/main-menu?msg=' + ctx.state.userMessage);
    }

    await pg.pool.query(`BEGIN`);

    try {
      await pg.pool.query(`

        UPDATE users
        SET is_confirmed = true
        WHERE
          id = $1

      `, [ userTempData.rows[0].user_id ]);

      await pg.pool.query(`

        DELETE
        FROM temp_codes
        WHERE
          hash = $1

      `, [ ctx.params.code ]);

      await pg.pool.query(`COMMIT`);

      ctx.state.userMessage = 'You successfully validated your account.';
      logger.info('Successfully validated your account');
    } catch (err) {
      ctx.state.userMessage = 'There was a problem confirming your account. Please try again later.';

      await pg.pool.query(`ROLLBACK`);

      logger.info('Problem while validation your account: %o', err);
    }

    ctx.redirect('/main-menu?msg=' + ctx.state.userMessage);
  },
	frontendLogger: async (ctx, next) => {
    const requestBody = ctx.request.body;

    assert(requestBody.logger);

    if (requestBody.level === 'INFO') {
      logger.info('FL: ' + requestBody.message);
    } else if (requestBody.level === 'ERROR') {
      logger.error('FRONTEND ERROR-------------------------------\n' +
        requestBody.message + '\nURL = ' + requestBody.url +
        '\n------------------------------------------------------------');
    }
    ctx.status = 200;
  }
};