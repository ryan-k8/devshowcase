const { exists } = require("../models/user");
const User = require("../models/user");

exports.getSessionProfile = async (req, res, next) => {
  res.redirect(`/profile/${req.session.user._id.toString()}`);
};

exports.getProfile = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate({
      path: "profileData.projects",
      populate: { path: "projectId" },
    });

    if (!user) {
      res.render("error", {
        pageTitle: "Not Found",
        statusCode: 404,
      });
    }
    res.render("profile/profile", {
      pageTitle: "Profile",
      isAuthenticated: req.session.isLoggedIn,
      path: "/profile",
      userProfile: user,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getEditProfile = async (req, res, next) => {
  try {
    const { user } = req.session;
    const userData = await User.findById(user._id.toString());

    res.render("profile/profile-edit", {
      pageTitle: "Edit Profile",
      isAuthenticated: req.session.isLoggedIn,
      path: "/profile",
      userProfile: userData,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postEditProfile = async (req, res, next) => {
  const { user: sessionUser } = req.session;
  const {
    realName: updatedName,
    userName: updatedUserName,
    aboutMe: updatedAbout,
    techStack: updatedTechnologies,
  } = req.body;

  try {
    const user = await User.findById(sessionUser._id.toString());
    user.name = updatedName;
    user.userName = updatedUserName;
    user.profileData.exists = true;
    user.profileData.about = updatedAbout;
    user.profileData.technologies = JSON.parse(updatedTechnologies).map(
      (t) => t.tag
    );

    await user.save();
    res.redirect(`/profile/${sessionUser._id.toString()}`);
  } catch (err) {
    console.log(err);
    res.redirect("/edit-profile");
  }
};
