const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
  UID: {
    type: String,
    required: true,
    unique: true,
  },
  Uname: {
    type: String,
    required: true,
    default: "",
  },
  UCity: {
    type: String,
    default: "",
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
  OTP: {
    type: String,
  },
  ShortDesc: {
    type: String,
    min: 60,
    default: "",
  },
  LongDesc: {
    type: String,
    min: 200,
    default: "",
  },
  Clglogo: {
    type: String,
    default: "",
  },
  Doc: {
    type: String,
    required: true,
  },
  Courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoursesInfo",
      default: "",
    },
  ],
  Prospectus: {
    type: String,
    default: "",
  },
  Gmap: {
    type: String,
    default: "",
  },
  Contact: {
    type: Number,
    default: "",
    min: 10,
  },
  Site: {
    type: String,
    default: "",
  },
  verified: {
    type: Boolean,
    default: "",
  },
  Slot: {
    type: String,
    default: "",
  },
});

collegeSchema.index({ name: "nameSearch" });

module.exports = mongoose.model("UniversityInfo", collegeSchema);
