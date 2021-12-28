const express = require("express");

const router = express.Router();
const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);

router.get("/oauth-callback", authController.handleOauth2Flow);

router.post("/logout", authController.postLogOut);

module.exports = router;
