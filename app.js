const express = require("express");
require("dotenv").config();
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

//regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookies and file upload middlewares
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);

//temp check
app.set("view engine", "ejs");

//morgan
app.use(morgan("tiny"));

//import all routes here
const home = require("./routes/home");
const user = require("./routes/user");

//router middleware
app.use("/api/v1", home);
app.use("/api/v1", user);

//temp check (for signup using files)
app.set("view engine", "ejs");

//signup test ejs
app.get("/signuptest", (req, res) => res.render("signuptest"));

module.exports = app;
