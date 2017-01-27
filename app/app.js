var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var reload = require('reload');
var loginSession = require('express-session');

var mongoose = require('mongoose');
var userMongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bookData');
var bookSchema = new mongoose.Schema({
    title: String,
    autor: String,
    summary: String,
    cover: String,
    worms: [String],
    comments: [
        {
            date: Date(),
            autor:{id: String, name: String},
            text: String
        }
    ]
});
var userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    hash: String,
    favBooks: []
});
var autorSchema = new mongoose.Schema({
    full_name: String,
    books: []
});
var Book = mongoose.model('book',bookSchema);
var User = mongoose.model('user',userSchema);
var app = express();

// view engine setup
app.set('view engine', 'ejs');
app.set('views','app/views');
app.set('port',process.env.PORT || 3000);
app.set('bookData', Book); //Giving the entire app to have access to the data.
app.set('userData', User);
app.set('session',loginSession());
app.locals.siteTitle = "Book Face";

app.use(express.static('app/public')); //Allows the use of the public folder
//app.use(require('./routes/index'));
app.use(require('./routes/books'));
app.use(require('./routes/api'));
app.use(require('./routes/users'));
app.use(loginSession({
    secret: '2C44-4D44-WppQ38S',
    saveUninitialized: true,
    resave: true
}));


var server = app.listen(app.get('port'),function(){
  console.log('Listening on port ' + app.get('port'));
});

reload(server,app);
