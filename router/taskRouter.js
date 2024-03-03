import express from "express";
export const TaskRouters = express.Router();
import auth from "../middleware/auth.js";
import * as taskController from "../controller/taskController.js";
import limiter from "../middleware/throttleservice.js";
//create task router
TaskRouters.post("/createTask", auth, limiter, taskController.createTask);

//get task router

TaskRouters.get("/getTask", auth, limiter, taskController.getTask);

//get task by id router

TaskRouters.get("/getTaskById/:id", auth, limiter, taskController.getTaskById);

//update task

TaskRouters.put("/updateTask/:id", auth, limiter, taskController.updateTask);

//delete task

TaskRouters.delete("/deleteTask/:id", auth, limiter, taskController.deleteTask);

TaskRouters.get("/getTaskByDate", auth, limiter, taskController.getTaskByDate);

TaskRouters.get("/generatepdftask/:id",auth, limiter, taskController.genaratePdfTask);

