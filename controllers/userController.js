const CustomError = require("../utils/customError");
const User = require("../models/user");
const cookieToken = require("../utils/cookieToken");
const bigPromise = require("../middlewares/bigPromise");
const cloudinary = require("cloudinary");

exports.signUp = bigPromise(async (req, res, next) => {
  if (!req.files) {
    return next(new CustomError("Please Upload The Files, It's Required", 400));
  }

  //calling it userphoto
  const file = req.files.userphoto;

  //Uploading it the cloudinary
  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  //getting the request
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new CustomError("Required Field is missing", 400));
  }

  //Creating User in the DB
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

exports.login = bigPromise(async (req, res, next) => {
  //getting the request
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new CustomError("Required Field is missing", 400));
  }

  //Fining User  & .select("+password"), because we have done select false in the model
  const user = await User.findOne({ email }).select("+password");

  //If User is not present in DB
  if (!user) {
    return next(new CustomError("User not registered", 400));
  }

  //match the password
  const isPasswordCorrect = await user.isValidPassword(password);

  //If Password is incorrect
  if (!isPasswordCorrect) {
    return next(
      new CustomError(
        "Password Incorrect, Please Enter the correct password",
        404
      )
    );
  }

  //generate jwt, set cookie, & return response
  cookieToken(user, res);
});

exports.logout = bigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    path: "/",
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true, 
    message: "Logout Success"
  })
});
