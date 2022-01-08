const express = require("express");

const router = express.Router();
const projectController = require("../controllers/project");
const getAuth = require("../middlewares/is-auth");
const upload = require("../middlewares/upload");
const uploadValidator = require("../middlewares/upload-validator");

router.get("/projects/add-project", getAuth, projectController.getAddProject);

router.post(
  "/projects/add-project",
  getAuth,
  uploadValidator(["image/jpeg", "image/jpg", "image/png"], 2.5, 2),
  upload.array("image", 2),
  projectController.postAddProject
);

//TODO
router.get("/projects/:userId", (req, res) => {
  res.json({ message: "OK" });
});

router.get("/project/:projectId", (req, res) => {
  res.json({ message: "OK" });
});

router.get("/projects/edit-project/:projectId", (req, res) => {
  res.json({ message: "OK" });
});

router.post(
  "/projects/edit-project/:projectId",
  projectController.postEditProject
);

module.exports = router;
