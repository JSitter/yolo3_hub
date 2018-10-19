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

//Connect to DB
mongoose.connect('localhost/yolo');