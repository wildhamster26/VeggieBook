"use strict";

const express = require("express");
const passport = require('passport');
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");
const router = express.Router();
const User = require("../models/User");
const uploadCloud = require('../config/cloudinary.js');
const cloudinary = require("cloudinary");



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

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
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
        console.log("EMAIL SENT SUCCESSFULLY")
        res.redirect('/posts') // Redirect to http://localhost:3000/profile
      })
    }
    else {
      next("No user found")
    }
  })
})


module.exports = router;
