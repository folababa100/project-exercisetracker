const mongoose = require("mongoose");

const { Schema } = mongoose;

const exerciseSchema = new Schema(
  {
    description: String,
    date: {
      type: Date,
      default: Date.now,
    },
    duration: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { versionKey: false }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
