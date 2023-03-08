const express = require("express");
const {
  addProduct,
  getAllProduct,
  adminGetAllProducts,
  getSingleProduct,
  adminUpdateSingleProduct,
  adminDeleteSingleProduct,
  addReview,
  deleteReview,
  getOnlyReviewsForOneProduct,
} = require("../controllers/productController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const router = express.Router();

//User routes
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getSingleProduct);
//Add review will be put, because we are checking that if user already have a review, and then updating with the data
router
  .route("/product/review/:id")
  .put(isLoggedIn, addReview)
  .delete(isLoggedIn, deleteReview);

router
  .route("/product/reviews/:id")
  .get(isLoggedIn, getOnlyReviewsForOneProduct);

//Admin Routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);

router
  .route("/admin/products")
  .get(isLoggedIn, customRole("admin"), adminGetAllProducts);

router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateSingleProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeleteSingleProduct);

module.exports = router;
