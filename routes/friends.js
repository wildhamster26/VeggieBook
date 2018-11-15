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

 //LIST OF FRIENDS
router.get('/', (req, res, next) => {
  const userId = req.user._id
    Friend.find({ status: "Friends", $or: [{ _user1: userId },{ _user2: userId }]})
    .populate("_user1")
    .populate("_user2")
    .then((friends) => {
      let friendsArr = []
      for (let iFriends = 0; iFriends < friends.length; iFriends++){
        if (JSON.stringify(friends[iFriends]._user1._id) != JSON.stringify(userId)) {
          friendsArr.push(friends[iFriends]._user1)
        }
        if (JSON.stringify(friends[iFriends]._user2._id) != JSON.stringify(userId)) {
          friendsArr.push(friends[iFriends]._user2)
        }
      }
      res.render('friends/my-friends', { friendsArr, userId })
    })
})

router.get('/find', (req, res, next) => {
  const user = req.user
  Promise.all([
    User.find(),
    Friend.find({ $or: [{ _user1: req.user._id },{ _user2:  req.user._id }]})
  ])
  .then(([users, friends]) => {
    for (let iUsers = 0; iUsers < users.length; iUsers++) {
      users[iUsers].isCurrentUser = false
      if (users[iUsers]._id.equals(user._id)) {
        users[iUsers].isCurrentUser = true
      }

      if (users[iUsers].status == "active") {
        users[iUsers].isActive = true
      }

      for (let iFriend = 0; iFriend < friends.length; iFriend++) {
        if (friends[iFriend]._user1.equals(users[iUsers]._id) || friends[iFriend]._user2.equals(users[iUsers]._id)) {
          if(friends[iFriend].status == "Friends") {
            users[iUsers].isFriend = true;
          } else if(friends[iFriend].status == "Pending") {
            users[iUsers].isPending = true; 
          }
        }
      }
    }
    for (let i = 0; i < users.length; i++){
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
  
  // User.findOneAndUpdate({_id: inviteeId}, { $push: { _invitersId: inviterId }})
  // .then(user => {
  // })
  // User.findOneAndUpdate({_id: inviterId}, { $push: { _inviteesId: inviteeId }})
  // .then(user => {
  //   res.redirect('/friends/find')
  // })
  Friend.create({
    _user1: inviterId,
    _user2: inviteeId,
    friendConfirmCode: friendConfirmCode,
    status: "Pending"
  })
  .then(user => {
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
        html: `Hi ${inviteeUsername}! please click <a href="https://freshbook.herokuapp.com/friends/confirm/${friendConfirmCode}">here</a> to accept ${req.user.username}'s request.` //Additional alternative text: If the link doesn't work, you can go here: ${process.env.BASE_URL}auth/confirm/${friendConfirmCode}`
      })
      res.redirect('/friends/find')
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