const Project = require("../models/project");
const User = require("../models/user");
const { cloudinary } = require("../util/cloudinary");
const ITEMS_PER_PAGE = 3;
require("dotenv").config();

exports.getProjects = async (req, res, next) => {
  const { search } = req.query;
  let { page } = req.query;

  try {
    if (!page && !search) {
      res.render("project/index", {
        pageTitle: "Projects",
        user: req.session.user,
        isAuthenticated: req.session.isLoggedIn,
        path: "/projects",
        search: [],
        pagination: {},
      });
    }

    if (search) {
      page = typeof page === typeof undefined ? 1 : page;

      const total = await Project.find({
        technologies: { $in: search.split(" ") },
      }).countDocuments();

      const resultantProjects = await Project.find({
        technologies: { $in: search.split(" ") },
      })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .sort({ createdAt: -1 })
        .select({
          name: 1,
          images: 1,
          technologies: 1,
          description: 1,
        });

      res.render("project/index", {
        pageTitle: "Add Project",
        isAuthenticated: req.session.isLoggedIn,
        path: "/projects",
        user: req.session.user,
        search: search.split(" "),
        pagination: {
          data: resultantProjects,
          hasPreviousPage: page > 1,
          previousPage: parseInt(page) - 1,
          total: total,
          currentPage: parseInt(page),
          hasNextPage: ITEMS_PER_PAGE * page < total,
          nextPage: parseInt(page) + 1,
          lastPage: Math.ceil(total / ITEMS_PER_PAGE),
        },
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getUserProjects = async (req, res, next) => {
  let { page } = req.query;
  const { userId } = req.params;
  try {
    page = typeof page === typeof undefined ? 1 : page;

    const total = await Project.find({ user: userId }).countDocuments();

    const user = await User.findOne({ _id: userId }).select({
      userName: 1,
      avatar: 1,
    });

    const resultantProjects = await Project.find({ user: userId })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .sort({ createdAt: -1 })
      .select({ name: 1, description: 1, images: 1, technologies: 1 });

    res.render("project/user-projects", {
      pageTitle: "Add Project",
      isAuthenticated: req.session.isLoggedIn,
      path: "/projects",
      user: user,
      sessionUser: req.session.user,
      search: ["react", "node"],
      pagination: {
        data: resultantProjects,
        hasPreviousPage: page > 1,
        previousPage: parseInt(page) - 1,
        total: total,
        currentPage: parseInt(page),
        hasNextPage: ITEMS_PER_PAGE * page < total,
        nextPage: parseInt(page) + 1,
        lastPage: Math.ceil(total / ITEMS_PER_PAGE),
      },
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("user")
      .populate({
        path: "comments",
        populate: { path: "user" },
      });

    res.render("project/project", {
      pageTitle: typeof project == typeof null ? "Project" : project.name,
      isAuthenticated: req.session.isLoggedIn,
      sessionUser: req.session.user,
      path: "/projects",
      project: project,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getAddProject = async (req, res, next) => {
  try {
    res.render("project/add-project", {
      pageTitle: "Add Project",
      isAuthenticated: req.session.isLoggedIn,
      path: "/projects",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postAddProject = async (req, res, next) => {
  const { user: sessionUser } = req.session;
  try {
    const { name, demoUrl, sourceCodeUrl, description, techStack } = req.body;

    const { files: images } = req;

    const project = new Project({
      name: name,
      description: description,
      links: {
        demo: demoUrl,
        sourceCode: sourceCodeUrl,
      },
      user: sessionUser._id.toString(),
      images: images.map((file) => ({
        url: file.path,
        cloudinaryId: file.filename.split("/")[1],
      })),
      technologies: JSON.parse(techStack).map((t) => t.tag),
      comments: [],
    });

    await project.save();

    res.redirect("/profile");
  } catch (err) {
    res.status(500).json({ message: "couldn't add project" });
  }
};

exports.getEditProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    console.log(project);

    res.render("project/edit-project", {
      pageTitle: "Edit Project",
      isAuthenticated: req.session.isLoggedIn,
      projectData: project,
      path: "/projects",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postEditProject = async (req, res, next) => {
  const { projectId } = req.params;
  console.log(req.body);
  const {
    name: updatedName,
    demoUrl: updatedDemoUrl,
    sourceCodeUrl: updatedSourceUrl,
    description: updatedDescription,
    techStack: updatedTechStack,
  } = req.body;

  let { files: uploadedImages } = req;
  if (uploadedImages) {
    uploadedImages = uploadedImages.map((i) => ({
      url: i.path,
      cloudinaryId: i.filename.split("/")[1],
    }));
  } else {
    uploadedImages = [];
  }

  const { prevImages: prevImagesMetaData } = JSON.parse(req.headers["x-images-metadata"]);

  console.log(prevImagesMetaData);

  try {
    const project = await Project.findById(projectId);

    project.images.forEach((alreadyPresentImg) => {
      if (!prevImagesMetaData.find((img) => img.url == alreadyPresentImg.url)) {
        cloudinary.uploader.destroy(
          process.env.CLOUDINARY_FOLDER_NAME + "/" + alreadyPresentImg.cloudinaryId
        );
      } else {
        uploadedImages.push(alreadyPresentImg);
      }
    });

    project.name = updatedName;
    project.description = updatedDescription;
    project.links.demo = updatedDemoUrl;
    project.links.sourceCode = updatedSourceUrl;
    project.images = uploadedImages;
    project.technologies = JSON.parse(updatedTechStack).map((t) => t.tag);

    await project.save();
    res.redirect(`/project/${projectId}`);
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteProject = async (req, res, next) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);

    project.images.forEach((img) => {
      cloudinary.uploader.destroy(process.env.CLOUDINARY_FOLDER_NAME + "/" + img.cloudinaryId);
    });

    await project.remove();
    res.redirect(`/projects/user/${req.session.user._id.toString()}`);
  } catch (err) {
    console.log(err);
  }
};

exports.postAddComment = async (req, res, next) => {
  const { projectId } = req.params;
  const { comment } = req.body;

  const { user: sessionUser } = req.session;

  try {
    const project = await Project.findById(projectId);
    const { _id: commentId } = await project.addComment({
      userId: sessionUser._id.toString(),
      comment: comment,
    });

    res.status(201).json({ message: "CREATED", uid: commentId.toString() });
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteComment = async (req, res, next) => {
  const { projectId, commentId } = req.params;
  try {
    const project = await Project.findById(projectId);

    await project.removeComment(commentId);

    res.status(200).json({ message: "DELETED" });
  } catch (err) {
    console.log(err);
  }
};

exports.postVoteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { user: sessionUser } = req.session;
    const { type } = req.body;

    const Project = await Project.findById(projectId);

    const [err, done] = await Project.voteProject({
      type: type,
      userId: sessionUser._id.toString(),
    });

    if (err && !done) {
      res.status(409).json({ message: err.message });
    }

    res.status(200).json({ message: "done" });
  } catch (err) {
    console.log(err);
  }
};
