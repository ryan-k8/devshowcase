const mongoose = require("mongoose");

const userProfileSchema = mongoose.Schema({
  about: {
    type: String,
  },

  technologies: [String],

  projects: [
    {
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project",
        required: true,
        index: true,
      },
    },
  ],
});

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  name: {
    type: String,
    required: true,
  },

  userName: {
    type: String,
    required: true,
  },

  avatar: {
    type: String,
  },

  profileData: userProfileSchema,
});

const User = mongoose.model("user", userSchema);
module.exports = User;
