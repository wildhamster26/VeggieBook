"use strict";

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const eventSchema = new Schema({
  title: {type: String, required:true},
  description: {type: String, required:true},
  _creator: {type: Schema.Types.ObjectId, ref: 'User'},
  date: Date,
  comments: [ {
    _creatorId: { required: true, type: Schema.Types.ObjectId, ref: "User" },
    creatorUsername: String,
    _event: { required: true, type: Schema.Types.ObjectId, ref: "Event" },
    content: String, 
    likes: Number,
    edited: { type: Boolean, default: true},
    createdAt: { type: Date, default: Date.now() }
  } ],
  imgName: String,
  imgPath: String,
  public_id: {type: String, default:""},
  address: {
    street: String,
    city: String   
  },
  location: { type: { type: String }, coordinates: [Number] },
  _attendees: [{type: Schema.Types.ObjectId, ref: 'User'}],
},{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

eventSchema.index({ location: '2dsphere' });
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;