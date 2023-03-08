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

exports.getSingleProduct = bigPromise(async (req, res, next) => {
  const singleProduct = await Product.findById(req.params.id);

  if (!singleProduct) {
    return next(new CustomError("Something went wrong with the user id", 401));
  }

  res.status(200).json({
    success: true,
    singleProduct,
  });
});

exports.addReview = bigPromise(async (req, res, next) => {
  const productId = req.params.id;
  const { rating, comment } = req.body;

  console.log(req.user.id);

  //Prepare the review
  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  //Find the product
  const product = await Product.findById(productId);

  //Check if user already had done review
  const alreadyReview = product.reviews.find(
    (review) => review.user.toString() === req.user.id.toString()
  );

  if (alreadyReview) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user.id.toString()) {
        (review.comment = comment), (review.rating = rating);
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  // Product Rating
  product.ratings =
    product.reviews.reduce((item, acc) => item.rating + acc, 0) /
    product.reviews.length;

  //Saving
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.deleteReview = bigPromise(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() === req.user.id.toString()
  );

  const numberOfReviews = reviews.length;

  // Product Rating
  product.ratings =
    product.reviews.reduce((item, acc) => item.rating + acc, 0) /
    product.reviews.length;

  //Ratings
  const ratings = product.ratings;

  //Saving
  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getOnlyReviewsForOneProduct = bigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//Admin Only Controllers
exports.adminGetAllProducts = bigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

exports.adminUpdateSingleProduct = bigPromise(async (req, res, next) => {
  let singleProduct = await Product.findById(req.params.id);

  if (!singleProduct) {
    return next(new CustomError("Something went wrong with the user id", 401));
  }

  let imagesArray = [];

  if (req.files) {
    for (let index = 0; index < singleProduct.photos.length; index++) {
      const element = singleProduct.photos[index].id;
      const result = await cloudinary.v2.uploader.destroy(element);
    }

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

  singleProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    singleProduct,
  });
});

exports.adminDeleteSingleProduct = bigPromise(async (req, res, next) => {
  const singleProduct = await Product.findById(req.params.id);

  //destroying the cloudinary image data
  for (let index = 0; index < singleProduct.photos.length; index++) {
    const element = singleProduct.photos[index].id;
    await cloudinary.v2.uploader.destroy(element);
  }

  await singleProduct.remove();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
