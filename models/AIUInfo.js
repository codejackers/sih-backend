const mongoose = require("mongoose");

const aiuSchema = new mongoose.Schema({
  Uname: {
    type: String,
    default: "",
  },
  Address: {
    type: String,
    default: "",
  },
  Verified: {
    type: Boolean,
  },
  Fake: {
    type: Boolean,
  },
});

module.exports = mongoose.model("AIUInfo", aiuSchema);
