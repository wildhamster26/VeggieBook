"use strict";

const express = require('express');
const router  = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Event = require("../models/Event");
const Friend = require("../models/Friend");
const ensureLogin = require("connect-ensure-login");
const uploadCloud = require('../config/cloudinary.js');
const cloudinary = require('cloudinary');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});


router.get('/users', ensureLogin.ensureLoggedIn("/auth/login"), (req, res, next) => {			
	// Get all the users from the db		
	User.find({status:"active"})		
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
  let userPosts;
  let userEvents;
  let id = req.params.id
  if(req.user._id == req.params.id){
    profileOwner = true;
  }
  Post.find({_creator : id}).then(posts => {userPosts = posts});
  Event.find({_creator : id}).then(events => {userEvents = events});
  // Friend.find({_user2 : id}).then(Friends => {userFriends = Friends});
  User.findById(id)
    .then(user => {	
    res.render('users/user-detail', {	
      user, profileOwner, userPosts, userEvents
      })	
    })	
  .catch(error => {	
    next(error)
  })	
});		

router.get("/users/:id/friends", (req,res,next) => {
  let id = req.params.id;
  let currentUserFriends = [];
  Promise.all([
    User.find(),
    Friend.find({ $or: [{ _user1: id },{ _user2:  id }]})
  ])
  .then(([users, friends]) => {
    for (let iUsers = 0; iUsers < users.length; iUsers++) {
      users[iUsers].isCurrentUser = false
      if (users[iUsers]._id.equals(id)) {
        users[iUsers].isCurrentUser = true
      }

      if (users[iUsers].status == "active") {
        users[iUsers].isActive = true
      }

      for (let iFriend = 0; iFriend < friends.length; iFriend++) {
        if (friends[iFriend]._user1.equals(users[iUsers]._id) || friends[iFriend]._user2.equals(users[iUsers]._id)) {
          if(friends[iFriend].status == "Friends") {
            currentUserFriends.push(users[iUsers]);
            console.log(currentUserFriends)
          }
        }
      }
    }
    User.findById(id)
    .then(viewedUser => {
      res.render('users/viewed-user-friends', {currentUserFriends, viewedUser})
    })
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
  cloudinary.v2.uploader.destroy(req.user.public_id, function(result) { console.log(result) });
  User.findByIdAndUpdate(req.params.id, {
  username: req.body.username,
  email: req.body.email,
  kind: req.body.kind,
  age: req.body.age,
  phoneNumber: req.body.phoneNumber,
  hobbies: req.body.hobbies,
  fears: req.body.fears,
  favFoods: req.body.favFoods,
  darkSecret: req.body.darkSecret,
  imgPath: req.file.url,
  imgName: req.file.originalname,
  public_id: req.file.public_id
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
