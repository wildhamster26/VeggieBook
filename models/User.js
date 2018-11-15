"use strict";

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, unique: true, required:true},
  password: String,
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
  googleID: String,
  imgName: {type: String, default:""},
  imgPath: {type: String, default:""},
  public_id: {type: String, default:""},
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

//CREATED A METHOD FOR FINDING FRIENDS
// Define a User.findFriends that is a Promise where the resolved value is an array of ids (friend ids) 
userSchema.statics.findFriends = function (userId) {
  return this.model("Friend").find({ $or: [{ _user1: userId },{ _user2:  userId }]})
  .then(friends => {
    return friends.map(friend => {
      if (friend._user1.equals(userId)) return friend._user2
      else return friend._user1
    })
  })
}

const User = mongoose.model('User', userSchema);
module.exports = User;
