const express = require("express");
const { home, homedummy } = require("../controllers/homeController");
const router = express.Router();

router.route("/").get(home);
router.route("/homedummy").get(homedummy);

module.exports = router;
