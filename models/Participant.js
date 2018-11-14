const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const participantSchema = new Schema({

  _event: {type: Schema.Types.ObjectId, ref: 'Event', unique:true},
  _user: {type: Schema.Types.ObjectId, ref: 'User', unique:true},
  // username: {type: String, unique: true, required: true},
  // password: {type: String, required: true, min: 3},
  // email: {type: String, unique: true, required: true, match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/},
  //Kind of vegetable
  
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Participant = mongoose.model('Participant', participantSchema);
module.exports = Participant;
