import subtaskModel from "../model/subtaskModel.js";
import taskModel from "../model/taskModel.js";
import userModel from "../model/userModel.js";
import mongoose from "mongoose";
import moment from "moment/moment.js";
// import { Redis } from "ioredis";
import { loggerError, loggerInfo } from "../utils/log.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
// const redisClient = new Redis();
//create task

export const createTask = async (req, res) => {
  try {
    const { user_id } = req.user;
    const {
      title,
      description,
      assignedUsers,
      scheduledDateTime,
      estimatedTime,
      price,
    } = req.body;


    const findUser = await userModel.findOne({ _id: user_id });

    if (!findUser) {
      loggerError.error("admin not found");
      return res.status(400).json({
        success: false,
        message: "admin not found",
      });
    }

    if (assignedUsers.includes(user_id)) {
      loggerError.error("Admin cannot assign a task to himself");
      return res.status(400).json({
        success: false,
        message: "Admin cannot assign a task to himself",
      });
    }



    const existingTasks = await taskModel.find({
      assignedUsers: { $in: assignedUsers },
      scheduledDateTime: scheduledDateTime,
    });

    if (existingTasks.length > 0) {
      loggerError.error("User is already assigned to a task at the same time");
      return res.status(400).json({
        success: false,
        message: "User is already assigned to a task at the same time",
      });
    }

    // Check if assignedUsers is empty or not provided
    if (!assignedUsers || assignedUsers.length === 0) {
      loggerError.error("At least one user ID must be provided to create a task");
      return res.status(400).json({
        success: false,
        message: "At least one user ID must be provided to create a task",
      });
    }

    // Validate assignedUsers
    const validUsers = await userModel.find({ _id: { $in: assignedUsers } });

    if (validUsers.length !== assignedUsers.length) {
      loggerError.error("One or more invalid user IDs were provided");
      return res.status(400).json({
        success: false,
        message: "One or more invalid user IDs were provided",
      });
    }
 
    //convert string to date object
   const scheduled=new Date(scheduledDateTime);
   console.log(scheduled);
   //convert date to milisecond
   const scheduledinmilisecond=scheduled.getTime();
   console.log(scheduledinmilisecond);

   const scheduledDateTimeNumber = parseInt(scheduledinmilisecond);

// Create the task
    const createdTask = new taskModel({
      title,
      description,
      assignedUsers,
      createdBy: user_id,
      scheduledDateTime:scheduledDateTimeNumber, // Save in milliseconds
      estimatedTime, // Save in milliseconds
      price,
    });

    const saveTask = await createdTask.save();

    // Update user models of assigned users with the task ID
    const updateTasksInUsers = await userModel.updateMany(
      { _id: { $in: assignedUsers } },
      { $push: { tasks: saveTask._id } }
    );

    // Update admin model with the task ID
    const updateTaskInAdmin = await userModel.findByIdAndUpdate(
      user_id,
      { $push: { tasks: saveTask._id } },
      { new: true }
    );


    loggerInfo.info("Task created successfully and assigned to the user");
    return res.status(200).json({
      success: true,
      message: "Task created successfully and assigned to the user",
      data: saveTask,
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

//get task

export const getTask = async (req, res) => {
  try {
    const { user_id } = req.user;

    const userfind = await userModel.findOne({ _id: user_id });
    if (!userfind) {
      loggerError.error("admin not found");
      return res.status(400).json({
        success: false,
        message: "admin not found",
      });
    }

    // const redisKey = `tasks:foundTasks`;

    // console.log(redisKey);

    // Check if the data exists in cache
    // const cacheData = await redisClient.get(redisKey);

    // if (cacheData) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "Tasks found successfully",
    //     data: JSON.parse(cacheData),
    //   });
    // }

    // If data does not exist in cache, fetch it from MongoDB
    const foundTasks = await taskModel
      .find({ createdBy: user_id })
      .populate(["assignedUsers", "createdBy", "subTasks"]);

    if (!foundTasks || foundTasks.length === 0) {
      loggerError.error("Tasks not found");
      return res.status(404).json({
        success: false,
        message: "Tasks not found",
      });
    }


    // Save data in Redis for future use
    // await redisClient.setex(redisKey, 300, JSON.stringify(foundTasks));

    loggerInfo.info("Tasks found successfully");
    return res.status(200).json({
      success: true,
      message: "Tasks found successfully",
      data: foundTasks,
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


//get task by task id

export const getTaskById = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;

    const findUser = await userModel.findOne({ _id: user_id });



    if (!findUser) {
      loggerError.error("admin not found");
      return res.status(400).json({
        success: false,
        message: "admin not found",
      });
    }

    // Validate if user_id is a valid ObjectId

    if (!mongoose.Types.ObjectId.isValid(id)) {
      loggerError.error("Invalid task ID");
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    // const redisKey = `tasks:${id}`;

    //check if data exist in cache

    // const cacheData = await redisClient.get(redisKey);

    // if (cacheData) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "Task found successfully",
    //     data: JSON.parse(cacheData),
    //   });
    // }

    const findTask = await taskModel.findOne({ _id: id });

    if (!findTask) {
      loggerError.error("task id not found");
      return res.status(400).json({
        success: false,
        message: "task id not found",
      });
    }
    const foundTaskById = await taskModel
      .findOne({ _id: id, createdBy: user_id })
      .populate(["assignedUsers", "createdBy", "subTasks"]);

  

    //if data doest not exist in cache fetch from it mongodb

    // await redisClient.setex(redisKey, 300, JSON.stringify(foundTaskById));


    loggerInfo.info("Task found successfully");
    return res.status(200).json({
      success: true,
      message: "Task found successfully",
      data: foundTaskById,
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

//update task by task id

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.user;
    const {
      title,
      description,
      assignedUsers,
      scheduledDateTime,
      estimatedTime,
      price,
    } = req.body;

    // Validate if task is a valid ObjectId

    if (!mongoose.Types.ObjectId.isValid(id)) {

      loggerError.error("Invalid task ID");
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    // Validate if user is a valid ObjectId

    for (const userId of assignedUsers) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        loggerError.error("Invalid user ID");
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }
    }

    //find user

    const findUser = await userModel.findOne({ _id: user_id });

    if (!findUser) {
      loggerError.error("admin not found");
      return res.status(400).json({
        success: false,
        message: "admin not found",
      });
    }

    //check task found or not
    const findTask = await taskModel.findOne({ _id: id });
    if (!findTask || findTask.length === 0) {
      loggerError.error("Task ID not found");
      return res.status(400).json({
        success: false,
        message: "Task ID not found",
      });
    }
    // Check if assignedUsers is empty or not provided

    if (!assignedUsers || assignedUsers.length === 0) {
      loggerError.error("At least one user ID must be provided to create a task");
      return res.status(400).json({
        success: false,
        message: "At least one user ID must be provided to create a task",
      });
    }

    // Validate assignedUsers
    const validUsers = await userModel.find({ _id: { $in: assignedUsers } });

    if (validUsers.length !== assignedUsers.length) {
      loggerError.error("One or more invalid user IDs were provided");
      return res.status(400).json({
        success: false,
        message: "One or more invalid user IDs were provided",
      });
    }

    // Remove task ID from previous assigned users
    await userModel.updateMany({ tasks: id }, { $pull: { tasks: id } });



 //convert string to date object
 const scheduled=new Date(scheduledDateTime);
 console.log(scheduled);
 //convert date to milisecond
 const scheduledinmilisecond=scheduled.getTime();
 console.log(scheduledinmilisecond);
 console.log(parseInt(scheduledinmilisecond));
const scheduledinmilisecondnumber=parseInt(scheduledinmilisecond);


    const update = await taskModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        assignedUsers,

        scheduledDateTime: scheduledinmilisecondnumber,
        estimatedTime,
        price,
        createdBy: user_id,
      },
      {
        new: true,
      }
    );

    // Add the task ID to the assigned users in userModel
    await userModel.updateMany(
      { _id: { $in: assignedUsers } },
      { $push: { tasks: id } }
    );

    if (!update) {
      return res.status(400).json({
        success: false,
        message: "task not update",
      });
    }


    loggerInfo.info("task update successfully");
    return res.status(200).json({
      success: true,
      message: "task update successfully",
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

//delete task by task id

export const deleteTask = async (req, res) => {
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

    // Validate if user_id is a valid ObjectId

    if (!mongoose.Types.ObjectId.isValid(id)) {
      loggerError.error("Invalid task ID");
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    // const task = await taskModel.findOne({ _id: id, createdBy: user_id });

    const task = await taskModel.findById(id);

    if (!task) {
      loggerError.error("Task ID not found");
      return res.status(400).json({
        success: false,
        message: "Task ID not found",
      });
    }

    // Delete associated subtasks
    await subtaskModel.deleteMany({ _id: { $in: task.subTasks } });

    // Delete task
    await taskModel.findByIdAndDelete(id);

    // Remove task ID from user model
    await userModel.updateMany(
      { _id: { $in: task.assignedUsers } },
      { $pull: { tasks: id } }
    );
    // Remove task ID from user model
    // await userModel.updateMany(
    //   { _id: { $in: task.assignedUsers } },
    //   { $pull: { subtasks: id } }
    // );

    // Remove sub task ID associeted with task from user model
    await userModel.updateMany(
      { _id: { $in: task.assignedUsers } },
      { $pull: { tasks: id, subtasks: { $in: task.subTasks } } }
    );

    loggerInfo.info("Task deleted successfully");
    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
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

//get task by task date

export const getTaskByDate = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { targetDate } = req.query;

    console.log(targetDate);
    const userfind = await userModel.findOne({ _id: user_id });
    if (!userfind) {
      loggerError.error("admin not found");
      return res.status(400).json({
        success: false,
        message: "admin not found",
      });
    }

    // const redisKey = `tasks:${targetDate}`;

    //check if data exist in cache

    // const cacheData = await redisClient.get(redisKey);

    // if (cacheData) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "Task found successfully",
    //     data: JSON.parse(cacheData),
    //   });
    // }

   // Convert targetDate to milliseconds for the start and end of the day
   const startDate = new Date(targetDate);
   startDate.setHours(0, 0, 0, 0);
   const endDate = new Date(targetDate);
   endDate.setHours(23, 59, 59, 999);

   const startMillis = startDate.getTime();
   const endMillis = endDate.getTime();

    const gettaskbydate = await taskModel
      .find({
        scheduledDateTime: {
          $gte: startMillis, 
          $lt: endMillis,  
        },
      })
      .populate("assignedUsers subTasks createdBy");

    if (gettaskbydate.length === 0) {
      loggerError.error("No tasks found for the specified date");
      return res.status(404).json({
        success: false,
        message: "No tasks found for the specified date",
      });
    }


    
    //if data doest not exist in cache fetch from it mongodb

    // await redisClient.setex(redisKey, 300, JSON.stringify(gettaskbydate));

    loggerInfo.info("Tasks found successfully");
    return res.status(200).json({
      success: true,
      message: "Tasks found successfully",
      data: gettaskbydate,
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

export const genaratePdfTask=async(req,res)=>{
  try {

    const {user_id}=req.user;
    const { id } = req.params;
    const user=await userModel.findById(user_id);

    if(!user){
      return res.status(400).json({
        success:false,
        message:"user not found"
      })
    }

    const findTask = await taskModel.findOne({ _id: id });

    if (!findTask) {
      loggerError.error("task id not found");
      return res.status(400).json({
        success: false,
        message: "task id not found",
      });
    }
 
 
    const foundTaskById = await taskModel
    .findOne({ _id: id, createdBy: user_id })
    .populate(["assignedUsers"]);


    console.log(foundTaskById);
     // Create a new PDF document


     
  // Create a new PDF document
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.font('Helvetica-Bold');
  doc.fontSize(20).text('Task Report', { align: 'center' });
  doc.moveDown(2); // Add space after the heading

  doc.font('Helvetica');
  doc.fontSize(20);
  doc.text(`Title: ${foundTaskById.title}\n\n\n`);
  doc.text(`Description: ${foundTaskById.description}\n\n\n`);
  doc.text(`Estimated Time: ${foundTaskById.estimatedTime}\n\n\n`);
  doc.text(`Price: ${foundTaskById.price}\n\n`);
  
  // Include assigned user IDs
  if (foundTaskById.assignedUsers && foundTaskById.assignedUsers.length > 0) {
    doc.moveDown(); // Add space before assigned users
    doc.text('Assigned to:\n\n');
    for (const user of foundTaskById.assignedUsers) {
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