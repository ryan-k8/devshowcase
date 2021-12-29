exports.getIndex = (req, res, next) => {
  res.render("index", {
    pageTitle: "devShowCase",
    isAuthenticated: req.session.isLoggedIn,
    path: "/",
  });
};
