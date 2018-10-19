/****************************************************
 * Yolo
 *    Auth
 ***************************************************/
const jwt = require('jsonwebtoken');

//Load mongodb User Model
var User = require('../models/user.js');

module.exports = (app) => {

  /**************************************
   * Setup 'add-user' POST route
   *************************************/
  app.post('/add-user', function(req, res, next) {

    // Create User and JWT
    var user = new User(req.body);

    //console.log(req.body);

    // user.save().then((user)=>{

    // }).catch((err)=>{

    // });
    // mongoose.Promise = global.Promise <- server.js   

    user.save(function (err) {

      console.log("Save user")

      //send 400 on error
      if (err) { return res.status(400).send({ err: err }) };
      console.log(user.username)
      console.log(process.env.SECRET)
      // Encode JWT and set cookie
      var token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "60 days" });
      res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
      res.redirect('/posts/all');
    });
  });
}