require("dotenv").config();

const User = require("../models/user");
const axios = require("axios");
const { redirect } = require("express/lib/response");

async function loginFlowHelper(userData) {
  const {
    name,
    avatar_url: avatar,
    email: emailData,
    login: userName,
  } = userData;

  const primaryEmail = emailData.find((email) => email.primary == true);
  const email = primaryEmail.email;

  try {
    const emailAlreadyExists = await User.findOne({ email: email });

    if (!emailAlreadyExists) {
      await User.create({
        email: email,
        name: name,
        userName: userName,
        avatar: avatar,
      });
    }
  } catch (err) {
    console.log(err);
  }

  return email;
}

exports.getLogin = (req, res, next) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GH_CLIENT_ID}&scope=read:user,user:email`
  );
};

exports.handleOauth2Flow = async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return res.status(403).json({ message: "forbidden" });
  }

  try {
    const body = {
      client_id: process.env.GH_CLIENT_ID,
      client_secret: process.env.GH_CLIENT_SECRET,
      code: code,
    };

    const {
      data: { access_token: accessToken },
    } = await axios.post("https://github.com/login/oauth/access_token", body, {
      headers: {
        accept: "application/json",
      },
    });

    if (!accessToken) {
      throw new Error();
    }
    const opts = {
      headers: {
        Authorization: `token ${accessToken}`,
        accept: "application/json",
      },
    };

    const { data: userData } = await axios.get(
      "https://api.github.com/user",
      opts
    );

    const { data: emailData } = await axios.get(
      "https://api.github.com/user/emails",
      opts
    );

    const email = await loginFlowHelper({ ...userData, email: emailData });

    const user = await User.findOne({ email: email });
    req.session.isLoggedIn = true;
    req.session.user = user;

    req.session.save(() => {
      res.redirect("/");
    });
  } catch (err) {
    const error = new Error(
      "error in login (failure in retrieving access token)"
    );
    error.statusCode = 401;
    next(error);
  }
};

exports.postLogOut = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};
