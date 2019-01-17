const logger = require('../helpers/logger');
const mysql = require('../db/mysql');
const utils = require('../helpers/utils');
const pug = require('../helpers/pug').baseRenderer;
const {
  ROOT,
  SERVICE_EMAIL_PROVIDER,
  SERVICE_EMAIL,
  EMAIL_PASS,
  MAX_USER_EMAIL_LEN,
  MAX_USER_PASSWORD_LEN,
  MIN_USER_NAME_LEN,
  MAX_USER_NAME_LEN,
  MIN_USER_EMAIL_LEN,
  MIN_STREET_ADDRESS_LEN,
  MAX_STREET_ADDRESS_LEN,
  MIN_USER_PASSWORD_LEN,
} = require('../constants/constants');

const assert = require('assert');
const _ = require('lodash/lang');
const Validations = require('../helpers/validations');
const sha256 = require('js-sha256').sha256;
const Nodemailer = require('nodemailer');

module.exports = {
  renderLogin: async (ctx, next) => {
    await next();

    renderLoginPage(ctx);
  },
  login: async (ctx, next) => {
    assert(ctx.request.body.email.length <= MAX_USER_EMAIL_LEN);
    assert(ctx.request.body.password.length <= MAX_USER_PASSWORD_LEN);

    const userData = await mysql.pool.query(`

      SELECT password, salt, id, confirmed
      FROM users
      WHERE
        email = ?

    `, [ ctx.request.body.email ]);

    assert(userData.length <= 1);

    if (userData.length === 1 && isLoginSuccessfull(ctx.request.body.password, userData[0])) {
      if (isAccountConfirmed(userData[0])) {
        ctx.session.userData = { userId: userData[0].id };
        ctx.session.isUserLoggedIn = true;

        return ctx.redirect('/products');
      } else {
        ctx.error = 'Email is not confirmed.';
      }
    } else {
      ctx.error = 'Wrong username or password.';
    }

    renderLoginPage(ctx);
  },
  renderSignUp: async (ctx, next) => {
    await next();

    const countryRows = await mysql.pool.query(`

      SELECT nicename, phonecode
      FROM countries

    `);

    assert(countryRows.length >= 0);

    await renderSignUpPage(ctx, {}, countryRows);
  },
  signUp: async (ctx, next) => {
    ctx.errors = [];

    await validateSignUpFields(ctx);

    const userData = getUserData(ctx);

    logger.info('User Data = %o', userData);

    if (ctx.errors.length !== 0) {
      return renderSignUpPage(ctx, userData);
    }

    const tempCode = utils.generateUniqueId(32);

    const userDbData = Object.keys(userData).map((fieldName) => userData[ fieldName ]);
    const userDbFields = Object.keys(userData).join(', ');

    const connection = await mysql.pool.getConnection();
    await connection.beginTransaction();

    try {
      const queryStatus = await connection.query(`

        INSERT INTO users (${userDbFields})
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

      `, userDbData);

      assert(queryStatus.insertId);

      const userId = queryStatus.insertId;

      await connection.query(`

        INSERT INTO temp_codes(user_id, hash, type)
        VALUES(?, ?, ?)

      `, [userId, tempCode, 'email']);

      await connection.commit();
    } catch (err) {
      ctx.userMessage = 'There was a problem creating your account.';

      await connection.rollback();

      return renderSignUpPage(ctx, userData);
    }

    await sendConfirmationEmail(ctx, tempCode);

    renderLoginPage(ctx);
  },
  logOut: async (ctx, next) => {
    await next();

    if (ctx.session.isUserLoggedIn) {
      ctx.session.userData = null;
      ctx.session.isUserLoggedIn = false;
      ctx.redirect('/products');
    }
  },
  confirmAccount: async (ctx, next) => {
    const userTempData = await mysql.pool.query(`

      SELECT *
      FROM temp_codes
      WHERE
        hash = ?

    `, [ctx.params.code]);

    assert(userTempData.length <= 1);

    if (userTempData.length === 0) {
      ctx.userMessage = 'Link is invalid or has expired.';
    }

    const connection = await mysql.pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query(`

        UPDATE users
        SET confirmed = 1
        WHERE
          id = ?

      `, [ userTempData[0].user_id ]);

      await connection.query(`

        DELETE
        FROM temp_codes
        WHERE
          hash = ?

      `, [ ctx.params.code ]);

      await connection.commit();
    } catch (err) {
      ctx.userMessage = 'There was a problem confirming your account.';

      await connection.rollback();

      return renderLoginPage(ctx);
    }

    ctx.userMessage = 'You successfully validated your account.';

    renderLoginPage(ctx);
  },
};

