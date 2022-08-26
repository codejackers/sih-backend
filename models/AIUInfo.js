const mongoose = require("mongoose");

const aiuSchema = new mongoose.Schema({
  UID: {
    type: String,
    required: true,
  },
  Uname: {
    type: String,
    required: true,
    default: "",
  },
  Uemail: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("AIUInfo", aiuSchema);
