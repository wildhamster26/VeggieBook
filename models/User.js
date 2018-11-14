"use strict";

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, unique: true, required: true},
  password: {type: String, required: true, min: 3},
  email: {type: String, unique: true, required: true, match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/},
  //Kind of vegetable
  status: {type: String, enum: ["active", "inactive"], default: "inactive"},
  kind: String,
  age: Number,
  phoneNumber: String,
  hobbies: String,
  fears: String,
  //favorite foods to be in
  favFoods: String,
  darkSecret: String,
  confirmationCode: String,
  // _invitersId: [ {type: Schema.Types.ObjectId, ref: "User"} ],
  // _inviteesId: [ {type: Schema.Types.ObjectId, ref: "User"} ],
  // _friendsId: [ {type: Schema.Types.ObjectId, ref: "User"} ],
  imgName: {type: String, required: true},
  imgPath: {type: String, required: true}
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
