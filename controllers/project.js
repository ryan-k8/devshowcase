const Project = require("../models/project");
const { cloudinary } = require("../util/cloudinary");

require("dotenv").config();

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

exports.postEditProject = async (req, res, next) => {
  const { user: sessionUser } = req.session;
  const { projectId: sessionProject } = req.params;
  const {
    name: updatedName,
    demoUrl: updatedDemoUrl,
    sourceCodeUrl: updatedSourceUrl,
    description: updatedDescription,
    techStack: updatedTechStack,
  } = req.body;

  const { files: updatedImages } = req;

  const updatedImagesMetaData = JSON.parse(req.headers["x-images-metadata"]);

  try {
    const project = await Project.findById(sessionProject._id.toString());

    //TODO: maybe deal with some of those edge cases
    updatedImagesMetaData.forEach((img) => {
      if (
        !project.images.find((projectImage) => projectImage.url == img.path)
      ) {
        cloudinary.uploader.destroy(
          process.env.CLOUDINARY_FOLDER_NAME + "/" + projectImage.cloudinaryId
        );
      }
    });

    project.name = updatedName;
    project.description = updatedDescription;
    project.links.demo = updatedDemoUrl;
    project.links.sourceCode = updatedSourceUrl;
    project.images = updatedImages.map((file) => ({
      url: file.path,
      cloudinaryId: file.filename.split("/")[1],
    }));
    project.technologies = JSON.parse(updatedTechStack).map((t) => t.tag);

    await project.save();
    req.status(201).json({ message: "edited" });
  } catch (err) {
    console.log(err);
  }
};
