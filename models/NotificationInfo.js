const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  Title: {
    type: String,
    required: true,
  },
  Doc: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("NotificationInfo", notificationSchema);
