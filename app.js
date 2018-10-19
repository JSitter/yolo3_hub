/********************************
 *  YOLO3 
 *  Demonstration of Yolo3 object detection
 *  v 0.0.1
 ********************************/

const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config()

//Connect to DB
mongoose.connect('mongodb://localhost:27017/yolo');


//User javascript global promise instead of mongoose's deprecated
mongoose.Promise = global.Promise;

// log database errors to console
mongoose.connection.on('error', console.error.bind(console, "MongoDB Connection error >^..^< :"));

//Require Models
const User = require('./models/user.js');
const Comment = require('./models/comment.js');
const Post = require('./models/post.js');

//Use CookieParser in express app
app.use(cookieParser());

// Set up a static directory
app.use(express.static('public'));

//Add bodyParser to App to get post data
app.use(bodyParser.urlencoded({extended: true}));

// Setup handlebars view engine and pass in parameters
app.engine('hbs', hbs({defaultLayout: 'main', extname: 'hbs'}));
app.set('view engine', 'hbs');

/****************************************************
 *  Check for login token on every request
 ***************************************************/
const checkAuth = function (req, res, next) {
    
    console.log("***Authentication Check***");
  
    if (typeof req.cookies.nToken === 'undefined' || req.cookies.nToken === null) {
      req.user = null;
    } else {
      var token = req.cookies.nToken;
      var decodedToken = jwt.decode(token, { complete: true }) || {};
      req.user = decodedToken.payload;
    };
  
    next();
  };

//Authenticate Users on every page load
app.use(checkAuth);

/**************************************
 * Setup root landing page
 *************************************/
app.get('/', function (req, res) {
    if(!req.user){
        res.render('splash');
    }else{
        User.findById(req.user).populate(
           'records'
        ).then((u)=>{
            res.render('all-posts', {user: u});
        }).catch((err)=>{
            console.log("user page error: ",err.message)
        })

    }


});

/**************************************
 * Setup User Signup page
 *************************************/
app.get('/sign-up', function(req, res, next){
    //sign-up.hbs submits form to /add-user defined in auth.js
  res.render('sign-up');
});

/**************************************
* Setup User Logout page
*************************************/
app.get('/logout', function(req, res, next) {
  res.clearCookie('nToken');

  res.redirect('/');
});

/**************************************
* Setup User Login Page
*************************************/
app.get('/login', function(req, res, next) {
  res.render('login');
});

/**************************************
* Setup User Login Post Functionality
*************************************/
app.post('/login', function(req, res, next) {
  User.findOne({ username: req.body.username }, "+password", function (err, user) {
    if (!user) { return res.status(401).send({ message: 'Wrong username or password' }) };
    user.comparePassword(req.body.password, function (err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Wrong Username or password' });
      }

      var token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "60 days" });
      res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });

      res.redirect('/');
    });
  })
});

/****************************************************
 *  Retrieve Post signup data
 ***************************************************/
app.post('/signup', (req, res)=>{
        
    //Check if user email already exists
    User.find({email: req.body.email}, (err, acct)=>{
        console.log("User found: " + String(acct.length))
        if( acct.length > 0 ){
            //Redirect to login if user email already exists
            //In the future this should redirect to a reset password page
            res.redirect('/login')
        }else{
            console.log("New Acct Made")
        }
    })
    const user = new User(req.body);
    user.save().then((user)=>{
        //console.log(user);
        // Encode JWT and set cookie
        var token = jwt.sign({ _id: user._id }, process.env.SECRETKEY, { expiresIn: "60 days" });
        res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
        res.redirect('/u');
    }).catch()
})


/**************************************
 * Setup Error Page
 *************************************/
app.get('/error', (req, res)=>{
    res.render('error-page')
  })

/**********************************************
 * Load Controllers
 *********************************************/
const Auth = require('./controllers/auth.js')(app);
require('./controllers/post.js')(app)

// Listen on port 8082
app.listen(8182, function () {
    console.log('Yolo listening on port 8082!');
   });