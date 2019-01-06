const logger = require('../helpers/logger');

const assert = require('assert');
const _ = require('lodash/lang');

module.exports = {
  notFound: async (ctx) => {
    // ctx.status = 404;
    // ctx.body = ctx.body || 'NOT FOUND 404';
    // ctx.render('not_found', { userMessage: 'Resource Not Found' });
  }
};