const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = Schema({
  username: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
