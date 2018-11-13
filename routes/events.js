"use strict";

const express = require('express');
const router  = express.Router();
const {ensureLoggedIn} = require('connect-ensure-login');
const Event = require('../models/Event')
const uploadCloud = require('../config/cloudinary.js');


// router.get('/', (req, res, next) => {
// res.render("events/events")
// })

router.get('/add', (req, res, next) => {
  res.render("events/add-event")
  })


  router.post('/add', uploadCloud.single('photo'),(req, res, next) => {
    let location = {
      type: 'Point',
      coordinates: [req.body.longitude, req.body.latitude] 
    };
    console.log('Location Works!!!');
    Event.create({
      title:req.body.title,
      description: req.body.description,
      date: req.body.date,
      city: req.body.city,
      location: location,
      // imgName : req.file.originalname,
      // imgPath : req.file.url
    })
    .then(events => {
      res.redirect('/events')
    })
  });

  router.get('/', (req, res, next) => {
   Event.find()
    .populate("_creator")
    .then(events => {
      res.render('events/events', {events: events})
      // console.log('posts')
    })
  })

router.get('/:id/detail', (req, res, next) => {
  let id = req.params.id
  Event.findById(id)
  .then(event =>{
    res.render("events/detail", {event})
  })
})

//EDITING EVENTS
router.get("/:id/edit", (req, res, next) => {
  let id = req.params.id
  Event.findById(id).then(event => {
    res.render("events/edit-event", {event});
  });
});

router.post("/:id/edit", (req, res, next) => {
  let location = {
    type: 'Point',
    coordinates: [req.body.longitude, req.body.latitude] 
  };
  Event.findByIdAndUpdate(req.params.id, {
      title:req.body.title,
      description: req.body.description,
      date: req.body.date,
      city: req.body.city,
      location:location,
      // imgName : req.file.originalname,
      // imgPath : req.file.url
  }).then(event => {
    res.redirect("/events");
  });
});


//DELETING EVENTS
router.get('/:id/delete',  (req, res, next) => {
  Event.findByIdAndRemove(req.params.id)
    .then(events => {
      res.redirect('/events')
    })
})


//ADDING COMMENTS

//ADDING COMMENTS
router.post('/:eventId/add-comment', (req, res, next) => {
  // console.log('DEBUG', req.params.postId)
  let _eventId = req.params.eventId
  let _ownerId = req.user._id
  let creatorUsername1 = req.user.username
  // console.log(req.user._id)
  let comment = {
      _creatorId: _ownerId,
      creatorUsername: creatorUsername1,
      _event: _eventId,
      content: req.body.content,
      // likes: 0
  }
    Event.findByIdAndUpdate({ _id: _eventId }, { $push: {comments: comment} })
      .then(event => {
        console.log("AHHHH COMMENTS")
        console.log(event)
        res.redirect('/events/')
      })
});

//DELETING COMMENTS
router.get('/:eventId/comment/:commId/delete', (req, res, next) => {
  let eventId = req.params.eventId
  let commId = req.params.commId
  // res.redirect('/posts')
  // Commnt.findByIdAndDelete(commId)
  Event.findById(eventId)
    .then(event => {
      var updatedComments = event.comments.filter((el, i) => {
        return el._id != commId
      })
      Post.findByIdAndUpdate({ _id: eventId }, {comments: updatedComments} )
        .then(event => {
          res.redirect('/:id/detail')
          // console.log('comment deleted')
        })
      
    })
  
})


module.exports = router;