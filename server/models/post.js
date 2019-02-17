const mongoose = require("mongoose");
const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  post: {
    type: String,
    required: true
  },
  hashtags: {
    type: [String]
  }
})
const Post = mongoose.model("Post", postSchema);
module.exports = {postSchema, Post}
