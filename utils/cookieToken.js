const cookieToken = (user, res) => {
  //generate token
  const token = user.generateJWT();

  //options for setting cookie
  const options = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    path: "/",
  };

  //setting cookie
  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
  });
};

module.exports = cookieToken;
