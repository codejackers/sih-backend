// Libraries
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");

const app = require("./app");

const PORT = process.env.PORT || 3000;

dotenv.config();

const server = http.createServer(app);

async function startServer() {
  // MongoDB connect
  await mongoose
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

  server.listen(PORT, () => {
    console.log(`Server Listening on port ${PORT}...`);
  });
}

startServer();
