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
                    pageID: 'index'
                });
            }
        }
    });
});

router.get('/books/:bookid', function(req,res){
    var curBook = "";
    req.app.get('bookData').findById(req.params.bookid,function(err,book){
        if(err)console.log(err);
        curBook = book;
        res.render('book',{
            pageTitle: curBook.title,
            book: curBook,
            pageID: 'book'
        });
    });

});

router.get('/createBook', function(req,res){
    res.render('createBook',{
        pageTitle: 'Create book',
        pageID: 'createBook'
    });
});

router.post('/books/newComment',function(req,res){
    var commentData = req.body;
    console.log("Passed id: ",commentData);
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




module.exports = router;