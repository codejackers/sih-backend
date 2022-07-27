const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
  UID: { type: String, required: true },
  Uname: { type: String, required: false },
  UCity: { type: String, required: false },
  Uemail: { type: String, required: true },
  Pass: { type: String, required: true , min:8 },
  Doc: { type: String, required: true }
});

module.exports = mongoose.model("UniversityInfo", collegeSchema);
 
