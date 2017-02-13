/**
 * Created by Kolodko on 23-Jan-17.
 */
var express = require('express');
var router = express.Router();
var crypt = require('password-hash-and-salt'); //https://www.npmjs.com/package/password-hash-and-salt
var async = require('async');
var nodemailer = require('nodemailer');

router.get('/signUp',function(req,res){
    var err;
    if(!req.session.err){
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
router.get('/signUp/verify/:userid',function(req,res){
    req.app.get('userData').findByIdAndUpdate(req.params.userid,
        { $set: {
            verified: true
        }},function(err,info){
            if(err) console.log(err);
            req.session.notification = 'Your account has been verified.';
            res.redirect('/');
        })
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
       notification: req.session.notification,
       err: req.session.err
   });
    req.session.err = null;
});

router.get('/users/:userid', function(req,res) {
    req.app.get('userData').findById(req.params.userid,function (err, user) {
        if (err)console.log(err);
        req.app.get('bookData').find({"_id": { $in: user.favBooks}},
            function(err,favBooksList){
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
    var Users = req.app.get('userData');

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


    async.parallel([
        //Check the password input
        function(callback){
            if(!req.body.password.length || !req.body.passwordC.length) {
                req.session.err += 'The password field appears to be empty.\n';
            }else{
                if(req.body.password.length > 7){
                    if(req.body.password === req.body.passwordC){
                        crypt(req.body.password).hash(function (err,hash){
                            if(err) console.log('Hashing has failed' + err);
                            hashedPassword = hash;
                            callback();
                        })
                    }else{
                        req.session.err += 'The confirmation password does not match.\n';
                        callback();
                    }
                }else{
                    req.session.err += 'The password must be at least 8 characters long.\n';
                    callback();
                }
            }
        },
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
                    Users.find({'username': req.body.username.trim()}, function (err, user) {
                        if (err) return callback(err);
                        if (user.length) {
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
                    Users.find({'email': req.body.email.trim()},function(err,user){
                        if(err) return callback(err);
                        if(user.length){
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
            if(req.session.err){
                res.redirect('/signUp');
            }else{
                var user = new Users({
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    email: email,
                    hash: hashedPassword,
                    favBooks: [],
                    verified: false
                });
                user.save(function(err, newUser){
                    if(err) throw(err);
                    //Create email vor verification.
                    var link = 'http://localhost:' + req.app.get('port') + '/signUp/verify/' + newUser._id;
                        var transporter = nodemailer.createTransport({
                            service: 'Gmail',
                            auth:{
                                user: 'BookFaceLimited@gmail.com',
                                pass: 'thomasthetanker'
                            }
                        });
                        var verEmail = {
                            from: 'BookFaceLimited@gmail.com',
                            to: newUser.email,
                            subject: 'BookFace verification email',
                            text: 'Hi' + newUser.firstName + '.\n\n' +
                            'Thank you for choosing BookFace \n' +
                            'To verify your account please follow the link below. \n'+ link
                        };
                        transporter.sendMail(verEmail,function(err,info){
                            if(err) res.json(err);
                            req.sessions.notification = 'The account ' + newUser.username + 'has been created';
                            res.redirect('/');
                        });
                });
                res.redirect('/');
            }

        });
});
router.post('/login/loginSubmit',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var Users = req.app.get('userData');
    req.session.err = "";
    Users.findOne({'username': username},function (err,user){
        if(err) throw err("Error with the user");
        if(user !== null){

            crypt(password).verifyAgainst(user.hash, function(err,match){
                if(match){
                    if(user.verified){
                        req.session.loggedIn = true;
                        req.session.username = username;
                        req.session.userid = user._id;
                        res.redirect('/');
                    }else{
                        req.session.loggedIn = false;
                        req.session.err += "The account is not verified";
                        res.redirect('/login');
                    }

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