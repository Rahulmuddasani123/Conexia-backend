const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      throw new Error("Invalid Token !!");
    }

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

    const { _id } = decodedToken;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User Not Found !!");
    }
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

const loginAuth = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("Invalid Email");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid Password");
    }

    const token = await user.getJWT();

    if (!token) {
      throw new Error("Invalid ");
    }

    req.token = token;
    req.user = user;

    next();
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

module.exports = { userAuth, loginAuth };
