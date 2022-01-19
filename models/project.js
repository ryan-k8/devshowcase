const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const projectSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  links: {
    demo: {
      type: String,
      required: true,
    },

    sourceCode: {
      type: String,
      required: true,
    },
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  technologies: [String],

  images: [{ url: String, cloudinaryId: String }],

  comments: [commentSchema],
});

projectSchema.methods.addComment = function ({ userId, comment }) {
  this.comments = [...this.comments, { user: userId, text: comment }];

  return this.save();
};

projectSchema.methods.removeComment = function (commentId) {
  const updatedComments = this.comments.filter(
    (comment) => comment._id.toString() != commentId.toString()
  );
  this.comments = updatedComments;
  return this.save();
};

const Project = mongoose.model("project", projectSchema);
module.exports = Project;
