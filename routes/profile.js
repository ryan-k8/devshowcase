const express = require("express");

const router = express.Router();
const profileController = require("../controllers/profile");

router.get("/profile", profileController.getProfile);

router.post("/edit-profile", (req, res) => {
  //TODO: add edit feature
  res.status(200).json({ message: "done" });
});

module.exports = router;
