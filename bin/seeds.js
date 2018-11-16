// Seeds file that remove all users and create 2 new users

// To execute this seed, run from the root of the project
// $ node bin/seeds.js
"use strict";

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
    username: "Eggplant",
    password: bcrypt.hashSync("a", bcrypt.genSaltSync(bcryptSalt)),
    email: "eggplant@eggplant.com",
    kind: "Eggplant",
    age: 2,
    phoneNumber: "123456789",
    hobbies: "Soaking in vinegar at sunset",
    fears: "Mouths with teeth",
    //favorite foods to be in
    favFoods: "Salads... But they never let me in...",
    darkSecret: "In my past I used to be a cucumber",
    status: "active",
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
    imgPath: "http://res.cloudinary.com/wildhamster26/image/upload/v1542175770/FreshBook/av1.jpg.jpg",
    imgName: "av1.jpg",
    public_id: "FreshBook/av1.jpg"
  },
  {
    username: "TomatoTommy",
    password: bcrypt.hashSync("a", bcrypt.genSaltSync(bcryptSalt)),
    email: "sam.l.boero@gmail.com",
    kind: "tomato",
    age: 4,
    phoneNumber: "15478522",
    hobbies: "peeling myself with friends",
    fears: "rotting",
    //favorite foods to be in
    favFoods: "Soup!!!!",
    darkSecret: "Once I ate a human",
    status: "active",
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
    imgPath: "http://res.cloudinary.com/wildhamster26/image/upload/v1542175770/FreshBook/av2.jpg.jpg",
    imgName: "av2.jpg",
    public_id: "FreshBook/av2.jpg"
  },
  {
    username: "PotatoPommy",
    password: bcrypt.hashSync("a", bcrypt.genSaltSync(bcryptSalt)),
    email: "potato@potato.com",
    kind: "potato",
    age: 4,
    phoneNumber: "8467220099",
    hobbies: "Playing with Mr. potato-heads.",
    fears: "Those knobby things that grow on potatoes.",
    //favorite foods to be in
    favFoods: "Pizza... I know, I'm a freak",
    darkSecret: "I like big spuds.",
    status: "active",
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
    imgPath: "http://res.cloudinary.com/wildhamster26/image/upload/v1542175770/FreshBook/av3.jpg.jpg",
    imgName: "av3.jpg",
    public_id: "FreshBook/av3.jpg"
  },
  {
    username: "TomatoTimmy",
    password: bcrypt.hashSync("a", bcrypt.genSaltSync(bcryptSalt)),
    email: "c.cazallas.delfa@gmail.com",
    kind: "tomato",
    age: 6,
    phoneNumber: "1457737299",
    hobbies: "Reenactments of Batman - the dark knight",
    fears: "Birds",
    //favorite foods to be in
    favFoods: "Jambalaya!",
    darkSecret: "I was seeded to this DB",
    status: "active",
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
    imgPath: "http://res.cloudinary.com/wildhamster26/image/upload/v1542175770/FreshBook/av4.jpg.jpg",
    imgName: "av4.jpg",
    public_id: "FreshBook/av4.jpg"
  },
  {
    username: "PumpkinMadness",
    password: bcrypt.hashSync("a", bcrypt.genSaltSync(bcryptSalt)),
    email: "pumpkin@pumpkin.com",
    kind: "pumpkin",
    age: 4,
    phoneNumber: "878762828",
    hobbies: "Drinking. Lots and lots of drinking.",
    fears: "Running out of juice",
    //favorite foods to be in
    favFoods: "Pie. Call me old fashioned.",
    darkSecret: "I am a vegetarian.",
    status: "active",
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
    imgPath: "http://res.cloudinary.com/wildhamster26/image/upload/v1542175770/FreshBook/av5.jpg.jpg",
    imgName: "av5.jpg",
    public_id: "FreshBook/av5.jpg"
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