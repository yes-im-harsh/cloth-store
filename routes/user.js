const express = require("express");
const { signUp } = require("../controllers/userController");
const router = express.Router();

router.route("/signup").post(signUp);

module.exports = router;
