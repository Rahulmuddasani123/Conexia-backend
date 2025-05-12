const validator = require("validator");
const signupValidation = (req) => {
  const { firstName, lastName, email, password,secretKey } = req.body;

  if (!firstName || !lastName) {
    throw new Error("First Name & Last Name Required!");
  }

  if (!email) {
    throw new Error("Email Required !!");
  }

  if (!secretKey) {
    throw new Error("Secret Key Required!");
  }

  if (!validator.isEmail(email) ) {
    throw new Error("Invalid Email !!");
  }
 
  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong !!");
  }
};

const validateEditData = (req) => {

  const { firstName, lastName, email, password, secretKey,photoUrl } = req.body;

  const allowedEditFields = [
    "firstName",
    "lastName",
    "email",
    "age",
    "gender",
    "about",
    "skills",
    "photoUrl"
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  if(!firstName && !lastName){
    throw new Error("First Name & Last Name Required")
  }
  if ( photoUrl && !validator.isURL(photoUrl)) {
    throw new Error("Please Enter a valid Photo URL");
  }

  return isEditAllowed;
};

const validateEditPassword = (req) => {

  

  if (!req.body.password) {
    throw new Error("Password is Required !!");
  }

  if(!req.body.password){
    throw new Error("Password is Required !!");

  }

  if (!validator.isStrongPassword(req.body.password)) {
    throw new Error("Password is not strong !!");
  }
  const allowedEditFields = ["password"];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
};





module.exports = { signupValidation, validateEditData, validateEditPassword };
