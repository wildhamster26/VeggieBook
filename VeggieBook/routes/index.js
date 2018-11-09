"use strict";

const express = require('express');
const router  = express.Router();
const User = require("../models/User")

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/users', (req, res, next) => {			
	// Get all the users from the db		
	User.find()		
	.then(users => {		
		res.render("users", {	
			users: users
		})	
	})		
});				

module.exports = router;
