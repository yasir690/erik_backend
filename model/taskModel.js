import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  assignedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],

  subTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subtasks",
    },
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },

  scheduledDateTime: {
    type: String,
    required: true,
  },

  estimatedTime: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
});

const taskModel = mongoose.model("tasks", taskSchema);

export default taskModel;
