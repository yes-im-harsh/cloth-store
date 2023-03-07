const bigPromise = require("../middlewares/bigPromise");

exports.testProduct = bigPromise(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Product Route Working Fine",
  });
});
