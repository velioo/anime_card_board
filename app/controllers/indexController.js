const logger = require('../helpers/logger');
const pg = require('../db/pg');
const {
  ROOT,
  SERVICE_EMAIL_PROVIDER,
  SERVICE_EMAIL,
  EMAIL_PASS,
  CONTACT_EMAIL_SEND_INTERVAL_MILLISECONDS,
} = require('../constants/constants');
const SCHEMAS = require('../schemas/schemas');
const assert = require('assert');
const _ = require('lodash/lang');
const Nodemailer = require('nodemailer');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, $data: true, jsonPointers: true, format: "full" });
const ajvErrors = require('ajv-errors')(ajv);

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
  contactData: async (ctx, next) => {
    ctx.errors = [];

    try {
      const requestData = ctx.request.body.data;
      const isSchemaValid = ajv.validate(SCHEMAS.CONTACT_DATA, requestData);

      if (!isSchemaValid) {
        ajv.errors.forEach((el) => {
          ctx.errors.push(el);
        })
      }

      if (ctx.session.lastSentEmailMilliseconds
        && (ctx.session.lastSentEmailMilliseconds + CONTACT_EMAIL_SEND_INTERVAL_MILLISECONDS) > new Date().getTime()) {
        let CONTACT_EMAIL_SEND_INTERVAL_MINUTES = CONTACT_EMAIL_SEND_INTERVAL_MILLISECONDS / (1000 * 60);
        ctx.errors.push({
          dataPath: '/email',
          message: `You can send only 1 email on every ${CONTACT_EMAIL_SEND_INTERVAL_MINUTES} minutes.`
        });
      }

      if (ctx.errors.length) {
        return self.sendResponse(ctx, next);
      }

      await sendContactEmail(ctx);
      ctx.session.lastSentEmailMilliseconds = new Date().getTime();

      logger.info('Contact email sent');
    } catch (err) {
      ctx.errors.push({ dataPath: '/email', message: 'There was a problem while sending email. Please try again later.' });
      logger.info('Problem while sending contact data: %o', err);
    }

    return self.sendResponse(ctx, next);
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
  },
  sendResponse: async (ctx, next) => {
    ctx.body = {
      errors: ctx.errors,
      isSuccessful: ctx.errors.length ? false : true,
    };

    if (ctx.userMessage) {
      ctx.body.userMessage = ctx.userMessage;
    }
  },
};

let sendContactEmail = async (ctx) => {
  const transporter = Nodemailer.createTransport({
    service: SERVICE_EMAIL_PROVIDER,
    auth: {
      user: SERVICE_EMAIL,
      pass: EMAIL_PASS
    }
  });

  let fromText;
  if (ctx.session.userData && ctx.session.userData.username) {
    fromText = '"' + ctx.session.userData.username + '" ' + ctx.request.body.data.email;
  } else {
    fromText = ctx.request.body.data.email;
  }

  const mailOptions = {
    from: `"Anime Card Board Game" ${SERVICE_EMAIL}`,
    to: `"Anime Card Board Game" ${SERVICE_EMAIL}`,
    subject: 'Contact Email from ' + fromText,
    text: ctx.request.body.data.content,
    html: ctx.request.body.data.content,
  };

  try {
    await transporter.sendMail(mailOptions);
    ctx.userMessage = `Email successfully sent.`;
    logger.info("Mail options: %o", mailOptions);
  } catch (err) {
    logger.error('Error while sending mail: ' + err.stack);
    throw(err);
  }

  transporter.close();
};