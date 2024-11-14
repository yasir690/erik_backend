const subtaskModel = require("../model/subtaskModel");
const userModel = require("../model/userModel");
const taskModel = require("../model/taskModel");
const mongoose = require("mongoose");
const moment = require("moment");
const PDFDocument = require("pdfkit");
const { loggerError, loggerInfo } = require("../utils/log");


//create subtask

 const createSubtask = async (req, res) => {
  try {
    const { user_id } = req.user;
    const {
      subTaskTitle,
      subTaskDescription,
      task,
      scheduledDateTime,
      estimatedTime,
      price,
      assignedUsers
    } = req.body;
    console.log("userId:", user_id);
    console.log(req.body);

    // Find admin user
    const findAdmin = await userModel.findOne({ _id: user_id });

    if (!findAdmin) {
      loggerError.error("Admin not found");
      return res.status(400).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check if taskId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(task)) {
      loggerError.error("Invalid task ID");
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const existingTask = await taskModel.findOne({ _id: task });

    if (!existingTask) {
      loggerError.error("Task ID not found");
      return res.status(400).json({
        success: false,
        message: "Task ID not found",
      });
    }

    const existingSubtasks = await subtaskModel.find({
      task,
      scheduledDateTime,
    });

    // if (existingSubtasks.length > 0) {
    //   loggerError.error("A subtask is already assigned to the same task at the same scheduled date and time");
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "A subtask is already assigned to the same task at the same scheduled date and time",
    //   });
    // }

    // const newStartTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    // console.log(newStartTime);

  //convert string to date object
  const scheduled=new Date(scheduledDateTime);
  console.log(scheduled);
  //convert date to milisecond
  const scheduledinmilisecond=scheduled.getTime();
  console.log(scheduledinmilisecond);

  const scheduledDateTimeNumber = parseInt(scheduledinmilisecond);


    const create = new subtaskModel({
      subTaskTitle,
      subTaskDescription,
      task,
      scheduledDateTime:scheduledDateTimeNumber,
      estimatedTime,
      price,
      assignedUsers,
      createdBy: user_id, // Store the user ID of the creator in createdBy
    });

    const savedSubTask = await create.save();

//     // Now, populate the task field in the saved subtask
// const populatedSubTask = await savedSubTask.populate('task');



    const updateTask = await taskModel.findByIdAndUpdate(
      task,
      { $push: { subTasks: savedSubTask._id } },
      { new: true }
    );

    // Update user models of assigned users with the subtask ID
    const updateUsers = await userModel.updateMany(
      { _id: { $in: existingTask.assignedUsers } },
      { $push: { subtasks: savedSubTask._id } }
    );

    // Update admin model with the subtask ID
    const updateAdmin = await userModel.findByIdAndUpdate(
      user_id,
      { $push: { subtasks: savedSubTask._id } },
      { new: true }
    );

    if (!updateTask || !updateUsers || !updateAdmin) {
      loggerError.error("Failed to update the corresponding task, users, or admin with the subtask ID");
      return res.status(400).json({
        success: false,
        message:
          "Failed to update the corresponding task, users, or admin with the subtask ID",
      });
    }

    console.log(updateTask);

    loggerInfo.info("Subtask created successfully and assigned to the task");
    return res.status(200).json({
      success: true,
      message: "Subtask created successfully and assigned to the task",
      data: savedSubTask,
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

//get all subtask

 const getSubTask = async (req, res) => {
  try {
    const { user_id } = req.user;

    //find user

    const findUser = await userModel.findOne({ _id: user_id });

    if (!findUser) {
      loggerError.error("admin not found");
      return res.status(400).json({
        success: false,
        message: "admin not found",
      });
    }


    //if the data does not exist in cache fetch it from mongodb

    const subtask = await subtaskModel
      .find({ createdBy: user_id })
      .populate({
        path: "task",
        populate: {
          path: "assignedUsers",
        },
      })
      .populate({
        path: "task",
        populate: {
          path: "createdBy",
        },
      });
    if (!subtask || subtask.length == 0) {
      loggerError.error("sub task not found");
      return res.status(400).json({
        success: false,
        message: "sub task not found",
      });
    }


    loggerInfo.info("subtasks found successfully");
    return res.status(200).json({
      success: true,
      message: "subtasks found successfully",
      data: subtask,
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

//get subtask by subtask id
 const getSubTaskById = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;

    //find user

    const findUser = await userModel.findOne({ _id: user_id });

    if (!findUser) {
      loggerError.error("admin not found");
      return res.status(400).json({
        success: false,
        message: "admin not found",
      });
    }

 

    //if data does not exist in cache fetch it from mongodb

    // Check if taskId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      loggerError.error("Invalid sub task ID");
      return res.status(400).json({
        success: false,
        message: "Invalid sub task ID",
      });
    }

    //find subtask

    const findSubTask = await subtaskModel.findOne({ _id: id });

    if (!findSubTask) {
      loggerError.error("subtask id not found");
      return res.status(400).json({
        success: false,
        message: "subtask id not found",
      });
    }

    const foundSubTask = await subtaskModel
      .findOne({ _id: id, createdBy: user_id })
      .populate({
        path: "task",
        populate: {
          path: "assignedUsers",
        },
      })
      .populate({
        path: "task",
        populate: {
          path: "createdBy",
        },
      });

    if (!foundSubTask) {
      loggerError.error("not found sub task");
      return res.status(400).json({
        success: false,
        message: "not found sub task",
      });
    }

    //save data in cache for future use

    loggerInfo.info("found subtask successfully");
    return res.status(200).json({
      success: true,
      message: "found subtask successfully",
      data: foundSubTask,
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

//update subtask by subtask id
 const updateSubTask = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;
    const {
      subTaskTitle,
      subTaskDescription,
      task,
      scheduledDateTime,
      estimatedTime,
      price,
      assignedUsers
    } = req.body;

    //find user

    const findUser = await userModel.findOne({ _id: user_id });

    if (!findUser) {
      loggerError.error("admin not found");
      return res.status(400).json({
        success: false,
        message: "admin not found",
      });
    }

    // Check if taskId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      loggerError.error("Invalid sub task ID");
      return res.status(400).json({
        success: false,
        message: "Invalid sub task ID",
      });
    }

    // Check if taskId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(task)) {
      loggerError.error("Invalid task ID");
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    // Check if the sub task ID exists or not
    const existingSubTask = await subtaskModel.findOne({ _id: id });

    if (!existingSubTask) {
      loggerError.error("Sub Task ID not founds");
      return res.status(400).json({
        success: false,
        message: "Sub Task ID not founds",
      });
    }

    //check if the task ID exist or not

    const existingTask = await taskModel.findOne({ _id: task });

    if (!existingTask) {
      loggerError.error("Task Id not found");
      return res.status(400).json({
        success: false,
        message: "Task Id not found",
      });
    }

    //convert string to date object
  const scheduled=new Date(scheduledDateTime);
  console.log(scheduled);
  //convert date to milisecond
  const scheduledinmilisecond=scheduled.getTime();
  console.log(scheduledinmilisecond);

  const scheduledDateTimeNumber = parseInt(scheduledinmilisecond);

    const update = await subtaskModel.findByIdAndUpdate(
      id,
      {
        subTaskTitle,
        subTaskDescription,
        task,
        scheduledDateTime:scheduledDateTimeNumber,
        createdBy: user_id,
        estimatedTime,
        assignedUsers
      },
      { new: true }
    );

    if (!update) {
      loggerError.error("Subtask not found or not updated");
      return res.status(400).json({
        success: false,
        message: "Subtask not found or not updated",
      });
    }

    loggerInfo.info("Subtask updated successfully");
    return res.status(200).json({
      success: true,
      message: "Subtask updated successfully",
      data: update,
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


//delete subtask by subtask id
 const deleteSubTask = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;

    //find user

    const findUser = await userModel.findOne({ _id: user_id });

    if (!findUser) {
      loggerError.error("admin not found");
      return res.status(400).json({
        success: false,
        message: "admin not found",
      });
    }

    // Check if taskId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      loggerError.error("Invalid sub task ID");
      return res.status(400).json({
        success: false,
        message: "Invalid sub task ID",
      });
    }

    // Check if the subtask ID exists
    const existingSubTask = await subtaskModel.findById(id);

    if (!existingSubTask) {
      loggerError.error("Subtask ID not found");
      return res.status(400).json({
        success: false,
        message: "Subtask ID not found",
      });
    }
    console.log(existingSubTask);

    await userModel.updateMany(
      { tasks: existingSubTask.task },
      { $pull: { subtasks: id } }
    );
    // Remove subtask ID from task model
    const task = await taskModel.findOneAndUpdate(
      { subTasks: id },
      { $pull: { subTasks: id } },
      { new: true }
    );

    if (!task) {
      loggerError.error("Task not found or subtask ID not present in the task");
      return res.status(400).json({
        success: false,
        message: "Task not found or subtask ID not present in the task",
      });
    }

    // Delete the subtask
    const removeSubTask = await subtaskModel.findByIdAndDelete(id);

    if (!removeSubTask) {
      loggerError.error("Subtask not deleted");
      return res.status(400).json({
        success: false,
        message: "Subtask not deleted",
      });
    }

    loggerInfo.info("Subtask deleted successfully");

    return res.status(200).json({
      success: true,
      message: "Subtask deleted successfully",
      data: removeSubTask,
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


 const genaratePdfSubtask=async(req,res)=>{
  try {
    

    const {user_id}=req.user;
    const { id } = req.params;
    const userfind=await userModel.findById(user_id);

    if(!userfind){
      return res.status(400).json({
        success:false,
        message:"user not found"
      })
    }

    const findSubTask = await subtaskModel.findOne({ _id: id });

    if (!findSubTask) {
      loggerError.error("subtask id not found");
      return res.status(400).json({
        success: false,
        message: "subtask id not found",
      });
    }

    const foundTaskById = await subtaskModel
  .findOne({ _id: id, createdBy: user_id })
  .populate({
    path: "task",
    populate: { path: "assignedUsers" }, // Populate assignedUsers field in subtask
  });
      console.log(foundTaskById);
      // Create a new PDF document
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.font('Helvetica-Bold');
  doc.fontSize(20).text('Sub Task Report', { align: 'center' });
  doc.moveDown(2); // Add space after the heading

  doc.font('Helvetica');
  doc.fontSize(20);
  doc.text(`Title: ${foundTaskById.subTaskTitle}\n\n\n`);
  doc.text(`Description: ${foundTaskById.subTaskDescription}\n\n\n`);
  doc.text(`Estimated Time: ${foundTaskById.estimatedTime}\n\n\n`);
  doc.text(`Price: ${foundTaskById.price}\n\n`);
  
  // Include assigned user IDs
  if (foundTaskById.task.assignedUsers && foundTaskById.task.assignedUsers.length > 0) {
    doc.moveDown(); // Add space before assigned users
    doc.text('Assigned to:\n\n');
    for (const user of foundTaskById.task.assignedUsers) {
      doc.text(`- ${user._id}`);
    }
  }
  doc.end();
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"internal server error",
      error:error.message
    })
  }
}

module.exports = {
  createSubtask,
  getSubTask,
  getSubTaskById,
  updateSubTask,
  deleteSubTask,
  genaratePdfSubtask,
};