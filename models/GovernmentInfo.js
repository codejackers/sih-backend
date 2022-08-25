const mongoose = require("mongoose");

const govtSchema = new mongoose.Schema({
  UID: {
    type: String,
    required: true,
    unique: true,
  },
  VerificationToken: {
    type: String,
  },
});

module.exports = mongoose.model("GovtInfo", govtSchema);
