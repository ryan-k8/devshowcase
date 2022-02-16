const mongoose = require("mongoose");

const upvoteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const downvoteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

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

  upvotes: [upvoteSchema],

  downvotes: [downvoteSchema],
});

projectSchema.methods.addComment = async function ({ userId, comment }) {
  this.comments = [...this.comments, { user: userId, text: comment }];

  await this.save();

  return this.comments[this.comments.length - 1];
};

projectSchema.methods.removeComment = function (commentId) {
  const updatedComments = this.comments.filter(
    (comment) => comment._id.toString() != commentId.toString()
  );
  this.comments = updatedComments;
  return this.save();
};

projectSchema.methods.voteProject = async function ({ type, userId }) {
  const alreadyUpvoted = this.upvotes.find(
    (upvote) => upvote.user.toString() == userId
  );
  const alreadyDownvoted = this.downvotes.find(
    (downvote) => downvote.user.toString() == userId
  );

  if (type == "upvote") {
    if (alreadyUpvoted) {
      this.upvotes = this.upvotes.filter(
        (upvote) => upvote.user.toString() != userId
      );
    } else {
      this.upvotes = [...this.upvotes, { user: userId }];
      this.downvotes = this.downvotes.filter((downvote) => {
        return downvote.user.toString() != userId.toString();
      });
    }
  } else {
    if (alreadyDownvoted) {
      this.downvotes = this.downvotes.filter(
        (downvote) => downvote.user.toString() != userId
      );
    } else {
      this.downvotes = [...this.downvotes, { user: userId }];
      this.upvotes = this.upvotes.filter((upvote) => {
        return upvote.user.toString() != userId.toString();
      });
    }
  }

  await this.save();
};

projectSchema.virtual("score").get(function () {
  if (this.upvotes && this.downvotes) {
    return this.upvotes.length - this.downvotes.length;
  }
  return 0;
});

const Project = mongoose.model("project", projectSchema);
module.exports = Project;
