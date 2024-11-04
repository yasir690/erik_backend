import express from "express";
import * as userController from "../controller/userController.js";
import auth from "../middleware/auth.js";
export const UserRouters = express.Router();

import limiter from "../middleware/throttleservice.js";
//user register routes
UserRouters.post("/userRegister", limiter, userController.userRegister);

//user login routes
UserRouters.post("/userLogin", limiter, userController.userLogin);

UserRouters.post("/forgetPassword", userController.forgetPassword);

UserRouters.post("/verifyOtp", limiter, userController.verifyOtp);

UserRouters.post("/resetPassword", auth, limiter, userController.resetPassword);

UserRouters.put("/updateImage", auth, limiter, userController.updateImage);

UserRouters.get("/getUserById/:id", auth, limiter, userController.getUserById);

UserRouters.get("/getUser", auth, limiter, userController.getUser);
