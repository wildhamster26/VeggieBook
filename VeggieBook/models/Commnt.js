"use strict";


const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
//Named Comment as Commnt because Comment is a reserved word for Javascript
const commntSchema = new Schema({
  _creator: { required: true, type: Schema.Types.ObjectId, ref: "User" },
  _post: { required: true, type: Schema.Types.ObjectId, ref: "Post" },
  content: String, 
  likes: Number
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
}); 

const Commnt = mongoose.model('Commnt', commntSchema);
module.exports = Commnt;
