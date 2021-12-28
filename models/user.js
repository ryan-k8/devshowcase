const mongoose = require("mongoose");

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

  avatar: {
    type: String,
  },
});

const User = mongoose.model("user", userSchema);
module.exports = User;
