/**
 * Created by Kolodko on 18-Jan-17.
 */
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', function(req,res){
    var books = req.app.get('bookData');
    var dataFile = [];
    var count;
    books.find(function (err, book){
        if(err) return console.error(err);
        //Collecting 3 random books to feature on the page.
        var randNum;
        for(count = 0; count < 4; count++){
            randNum = Math.floor(Math.random() * book.length);
            dataFile.push(book[randNum]);
            if(count == 3){
                res.render('index', {
                    pageTitle: 'HOME',
                    featureBooks: dataFile,
                    pageID: 'index',
                    userid: req.session.userid,
                    loggedIn: req.session.loggedIn,
                    username: req.session.username,
                    notification: req.session.notification
                });
            }
        }
    });
});

router.get('/books/:bookid', function(req,res){
    var bookid = req.params.bookid;

    req.app.get('bookData').findById(bookid,function(err,book){
        if(err)console.log(err);

        //Creates the page of the book.
        //Very dirty solution to the callback hell.
        // The goal was to display correctly if the current book is already in the user's favourites or not.
        if(req.session.loggedIn){
            req.app.get('userData').findById(req.session.userid,function(err,user) {
                if (user.favBooks.includes(bookid)) {
                     if(typeof book !== 'undefined'){
                        res.render('book',{
                            pageTitle: book.title,
                            book: book,
                            pageID: 'book',
                            userid: req.session.userid,
                            loggedIn: req.session.loggedIn,
                            username: req.session.username,
                            notification: req.session.notification,
                            fav: true
                        });
                    }else{
                        res.redirect('/');
                    }
                }else{
                    if(typeof book !== 'undefined'){
                        res.render('book',{
                            pageTitle: book.title,
                            book: book,
                            pageID: 'book',
                            userid: req.session.userid,
                            loggedIn: req.session.loggedIn,
                            username: req.session.username,
                            notification: req.session.notification,
                            fav: false
                        });
                    }else{
                        res.redirect('/');
                    }
                }
            });
        }else{
            if(typeof book !== 'undefined'){
                res.render('book',{
                    pageTitle: book.title,
                    book: book,
                    pageID: 'book',
                    userid: req.session.userid,
                    loggedIn: req.session.loggedIn,
                    username: req.session.username,
                    notification: req.session.notification,
                    fav: false
                });
            }else{
                res.redirect('/');
            }
        }
    });
});

router.get('/createBook', function(req,res){
    res.render('createBook',{
        pageTitle: 'Create book',
        pageID: 'createBook',
        userid: req.session.userid,
        loggedIn: req.session.loggedIn,
        username: req.session.username,
        notification: req.session.notification
    });
});
router.post('/books/newComment',function(req,res){
    var commentData = req.body.comment;
    var bookid = req.body.book_id;
    req.app.get('bookData').findByIdAndUpdate(
        bookid,
        {$push: {
            "comments":{
                commentAutor: req.session.username,
                body: commentData,
                date: new Date()
            }}},
        {safe: true, upsert: true, new: true},
        function(err,comment){
            if(err) console.log("Error while creating a comment instance has occurred")
        }
    );
    res.redirect('/books/'+bookid);
});

/*
Adds the book's id to the user's favourites and also
adds the user's id to the book's worm list.
 */
router.post('/books/fav',function(req,res){
    var curBookid = req.body.book_id;
    var curUserid = req.session.userid;
    req.app.get('userData').findById(curUserid,function(err,user){
        if(!user.favBooks.includes(curBookid)) {
            req.app.get('userData').findByIdAndUpdate(curUserid,
                {
                    $push: {
                        favBooks: curBookid
                    }
                },
                {
                    safe: true,
                    upsert: true,
                    new: true
                },
                function(err,node){
                    if(err)console.log(err);
                    pushWorm(curBookid,curUserid)
                }
            );
        }else{
            req.app.get('userData').findByIdAndUpdate(curUserid,
                {
                    $pull: {
                        favBooks: curBookid
                    }
                },
                {
                    multi: true
                },
                function (err, note) {
                    if (err) console.log(err);
                    pullWorm(curBookid,curUserid)
                }
            );
        }
    });
    function pushWorm(bookid,userid){
        req.app.get('bookData').findByIdAndUpdate(bookid,
            {
                $push: {
                    worms: userid
                }
            },
            {
                safe: true,
                upsert: true,
                new: true
            },
            function (err, note) {
                if (err) console.log(err);
                res.redirect(('/books/'+curBookid));
            }
        );
    }
    function pullWorm(bookid,userid){
        req.app.get('bookData').findByIdAndUpdate(bookid,
            {
                $pull: {
                    worms: userid
                }
            },
            {
                multi: true
            },
            function (err, note) {
                if (err) console.log(err);
                res.redirect(('/books/'+curBookid));
            }
        );
    }
});


module.exports = router;