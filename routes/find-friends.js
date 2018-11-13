"use strict";

const express = require('express');
const router  = express.Router();
const {ensureLoggedIn} = require('connect-ensure-login');
const Post = require('../models/Post')
const Commnt = require('../models/Commnt')
const User = require('../models/User')

/* Will include routes to posts and comments */

//POSTS CODE
//MAKING SURE THAT ONLY LOGGED IN USERS CAN ACCESS THE PAGE TO ADD POSTS
router.get('/', (req, res, next) => {
  const user = req.user._id

  User.find()
  .then(users => {
    res.render('friends/find-friends', {users: users})
  })
})


router.post('/invite/:id', (req, res, next) => {
  console.log(req.user._id)
  User.findOneAndUpdate(req.params.id, {
    invitations: req.user._id
  })
  .then(users => {
    res.render('friends/find-friends', {users: users})
  })
})



module.exports = router;