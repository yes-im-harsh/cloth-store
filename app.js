const express = require("express");
require("dotenv").config();
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")

//regular middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//cookies and file upload middlewares
app.use(cookieParser())
app.use(fileUpload()) 

//morgan
app.use(morgan("tiny"));

//import all routes here
const home = require("./routes/home");

//router middleware
app.use("/api/v1", home);

module.exports = app;
