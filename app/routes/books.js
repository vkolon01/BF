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
                req.session.err = '';
            }
        }
    });
});

router.get('/books/:bookid', function(req,res){
    var bookid = req.params.bookid;

    req.app.get('bookData').findById(bookid,function(err,book) {
        if (err)console.log(err);

        //Creates the page of the book.
        //Very dirty solution to the callback hell.
        // The goal was to display correctly if the current book is already in the user's favourites or not.
        req.app.get('userData').find({
            "_id": {$in: book.worms}
        }, function (err, worms) {
            if (err) console.log(err);
            if (req.session.loggedIn) {
                req.app.get('userData').findById(req.session.userid, function (err, user) {
                    if (user.favBooks.includes(bookid)) {
                        if (typeof book !== 'undefined') {
                            res.render('book', {
                                pageTitle: book.title,
                                book: book,
                                pageID: 'book',
                                userid: req.session.userid,
                                loggedIn: req.session.loggedIn,
                                username: req.session.username,
                                notification: req.session.notification,
                                worms: worms,
                                err: req.session.err,
                                fav: true
                            });
                            req.session.err = '';
                        } else {
                            res.redirect('/');
                        }
                    } else {
                        if (typeof book !== 'undefined') {
                            res.render('book', {
                                pageTitle: book.title,
                                book: book,
                                pageID: 'book',
                                userid: req.session.userid,
                                loggedIn: req.session.loggedIn,
                                username: req.session.username,
                                notification: req.session.notification,
                                worms: worms,
                                err: req.session.err,
                                fav: false
                            });
                            req.session.err = '';
                        } else {
                            res.redirect('/');
                        }
                    }
                });
            } else {
                if (typeof book !== 'undefined') {
                    res.render('book', {
                        pageTitle: book.title,
                        book: book,
                        pageID: 'book',
                        userid: req.session.userid,
                        loggedIn: req.session.loggedIn,
                        username: req.session.username,
                        notification: req.session.notification,
                        err: req.session.err,
                        worms: worms,
                        fav: false
                    });
                    req.session.err = '';
                } else {
                    res.redirect('/');
                }
            }
        });
    });
});

router.get('/createBook', function(req,res,next){
    res.render('createBook',{
        pageTitle: 'Create book',
        pageID: 'createBook',
        userid: req.session.userid,
        loggedIn: req.session.loggedIn,
        username: req.session.username,
        notification: req.session.notification,
        err:req.session.err
    });
});
router.post('/books/newBook',function(req,res){
    var BookModel = req.app.get('bookData');
    var title = req.body.title.trim();
    var author = req.body.author.trim();
    var summary = req.body.summary.trim();
    req.session.err = '';

    if(title.length < 1){req.session.err += "Title field cannot be empty "+'\n' }
    if(title.length > 50){req.session.err += 'Title field cannot be over 50 characters\n'}
    if(author.length < 1){req.session.err += 'Author name field cannot be empty\n'}
    if(author.length > 50){req.session.err += 'Author name field cannot be over 20 characters\n'}
    if(summary.length > 300){req.session.err += 'Summary field cannot be over 300 characters\n'}

    console.log(title+author);
    if(req.session.err == ""){
        var book = new BookModel({
            title:req.body.title.trim(),
            author: req.body.author.trim(),
            summary: req.body.summary.trim(),
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
        res.redirect('/');
    }else{
        res.redirect('/createBook');
    }

});
router.post('/books/newComment',function(req,res){
    req.session.err = '';
    var commentData = req.body.comment;
    var bookid = req.body.book_id;
    if(commentData.length > 0){
        req.app.get('bookData').findByIdAndUpdate(
            bookid,
            {$push: {
                "comments":{
                    commentAuthor: req.session.username,
                    authorid: req.session.userid,
                    body: commentData,
                    date: new Date()
                }}},
            {safe: true, upsert: true, new: true},
            function(err,comment){
                if(err) console.log("Error while creating a comment instance has occurred")
            }
        );
    }else{
        req.session.err += 'The comment appears to be blank. Please write your comment before submitting.'
    }

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