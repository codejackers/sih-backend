const mongoose = require("mongoose");

const coursesSchema = new mongoose.Schema({
  CID: { type: String, required: true },
});

module.exports = mongoose.model("CoursesInfo", coursesSchema);
