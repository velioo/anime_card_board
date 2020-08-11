const assert = require('assert');
const logger = require('../helpers/logger');

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;

    if (err.status === 401) {
      ctx.set('WWW-Authenticate', 'Basic');
      ctx.state = {
          userMessage: 'You have no access here',
          httpCode: 401,
      }

      return ctx.render('./views/400.hbs');
    } else if (err.status === 403) {
       if (err.userNotLoggedIn) {
          assert(err._message, 'Error needs a message');
          assert(err._code, 'Error needs a code');

          ctx.state = {
            userMessage: err._message,
            code: err._code,
            httpCode: 403,
          }

          return ctx.render('./views/400.hbs');
      }
    } else if (err.status === 200) {
      if (err.userLoggedIn) {
        assert(err._message, 'Error needs a message');
        assert(err._code, 'Error needs a code');

        ctx.state = {
          userMessage: err._message,
          code: err._code,
        }

        return ctx.render('./views/home.hbs');
      }
    } else {
      logger.error(`Error while executing code: ${err.stack}`);
    }

    await ctx.render('./views/500.hbs');
  }
};
