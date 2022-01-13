const Project = require("../models/project");
const User = require("../models/user");
const { cloudinary } = require("../util/cloudinary");
const ITEMS_PER_PAGE = 6;
require("dotenv").config();

exports.getProjects = async (req, res, next) => {
  const { search } = req.query;
  let { page } = req.query;

  try {
    if (!page && !search) {
      res.render("projects/index", {
        pageTitle: "Projects",
        isAuthenticated: req.session.isLoggedIn,
        path: "/projects",
        search: [],
        pagination: [],
      });
    }

    if (search) {
      page = typeof page === typeof undefined ? 1 : page;

      const total = await Project.find({
        technologies: { $in: search.split(" ") },
      })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .sort({ createdAt: -1 })
        .countDocuments();

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

      res.render("projects/index", {
        pageTitle: "Add Project",
        isAuthenticated: req.session.isLoggedIn,
        path: "/projects",
        search: search.split(" "),
        pagination: {
          data: resultantProjects,
          hasPreviousPage: page > 1,
          previousPage: page - 1,
          total: total,
          currentPage: page,
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

    const user = await User.find({ user: userId }).select({
      userName: 1,
      avatar: 1,
    });

    const resultantProjects = await Project.find({ user: userId })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .sort({ createdAt: -1 })
      .select({ name: 1, description: 1, images: 1, technologies: 1 });

    res.render("projects/user-projects", {
      pageTitle: "Add Project",
      isAuthenticated: req.session.isLoggedIn,
      path: "/projects",
      user: user,
      pagination: {
        data: resultantProjects,
        hasPreviousPage: page > 1,
        previousPage: page - 1,
        total: total,
        currentPage: page,
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

    const project = await Project.findById(projectId);

    res.render("/projects/project", {
      pageTitle: project.name || "Project",
      isAuthenticated: req.session.isLoggedIn,
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

  const { prevImages: prevImagesMetaData } = JSON.parse(
    req.headers["x-images-metadata"]
  );

  console.log(prevImagesMetaData);

  try {
    const project = await Project.findById(projectId);

    project.images.forEach((alreadyPresentImg) => {
      if (!prevImagesMetaData.find((img) => img.url == alreadyPresentImg.url)) {
        cloudinary.uploader.destroy(
          process.env.CLOUDINARY_FOLDER_NAME +
            "/" +
            alreadyPresentImg.cloudinaryId
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
    res.status(201).json({ message: "edited" });
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteProject = async (req, res, next) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);

    project.images.forEach((img) => {
      cloudinary.uploader.destroy(
        process.env.CLOUDINARY_FOLDER_NAME + "/" + img.cloudinaryId
      );
    });

    await project.remove();
    res.status(200).json({ message: "deleted" });
  } catch (err) {
    console.log(err);
  }
};
