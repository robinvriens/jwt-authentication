module.exports = async (ctx, next) => {
  if (!ctx.state.user) ctx.throw(401, 'Unauthorized');

  await next();
};
