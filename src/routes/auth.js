const express = require("express");
const authRouter = express.Router();
const { loginAuth } = require("../middlewares/Auth");
const { signupValidation } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

authRouter.post("/login", loginAuth, async (req, res) => {
  try {
    const loggedInUser=req.user;
    const token = req.token;

    res.cookie("token", token);
    res.send(loggedInUser);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

// HTTP POST USER API Route
authRouter.post("/signup", async (req, res) => {
  try {
    signupValidation(req); // Validation
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      skills,
      about,
      secretKey,
    } = req.body;

    const validUser = await User.findOne({ email: email });

    if (validUser) {
      throw new Error("User Already Exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const data = {
      firstName,
      lastName,
      email,
      age,
      gender,
      skills,
      about,
      password: passwordHash,
      secretKey
    };

    const user = new User(data);
    await user.save();
    res.send("User Added Successfully");
  } catch (err) {
    res.status(400).send( err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });

    res.send("Logout Successful");
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = authRouter;
