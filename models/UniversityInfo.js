const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
  UID: {
    type: String,
    required: true,
    unique: true,
  },
  Uname: {
    type: String,
    required: false,
  },
  UCity: {
    type: String,
    required: false,
  },
  Uemail: {
    type: String,
    required: true,
  },
  Pass: {
    type: String,
    required: true,
    min: 8,
  },
  ShortDesc: {
    type: String,
    min: 60,
  },
  LongDesc: {
    type: String,
    min: 200,
  },
  Clglogo: {
    type: String,
  },
  Doc: {
    type: String,
    required: true,
  },
  Prospectus: {
    type: String,
  },
  Gmap: {
    type: String,
  },
  Contact: {
    type: Number,
  },
  Site: {
    type: String,
  },
  verified: {
    type: Boolean,
  },
  Slot: {
    type: String,
  },
});

collegeSchema.index({ name: "nameSearch" });

module.exports = mongoose.model("UniversityInfo", collegeSchema);
