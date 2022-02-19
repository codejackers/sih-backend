const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
  UID: { type: String, required: true },
  Uname: { type: String, required: true },
  UCity: { type: String, required: true },
});

module.exports = mongoose.model("UniversityInfo", collegeSchema);
