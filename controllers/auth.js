const res = require("express/lib/response");

require("dotenv").config();

exports.getLogin = (req, res, next) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GH_CLIENT_ID}`
  );
};

exports.handleOauth2Flow = async (req, res, next) => {
  const { code } = req.query;

  res.status(200).json({ code: code });
};
