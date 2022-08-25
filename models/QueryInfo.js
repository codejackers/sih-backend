const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
  UserContact: {
    type: String,
    default: "",
  },
  Message: {
    type: String,
    min: 200,
    default: "",
  },
  UserName: {
    type: String,
    required: true,
    default: "",
  },
  CollegeName: {
    type: String,
    sparse: true,
    required: true,
  },
  CollegeContact: {
    type: String,
    default: "",
    sparse: true,
  },
  CollegeWebsite: {
    type: String,
    default: "",
  },
  Doc: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("QueryInfo", querySchema);
