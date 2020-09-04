const logger = require('../helpers/logger');
const pg = require('../db/pg');
const {
} = require('../constants/constants');

const assert = require('assert');
const _ = require('lodash/lang');

var self = module.exports = {
	renderHomeScreen: async (ctx) => {
    ctx.state.userMessage = ctx.request.query.msg || "";

    let queryStatus = await pg.pool.query(`
      SELECT id, name FROM boards ORDER BY name
    `);

    assert(queryStatus.rowCount > 0);
    ctx.state.boards = queryStatus.rows;

    queryStatus = await pg.pool.query(`
      SELECT * FROM cards ORDER BY name
    `);

    assert(queryStatus.rowCount >= 0);
    ctx.state.cards = queryStatus.rows;

    queryStatus = await pg.pool.query(`
      SELECT * FROM characters ORDER BY name
    `);

    assert(queryStatus.rowCount >= 0);
    ctx.state.characters = queryStatus.rows;

    ctx.state.characters.forEach(function(character) {
      if (character.id == 1) {
        ctx.state.default_character = character;
      }
    });

    ctx.state.cards.forEach(function(card) {
      card.original_image = card.image;
      if (ctx.session.userData && ctx.session.userData.settings && !ctx.session.userData.settings.cardAnimations) {
        if (card.image.split('.').pop() == "gif") {
          card.image = card.image.substr(0, card.image.lastIndexOf(".")) + ".jpg";
        }
      }
    });

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