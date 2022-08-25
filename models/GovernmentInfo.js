const mongoose = require("mongoose");

const govtSchema = new mongoose.Schema({
  UID: {
    type: String,
  },
  VerificationToken: {
    type: String,
  },
  Md5SumHash: {
    type: String,
  },
});

module.exports = mongoose.model("GovtInfo", govtSchema);
