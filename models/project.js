const mongoose = require("mongoose");

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
});

const Project = mongoose.model("project", projectSchema);
module.exports = Project;
