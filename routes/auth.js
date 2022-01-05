const express = require("express");

const router = express.Router();
const authController = require("../controllers/auth");
const getAuth = require("../middlewares/is-auth");
router.get("/login", authController.getLogin);

router.get("/oauth-callback", authController.handleOauth2Flow);

router.post("/logout", getAuth, authController.postLogOut);

module.exports = router;
