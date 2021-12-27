exports.get404 = (req, res, next) => {
  res.render("error", {
    pageTitle: "Error",
    statusCode: 404,
  });
};
