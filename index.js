const app = require("./app");
require("dotenv").config();
const colors = require("colors");
const connectWithDB = require("./config/db");
const cloudinary = require("cloudinary");

//Connect to the DB
connectWithDB();

//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`Server is up & running on ${process.env.PORT}`.underline.cyan);
});
