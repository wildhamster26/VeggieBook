"use strict";
 const express = require('express');
const router  = express.Router();
const {ensureLoggedIn} = require('connect-ensure-login');
const Post = require('../models/Post')
const User = require('../models/User')
const Friend = require('../models/Friend')
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
  .then(friends => {
    res.render('friends/my-friends', { friends, user })
  })
})

router.get('/find', (req, res, next) => {
  // const currentUser = req.user._id
  const user = req.user
  Promise.all([
    User.find(),
    // Friend.find({ status: "Friends", $or: [{ _user1: req.user._id },{ _user2:  req.user._id }]})
    Friend.find({ $or: [{ _user1: req.user._id },{ _user2:  req.user._id }]})
  ])
  .then(([users, friends]) => {
    for (let iUsers = 0; iUsers < users.length; iUsers++) {
      users[iUsers].isCurrentUser = false
      // console.log(typeof(users[iUsers]._id))
      // console.log(typeof(user._id))
      if (users[iUsers]._id.equals(user._id)) {
        users[iUsers].isCurrentUser = true
      }
      for (let iFriend = 0; iFriend < friends.length; iFriend++) {
        if (friends[iFriend]._user1.equals(users[iUsers]._id) || friends[iFriend]._user2.equals(users[iUsers]._id)) {
          if(friends[iFriend].status == "Friends") {
            users[iFriend].isFriend = true;
          } else if(friends[iFriend].status == "Pending") {
            users[iFriend].isPending = true;
          }
        }
      }
    }
    res.render('friends/find-friends', { users, user })
  })
})

 router.post('/invite/:id', (req, res, next) => {
  const inviterId = req.user._id
  const inviteeId = req.params.id
  const friendConfirmCode = randomstring.generate(30);
  var email = ''
  var inviteeUsername = ''
  
  User.findOneAndUpdate({_id: inviteeId}, { $push: { _invitersId: inviterId }})
  .then(user => {
      // console.log('USER FINDONEANDUPDATE 1')
  })
  User.findOneAndUpdate({_id: inviterId}, { $push: { _inviteesId: inviteeId }})
  .then(user => {
    // console.log('USER FINDONEANDUPDATE 2')
    res.redirect('/friends/find')
  })
  Friend.create({
    _user1: inviterId,
    _user2: inviteeId,
    friendConfirmCode: friendConfirmCode,
    status: "Pending"
  })
  .then(user => {
    // console.log('FRIEND CREATED')
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
        html: `Hi ${req.user.username}! please click <a href="http://localhost:5000/friends/confirm/${friendConfirmCode}">here</a> to accept ${inviteeUsername}'s request.` //Additional alternative text: If the link doesn't work, you can go here: ${process.env.BASE_URL}auth/confirm/${friendConfirmCode}`
      })
    })
  })

router.get('/confirm/:friendConfirmCode', (req, res, next) => {
  const friendConfirmCode = req.params.friendConfirmCode
  console.log('hey!!!!!')
  Friend.findOneAndUpdate({ friendConfirmCode: friendConfirmCode }, { status: "Friends" })
    .then(x => {
      res.redirect('/friends/find')
    })
})


 module.exports = router