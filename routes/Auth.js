const router = require("express").Router();
const conn = require("../db/dbConnection");
const { body, validtionResult } = require("express-validator");
const util = require("util");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


router.post("/login", body("email").isEmail().withMessage("please enter a vaild email"), body("password").isLength({ min: 10, max: 20 }).withMessage("please enter a vaild password"), async(req, res) => {
    try {
        const errors = validtionResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const query = util.promisify(conn.query).bind(conn);
        const checkEmailExists = await query("select * from users where email = ?", [req.body.email]);

        if (checkEmailExists.length == 0) {
            res.status(400).json({
                errors: [{
                    msg: "email or password not found",
                }, ],
            })
        }
        //const userData = {
        //name: req.body.name,
        // email: req.body.email,
        // password: await bcrypt.hash(req.body.password, 10),
        //token: crypto.randomBytes(16).toString("hex"),
        //};

        //await query("insert into users set ?", userData);
        res.status(200).json(userData);

        //delete userData.password;
        const checkPassword = await bcrypt.compare(req.body.password, checkEmailExists[0].password);
        if (checkPassword) {
            delete user[0].password;
            res.status(200).json(checkPassword);
        } else {
            res.status(400).json({
                errors: [{
                    msg: "email or password not found",
                }, ],
            })
        }




        //res.json("success");
        res.json("hi");

    } catch (err) {
        console.log(err);
        res.status(500).json({ err: err });
    }
});
module.exports = router;





router.post("/register", body("email").isEmail().withMessage("please enter a vaild email"), body("name").isString().withMessage("please enter a vaild name").isLength({ min: 10, max: 20 }).withMessage("name shold be between (10-20) character"), body("password").isLength({ min: 10, max: 20 }).withMessage("please enter a vaild password"), async(req, res) => {
    try {
        const errors = validtionResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const query = util.promisify(conn.query).bind(conn);
        const checkEmailExists = await query("select * from users where email = ?", [req.body.email]);

        if (checkEmailExists.length > 0) {
            res.status(400).json({
                errors: [{
                    msg: "email already exists",
                }, ],
            })
        }
        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
            token: crypto.randomBytes(16).toString("hex"),
        };

        await query("insert into users set ?", userData);
        res.status(200).json(userData);

        delete userData.password;




        //res.json("success");

    } catch (err) {
        console.log(err);
        res.status(500).json({ err: err });
    }
});
module.exports = router;