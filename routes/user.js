const express = require("express");
const { signUp } = require("../controllers/userController");
const router = express.Router();

router.route("/signup").get(signUp);

module.exports = router;
