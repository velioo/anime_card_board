const logger = require('../helpers/logger');

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;

    if (err.status === 401) {
      ctx.set('WWW-Authenticate', 'Basic');
      ctx.body = 'You have no access here';
    } else if (err.status === 403) {
       if (err.userNotLoggedIn) {
          assert(err._message, 'Error needs a message');
          assert(err._code, 'Error needs a code');

          ctx.body = {
            message: err._message,
            code: err._code,
          }
      }
    } else if (err.status === 200) {
      if (err.userLoggedIn) {
        assert(err._message, 'Error needs a message');
        assert(err._code, 'Error needs a code');

        ctx.body = {
          message: err._message,
          code: err._code,
        }
      }
    } else {
      logger.error(`Error while executing code: ${err.stack}`);
    }

    await ctx.render('./views/500.hbs');
  }
};
