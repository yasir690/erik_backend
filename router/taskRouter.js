const express = require('express');
const taskController = require('../controller/taskController'); // Importing controller without the .js extension
const auth = require('../middleware/auth');
const limiter = require('../middleware/throttleservice');

const TaskRouters = express.Router();

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

module.exports=TaskRouters;