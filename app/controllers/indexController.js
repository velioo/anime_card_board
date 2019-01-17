const logger = require('../helpers/logger');
const {
} = require('../constants/constants');

const assert = require('assert');
const _ = require('lodash/lang');

module.exports = {
	renderHomeScreen: async (ctx, next) => {
		await ctx.render('./views/home.hbs');
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