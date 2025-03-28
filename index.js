const express = require("express");
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("upload"));

const cors = require("cors");
app.use(cors());

const auth = require("./routes/Auth");
const books = require("./routes/Books");

app.listen(4000, "localhost", () => {
    console.log("uigdiuahsui")
});

app.use("/auth", auth);
app.use("/books", books);