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
  Event.findById(req.params.id).then(event => {
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
      location: location,
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

module.exports = router;