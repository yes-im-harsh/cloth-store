const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxlength: [10, "Name Must be less that 10 char"],
  },

  email: {
    type: String,
    required: [true, "Please Enter Your Name"],
    unique: true,
  },

  password: {
    type: String,
    require: [true, "Please Enter Your Password"],
    minlength: [6, "Password must be 6 characters"],
    // validate: [validator.isEmail, "Please enter email in correct format"],

    //With select we don't have to make our password undefined in the controller.
    select: false,
  },

  role: {
    type: String,
    default: "user",
  },

  photo: {
    id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
  },

  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

//.pre Hook
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const encyptedPassword = await bcrypt.hash(this.password, 10);
    this.password = encyptedPassword;
  }

  next();
});

//For Verifying Password
userSchema.methods.isValidPassword = async function (passwordToCompare) {
  return await bcrypt.compare(toBeComparedPassword, this.password);
};

//For Creating JWT
userSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

//Forgot Password Token (!Not a JWT Token, Just a random bytes of strings)
userSchema.methods.getForgotPasswordToken = function () {
  //for generating a random string
  const forgotPasswordToken = crypto.randomBytes(20).toString("hex");

  // getting a hash - make sure to get a hash on backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotPasswordToken)
    .digest("hex");

  //time for token
  this.forgotPasswordExpiry =
    Date.now() + process.env.FORGOT_PASSWORD_TOKEN_EXPIRY_TIME;

  return forgotPasswordToken;
};

module.exports = mongoose.model("User", userSchema);
