const Project = require("../models/project");

module.exports = async (req) => {
  try {
    const { user } = req.session;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (project.user.toString() != user._id.toString()) {
      return false;
    }

    return true;
  } catch (err) {
    console.log(err);
  }
};
