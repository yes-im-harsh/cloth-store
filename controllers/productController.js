const bigPromise = require("../middlewares/bigPromise");
const Product = require("../models/product");
const CustomError = require("../utils/customError");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause");

exports.addProduct = bigPromise(async (req, res, next) => {
  //Images
  let imagesArray = [];

  if (!req.files) return next(new CustomError("Please add photos", 400));

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      imagesArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imagesArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProduct = bigPromise(async (req, res, next) => {
  const resultPerPage = 6;

  //Optional (same as filterProductLength as defined below)
  const totalCountProduct = await Product.countDocuments();

  console.log(req.query);

  //getting filtered products
  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  //Without await works fine, But with await gives an error (MongooseError: Query was already executed: Product.find({})): Search Stack overflow, and use clone()
  let products = await productsObj.base;
  const filteredProductLength = products.length;

  //Pager
  productsObj.pager(resultPerPage);
  //Using clone of the error discussed in 53, clone helps with the (removes errors) of multiple chaining of filters
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filteredProductLength,
    totalCountProduct,
  });
});
