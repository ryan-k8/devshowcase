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
