"use strict";

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;


const postSchema = new Schema({
  title: String,
  content: String,
  _creator: {type: Schema.Types.ObjectId, ref: 'User'},
  _pic: {type: Schema.Types.ObjectId, ref: 'Picture'}
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
