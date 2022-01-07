const Project = require("../models/project");

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
      images: images.map((file) => ({ url: file.path })),
      technologies: JSON.parse(techStack).map((t) => t.tag),
    });

    await project.save();

    res.redirect("/profile");
  } catch (err) {
    res.status(500).json({ message: "couldn't add project" });
  }
};
