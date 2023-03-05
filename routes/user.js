const express = require("express");
const {
  signUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUserDetails,
  updatePassword,
  adminAllUser,
  managerAllUser,
  adminSingleUser,
  updateUserDetails,
  adminUpdateSingleUser,
  adminDeleteSingleUser,
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/user-dashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, updatePassword);
router.route("/user-dashboard/update").post(isLoggedIn, updateUserDetails);

// Admin Only Route
router.route("/admin/user").get(isLoggedIn, customRole("admin"), adminAllUser);
router
  .route("/admin/user/:id")
  .get(isLoggedIn, customRole("admin"), adminSingleUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateSingleUser)
  .delete(isLoggedIn, customRole("admin"), adminDeleteSingleUser);

// Manager Only Route
router
  .route("/manager/user")
  .get(isLoggedIn, customRole("manager"), managerAllUser);

module.exports = router;
