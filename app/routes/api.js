var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var crypt = require('password-hash-and-salt'); //https://www.npmjs.com/package/password-hash-and-salt
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}))


router.post('/newBook', function(req,res){
    var BookModel = req.app.get('bookData');
    var bookData = req.body;
    //console.log('The received json data: '+json(sanForm));

    var book = new BookModel({
        title: bookData.title,
        autor: bookData.autor,
        summary: bookData.summary,
        cover: 'null',
        worms: []
    });
    book.save(function (err) {
        if(err) {
            console.log('The book is lost in space and time')
        }else{
            console.log("The book "+ book.title + "has been recorded");
        }
    });
});

router.post('/newUser', function(req,res){
    var UserModel = req.app.get('userData');
    var userData = req.body;
    var password = "";

    crypt(userData.pass).hash(function (error, hash) {
        if (error) throw new Error('Hashing has failed');
        password = hash;


        var user = new UserModel({
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username,
            email: userData.email,
            hash: password
        });
        user.save(function (err) {
            if(err) {
                console.log('The user is lost in space and time')
            }else{
                console.log("The user " + user.firstName + "has been recorded");
            }
        });
    });
});
router.post('/log_in',function(req,res){
    var username = req.body.username;
    var password = req.body.password;


    var Users = req.app.get('userData');

    Users.findOne({'username': username},function (err,user){
        if(err) throw err("Error with the user");
        if(user !== null){
            crypt(password).verifyAgainst(user.hash, function(err,verified){
                if(verified){
                    router.get('/', function(req,res){
                        res.render('/',{
                            pageTitle: 'Log In',
                            message: 'You have logged in',
                            pageID: 'logIn'
                        }) ;
                        res.redirect('/');
                    });
                }else{
                    console.log("try better next time");
                }
            });
        }else{
            console.log("No users found");
        }

    });

});



router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

module.exports = router;
