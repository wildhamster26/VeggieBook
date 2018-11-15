"use strict";

require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const session      = require("express-session");
const MongoStore   = require('connect-mongo')(session);
const flash        = require("connect-flash");
const {ensureLoggedIn} = require('connect-ensure-login');
const Friend       = require('./models/Friend');
var ObjectId = require('mongoose').Types.ObjectId; 
var Post          = require('./models/Post');


mongoose
.connect(process.env.MONGODB_URI, {useNewUrlParser: true})
.then(x => {
  console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
})
.catch(err => {
  console.error('Error connecting to mongo', err)
});


const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);
const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

hbs.registerHelper('ifUndefined', (value, options) => {
  if (arguments.length < 2)
  throw new Error("Handlebars Helper ifUndefined needs 1 parameter");
  if (typeof value !== undefined ) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  console.log('Delete this, this is just a try to get rid of an error')
  
  console.log("arg1:", arg1);
  console.log("arg2:", arg2);
  
  console.log('Delete this, this is just a try to get rid of an error on github')
  for (let i = 0; i < 10; i++){
    //DELETE THIS FOR LOOP
  }
  return (JSON.stringify(arg1) === JSON.stringify(arg2)) ? options.fn(this) : options.inverse(this);
  
});



//DEPRECATED
hbs.registerHelper('ifIsInvitee', function(currentUser, otherUser, options) {
  let isInvitee = false
  currentUser._inviteesId.forEach(invitee => {
    if (JSON.stringify(invitee) === JSON.stringify(otherUser._id)) {
      isInvitee = true
    }
  })
  if(isInvitee) {
    return (true) ? options.fn(this) : options.inverse(this);
  } else {
    return (false) ? options.fn(this) : options.inverse(this);
  }
})

//THIS MAY BE VERY INEFFICIENT BUT IT WORKS
//DEPRECATED
hbs.registerHelper('ifIsFriend', function(currentUser, otherUser, options) {
  let _user1 = currentUser._id
  let _user2 = otherUser._id
  let query = { status: "Friends", $or: [{  $or: [{ _user1: _user1 },{ _user2: _user2 }], $or: [{ _user1: _user2 },{ _user2: _user1 }]}]}
  
  Friend.findOne(query)
  .then(x => {
    return (true) ? options.fn(this) : options.inverse(this);
  })
  .catch(y => {
    return (false) ? options.fn(this) : options.inverse(this);
  })
})

// default value for title local
app.locals.title = 'Welcome to Veggiebook';

// Enable authentication using session + passport
app.use(session({
  secret: 'irongenerator',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore( { mongooseConnection: mongoose.connection })
}))
app.use(flash());
require('./passport')(app);

// This middleware gives the variable "isConnected" to the view
app.use((req,res, next) => {
  console.log("MIDDLEWARE", req.url);
  

  res.locals.isConnected = !!req.user
  if (req.user) {
    res.locals.currentUserId = req.user._id
  }
  next() 
})

app.locals.key = process.env.GOOGLE_CLIENT_ID

app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/posts', ensureLoggedIn(), require('./routes/posts'));
app.use('/friends', ensureLoggedIn(), require('./routes/friends'));
app.use('/events', ensureLoggedIn() , require('./routes/events'));



module.exports = app;
