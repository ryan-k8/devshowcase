exports.getProfile = async (req, res, next) => {
  res.render("profile", {
    pageTitle: "Profile",
    isAuthenticated: req.session.isLoggedIn,
    path: "/profile",
  });
};
