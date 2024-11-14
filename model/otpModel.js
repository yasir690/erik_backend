const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    otpKey: {
      type: String,
      required: true,
    },
    otpUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      index: { expires: "1h" }, // TTL index that expires after 1 hour
    },
  },
  {
    timestamps: true,
  }
);

const otpModel = mongoose.model("otp", otpSchema);

module.exports=otpModel;