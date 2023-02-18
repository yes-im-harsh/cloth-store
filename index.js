const app = require("./app");
require("dotenv").config();
var colors = require("colors");

app.listen(process.env.PORT, () => {
  console.log(`Server is up & running on ${process.env.PORT}`.underline.cyan);
});
