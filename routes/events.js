"use strict";

const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Participant = require("../models/Participant")
const uploadCloud = require("../config/cloudinary.js");
const cloudinary = require('cloudinary');
var ObjectId = require('mongoose').Types.ObjectId; 


router.get("/add", (req, res, next) => {
  res.render("events/add-event");
});

  router.post('/add', uploadCloud.single('photo'),(req, res, next) => {
    let location = {
      type: 'Point',
      coordinates: [req.body.longitude, req.body.latitude] 
    };
    Event.create({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      city: req.body.city,
      location: location,
      imgName : req.file.originalname,
      imgPath : req.file.url,
      _creator: req.user._id
    })
    .then(events => {
      res.redirect('/events')
    })
  });

// JOINing THE EVENT
router.post('/:id/join', (req, res, next) => {
let _eventId = req.params.id
let _userId = req.user._id

Participant.findOne({_event: _eventId, _user: _userId})
.then(participant => {
  if (participant) {
    console.log("Nothing happened, already joined")
    return null; // Go to the next then
  }
  else {
    return Participant.create({
      _event: _eventId,
      _user: _userId
    })
  }
  })
  .then(participantCreated => {
    res.redirect("/events/" + _eventId + "/detail") 
  })
  .catch(err => next(err))
 
})

  
  
//DISPlAYING THE LIST OF EVENTS
router.get("/", (req, res, next) => {
  Event.find()
    .populate("_creator")
    .then(events => {
      res.render('events/events', {
        events:events})
    })
  })
  
//DISPLAYING DETAILS OF THE EVENT 
router.get("/:id/detail", (req, res, next) => {
  let id = req.params.id; 

  Promise.all([
    Event.findById(id),
    Participant.find({_event:id}).populate("_user")
  ])
  .then(([event, participants]) => {
    res.render("events/detail", { event, participants});
  })
});

//EDITING EVENTS
router.get("/:id/edit", (req, res, next) => {
  let id = req.params.id;
  Event.findById(id).then(event => {
    res.render("events/edit-event", { event, "message": req.flash("error") });
  });
});

router.post("/:id/edit", uploadCloud.single('photo'), (req, res, next) => {
  let _event = req.params.id
  if(!req.file){
    req.flash("error", "Please Choose a file to upload.");
    return res.redirect(`/events/${_event}/edit`);
  }
  let location = {
    type: "Point",
    coordinates: [req.body.longitude, req.body.latitude]
  };
  cloudinary.v2.uploader.destroy(_event.public_id, function(result) { console.log(result) });
  Event.findByIdAndUpdate(req.params.id, {
      title:req.body.title,
      description: req.body.description,
      date: req.body.date,
      city: req.body.city,
      location:location,
      imgName : req.file.originalname,
      imgPath : req.file.url,
      public_id: req.file.public_id
  }).then(event => {
    res.redirect("/events");
  });
});

//DELETING EVENTS
router.get("/:id/delete", (req, res, next) => {
  Event.findByIdAndRemove(req.params.id).then(events => {
    res.redirect("/events");
  });
});

//ADDING COMMENTS
router.post("/:eventId/add-comment", (req, res, next) => {
  // console.log('DEBUG', req.params.postId)
  let _eventId = req.params.eventId;
  let _ownerId = req.user._id;
  let creatorUsername1 = req.user.username;
  console.log(_eventId);
  let comment = {
    _creatorId: _ownerId,
    creatorUsername: creatorUsername1,
    _event: _eventId,
    content: req.body.content
    // likes: 0
  };
  Event.findByIdAndUpdate(
    { _id: _eventId },
    { $push: { comments: comment } }
  ).then(event => {
    console.log("AHHHH COMMENTS");
    console.log(event);
    res.redirect("/events/" + _eventId + "/detail");
  });
});

//DELETING COMMENTS ON EVENTS
router.post("/:eventId/comment/:commId/delete", (req, res, next) => {
  let _eventId = req.params.eventId;
  let _commId = req.params.commId;
  // console.log(req.params.commId);
  // console.log(req.params.eventId);
  Event.findById(_eventId).then(event => {
    console.log(event.comments);
    console.log("AHHHHHHHHHH");

    event.comments.forEach(function(one, index) {
      
      if (one._id == _commId) {
        event.comments.splice(index, 1);
        console.log("DEBUG: success!");
        event.save().then(one => {
          res.redirect("/events/" + _eventId + "/detail");
        });
      } else {
        console.log("nothing to remove");
      }
    });
    console.log("THE EVENT");
  });
});






module.exports = router;
