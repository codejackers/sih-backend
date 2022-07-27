const express = require("express");
const cors = require("cors");
const collegeRouter = require("./routes/college/college.router");
const courseRouter = require("./routes/courses/course.router");

// Routers

const app = express();

app.use(cors());
app.use(express.json());
app.use(collegeRouter);
app.use(courseRouter);


app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
