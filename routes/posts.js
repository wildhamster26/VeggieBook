"use strict";

const express = require('express');
const router  = express.Router();
const Post = require('../models/Post')
const User = require('../models/User')
const uploadCloud = require("../config/cloudinary.js");
const {ensureLoggedIn} = require('connect-ensure-login');
const Friend = require('../models/Friend');
const cloudinary = require('cloudinary')
/* Will include routes to posts and comments */

//POSTS CODE
//MAKING SURE THAT ONLY LOGGED IN USERS CAN ACCESS THE PAGE TO ADD POSTS
router.get('/add', (req, res, next) => {
  res.render('posts/add-post');
});


//CODE TO CREATE THE POST BASED ON THE THE INFORMATION ADDED IN THE "ADD-POST.HBS FORM"
router.post('/add', uploadCloud.single('photo'),(req, res, next) => {
  Post.create({
    title:req.body.title,
    content: req.body.content,
    visibility:req.body.visibility,
    category: req.body.category,
    imgName : req.file.originalname,
    imgPath : req.file.url,
    _creator: req.user._id  //this ensures that the creator of the post is the user that is currently logged in
  })
  .then(user => {
    res.redirect('/posts')
  })
});

//CODE TO DISPLAY THE LIST OF POSTS, INCLUDING THE CREATOR AND CONSIDERING WHETHER OR NOT THE POST IS PUBLIC/PRIVATE
router.get('/', (req, res, next) => {
  User.findFriends(req.user._id)
  .then(userIds => {
    return Post.find({ $or:[
      {visibility: "Public"},
      {_creator: {$in: userIds}}
    ] })
    .populate("_creator")
  })
  .then(posts => {
    res.render('private-homepage', {posts})
  })
  .catch(err => next(err))
})
     

//EDITING POSTS
router.get("/:id/edit", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    res.render("posts/edit-post", {post});
  });
});


router.post("/:id/edit", uploadCloud.single('photo'), (req, res, next) => {
  let _post = req.params.id
  console.log("HELLO", req.params)
  
  cloudinary.v2.uploader.destroy(_post.public_id, function(result) { console.log("LALALAL",result) });
  console.log("REQ FILE EHHHHHHHHHHHHH", req.file)
    Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      content: req.body.content,
      visibility: req.body.visibility,
      category: req.body.category,
      imgName : req.file.originalname,
      imgPath : req.file.url,
      public_id: req.file.public_id
    }).then(post => {
      console.log("i am in post")
      res.redirect("/posts");
    });
  })
// });

//DELETING POSTS
router.get('/:id/delete',  (req, res, next) => {
  Post.findByIdAndRemove(req.params.id)
    .then(post => {
      res.redirect('/posts')
    })
})
 
//ADDING COMMENTS
router.post('/:postId/add-comment',  (req, res, next) => {
  let postId = req.params.postId
  let _ownerId = req.user._id
  let creatorUsername = req.user.username
  let comment = {
      _creatorId: _ownerId,
      creatorUsername: creatorUsername,
      _post: postId,
      content: req.body.content,
      likes: 0
  }
    Post.findByIdAndUpdate({ _id: postId }, { $push: {comments: comment} })
      .then(user => {
        res.redirect('/posts')
      })
});

//DELETING COMMENTS
router.get('/:postId/comment/:commId/delete', (req, res, next) => {
  let postId = req.params.postId
  let commId = req.params.commId
  Post.findById(postId)
    .then(post => {
      var updatedComments = post.comments.filter((el, i) => {
        return el._id != commId
      })
      Post.findByIdAndUpdate({ _id: postId }, {comments: updatedComments} )
        .then(user => {
          res.redirect('/posts')
        })
      
    })
  
})

module.exports = router;