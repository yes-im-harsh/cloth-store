const express = require("express");
const {
  addProduct,
  getAllProduct,
} = require("../controllers/productController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const router = express.Router();

router.route("/products").get(getAllProduct);
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);

module.exports = router;
