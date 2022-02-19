const express = require("express");
const cors = require("cors");
const collegeRouter = require("./routes/college/college.router");

// Routers

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
app.use(collegeRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
