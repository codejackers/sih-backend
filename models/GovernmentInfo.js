const mongoose = require("mongoose");

const govtSchema = new mongoose.Schema({
  UID: {
    type: String,
    required: true,
    unique: true,
  },
  VerificationToken: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("GovtInfo", govtSchema);
