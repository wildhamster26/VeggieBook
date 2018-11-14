"use strict";

const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

require('./serializers');
require('./localStrategy');
// require('./googleStrategy');



module.exports = (app)  => {
  app.use(passport.initialize());
  app.use(passport.session());
}


