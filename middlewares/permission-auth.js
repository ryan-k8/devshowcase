module.exports = (permission) => {
  return async (req, res, next) => {
    const allowed = await permission(req);

    if (!allowed) {
      const err = new Error("forbidden");
      err.statusCode = 403;
      next(err);
    }

    next();
  };
};
