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
/*       if (err.userNotLoggedIn) {
        if (err.ajax) {
          ctx.body = err.ajax.message;
        } else {
          ctx.redirect('/login');
        }
      } else if (err.employeeNotLoggedIn) {
        if (err.ajax) {
          ctx.body = err.ajax.message;
        } else {
          ctx.redirect('/employee_login');
        }
      } */
    } else if (err.status === 200) {
/*       if (err.userLoggedIn) {
        ctx.redirect('/');
      } else if (err.employeeLoggedIn) {
        ctx.redirect('/employee/dashboard');
      } */
    } else {
      logger.error(`Error while executing code: ${err.stack}`);
    }

    ctx.body = ctx.body || 'Problem while processing your request';
  }
};
