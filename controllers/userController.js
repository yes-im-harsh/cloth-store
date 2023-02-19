const CustomError = require("../utils/customError");
const User = require("../models/user");
const cookieToken = require("../utils/cookieToken");

exports.signUp = async (req, res, next) => {
  try {
    //getting the request
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new CustomError("Required Field is missing", 400));
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    //generate jwt, set cookie, & return response
    cookieToken(user, res);
  } catch (error) {
    throw new Error(e);
  }
};
