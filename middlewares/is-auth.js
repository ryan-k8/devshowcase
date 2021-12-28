module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    const err = new Error("unauthorized");
    err.statusCode = 401;
    next(err);
  }

  next();
};
