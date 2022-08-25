const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
  UID: {
    type: String,
    required: true,
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
  Logo: {
    type: String,
    default: "",
  },
  Doc: {
    type: String,
  },
  Courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoursesInfo",
      default: "",
    },
  ],
  Notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotificationInfo",
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
  ReportCount: {
    type: Number,
    default: 0,
  },
});

collegeSchema.index({ name: "nameSearch" });

module.exports = mongoose.model("UniversityInfo", collegeSchema);
