const mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  technologies: [String],

  image: {
    type: String,
  },
});

const Project = mongoose.define("project", projectSchema);
module.exports = Project;
