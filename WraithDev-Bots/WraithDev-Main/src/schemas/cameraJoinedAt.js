const { Schema, model } = require("mongoose");

const schema = Schema({
  userID: String,
  date: Number,
});

module.exports = model("cameraJoinedAt", schema);