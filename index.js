const app = require("./app");
require("dotenv").config();
const colors = require("colors");
const connectWithDB = require("./config/db");


//Connect to the DB
connectWithDB()

app.listen(process.env.PORT, () => {
  console.log(`Server is up & running on ${process.env.PORT}`.underline.cyan);
});
