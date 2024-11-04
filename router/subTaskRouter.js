import express from "express";
export const subTaskRouters = express.Router();
import auth from "../middleware/auth.js";
import * as subTaskController from "../controller/subTaskController.js";
import limiter from "../middleware/throttleservice.js";
//create sub task router
subTaskRouters.post(
  "/createSubTask",
  auth,
  limiter,
  subTaskController.createSubtask
);

//get sub task router
subTaskRouters.get("/getSubTask", auth, limiter, subTaskController.getSubTask);

//get sub task by id router
subTaskRouters.get(
  "/getSubTask/:id",
  auth,
  limiter,
  subTaskController.getSubTaskById
);

//update sub task router
subTaskRouters.put(
  "/updateSubTask/:id",
  auth,
  limiter,
  subTaskController.updateSubTask
);

//delete sub task router
subTaskRouters.delete(
  "/deleteSubTask/:id",
  auth,
  subTaskController.deleteSubTask
);

subTaskRouters.get("/generatepdfsubtask/:id",auth, limiter, subTaskController.genaratePdfSubtask);
