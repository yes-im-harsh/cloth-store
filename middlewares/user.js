const user = require("../models/user");
const BigPromise = require("./bigPromise");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization").replace("Bearer ", "");

  if (!token) return next(new CustomError("First login", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await user.findById(decoded.id);

  next();
});
