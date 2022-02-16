const express = require("express");

const router = express.Router();
const projectController = require("../controllers/project");
const getAuth = require("../middlewares/is-auth");
const permitAuth = require("../middlewares/permission-auth");
const upload = require("../middlewares/upload");
const uploadValidator = require("../middlewares/upload-validator");

const projectPermission = require("../permissions/project");
const commentPermission = require("../permissions/comment");

router.get("/projects/add-project", getAuth, projectController.getAddProject);

router.get(
  "/projects/edit-project/:projectId",
  getAuth,
  permitAuth(projectPermission),
  projectController.getEditProject
);

router.get("/projects/user/:userId", projectController.getUserProjects);

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

router.post(
  "/project/:projectId/add-comment",
  getAuth,
  projectController.postAddComment
);

router.post(
  "/project/:projectId/delete-comment/:commentId",
  getAuth,
  permitAuth(commentPermission),
  projectController.postDeleteComment
);

router.post("/project/:projectId/vote", projectController.postVoteProject);

module.exports = router;
