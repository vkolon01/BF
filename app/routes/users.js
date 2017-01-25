/**
 * Created by Kolodko on 23-Jan-17.
 */
var express = require('express');
var router = express.Router();

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

module.exports = router;