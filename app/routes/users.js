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
});
router.get('/login', function(req,res){
   res.render('logInPage',{
       pageTitle: 'Log In',
       pageID: 'logIn'
   }) ;
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
                    res.get('./',{
                        pageTitle: 'Log In',
                        Message: 'You are logged in',
                        pageID: 'logIn'
                    }) ;
                }else{
                    console.log("try better next time");
                }
            });
        }else{
            console.log("No users found");
        }
    });
});
module.exports = router;