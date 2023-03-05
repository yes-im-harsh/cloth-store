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
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/user-dashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/user-dashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, updatePassword);

router.route("/admin/user").get(isLoggedIn, customRole("admin"), adminAllUser);

module.exports = router;
