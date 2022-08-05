// Libraries
const express = require("express");
// const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const nodemailer = require('nodemailer');
const route = express.Router();

const app = require("./app");

const PORT = process.env.PORT || 3000;

// app.use('/', route); // for mail sending



dotenv.config();


const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  secureConnection: false,
  port: 587,
  auth: {
    user: "codejackers@outlook.com",
    pass: "we@recoders#"
  },
  tls: {
    ciphers: 'SSLv3'
  }
});
var maillist = ['Harshc252@gmail.com', 'abhishekmorla87@gmail.com', 'vs361017@gmail.com', 'tymsai6076@gmail.com', 'dpdurg123@gmail.com', 'divyapawar.sstc@gmail.com', 'firewallmorlaabi@gmail.com'];

route.post('/text-mail', (req, res) => {
  const { to, subject, text } = req.body;
  const mailData = {
    from: 'codejackers@outlook.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!',
    html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer<br/>',
    to: 'abhishekmorla87@gmail.com'
  
  };

  transporter.sendMail(mailData, (error, info) => {
    if (error) {
      return console.log(error);
    }
    res.status(200).send({ message: "Mail send", message_id: info.messageId });
  });
});



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
