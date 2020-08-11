const logger = require('../helpers/logger');
const pg = require('../db/pg');
const utils = require('../helpers/utils');
const gameServer = require('../socket/gameServer.js');

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
const ajv = new Ajv({ allErrors: true, $data: true, jsonPointers: true, format: "full" });
const ajvErrors = require('ajv-errors')(ajv);

var self = module.exports = {
  signUp: async (ctx, next) => {
    ctx.errors = [];

    const isSchemaValid = ajv.validate(SCHEMAS.SIGN_UP, ctx.request.body.data);

    if (!isSchemaValid) {
      ajv.errors.forEach((el) => {
        ctx.errors.push(el);
      })
    }

    await validateSignUpFields(ctx);

    if (ctx.errors.length) {
      return self.sendResponse(ctx, next);
    }

    const userData = getUserData(ctx);
    const tempCode = utils.generateUniqueId(32);

    const userDbData = Object.keys(userData).map((fieldName) => userData[ fieldName ]);
    const userDbFields = Object.keys(userData).join(', ');

    await pg.pool.query('BEGIN');

    try {
      const queryStatus = await pg.pool.query(`

        INSERT INTO users (${userDbFields})
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id

      `, userDbData);

      assert(queryStatus.rows[0].id);

      const userId = queryStatus.rows[0].id;

      await pg.pool.query(`

        INSERT INTO temp_codes(user_id, hash, type)
        VALUES($1, $2, $3)

      `, [userId, tempCode, 'email']);

      await sendConfirmationEmail(ctx, tempCode);

      logger.info('Confirmation email sent');

      await pg.pool.query('COMMIT');
    } catch (err) {
      ctx.errors.push({ dataPath: '/username', message: 'There was a problem creating your account. Please try again later.' });
      await pg.pool.query('ROLLBACK');

      logger.info('Failed to sign up: %o', err);
    }

    return self.sendResponse(ctx, next);
  },
  logIn: async (ctx, next) => {
    ctx.errors = [];
    ctx.settings = null;

    const isSchemaValid = ajv.validate(SCHEMAS.LOGIN, ctx.request.body.data);

    if (!isSchemaValid) {
      ajv.errors.forEach((el) => {
        ctx.errors.push(el);
      })
    }

    if (ctx.errors.length) {
      return self.sendResponse(ctx, next);
    }

    try {
      const userData = await pg.pool.query(`

        SELECT username, password, salt, id, is_confirmed, settings_json
        FROM users
        WHERE
          username = $1

      `, [ ctx.request.body.data.username ]);

      assert(userData.rowCount <= 1);

      if (userData.rowCount === 1 && isLoginSuccessfull(ctx.request.body.data.password, userData.rows[0])) {
        if (isAccountConfirmed(userData.rows[0])) {
          ctx.session.userData = { userId: userData.rows[0].id, username: userData.rows[0].username };
          ctx.session.isUserLoggedIn = true;
          ctx.session.userData.settings = JSON.parse(userData.rows[0].settings_json);
        } else {
          ctx.errors.push({ dataPath: '/username', message: 'You must confirm your email before logging in.' });
        }
      } else {
        ctx.errors.push({ dataPath: '/username', message: 'Wrong username or password.' });
      }

      ctx.settings = ctx.session.userData.settings;
    } catch(err) {
      ctx.errors.push({ dataPath: '/username', message: 'There was a problem while logging in. Please try again later.' });

      logger.info('Failed to log in: %o', err);
    }

    return self.sendResponse(ctx, next);
  },
  isUserLoggedIn: async (ctx, next) => {
    ctx.body = {
      isUserLoggedIn: ctx.session.isUserLoggedIn,
      userId: ctx.session.userData ? ctx.session.userData.userId || null : null,
      username: ctx.session.userData ? ctx.session.userData.username || null : null,
      settings: ctx.session.userData ? ctx.session.userData.settings || null : null,
      isSuccessful: true,
    };
  },
  sendResponse: async (ctx, next) => {
    ctx.body = {
      errors: ctx.errors,
      isSuccessful: ctx.errors.length ? false : true,
    };

    if (ctx.userMessage) {
      ctx.body.userMessage = ctx.userMessage;
    }

    if ("settings" in ctx) {
      ctx.body.settings = ctx.settings;
    }

    ctx.body.userId = ctx.session.userData ? ctx.session.userData.userId : null;
    ctx.body.username = ctx.session.userData ? ctx.session.userData.username : null;
  },
  logOut: async (ctx, next) => {
    ctx.errors = [];

    await gameServer.processDisconnect(ctx, next);

    if (ctx.session.isUserLoggedIn) {
      ctx.session.userData = null;
      ctx.session.isUserLoggedIn = false;
    }

    self.sendResponse(ctx, next);
  },
  settings: async (ctx, next) => {
    ctx.errors = [];
    ctx.userMessage = "There was a problem while saving your settings. Please try again later.";
    ctx.settings = {};

    try {
      assert(ctx.session.userData && ctx.session.userData.username);

      ctx.request.body.data.sound = (ctx.request.body.data.sound == 'true');
      const isSchemaValid = ajv.validate(SCHEMAS.SETTINGS, ctx.request.body.data);

      if (!isSchemaValid) {
        ajv.errors.forEach((el) => {
          ctx.errors.push(el);
        })
      }

      if (ctx.errors.length) {
        return self.sendResponse(ctx, next);
      }

      let settingsJson = {
        sound: ctx.request.body.data.sound,
      };

      const queryStatus = await pg.pool.query(`

        UPDATE users
        SET settings_json = $1
        WHERE username = $2
        RETURNING id

      `, [ JSON.stringify(settingsJson), ctx.session.userData.username ]);

      assert(queryStatus.rowCount == 1);

      ctx.userMessage = "Settings successfully saved.";
      ctx.settings = settingsJson;
      ctx.session.userData.settings = settingsJson;

    } catch(err) {
      ctx.errors.push({ dataPath: '/settings', message: 'There was a problem while saving your settings. Please try again later.' });

      logger.info('Failed to save setttings: %o', err);
    }

    return self.sendResponse(ctx, next);
  },
};

