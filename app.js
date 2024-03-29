const express = require("express");
const cors = require("cors");

// Routers
const collegeRouter = require("./routes/collegeRoute");
const courseRouter = require("./routes/courseRoute");
const queryRouter = require("./routes/queryRoute");
const aiuRouter = require("./routes/aiuRoute");
const govtRouter = require("./routes/govtRoute");
const notifcationRouter = require("./routes/notificationRoute");

const app = express();

app.use(cors());
app.use(express.json());
app.use(collegeRouter);
app.use(courseRouter);
app.use(queryRouter);
app.use(govtRouter);
app.use(aiuRouter);
app.use(notifcationRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
