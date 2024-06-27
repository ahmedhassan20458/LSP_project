const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "demo-backend",
    port: "3307"

});

connection.connect((err) => {
    if (err) throw err;
    console.log("db is conncted");
});

module.exports = connection;