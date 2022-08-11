const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

dotenv.config();

//transpoter
exports.transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

// get zoom link
exports.getZoomLink = async (req, res) => {
  const payload = {
    iss: process.env.ZOOMAPI_KEY, //your zoom API KEY
    exp: new Date().getTime() + 21600000,
  };

  const token = jwt.sign(payload, process.env.ZOOMAPI_SECRET); //your zoom API SECRET HERE

  // console.log(token);
  email = "codejackers@outlook.com"; // your zoom developer email account

  const body = {
    topic: "Registration meet for university", //meeting title
    type: 1,
    settings: {
      host_video: "true",
      participant_video: "true",
    },
  };

  const response = await fetch(
    `https://api.zoom.us/v2/users/${email}/meetings`,
    {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "User-Agent": "Zoom-api-Jwt-Request",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );
  const data = await response.json();
  // console.log(data);
  return data;
};
