const express = require("express");
const {
  signUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUserDetails,
} = require("../controllers/userController");
const { isLoggedIn } = require("../middlewares/user");
const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/user-dashboard").get(isLoggedIn, getLoggedInUserDetails);

module.exports = router;
