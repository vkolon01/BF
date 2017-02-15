/**
 * Created by Kolodko on 18-Jan-17.
 */
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));


/*
The router for the index page of the website.
The index page contains a fixed number of random books that are displayed on the main page.
--> Sometimes the same book can show up twice on the same page. <--
 */
router.get('/', function(req,res){
    var books = req.app.get('bookData'),
        dataFile = [],
        authors = [],
        count;
    books.find(function (err, book){
        if(err) return console.error(err);

        //Collecting 3 random books to feature on the page.
        var randNum;
        for(count = 0; count < 4; count++){
            randNum = Math.floor(Math.random() * book.length);
            dataFile.push(book[randNum]);
            if(count == 3){
                dataFile.forEach(function(book){
                    var authorName = "";
                    if(book.author_id) {
                        req.app.get('authorData').findById(book.author_id, function (err, bookAuthor) {
                            if (err)return err;
                            if(bookAuthor)authors.push(bookAuthor.firstName + " " + bookAuthor.middleName + " " + bookAuthor.lastName);
                        });
                    }
                });
                res.render('index', {
                    pageTitle: 'HOME',
                    featureBooks: dataFile,
                    bookAuthor: authors,
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

/*
Displays all the books on the database.
 */
router.get('/browse', function(req,res){
    var books = req.app.get('bookData')
    books.find(function (err, book){
        if(err) return console.error(err);
                res.render('browse', {
                    pageTitle: 'HOME',
                    allBooks: book,
                    pageID: 'index',
                    userid: req.session.userid,
                    loggedIn: req.session.loggedIn,
                    username: req.session.username,
                    notification: req.session.notification
                });
                req.session.err = '';
    });
});

/*
Creates the page of the author by using the author's id number.
The book_list is created by finding all the books by id. The id's are taken from the author's books list.
 */
router.get('/authors/:authorid',function(req,res){
    req.app.get('authorData').findById(req.params.authorid,function(err, author) {
        if (err)console.log(err);
        req.app.get('bookData').find({"_id": { $in: author.books}},
            function(err,books){
                res.render('author', {
                    pageTitle: "Author's page",
                    author: author,
                    book_list: books,
                    userid: req.session.userid,
                    loggedIn: req.session.loggedIn,
                    username: req.session.username,
                    notification: req.session.notification
                });
            });
    });
});

/*
 Creates the page of the book.
 Very dirty solution to the callback hell.
 The goal was to display correctly if the current book is already in the user's favourites or not.
 */
router.get('/books/:bookid', function(req,res){
    var bookid = req.params.bookid;

    req.app.get('bookData').findById(bookid,function(err,book) {
        if (err)console.log(err);
        var author;
        if(book.author_id) {
            req.app.get('authorData').findById(book.author_id, function (err, bookAuthor) {
                if (err)return err;
                if(bookAuthor)author = bookAuthor;
            });
        }

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
                                bookAuthor: author,
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
                                bookAuthor: author,
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
                        bookAuthor: author,
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

/*
The page is replica of the book page but without the 'fav' function
 */
router.get('/books/:bookid/addauthor', function(req,res){
    var bookid = req.params.bookid;

    req.app.get('bookData').findById(bookid,function(err,book) {
        if (err)console.log(err);
        res.render('addAuthor', {
            pageTitle: book.title,
            book: book,
            pageID: 'book',
            userid: req.session.userid,
            loggedIn: req.session.loggedIn,
            username: req.session.username,
            notification: req.session.notification,
            err: req.session.err
        });
    });
});

/*
Creates a page with a form for creating a new book.
 */
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

/*
Catches a post request from a newBook form.
If the user did not provide the name of the author the book will be created normally
with the first, middle and last names having the value NULL.
 */
router.post('/books/newBook',function(req,res){
    var BookModel = req.app.get('bookData');
    var title = req.body.title.trim();
    var author = req.body.author.trim();
    var summary = req.body.summary.trim();
    req.session.err = '';

    if(title.length < 1){req.session.err += "Title field cannot be empty "+'\n' }
    if(title.length > 50){req.session.err += 'Title field cannot be over 50 characters\n'}
    if(summary.length > 300){req.session.err += 'Summary field cannot be over 300 characters\n'}

    if(req.session.err == ""){
        var book = new BookModel({
            title:req.body.title.trim(),
            author_id: null,
            summary: req.body.summary.trim(),
            cover: 'null',
            worms: []
        });
        book.save(function (err, book) {
            if(err) {
                console.log('The book is lost in space and time')
            }else{
                console.log("The book " + book.title + "has been recorded");

                /*
                Checks if the user input in the author field is 1, 2, 3 or more words.
                Accordingly uses that data to find the author to assign the book to the
                author's book list.
                 */
                var update = { $push: {"books": book._id}},
                    options = { upsert: true, new: true, setDefaultsOnInsert: true };


                if(author.length > 0){
                    author = author.split(' ');
                    if(author.length == 1){
                        req.app.get('authorData').findOneAndUpdate({ $and:[ {"firstName": author[0]},{"middleName": ""},{"lastName": ""}]},update,options,function(err,result){
                            if(err) return err;
                                book.update({"author_id": result._id},function(err){if(err) console.log(err)});
                        }
                        )
                    }else if(author.length == 2){
                        req.app.get('authorData').findOneAndUpdate({ $and:[ {"firstName": author[0]},{"middleName": " "},{"lastName": author[1]}]},update,options,function(err,result){
                            if(err) return err;
                                book.update({"author_id": result._id},function(err){if(err) console.log(err)});
                        }
                        )
                    }else {
                        req.app.get('authorData').findOneAndUpdate({ $and:[ {"firstName": author[0]},{"middleName": author[1]},{"lastName": author[2]}]},update,options,function(err,result){
                            if(err) return err;
                                book.update({"author_id": result._id},function(err){if(err) console.log(err)});
                        }
                        )
                    }
                }
            }
        });
        res.redirect('/');
    }else{
        res.redirect('/createBook');
    }

});

/*
Gets the comment data and the book's id where the comment was left.
 The comment author is passed from the session that the user is using.
 */
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
 The post contains code that is the exact replica from the post/newBook.
 Will need to create functions to avoid duplications.
 */
router.post('/book/addAuthor',function(req,res){


    var author = req.body.author,
        book_id = req.body.book_id;

    req.app.get('bookData').findById(book_id,function(err,book){
        if(err) console.log(err);
        if(book && author.length > 0){
            author = author.split(' ');
            var update = { $push: {"books": book._id}},
                options = { upsert: true, new: true, setDefaultsOnInsert: true };
            if(author.length == 1){
                req.app.get('authorData').findOneAndUpdate({ $and:[ {"firstName": author[0]},{"middleName": ""},{"lastName": ""}]},update,options,function(err,result){
                        if(err) return err;
                        console.log(result._id);
                        book.update({"author_id": result._id},function(err){if(err) console.log(err)});
                    res.redirect('/');
                    }
                )
            }else if(author.length == 2){
                req.app.get('authorData').findOneAndUpdate({ $and:[ {"firstName": author[0]},{"middleName": ""},{"lastName": author[1]}]},update,options,function(err,result){
                        if(err) return err;
                        console.log(result._id);
                        book.update({"author_id": result._id},function(err){if(err) console.log(err)});
                    res.redirect('/');
                    }
                )
            }else {
                req.app.get('authorData').findOneAndUpdate({ $and:[ {"firstName": author[0]},{"middleName": author[1]},{"lastName": author[2]}]},update,options,function(err,result){
                        if(err) return err;
                        console.log(result);
                        book.update({"author_id": result._id},function(err){if(err) console.log(err)});
                    res.redirect('/');
                    }
                )
            }

        }else{
            req.session.err = "The author name form appears to be empty.";
            res.redirect('/books/' + book_id + '/addAuthor');
        }
    });
});



/*
Worms are referred to users who like the current book.
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