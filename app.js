const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session= require('express-session');

mongoose.connect('mongodb://localhost/nodekb');

let db = mongoose.connection;

// check connection
db.once('open', function(){
    console.log('connection to MongoDB');
});

//check for DB errors
db.on('error', function(err){
    console.log(err);
});

// init App
const app = express();

// Bring in Models
let Article = require('./models/article');

// Load view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}))


// Express Message Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


// Home Route

app.get('/', function(req, res){
    Article.find({}, function(err, articles){

        if(err){
            console.log(err);
        }
        else {
            res.render('index', {
                title: 'Articles',
                articles: articles
              });
            }
          });
});

// Router Files
let articles = require( './routes/articles');
app.use('/articles/', articles);

// Start server
app.listen(3000, () => console.log(`Example app listening on port 3000!`));