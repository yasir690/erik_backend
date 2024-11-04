import mongoose from "mongoose";

const subtasksSchema = new mongoose.Schema({
  subTaskTitle: {
    type: String,
    required: true,
  },

  subTaskDescription: {
    type: String,
    required: true,
  },

  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tasks",
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  scheduledDateTime: {
    type: String,
    required: true,
  },
  assignedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  estimatedTime: {
    type: String,
  },
  price: {
    type: String,
  },
});

const subtaskModel = mongoose.model("subtasks", subtasksSchema);

export default subtaskModel;
