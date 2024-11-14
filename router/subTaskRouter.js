const express = require('express');
const subTaskController = require('../controller/subTaskController'); // Importing controller without the .js extension
const auth = require('../middleware/auth');
const limiter = require('../middleware/throttleservice');

const subTaskRouters = express.Router();
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

module.exports=subTaskRouters;