"use strict";

const express = require('express');
const router  = express.Router();
const User = require("../models/User");
const ensureLogin = require("connect-ensure-login");
const uploadCloud = require('../config/cloudinary.js');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});


router.get('/users', ensureLogin.ensureLoggedIn("/auth/login"), (req, res, next) => {			
	// Get all the users from the db		
	User.find({status:"Active"})		
	.then(users => {		
		res.render("users/users", {	
			users: users
		})	
  })
  .catch(error => {	
    redirect("/auth/login")
  })			
});

router.get('/users/:id', (req, res, next) => {			
  let profileOwner = false;
  let id = req.params.id
  if(req.user._id == req.params.id)
    profileOwner = true;
  User.findById(id)	
    .then(user => {	
      console.log("this is the owner:", profileOwner)
    res.render('users/user-detail', {	
      user, profileOwner
      })	
    })	
  .catch(error => {	
    next(error)
  })	
});		


router.get('/users/:id/edit', (req, res, next) => {
  User.findById(req.params.id)		
	.then(user => {
    if(!(req.user._id == req.params.id))
      res.redirect('/users');
    else
      res.render('users/edit-user', { user });
	})		
});

router.post('/users/:id/edit', uploadCloud.single('photo'), (req, res, next) => {	
  User.findByIdAndUpdate(req.params.id, {
  username: req.body.username,
  password: req.body.password,
  email: req.body.email,
  kind: req.body.kind,
  age: req.body.age,
  phoneNumber: req.body.phoneNumber,
  hobbies: req.body.hobbies,
  fears: req.body.fears,
  favFoods: req.body.favFoods,
  darkSecret: req.body.darkSecret
  })
	.then(user => {	
    res.redirect('/users');	
	})		
});

router.get('/users/:id/delete', (req, res, next) => {
  if(!(req.user._id == req.params.id))
    res.redirect('/users');
  else
    User.findByIdAndRemove(req.params.id)
    .then(user => {	
      res.redirect('/users')
    })	
});


module.exports = router;
