const express = require("express");
const { home } = require("../controllers/homeController");
const router = express.Router();

router.route("/").post(home);

module.exports = router;
