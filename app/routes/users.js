/**
 * Created by Kolodko on 23-Jan-17.
 */
var express = require('express');
var router = express.Router();
var crypt = require('password-hash-and-salt'); //https://www.npmjs.com/package/password-hash-and-salt
var async = require('async');
router.get('/signUp',function(req,res){
    var err;
    if(req.session.err === null){
        err = '';
    }else{
        err = req.session.err.split('\n')
    }
    res.render('signUp',{
        pageTitle: 'Sign Up',
        pageID: 'signUp',
        err: err
    });
    req.session.err = null;
});
router.get('/logOut',function(req,res){
   req.session.destroy();
    res.render('logInPage',{
        pageTitle: 'Log Out',
        pageID: 'logOut'
    });
});
router.get('/login', function(req,res){
   res.render('logInPage',{
       pageTitle: 'Log In',
       pageID: 'logIn',
       userid: req.session.userid,
       loggedIn: req.session.loggedIn,
       username: req.session.username,
       notification: req.session.notification
   });
    req.session.err = null;
});

router.get('/users/:userid', function(req,res) {
    //Array to store all the user's favourite books.
    var likedBooks = [];

    req.app.get('userData').findById(req.params.userid, function (err, user) {
        if (err)console.log(err);

            req.app.get('bookData').find({
                 "_id": { $in: user.favBooks}
            },function(err,favBooksList){
                console.log(favBooksList);
                res.render('user', {
                    pageTitle: "User's page",
                    user: user,
                    likedBooks: favBooksList,
                    userid: req.session.userid,
                    loggedIn: req.session.loggedIn,
                    username: req.session.username,
                    notification: req.session.notification
                });
            });
        });
    });
router.post('/users/signUp',function(req,res, next){
    //Gathering all the data from the post.
    var firstName = null;
    var lastName = null;
    var username = null;
    var email = null;
    var hashedPassword = null;
    req.session.err = '';

    //First name
    if(!req.body.firstName.length){
        req.session.err += 'The first name field appears to be empty.\n';
    }else if(req.body.firstName.trim().length > 50){
        req.session.err += 'The first name field appears to over 50 characters long.\n';
    }else{
        firstName = req.body.firstName.trim();
    }
    //Last name
    if(!req.body.lastName.length){
        req.session.err += 'The last name field appears to be empty.\n';
    }else if(req.body.lastName.trim().length > 50){
        req.session.err += 'The last name field appears to over 50 characters long.\n';
    }else{
        lastName = req.body.lastName.trim();
    }
    //Password
    if(!req.body.password.length || !req.body.passwordC.length) {
        req.session.err += 'The password field appears to be empty.\n';
    }else{
        if(req.body.password.length > 7){
            if(req.body.password === req.body.passwordC){
                crypt(req.body.password).hash(function (err,hash){
                    if(err) throw console.log('Hashing has failed' + err);
                    hashedPassword = hash;
                })
            }else{
                req.session.err += 'The confirmation password does not match.\n';
            }
        }else{
            req.session.err += 'The password must be at least 8 characters long.\n';
        }
    }
    async.parallel([
            //Check username input
            function (callback){
                if (!req.body.username.length) {
                    req.session.err += 'The username field appears to be empty.\n';
                    callback();
                } else if (req.body.username.trim().length > 50) {
                    req.session.err += 'The username field appears to over 50 characters long.\n';
                    callback();
                } else {
                    //Checking for username availability
                    var Users = req.app.get('userData');
                    Users.find({'username': req.body.username.trim()}, function (err, user) {
                        if (err) return callback(err);
                        if (user.length) {
                            console.log('username exist');
                            req.session.err += 'The username is already taken.\n';
                        } else {
                            username = req.body.username.trim();
                        }
                        callback();
                    });
                }


            },
            //Check email input
            function(callback){
                if(!req.body.email.length){
                    req.session.err += 'The email field appears to be empty.\n';
                    callback();
                }else{
                    //Checking for email availability
                    var Users = req.app.get('userData');
                    Users.find({'email': req.body.email.trim()},function(err,user){
                        if(err) return callback(err);
                        if(user.length){
                            console.log('email exist');
                            req.session.err += 'Provided email is already registered.\n';
                        }else{
                            email = req.body.email.trim();
                        }
                        callback();
                    });
                }
            }],
        function(err){
            if(err) return next(err);
            res.redirect('/signUp');
        });
});
router.post('/login/loginSubmit',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var Users = req.app.get('userData');

    Users.findOne({'username': username},function (err,user){
        if(err) throw err("Error with the user");
        if(user !== null){
            crypt(password).verifyAgainst(user.hash, function(err,verified){
                if(verified){
                    req.session.loggedIn = true;
                    req.session.username = username;
                    req.session.userid = user._id;
                    res.redirect('/');
                }else{
                    req.session.loggedIn = false;
                    req.session.err += "The username and/or password is incorrect";
                    res.redirect('/login');
                }
            });
            }else{
                req.session.loggedIn = false;
                req.session.err += "The username and/or password is incorrect";
                res.redirect('/login');
            }
        });
});
module.exports = router;