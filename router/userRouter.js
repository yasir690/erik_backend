const express = require('express');
const userController = require('../controller/userController'); // Importing controller without the .js extension
const auth = require('../middleware/auth');
const limiter = require('../middleware/throttleservice');

// Create a router instance
const UserRouters = express.Router();

// User register route
UserRouters.post("/userRegister", limiter, userController.userRegister);

// User login route
UserRouters.post("/userLogin", limiter, userController.userLogin);

// Forget password route
UserRouters.post("/forgetPassword", userController.forgetPassword);

// Verify OTP route
UserRouters.post("/verifyOtp", limiter, userController.verifyOtp);

// Reset password route
UserRouters.post("/resetPassword", auth, limiter, userController.resetPassword);

// Update image route
// UserRouters.put("/updateImage", auth, limiter, userController.updateImage);

// Get user by ID route
UserRouters.get("/getUserById/:id", auth, limiter, userController.getUserById);

// Get user route
UserRouters.get("/getUser", auth, limiter, userController.getUser);

// Export the router
module.exports = UserRouters;
