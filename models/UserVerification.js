const mongoose = require("mongoose");

const userverificationSchema = new mongoose.Schema({
  userId: { 
    type: String
  },
  uniquestring: { 
    type: String
  },
  createdAt: { 
    type: Date
  },
  expiresAt: { 
    type: Date
  }, 
});


module.exports = mongoose.model("UserVerification", userverificationSchema);
 
