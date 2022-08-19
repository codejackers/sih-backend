// Libraries
const mongoose = require("mongoose");
const http = require("http");

const app = require("./app");

const PORT = process.env.PORT || 3000;

require("dotenv").config();

const server = http.createServer(app);

async function startServer() {
  // MongoDB connect
  await mongoose.connect(process.env.MONGO_URL);

  console.log("Connected to MongoDB!");

  server.listen(PORT, () => {
    console.log(`Server Listening on port ${PORT}...`);
  });
}

startServer();
