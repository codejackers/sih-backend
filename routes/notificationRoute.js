const express = require("express");

const {
  createNotification,
  deleteNotification,
} = require("../controller/notificationController");

const notifcationRouter = express.Router();

notifcationRouter.post("/add/notification", createNotification);
notifcationRouter.delete("/delete/notification", deleteNotification);

module.exports = notifcationRouter;
