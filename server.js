// Libraries
const express = require("express");
// const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");

const app = require("./app");

const PORT = process.env.PORT || 3000;

dotenv.config();

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.error(err);
  });

const server = http.createServer(app);

async function startServer() {
  server.listen(PORT, () => {
    console.log(`Server Listening on port ${PORT}...`);
  });
}

startServer();
