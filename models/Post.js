"use strict";

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const postSchema = new Schema({
  title: {type: String, required:true},
  content: {type: String, required:true},
  image: String,
  visibility: {type: String, enum: ["Private", "Public"], default: "Public"},
  category: {type: String, enum:["Recommendation", "Story", "Question"], default: "Story"},
  _creator: {type: Schema.Types.ObjectId, ref: 'User'},
  // _pic: {type: Schema.Types.ObjectId, ref: 'Picture'}
  // comments: [ { type : Schema.Types.ObjectId, ref: 'Commnt' } ]
  comments: [ {
    _creatorId: { required: true, type: Schema.Types.ObjectId, ref: "User" },
    creatorUsername: String,
    _post: { required: true, type: Schema.Types.ObjectId, ref: "Post" },
    content: String, 
    likes: Number,
    edited: { type: Boolean, default: true},
    createdAt: { type: Date, default: Date.now() }
  } ],
  imgName: String,
  imgPath: String
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
