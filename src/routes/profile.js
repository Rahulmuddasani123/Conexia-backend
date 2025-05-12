const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/Auth");
const User = require("../models/user");
const validator = require("validator");

const {
  signupValidation,
  validateEditData,
  validateEditPassword,
} = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const newData = req.body;

    const isEditAllowed = validateEditData(req);

    if (!isEditAllowed) {
      throw new Error("Edit is not Allowed");
    }

    Object.keys(newData).every((key) => (loggedInUser[key] = newData[key]));

    await loggedInUser.save();

    res.json({ message: `Profile Updated Successfully`, data: loggedInUser });
  } catch (err) {
    console.error("Validation Error:", err);

    // Check if it's a Mongoose validation error
    const validationErrors = err.errors;
    const firstError = validationErrors
      ? Object.values(validationErrors)[0]?.message
      : err.message;

    res.status(400).json({
      message: firstError || "Invalid input",
    });
  }
});

profileRouter.patch("/changePassword", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const newPassword = req.body.password;

    const isEditAllowed = validateEditPassword(req);

    if (!isEditAllowed) {
      throw new Error("Edit is not Allowed");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    loggedInUser["password"] = passwordHash;

    loggedInUser.save();

    res.send(`Password Updated Successfully`);
  } catch (err) {
    res.status(400).send( err.message);
  }
});

profileRouter.patch("/forgotPassword", async (req, res) => {
  try {
    const { email, secretKey, newPassword } = req.body;

    if (!email) throw new Error("Email Required");
    if (!secretKey) throw new Error("Secret Key Required");
    if (!newPassword) throw new Error("New Password Required");

    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("Invalid User");
    }
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Password is not strong !!");
    }
    const userSecretKey = user.secretKey;

    if (!(userSecretKey === secretKey)) throw new Error("Invalid Secret Key");

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    user.password = newPasswordHash;
    await user.save();
    res.json({ message: "New Password Set Successfully", data: user });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = profileRouter;
