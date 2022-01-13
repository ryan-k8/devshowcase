const express = require("express");

const router = express.Router();
const projectController = require("../controllers/project");
const getAuth = require("../middlewares/is-auth");
const permitAuth = require("../middlewares/permission-auth");
const upload = require("../middlewares/upload");
const uploadValidator = require("../middlewares/upload-validator");

const projectPermission = require("../permissions/project");

router.get("/projects/add-project", getAuth, projectController.getAddProject);

router.get(
  "/projects/edit-project/:projectId",
  getAuth,
  permitAuth(projectPermission),
  projectController.getEditProject
);

router.get("/projects/:userId", projectController.getUserProjects);

router.get("/project/:projectId", projectController.getProject);

router.get("/projects", projectController.getProjects);

router.post(
  "/projects/add-project",
  getAuth,
  uploadValidator(["image/jpeg", "image/jpg", "image/png"], 2.5, 2),
  upload.array("image", 2),
  projectController.postAddProject
);

router.post(
  "/projects/edit-project/:projectId",
  getAuth,
  permitAuth(projectPermission),
  uploadValidator(["image/jpeg", "image/jpg", "image/png"], 2.5, 2),
  upload.array("image", 2),
  projectController.postEditProject
);

router.post(
  "/projects/delete-project/:projectId",
  getAuth,
  permitAuth(projectPermission),
  projectController.postDeleteProject
);

module.exports = router;
