// Seeds file that remove all users and create 2 new users

// To execute this seed, run from the root of the project
// $ node bin/seeds.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const bcryptSalt = 10;

mongoose
  .connect('mongodb://localhost/veggiebook', {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

let users = [
  {
    username: "alice",
    password: bcrypt.hashSync("alice", bcrypt.genSaltSync(bcryptSalt)),
    email: "aliceThePickle@gmail.com",
    kind: "Pickle",
    age: 2,
    phoneNumber: "123456789",
    hobbies: "Soaking in vinegar at sunset",
    fears: "Mouths with teeth",
    //favorite foods to be in
    favFoods: "Salad",
    darkSecret: "In my past i used to be a cucumber"
  },
  {
    username: "bob",
    password: bcrypt.hashSync("bob", bcrypt.genSaltSync(bcryptSalt)),
    email: "soupMan1987@gmail.com",
    kind: "yam",
    age: 4,
    phoneNumber: "15478522",
    hobbies: "peeling myself with friends",
    fears: "rotting",
    //favorite foods to be in
    favFoods: "Soup!!!!",
    darkSecret: "Once i ate a human"
  }
]

User.deleteMany()
.then(() => {
  return User.create(users)
})
.then(usersCreated => {
  console.log(`${usersCreated.length} users created with the following id:`);
  console.log(usersCreated.map(u => u._id));
})
.then(() => {
  // Close properly the connection to Mongoose
  mongoose.disconnect()
})
.catch(err => {
  mongoose.disconnect()
  throw err
})