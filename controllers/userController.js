const CustomError = require("../utils/customError");
const User = require("../models/user");
const cookieToken = require("../utils/cookieToken");
const bigPromise = require("../middlewares/bigPromise");
const cloudinary = require("cloudinary");
const user = require("../models/user");
const sendMail = require("../utils/mailHelper");
const crypto = require("crypto");

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
    message: "Logout Success",
  });
});

exports.forgotPassword = bigPromise(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("Email not registered in the db", 400));
  }

  //get the forgotToken
  const forgotToken = user.getForgotPasswordToken();

  //save user with the forgot token
  await user.save({ validateBeforeSave: false });

  //create url to send to the user
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `Click on this link to reset password \n\n ${myUrl}`;

  try {
    await sendMail({
      email: user.email,
      subject: "Cloth Store Reset Email",
      message,
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new CustomError("Mail not sent, Something went wrong", 400));
  }

  res.status(200).json({
    success: true,
    message: "Mail Sent",
  });
});

exports.resetPassword = bigPromise(async (req, res, next) => {
  const token = req.params.token;
  console.log(token, "token");

  const encryptToken = crypto.createHash("sha256").update(token).digest("hex");
  console.log(encryptToken, "encrypted token");

  console.log(Date.now());

  const user = await User.findOne({
    forgotPasswordToken: encryptToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  console.log(user);

  if (!user) {
    return next(new CustomError("Not a valid user", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError("Password and Confirm Password don't match", 400)
    );
  }

  user.password = req.body.password;

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  //send json response or cookie
  cookieToken(user, res);
});

exports.getLoggedInUserDetails = bigPromise(async (req, res, next) => {
  const userDetails = await User.findById(req.user.id);

  if (!userDetails)
    return next(new CustomError("User details Not available, Please Login"));

  res.status(200).json({
    success: true,
    userDetails,
  });
});

exports.updatePassword = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!user) return next(new CustomError("User not logged in", 401));

  const oldPassword = req.body.oldPassword;

  if (!oldPassword) next(new CustomError("oldPassword not provided", 400));

  const isCorrectOldPassword = await user.isValidPassword(oldPassword);

  if (!isCorrectOldPassword) {
    return next(new CustomError("old password don't match", 401));
  }

  const newPassword = req.body.newPassword;
  const confirmNewPassword = req.body.confirmNewPassword;

  if (!newPassword || !confirmNewPassword)
    next(new CustomError("password or confirmPassword field missing"));
  if (newPassword !== confirmNewPassword)
    next(new CustomError("password and confirm password do not match"));

  user.password = newPassword;

  await user.save();

  cookieToken(user, res);
});

exports.updateUserDetails = bigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files) {
    const user = await User.findById(req.user.id);
    const photoId = user.photo.id;

    //delete photo on cloudinary
    const resp = await cloudinary.v2.uploader.destroy(photoId);

    //upload new photo
    //Uploading it the cloudinary
    const result = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) next(new CustomError("No Such User", 400));

  res.status(200).json({
    success: true,
  });
});

exports.adminAllUser = bigPromise(async (req, res, next) => {
  const user = await User.find();

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminSingleUser = bigPromise(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findById(id);

  if (!user) next(new CustomError("No such user", 400));

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminUpdateSingleUser = bigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  if (!newData) next(new CustomError("Name, Email or Role Missing"));

  //Update the user
  const result = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.adminDeleteSingleUser = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new CustomError("No such user", 400));

  // Delete from cloudinary
  const resp = await cloudinary.v2.uploader.destroy(user.photo.id);

  // User Removed
  await user.remove();

  res.status(200).json({
    success: true,
  });
});

exports.managerAllUser = bigPromise(async (req, res, next) => {
  const user = await User.find({ role: "user" });

  res.status(200).json({
    success: true,
    user,
  });
});
