module.exports = async (ctx, next) => {
  const requestUrl = ctx.request.url;
  const userServiceUrls = [
    '/log_in/',
    '/sign_up/',
  ];
  const userLoggedInUrls = [
    '/create_room/',
    '/log_out/',
    '/destroy_room/',
    '/create_room',
    '/browse_rooms',
    '/room_data',
    '/join_room',
  ];

  if (userServiceUrls.some((url) => requestUrl.startsWith(url) ||
    (requestUrl + '/').startsWith(url))) {
    if (ctx.session.isUserLoggedIn) {
      ctx.throw(200, 'User already logged in.', { userLoggedIn: true, _message: 'User already logged in', _code: 'UC_100', });
    }

    return;
  }

  if (userLoggedInUrls.some((url) => requestUrl.startsWith(url) ||
    (requestUrl + '/').startsWith(url))) {
    if (!ctx.session.isUserLoggedIn) {
      ctx.throw(403, 'User not logged in.', { userNotLoggedIn: true, _message: 'User not logged in', _code: 'UC_101' });
    }

    return;
  }

  await next();
};