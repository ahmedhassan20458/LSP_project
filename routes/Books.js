const router = require("express").Router();
const conn = require("../db/dbConnection");
const util = require("util");
const fs = require("fs");

const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { body, validtionResult } = require("express-validator");
const upload = require("../middleware/uploadImages");

//put books
router.post("", admin, upload.single("image"), body("name").isString().withMessage("").isLength({ min: 10 }).withMessage(""), body("description").isString().withMessage("").isLength({ min: 20 }).withMessage(""), async(req, res) => {

    const errors = validtionResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
        return res.status(400).json({
            errors: [{
                msg: "image is required"
            }]
        })
    }

    const book = {
        name: req.body.name,
        description: req.body.description,
        image_url: req.file.filename,
    }

    const query = util.promisify(conn.query).bind(conn);
    await query("insert into boooks set", book);

    res.status(200).json({
        msg: req.body,
    });
});



//update books
router.put("/:id", admin, upload.single("image"), body("name").isString().withMessage("").isLength({ min: 10 }).withMessage(""), body("description").isString().withMessage("").isLength({ min: 20 }).withMessage(""), async(req, res) => {

    const query = util.promisify(conn.query).bind(conn);
    const errors = validtionResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const book = await query("select from books where id =", [
        req.params.id,
    ]);
    if (!book[0]) {
        res.status(404).json({ ms: "book not found" });
    }

    const bookObj = {
        name: req.body.name,
        description: req.body.description,
    }
    if (req.file) {
        bookObj.image_url = req.file.filename;
        fs.unlinkSync("./upload/" + book[0].image_url)
    }

    await query("update books is set ? where id = ?", [
        bookObj,
        book[0].id
    ])

    res.status(200).json({
        msg: 'book upload '
    })




});





//delete books

router.delete("/:id", admin, async(req, res) => {

    const query = util.promisify(conn.query).bind(conn);
    const book = await query("select from books where id =", [
        req.params.id,
    ]);
    if (!book[0]) {
        res.status(404).json({ ms: "book not found" });
    }




    fs.unlinkSync("./upload/" + book[0].image_url)


    await query("delete books is set ? where id = ?", [

        book[0].id
    ])

    res.status(200).json({
        msg: "book deleted "
    })




});





//list & search

router.get("", async(req, res) => {
    const query = util.promisify(conn.query).bind(conn);
    let search = "";
    if (req.query.search) {
        search = `where name LIKE'%${req.query.search}% 'or description LIKE'%${req.query.search}%  '`
    }
    const books = await query(`select * form books {$search}`);
    books.map(book => {
        book.image_url = "http://" + req.hostname + ":4000/" + book.image_url;
    })
    res.status(200).json(books);
});

//show books
router.get("/:id", async(req, res) => {
    const query = util.promisify(conn.query).bind(conn);
    const book = await query("select * from books where id =?", [
        req.params.id,
    ]);
    if (!book[0]) {
        res.status(404).json({ ms: "book not found" });
    }
    book[0].image_url = "http://" + req.hostname + ":4000/" + book[0].image_url;
    book[0].reviews = await query("select * from user_movie_review where book_id=?", book[0].id)

    res.status(200).json(book[0]);
});



router.post("/review", body("book_id").isNumeric().withMessage("please enter a valid book ID"), body("review").isString().withMessage("please enter a valid review"), authorized, async(req, res) => {
    const query = util.promisify(conn.query).bind(conn);
    const errors = validtionResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const book = await query("select from books where id =", [
        req.body.book_id,
    ]);
    if (!book[0]) {
        res.status(404).json({ ms: "book not found" });
    }

    const reviewObj = {
        user_id: res.locals.user.id,
        book_id: book[0].id,
        review: req.body.review
    };
    await query("insert into user_book_review set ?", reviewObj);
    res.status.query(200).json({
        msg: "review added "
    })


});

module.exports = router;