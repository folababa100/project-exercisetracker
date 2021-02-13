const mongoose = require("mongoose");

const { Schema } = mongoose;

const exerciseSchema = Schema({
  description: String,
  date: Date.now,
  duration: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
})

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
