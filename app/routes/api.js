var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var crypt = require('password-hash-and-salt'); //https://www.npmjs.com/package/password-hash-and-salt
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}))


router.post('/newBook', function(req,res){

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

module.exports = router;
