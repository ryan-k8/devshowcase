const express = require("express");

const router = express.Router();
const profileController = require("../controllers/profile");
const getAuth = require("../middlewares/is-auth");

router.get("/profile", getAuth, profileController.getSessionProfile);
router.get("/profile/:userId", profileController.getProfile);

router.get("/edit-profile", getAuth, profileController.getEditProfile);

router.post("/edit-profile", getAuth, profileController.postEditProfile);

module.exports = router;
