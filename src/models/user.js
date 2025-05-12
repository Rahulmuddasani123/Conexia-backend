const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { Schema, model } = require("mongoose");

// Schema for users model
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxlength: 30,
    },
    lastName: {
      type: String,
      required: true,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate(value) {
        isValid = validator.isEmail(value);
        if (!isValid) {
          throw new Error("Email is not Valid");
        }
      },
    },
    password: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    photoUrl: {
      type: String,
    },
    about: {
      type: String,
      default: "This is default about",
    },
    skills: {
      type: Array,
    },
    secretKey:{
      type:String,
      required:true
    }
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return token;
};

userSchema.methods.validatePassword = async function (passwords) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(passwords, passwordHash);

  return isPasswordValid;
};

// User model
const userModel = model("User", userSchema);

// Exporting Users model

module.exports = userModel;
