const Project = require("../models/project");

module.exports = async (req) => {
  try {
    const { user: sessionUser } = req.session;
    const { projectId, commentId } = req.params;

    const project = await Project.findById(projectId);

    const [comment] = project.comments.filter((comment) => {
      return comment._id.toString() == commentId;
    });

    if (comment.user.toString() != sessionUser._id.toString()) {
      return false;
    }

    return true;
  } catch (err) {
    console.log(err);
  }
};
