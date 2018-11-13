"use strict";

const express = require('express');
const router  = express.Router();
const {ensureLoggedIn} = require('connect-ensure-login');
const Post = require('../models/Post')
const Commnt = require('../models/Commnt')
const user = require('../models/User')

/* Will include routes to posts and comments */

//POSTS CODE
//MAKING SURE THAT ONLY LOGGED IN USERS CAN ACCESS THE PAGE TO ADD POSTS
router.get('/', (req, res, next) => {
  const user = req.user._id

  User.find()
  .populate("_creator")
  .then(posts => {
    res.render('friends/friends', {posts: posts, user})
    // console.log('posts')
  })
})


module.exports = router;