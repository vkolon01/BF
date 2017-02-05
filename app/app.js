var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var reload = require('reload');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var mongoBase = require('connect-mongo')(expressSession);
mongoose.connect('mongodb://localhost/bookData');
var bookSchema = new mongoose.Schema({
    title: String,
    autor: String,
    summary: String,
    cover: String,
    worms: [String], // Holds the user id's who like the book.
    comments: [{commentAutor: String, body: String, date: Date }]
    //comments: [String] //Holds the comment id's
});
var userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    hash: String,
    favBooks: [String]
});
var autorSchema = new mongoose.Schema({
    full_name: String,
    books: [String]
});
var Book = mongoose.model('book',bookSchema);
var User = mongoose.model('user',userSchema);
//var Comment = mongoose.model('comment',commentSchema);

var app = express();

// view engine setup
app.set('view engine', 'ejs');
app.set('views','app/views');
app.set('port',process.env.PORT || 9000);

/**
 * Giving the app access to the following data.
 */
app.set('bookData', Book);
app.set('userData', User);
//app.set('commentData', Comment);
//app.set('session',loginSession());
app.locals.siteTitle = "Book Face";


app.use(cookieParser());
app.use(bodyParser());
app.use(expressSession({
    secret: '2C44-4D44-WppQ38S',
    saveUninitialized: true,
    resave: false,
    store: new mongoBase({
        mongooseConnection: mongoose.connection,
        autoRemove: 'native'
    }),
    cookie: {maxAge: 180*60*1000}, //2 hours
}));

app.use(express.static('app/public')); //Allows the use of the public folder
/*app.use(function(req,res,next){
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});*/
app.use(require('./routes/books'));
app.use(require('./routes/api'));
app.use(require('./routes/users'));

var server = app.listen(app.get('port'),function(){
  console.log('Listening on port ' + app.get('port'));
});

reload(server,app);
