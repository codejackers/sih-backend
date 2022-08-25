const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
  UserContact: {
    type: String,
    required: true,
  },
  Message: {
    type: String,
    min: 200,
  },
  UserName: {
    type: String,
    required: true,
    default: "",
  },
  CollegeName: {
    type: String,
    required: true,
  },
  CollegeContact: {
    type: String,
  },
  CollegeWebsite: {
    type: String,
  },
  Doc: {
    type: String,
  },
});

module.exports = mongoose.model("QueryInfo", querySchema);
