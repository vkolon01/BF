/**
 * Created by Kolodko on 23-Jan-17.
 */
var express = require('express');
var router = express.Router();
var crypt = require('password-hash-and-salt'); //https://www.npmjs.com/package/password-hash-and-salt


router.get('/signUp',function(req,res){
    res.render('signUp',{
        pageTitle: 'Sign Up',
        pageID: 'signUp'
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
       loggedIn: req.session.loggedIn,
       username: req.session.username,
       err: req.session.err
   });
    req.session.err = null;
});

router.get('/:userid', function(req,res) {
    var curBook = "";
    req.app.get('userData').findById(req.params.userid, function (err, user) {
        if (err)console.log(err);
        res.render('user', {
            user: user,
            loggedIn: req.session.loggedIn,
            username: req.session.username,
            err: req.session.err
        });
    });
});

router.post('/loginSubmit',function(req,res){
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
                    req.session.favBooks = user.favBooks;
                    res.redirect('/');
                }else{
                    req.session.loggedIn = false;
                    req.session.err = "The username and/or password is incorrect";
                    res.redirect('/login');
                }
            });
            }else{
                req.session.loggedIn = false;
                req.session.err = "The username and/or password is incorrect";
                res.redirect('/login');
            }
        });
});
module.exports = router;