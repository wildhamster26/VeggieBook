"use strict";

const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User           = require('../models/User');



//GOOGLE SIGN UP/IN
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
},
function(accessToken, refreshToken, profile, done) {
  console.log("PROFILE", profile)
  User.findOne({ googleID: profile.id })
  .then(user => {
    if (user) {
      return done(null, user);
    }
    console.log("then");
    
    const newUser = new User({
      googleID: profile.id,
      username:profile.emails[0].value,
      imgName: "google_image",
      imgPath: profile.photos[0].value,
      public_id:"google_id",
      email: profile.emails[0].value,
      status:"active"

    });

    newUser.save()
    .then(user => {
      console.log("saved");
      done(null, newUser);
    })
  })
  .catch(error => {
    done(error)
  })
}
));



