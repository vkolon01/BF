/**
 * Created by Kolodko on 18-Jan-17.
 */
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', function(req,res){
    var info = '';
    var books = req.app.get('bookData');
    var dataFile = [];
    var count;
    books.find(function (err, book){
        if(err) return console.error(err);
        //Collecting 3 random books to feature on the page.
        var randNum;
        for(count = 0; count < 3; count++){
            randNum = Math.floor(Math.random() * book.length);
            dataFile.push(book[randNum]);
            if(count == 2){
                res.render('index', {
                    pageTitle: 'HOME',
                    featureBooks: dataFile,
                    pageID: 'index',
                    loggedIn: req.session.loggedIn,
                    username: req.session.username,
                    err: req.session.err
                });
            }
        }
    });
});

router.get('/books/:bookid', function(req,res){
    req.app.get('bookData').findById(req.params.bookid,function(err,book){
        if(err)console.log(err);
        res.render('book',{
            pageTitle: book.title,
            book: book,
            pageID: 'book',
            loggedIn: req.session.loggedIn,
            username: req.session.username,
            err: req.session.err,
            fav: checkFavourite(book)
        });
    });
    function checkFavourite(book){
        if(typeof req.session.favBooks !== 'undefined'){
            req.session.favBooks.forEach(function(favBook){
                if(favBook.bookid == book._id){
                    console.log('liked!');
                    return true;
                }else{
                    console.log('disliked!');
                    return false;
                }
            });
        }
        return false;
    }
});

router.get('/createBook', function(req,res){
    res.render('createBook',{
        pageTitle: 'Create book',
        pageID: 'createBook',
        loggedIn: req.session.loggedIn,
        username: req.session.username,
        err: req.session.err
    });
});

router.post('/books/newComment',function(req,res){
    var commentData = req.body;
    req.app.get('bookData').findByIdAndUpdate(
        commentData.book_id,
        {$push: {
            "comments":{
                commentAutor: commentData.commentAutor,
                body: commentData.body,
                date: new Date()
            }}},
        {safe: true, upsert: true, new: true},
        function(err,comment){
            if(err) console.log("Error while creating a comment instance has occurred")
        }
    );
});
router.post('/books/fav',function(req,res){
    req.app.get('bookData').findById(req.body.book_id,function(err,book){
        if(err)throw err;
        var favBook = book;
        if(req.session.fav){

        }else{
            push(favBook);
        }
        res.redirect('/books/'+book._id);
    });
    function push(favBook){
        req.app.get('userData').findByIdAndUpdate(req.session.userid,
            {$push: {
                "favBooks":{
                    bookid: favBook._id,
                    title: favBook.title,
                    autor: favBook.autor
                }
            }},
            {safe: true, upsert: true, new: true},
            function(err,comment){
                if(err) console.log(err);
            }
        );
    }
    function pull(favBook){
        req.app.get('userData').findByIdAndUpdate(req.session.userid,
            {$pull: {
                "favBooks":{
                    bookid: favBook._id,
                    title: favBook.title,
                    autor: favBook.autor
                }
            }},
            {safe: true, upsert: true, new: true},
            function(err,comment){
                if(err) console.log(err);

            }
        );
    }
});



module.exports = router;