let renderLoginPage = (ctx) => {
  return ctx.render('login.pug', {
    error: ctx.error,
    userMessage: ctx.userMessage,
    isUserLoggedIn: ctx.session.isUserLoggedIn,
    user: {}
  });
};

let isLoginSuccessfull = (inputPassword, userData) => {
  return sha256(inputPassword + userData.salt) === userData.password;
};

let isAccountConfirmed = (userData) => {
  return +userData.confirmed === 1;
};

let validateSignUpFields = async (ctx) => {
  ctx.checkBody('name')
    .len(MIN_USER_NAME_LEN, MAX_USER_NAME_LEN,
      `Name is too long or too short: ${MIN_USER_NAME_LEN} to ${MAX_USER_NAME_LEN} symbols`);
  ctx.checkBody('last_name')
    .optional()
    .empty()
    .len(MIN_USER_NAME_LEN, MAX_USER_NAME_LEN,
      `Last name is too long or too short: ${MIN_USER_NAME_LEN} to ${MAX_USER_NAME_LEN} symbols`);
  ctx.checkBody('email')
    .isEmail('Your entered a bad email.')
    .len(MIN_USER_EMAIL_LEN, MAX_USER_EMAIL_LEN,
      `Email is too long or too short: ${MIN_USER_EMAIL_LEN} to ${MAX_USER_EMAIL_LEN} symbols`);
  if (await Validations.emailExists(ctx)) {
    ctx.errors.push({email: 'Email already exists.'});
  }
  ctx.checkBody('country')
    .optional()
    .empty()
    .len(MIN_COUNTRY_LEN, MAX_COUNTRY_LEN,
      `Country is too long or too short: ${MIN_COUNTRY_LEN} to ${MAX_COUNTRY_LEN} symbols`);
  ctx.checkBody('phone')
    .ensure(Validations.phoneMatch(ctx.request.body.phone), 'You entered a bad phone.');
  ctx.checkBody('region')
    .optional()
    .empty()
    .len(MIN_REGION_LEN, MAX_REGION_LEN,
      `Region is too long or too short: ${MIN_REGION_LEN} to ${MAX_REGION_LEN} symbols`);
  ctx.checkBody('street_address')
    .optional()
    .empty()
    .len(MIN_STREET_ADDRESS_LEN, MAX_STREET_ADDRESS_LEN,
      `Street address is too long or too short:
        ${MIN_STREET_ADDRESS_LEN} to ${MAX_STREET_ADDRESS_LEN} symbols`);
  ctx.checkBody('password')
    .len(MIN_USER_PASSWORD_LEN, MAX_USER_PASSWORD_LEN,
      `Password is too long or too short: ${MIN_USER_PASSWORD_LEN} to ${MAX_USER_PASSWORD_LEN} symbols`);
  ctx.checkBody('conf_password')
    .eq(ctx.request.body.password, 'Passwords don\'t match');
  ctx.checkBody('gender')
    .default('Unknown');
};

let getUserData = (ctx) => {
  const salt = utils.generateSalt();
  return {
    'name': ctx.request.body.name,
    'last_name': ctx.request.body.last_name,
    'email': ctx.request.body.email,
    'password': sha256(ctx.request.body.password + salt),
    'salt': salt,
    'gender': (ctx.request.body.gender) ? ctx.request.body.gender : 'Unknown',
    'phone': ctx.request.body.phone.replace(/[^0-9]/, ''),
    'phone_unformatted': ctx.request.body.phone,
    'country': ctx.request.body.country,
    'region': ctx.request.body.region,
    'street_address': ctx.request.body.street_address
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
    from: pug.render('PC Store, <#{email}>', { email: SERVICE_EMAIL }, { fromString: true }),
    to: ctx.request.body.email,
    subject: 'Confirm email',
    text: 'Please confirm your account by clicking the link below.',
    html: `Confirm Account:` + pug.render("p: a(href=ROOT + 'confirm_account/' + tempCode) Click Here",
      { ROOT: ROOT, tempCode: tempCode }, { fromString: true })
  };

  try {
    await transporter.sendMail(mailOptions);
    ctx.userMessage = `A confirmation email was sent to your email address.
      Please confirm your account before logging in.`;
  } catch (err) {
    logger.error('Error while sending mail: ' + err.stack);
    ctx.errors.push({ confirmation_email: 'There was a problem while sending confirmation email.' });
  }

  logger.info('userMessageMail = ' + ctx.userMessage);

  transporter.close();
};

let renderSignUpPage = async (ctx, userData = {}, countryRows = {}) => {
  ctx.render('signup.pug', {
    user: userData,
    countries: countryRows,
    errors: ctx.errors,
    isUserLoggedIn: ctx.session.isUserLoggedIn,
    userMessage: ctx.userMessage
  });
};