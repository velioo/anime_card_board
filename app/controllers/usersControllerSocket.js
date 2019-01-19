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
  signUp: async (ctx, next) => {
    console.log('signUp usersController');
    ctx.errors = [];

    const isSchemaValid = ajv.validate(SCHEMAS.SIGN_UP, ctx.data);

    if (!isSchemaValid) {
      ajv.errors.forEach((el) => {
        ctx.errors.push(el);
      })
    }

    await validateSignUpFields(ctx);

    if (ctx.errors.length) {
      return;
    }

    const userData = getUserData(ctx);

    logger.info('User Data = %o', userData);

    const tempCode = utils.generateUniqueId(32);

    const userDbData = Object.keys(userData).map((fieldName) => userData[ fieldName ]);
    const userDbFields = Object.keys(userData).join(', ');

    await pg.pool.query(`BEGIN`);

    try {
      const queryStatus = await pg.pool.query(`

        INSERT INTO users (${userDbFields})
        VALUES ($1, $2, $3, $4)
        RETURNING id

      `, userDbData);

      assert(queryStatus.rows[0].id);

      const userId = queryStatus.rows[0].id;

      await pg.pool.query(`

        INSERT INTO temp_codes(user_id, hash, type)
        VALUES($1, $2, $3)

      `, [userId, tempCode, 'email']);

      await sendConfirmationEmail(ctx, tempCode);

      await pg.pool.query(`COMMIT`);
    } catch (err) {
      ctx.errors.push({ message: 'There was a problem creating your account. Please try again later.' });
      await pg.pool.query(`ROLLBACK`);

      logger.info('Failed to sign up: %o', err);

      return;
    }

    logger.info('Confirmation email sent');
  },
  login: async (ctx, next) => {
    console.log('login usersController');
    ctx.errors = [];

    const isSchemaValid = ajv.validate(SCHEMAS.LOGIN, ctx.data);

    if (!isSchemaValid) {
      ajv.errors.forEach((el) => {
        ctx.errors.push(el);
      })
    }

    if (ctx.errors.length) {
      return;
    }

    const userData = await pg.pool.query(`

      SELECT password, salt, id, is_confirmed
      FROM users
      WHERE
        username = $1

    `, [ ctx.data.username ]);

    assert(userData.rowCount <= 1);

    if (userData.rowCount === 1 && isLoginSuccessfull(ctx.data.password, userData.rows[0])) {
      if (isAccountConfirmed(userData.rows[0])) {
        ctx.userMessage = 'You have successfully logged in';
        // TODO: SESSION
        // ctx.session.userData = { userId: userData.rows[0].id };
        // ctx.session.isUserLoggedIn = true;
      } else {
        ctx.errors.push({ dataPath: '/username', message: 'You must confirm your email before logging in.' });
      }
    } else {
      ctx.errors.push({ dataPath: '/username', message: 'Wrong username or password.' });
    }
  },
  logOut: async (ctx, next) => {
    await next();

    if (ctx.session.isUserLoggedIn) {
      ctx.session.userData = null;
      ctx.session.isUserLoggedIn = false;
      ctx.redirect('/');
    }
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
    'username': ctx.data.username,
    'email': ctx.data.email,
    'password': sha256(ctx.data.password + salt),
    'salt': salt,
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
    to: ctx.data.email,
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