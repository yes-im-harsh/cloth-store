const CustomError = require("../utils/customError");
const User = require("../models/user");
const cookieToken = require("../utils/cookieToken");
const bigPromise = require("../middlewares/bigPromise");
const cloudinary = require("cloudinary");

exports.signUp = bigPromise(async (req, res, next) => {
  let result;
  if (req.files) {
    //calling it userphoto
    const file = req.files.userphoto;
    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }

  //getting the request
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new CustomError("Required Field is missing", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  //generate jwt, set cookie, & return response
  cookieToken(user, res);
});
