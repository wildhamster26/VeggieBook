"use strict";

const express = require('express');
const router  = express.Router();
const Post = require('../models/Post')
const User = require('../models/User')

/* Will include routes to posts and comments */

//POSTS CODE
//MAKING SURE THAT ONLY LOGGED IN USERS CAN ACCESS THE PAGE TO ADD POSTS
router.get('/add', (req, res, next) => {
  res.render('posts/add-post');
});


//CODE TO CREATE THE POST BASED ON THE THE INFORMATION ADDED IN THE "ADD-POST.HBS FORM"
router.post('/add', (req, res, next) => {
  Post.create({
    title:req.body.title,
    content: req.body.content,
    visibility:req.body.visibility,
    category: req.body.category,
    _creator: req.user._id  //this ensures that the creator of the post is the user that is currently logged in
  })
  // .then(User.findByIdAndUpdate(req.user._id,{
  //    $push: {_userPosts : req.body._id} 
  // }))
  .then(user => {
    // console.log("ADDING THE POST WORKED!!!")
    res.redirect('/posts')
  })
});

//CODE TO DISPLAY THE LIST OF POSTS, INCLUDING THE CREATOR
router.get('/', (req, res, next) => {
  const user = req.user._id

  Post.find()
  .populate("_creator")
  .then(posts => {
    res.render('private-homepage', {posts: posts, user})
    // console.log('posts')
  })
})

//EDITING POSTS
router.get("/:id/edit", (req, res, next) => {
  // console.log("EDIT")
  Post.findById(req.params.id).then(post => {
    res.render("posts/edit-post", {post});
  });
});

router.post("/:id/edit",  (req, res, next) => {
  Post.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    content: req.body.content,
    visibility: req.body.visibility,
    category: req.body.category,
  }).then(post => {
    res.redirect("/posts");
  });
});

//DELETING POSTS
router.get('/:id/delete',  (req, res, next) => {
  Post.findByIdAndRemove(req.params.id)
    .then(post => {
      res.redirect('/posts')
    })
})
 
//ADDING COMMENTS
router.post('/:postId/add-comment',  (req, res, next) => {
  // console.log('DEBUG', req.params.postId)
  let postId = req.params.postId
  let _ownerId = req.user._id
  let creatorUsername = req.user.username
  // console.log(req.user._id)
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
  // res.redirect('/posts')
  // Commnt.findByIdAndDelete(commId)
  Post.findById(postId)
    .then(post => {
      var updatedComments = post.comments.filter((el, i) => {
        return el._id != commId
      })
      Post.findByIdAndUpdate({ _id: postId }, {comments: updatedComments} )
        .then(user => {
          res.redirect('/posts')
          // console.log('comment deleted')
        })
      
    })
  
})

module.exports = router;