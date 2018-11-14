"use strict";

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const friendSchema = new Schema({
  _user1: {type: Schema.Types.ObjectId, ref: "User"},
  _user2: {type: Schema.Types.ObjectId, ref: "User"},
  // _user1: String,
  // _user2: String,
  friendConfirmCode: String,
  status: { type: String, enum: ["Pending", "Friends", "Rejected"] }
} , {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Friend = mongoose.model('Friend', friendSchema);
module.exports = Friend;
