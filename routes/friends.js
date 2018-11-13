"use strict";
 const express = require('express');
const router  = express.Router();
const {ensureLoggedIn} = require('connect-ensure-login');
const Post = require('../models/Post')
const User = require('../models/User')
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");
// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
 /* Will include routes to posts and comments */
 //LIST OF FRIENDS
router.get('/', (req, res, next) => {
  const user = req.user._id
   User.find()
  .populate("_creator")
  .then(posts => {
    res.render('friends/my-friends', {posts: posts, user})
    // console.log('posts')
  })
})
 router.get('/find', (req, res, next) => {
  const currentUser = req.user._id
  const user = req.user
  User.find()
  .then(users => {
    res.render('friends/find-friends', {users, currentUser, user})
  })
})
 router.post('/invite/:id', (req, res, next) => {
  const inviterId = req.user._id
  const inviteeId = req.params.id
  const confirmationCode = randomstring.generate(30);
   var email = ''
  var inviteeUsername = ''
  
  User.findOneAndUpdate({_id: inviteeId}, { $push: { invitersId: inviterId }})
  .then(user => {
    
  })
  User.findOneAndUpdate({_id: inviterId}, { $push: { inviteesId: inviteeId }})
  .then(user => {
    res.redirect('/friends/find')
  })
   User.findById({ _id: inviteeId })
    .then(invitee => {
      email = invitee.email
      inviteeUsername = invitee.username
       let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user:  process.env.GMAIL_USER,
          pass:  process.env.GMAIL_PASS
        }
      });
      transporter.sendMail({
        from: '"The Veggiebook team"',
        to: email, // the email entered in the form 
        subject: 'Hey, friend me!', 
        html: `Hi ${inviteeUsername}, please click <a href="http://localhost:5000/friends/find/${confirmationCode}">here</a> to accept this friend request.` //Additional alternative text: If the link doesn't work, you can go here: ${process.env.BASE_URL}auth/confirm/${confirmationCode}`
      })
    })
  })
 module.exports = router