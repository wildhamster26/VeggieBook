"use strict";

const express = require("express");
const passport = require('passport');
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");
const router = express.Router();
const User = require("../models/User");
const uploadCloud = require('../config/cloudinary.js');
const cloudinary = require("cloudinary");
const crypto = require("crypto");
const async = require("async");



// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


router.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });
});

router.get("/forgot", (req, res, next) => {
  res.render("auth/forgot", { "message": req.flash("error") });
});

router.post("/forgot", (req, res, next) => {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf){
        let token = buf.toString("hex");
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({email: req.body.email}, function(err, user){
        if(!user){
          req.flash("error", "There is no account with that email address.");
          return res.redirect("/auth/forgot");
        }
        
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour to change password
        console.log(user.resetPasswordToken);
        console.log(user.resetPasswordExpires);
        user.save();
        done(err, token, user);
      });
    },
    function(token, user, done){
      let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user:  process.env.GMAIL_USER,
          pass:  process.env.GMAIL_PASS
        }
      });
      
      transporter.sendMail({
        from: '"The Veggiebook team"',
        to: req.body.email, // the email entered in the form 
        subject: 'Reset your password', 
        html: `Hi ${user.username}, to reset your password please click <a href="http://localhost:3000/auth/reset/${token}">here</a>.`
      })
      
      res.render("auth/goToMail");
      // catch(err) {
      //   req.flash("error", "There is no account with that email address.");
      //   return res.redirect("/auth/forgot");
      // }
    }
  ])
});

router.get("/reset/:token", (req, res, next) => {
  let token = req.params.token;
  User.findOne({resetPasswordToken: token, resetPasswordExpires:{$gt:Date.now()}}, (err, user) => {
    if(!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/auth/forgot")
    }
    res.render("auth/reset", {token});
  })
});

router.get("/auth/reset/:token", (req, res, next) => {
  let token = req.params.token;
  let newPassword = req.body.newPassword;
  let confirmPassword = req.body.confirmPassword;
  async.waterfall([
    User.findOne({resetPasswordToken: token, resetPasswordExpires:{$gt:Date.now()}}, (err, user) => {
      if(!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/auth/forgot")
      }
      if(newPassword === confirmPassword){
        user.setPassword(newPassword, function(err){
          console.log("Before Undefigning the token:",user.resetPasswordToken);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          
          user.save()
          console.log("And token after:",user.resetPasswordToken);

          return res.redirect("/auth/login");
        })
      }
    })

  ])
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/posts",
  failureRedirect: "/auth/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", uploadCloud.single('photo'), (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const kind = req.body.kind;
  const age = req.body.age;
  const phoneNumber = req.body.phoneNumber;
  const hobbies = req.body.hobbies;
  const fears = req.body.fears;
  const favFoods = req.body.favFoods;
  const darkSecret = req.body.darkSecret;
  const imgPath = req.file.url;
  const imgName = req.file.originalname;
  const confirmationCode = randomstring.generate(30);
  
  if (username === "" || password === "" || email === "") {
    res.render("auth/signup", { message: "Indicate username, password and email" });
    return;
  }

  User.findOne({ email }, "email", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "That email address is already in use." });
      return;
    }});

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists." });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass,
      email,
      kind,
      age,
      phoneNumber,
      hobbies,
      favFoods,
      fears,
      darkSecret,
      confirmationCode,
      imgPath,
      imgName
    });

    newUser.save()
    .then(() => {
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
        subject: 'Validate your account', 
        html: `Hi ${username}, please click <a href="http://localhost:3000/auth/confirm/${confirmationCode}">here</a> to confirm your account.` //Additional alternative text: If the link doesn't work, you can go here: ${process.env.BASE_URL}auth/confirm/${confirmationCode}`
      })

      .then(info => console.log(info))
      .catch(error => console.log(error))
      res.redirect("/");
    })
    .catch(err => {
      console.log(err);
      res.render("auth/signup", { message: "Something went wrong" });
    })
  });
});


router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get('/confirm/:confirmationCode', (req,res,next)=> {
  let confirmationCode = req.params.confirmationCode
  // Find the first user where confirmationCode = req.params.confirmationCode
  User.findOneAndUpdate({confirmationCode}, {status: 'Active'})
  .then(user => {
    if (user) {
      // req.login makes the user login automatically
      req.login(user, () => {
        console.log("EMAIL SENT SUCCESSFULLY");
        res.redirect('/posts') // Redirect to http://localhost:3000/profile
      })
    }
    else {
      next("No user found")
    }
  })
})


module.exports = router;
