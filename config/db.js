const mongoose = require("mongoose");

const connectWithDB = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("Db Connected".rainbow))
    .catch((error) => {
      console.log("DB not connected".underline.red);
      console.log(error);
      process.exit(1);
    });
};

module.exports = connectWithDB;