let isLoginSuccessfull = (inputPassword, userData) => {
  return sha256(inputPassword + userData.salt) === userData.password;
};

let isAccountConfirmed = (userData) => {
  return userData.is_confirmed === true;
};

let validateSignUpFields = async (ctx) => {
  if (await Validations.emailExists(ctx)) {
    ctx.errors.push({ dataPath: '/email', message: 'Email already exists.' });
  }

  if (await Validations.usernameExists(ctx)) {
    ctx.errors.push({ dataPath: '/username', message: 'Username already exists.' });
  }
};

let getUserData = (ctx) => {
  const salt = utils.generateSalt();
  return {
    'username': ctx.request.body.data.username,
    'email': ctx.request.body.data.email,
    'password': sha256(ctx.request.body.data.password + salt),
    'salt': salt,
    'settings_json': JSON.stringify({
      sound: false,
    }),
  };
};

let sendConfirmationEmail = async (ctx, tempCode) => {
  const transporter = Nodemailer.createTransport({
    service: SERVICE_EMAIL_PROVIDER,
    auth: {
      user: SERVICE_EMAIL,
      pass: EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `Anime Card Board Game, ${SERVICE_EMAIL}`,
    to: ctx.request.body.data.email,
    subject: 'Confirm email',
    text: 'Please confirm your account by clicking the link below.',
    html: `Confirm Account: <a href="${ROOT}confirm_account/${tempCode}">Click Here</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    ctx.userMessage = `A confirmation email was sent to your email address.
      Please confirm your account before logging in.`;
  } catch (err) {
    logger.error('Error while sending mail: ' + err.stack);
    throw(err);
  }

  logger.info('userMessageMail = ' + ctx.userMessage);

  transporter.close();
};