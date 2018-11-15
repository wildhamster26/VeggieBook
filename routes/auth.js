"use strict";

const express = require("express");
const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
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


router.post("/login", passport.authenticate("local", {
  successRedirect: "/posts",
  failureRedirect: "/auth/login",
  failureFlash: true,
  passReqToCallback: true
}));

//GOOGLE SIGNUP --> Uncomment the code below to ENABLE GOOGLESIGN IN

// router.get('/google',
//   passport.authenticate('google', {scope: "email"}));


// router.get('/google/callback', 
//   passport.authenticate('google', { failureRedirect: 'auth/login' }),
  // function(req, res) {
  //   res.redirect('/');
  // });

//END OF GOOGLE SIGNUP


router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", uploadCloud.single('photo'), (req, res, next) => {
  const {username,password, email, kind, age, phoneNumber, hobbies, fears, 
  favFoods,darkSecret} = req.body;
  const resetPasswordToken = "";
  const resetPasswordExpires = "";
  const imgPath = req.file.url;
  const imgName = req.file.originalname;
  const public_id = req.file.public_id;
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
      imgName,
      resetPasswordExpires,
      resetPasswordToken, 
      public_id
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
        html: `Hi ${username}, please click <a href="${process.env.BASE_URL}/auth/confirm/${confirmationCode}">here</a> to confirm your account.` //Additional alternative text: If the link doesn't work, you can go here: ${process.env.BASE_URL}auth/confirm/${confirmationCode}`
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
  User.findOneAndUpdate({confirmationCode}, {status: 'active'})
  .then(user => {
    if (user) {
      // req.login makes the user login automatically
      req.login(user, () => {
        console.log("EMAIL SENT SUCCESSFULLY");
        res.redirect(`/users/${user._id}/edit`) // Redirect to BASE_URL/profile
      })
    }
    else {
      next("No user found")
    }
  })
})


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
          return res.redirect({ "message": req.flash("error") }, "/auth/forgot");
        }
        
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour to change password
  
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
        html: `Hello ${user.username}, to reset your password please click <a href="${process.env.BASE_URL}/auth/reset/${token}">here</a>.`
      })
      
      res.render("auth/goToMail");
    },{
      catch(err) {
        req.flash("error", "There is no account with that email address.");
        return res.redirect("/auth/forgot", { "message": req.flash("error") });
      }
    }
  ])
});

router.get("/reset/:token", (req, res, next) => {
  let token = req.params.token;
  User.findOne({resetPasswordToken: token, resetPasswordExpires:{$gt:Date.now()}}, (err, user) => {
    if(!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/auth/forgot", { "message": req.flash("error") })
    }
    res.render("auth/reset", {token});
  })
});

router.post("/reset/:token", (req, res, next) => {
  let token = req.params.token;
  let newPassword = req.body.newPassword;
  let confirmPassword = req.body.confirmPassword;
  let salt = bcrypt.genSaltSync(bcryptSalt);
  let newHashPass = bcrypt.hashSync(newPassword, salt);
  let query = {resetPasswordToken: token, resetPasswordExpires:{$gt:Date.now()}}
  console.log(typeof Date.now());
  if(newPassword === confirmPassword){
    User.findOneAndUpdate(query, {
      password: newHashPass
    })
    .then(user => {
      return res.redirect("/auth/login");
    })
  } else {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/auth/forgot");
    }
  });

module.exports = router;
