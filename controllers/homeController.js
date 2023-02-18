const BigPromise = require("../middlewares/bigPromise");

//Using Big promise
exports.home = BigPromise((req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello from API",
  });
});

// Or Use Async await with try catch
exports.homedummy = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Hello from Home Dummy API",
    });
  } catch (error) {
    console.log(error);
  }
};
