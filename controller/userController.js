const userModel = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { config } = require("dotenv");
// const { randomInt } = require("crypto");
const otpModel = require("../model/otpModel");
const { sendEmails } = require("../utils/sendEmail");
const { handleMultipartData } = require("../utils/multiPartData");
const mongoose = require("mongoose");

const { loggerInfo, loggerError } = require('../utils/log');

// user register
const userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      loggerError.error('provide name');
      return res.status(400).json({
        success: false,
        message: "provide name",
      });
    }
    if (!email) {
      loggerError.error('provide email');
      return res.status(400).json({
        success: false,
        message: "provide email",
      });
    }
    if (!password) {
      loggerError.error('provide password');
      return res.status(400).json({
        success: false,
        message: "provide password",
      });
    }

    // Check if the user exists in the database
    const userCheck = await userModel.find({ email: email });

    if (userCheck.length !== 0) {
      loggerError.error("user already exists");
      return res.status(200).json({
        message: "user email already exists",
        success: false,
      });
    }

    // Create user
    const user = new userModel({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
    });

    const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // Save user token
    user.userToken = token;

    // Save user to the database
    const saveUser = await user.save();

    if (!saveUser) {
      loggerError.error("user not created");
      return res.status(400).json({
        success: false,
        message: "user not created",
      });
    }

    loggerInfo.info("user created successfully");
    return res.status(200).json({
      success: true,
      message: "user created successfully",
      data: saveUser,
    });
  } catch (error) {
    loggerError.error("Internal server error", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// user login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      loggerError.error("Email not provided");
      return res.status(400).json({
        success: false,
        message: "Email not provided",
      });
    }

    if (!password) {
      loggerError.error("Password not provided");
      return res.status(400).json({
        success: false,
        message: "Password not provided",
      });
    }

    const user = await userModel
      .findOne({ email: email })
      .populate(["tasks", "subtasks"]);

    if (!user) {
      loggerError.error("user not found");
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      loggerError.error("Please enter the correct password");
      return res.status(400).json({
        success: false,
        message: "Please enter the correct password",
      });
    }

    const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user.userToken = token;
    await user.save();

    const profile = { ...user._doc, userToken: token };

    loggerInfo.info("User Login Successfully");
    return res.status(200).json({
      success: true,
      message: "User Login Successfully",
      data: profile,
    });
  } catch (error) {
    loggerError.error("Internal server error", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// forget password
// const forgetPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await userModel.findOne({ email: email }).populate("otpEmail");

//     if (!user) {
//       loggerError.error("User not found");
//       return res.status(400).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const OTP = randomInt(10000, 99999);

//     const newOTP = new otpModel({
//       otpKey: OTP,
//       otpUsed: false,
//     });

//     const savedOTP = await newOTP.save();
//     user.otpEmail = savedOTP._id;
//     await user.save();

//     sendEmails(user.email, "Code sent successfully", `<h5>Your code is ${OTP}</h5>`);
//     loggerInfo.info("Code sent successfully");

//     return res.status(200).json({
//       success: true,
//       message: "Code sent successfully",
//       data: OTP,
//     });
//   } catch (error) {
//     loggerError.error("Internal server error", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email }).populate("otpEmail");

    if (!user) {
      loggerError.error("User not found");
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const OTP = user.otpEmail;

    if (!OTP) {
      loggerError.error("OTP not found");
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (OTP.otpUsed) {
      loggerError.error("OTP already used");
      return res.status(400).json({
        success: false,
        message: "OTP already used",
      });
    }

    if (OTP.otpKey !== otp) {
      loggerError.error("Invalid OTP");
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const currentTime = new Date();
    const OTPTime = OTP.createdAt;
    const diff = currentTime.getTime() - OTPTime.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes > 60) {
      return res.status(400).json({
        success: false,
        message: "OTP expire",
      });
    }

    const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user.userToken = token;
    await user.save();

    OTP.otpUsed = true;
    await OTP.save();

    user.otpVerified = true;
    user.otpEmail = null;
    await user.save();

    const profile = { ...user._doc, userToken: token };

    loggerInfo.info("OTP verified successfully");
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: profile,
    });
  } catch (error) {
    loggerError.error("Internal server error", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// reset password
const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { user_id } = req.user;

    if (!password) {
      loggerError.error("provide password");
      return res.status(400).json({
        success: false,
        message: "provide password",
      });
    }
    if (!confirmPassword) {
      loggerError.error("provide confirm password");
      return res.status(400).json({
        success: false,
        message: "provide confirm password",
      });
    }

    if (password != confirmPassword) {
      loggerError.error("password does not match");
      return res.status(400).json({
        success: false,
        message: "password does not match",
      });
    }

    const userResetPassword = await userModel.findByIdAndUpdate(
      user_id,
      {
        password: bcrypt.hashSync(password, 10),
      },
      { new: true }
    );

    if (!userResetPassword) {
      loggerError.error("Password not reset");
      return res.status(400).json({
        success: false,
        message: "Password not reset",
      });
    }

    loggerInfo.info("Password reset successfully");
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: userResetPassword,
    });
  } catch (error) {
    loggerError.error("Internal server error", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// update image
// const updateImage = [
//   handleMultipartData.fields([
//     {
//       name: "image",
//       maxCount: 1,
//     },
//   ]),

//   async (req, res) => {
//     try {
//       const { user_id } = req.user;
//       const { files } = req;
//       const filesArray = (filesObj, type) => {
//         if (!filesObj[type].length) {
//           return "";
//         }
//         const file = filesObj[type][0]; // Get the first file from the array
//         const imagePath = file.path.replace(/\\/g, "/").replace("public/", "");
//         const baseUrl = `${req.protocol}://${req.get("host")}`;
//         const fullImagePath = `${baseUrl}/${imagePath}`;
//         return fullImagePath;
//       };

//       const user = await userModel.findById(user_id);

//       if (!user) {
//         loggerError.error("User not found");
//         return res.status(400).json({
//           success: false,
//           message: "User not found",
//         });
//       }

//       if (!files || !files["image"]) {
//         loggerError.error("Image not provided");
//         return res.status(400).json({
//           success: false,
//           message: "Image not provided",
//         });
//       }

//       user.image = files && files["image"] ? filesArray(files, "image") : "";

//       const updatedUser = await user.save();

//       loggerInfo.info("Image updated successfully");
//       return res.status(200).json({
//         success: true,
//         message: "Image updated successfully",
//         data: updatedUser,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message,
//       });
//     }
//   },
// ];

// get user
const getUser = async (req, res) => {
  try {
    const { user_id } = req.user;

    const userFind = await userModel.findOne({ _id: user_id });

    if (!userFind) {
      loggerError.error("user not found");
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    const getAllUser = await userModel.find({ _id: { $ne: user_id } });

    if (!getAllUser || getAllUser.length === 0) {
      loggerError.error("users not found");
      return res.status(400).json({
        success: false,
        message: "users not found",
      });
    }

    loggerInfo.info("users found successfully");
    return res.status(200).json({
      success: true,
      message: "users found successfully",
      data: getAllUser,
    });
  } catch (error) {
    loggerError.error("Internal server error", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// get user by user id
const getUserById = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;

    const userFind = await userModel.findOne({ _id: user_id });

    if (!userFind) {
      loggerError.error("user not found");
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      loggerError.error("Invalid user ID");
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const getUser = await userModel.findById(id);
    if (!getUser) {
      loggerError.error("user not found");
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    loggerInfo.info("user found successfully");
    return res.status(200).json({
      success: true,
      message: "user found successfully",
      data: getUser,
    });
  } catch (error) {
    loggerError.error("Internal server error", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  userRegister,
  userLogin,
  // forgetPassword,
  verifyOtp,
  resetPassword,
  // updateImage,
  getUser,
  getUserById
};
