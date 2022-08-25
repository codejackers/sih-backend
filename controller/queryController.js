const QueryInfo = require("../models/QueryInfo");
const { transporter } = require("../utils/lib");
const { default: fetch } = require("node-fetch");

const createQuery = async (req, res) => {
  try {
    const {
      UserContact,
      Message,
      UserName,
      CollegeName,
      CollegeContact,
      CollegeWebsite,
      Doc,
    } = req.body;

    const collegeMailOption = {
      from: "codejackers@outlook.com",
      subject: "Your college is reported as suspicious",
      to: CollegeContact,
      html: `

    <h1>Suspicious College details: </h1>
    <ul>
        <li>College Name: ${CollegeName} </li>
        <li>College Contact: ${CollegeContact} </li>
        ${CollegeWebsite && "<li>College Website: " + CollegeWebsite + " </li>"}
        ${Doc && "<li>Related Docs: " + Doc + " </li>"}
    </ul>

    <h1>User details: </h1>
    <ul>
        <li>User Name: ${UserName} </li>
        <li>User Contact: ${UserContact} </li>
        ${Message && "<li>User Query Message: ${Message} </li>"}
    </ul>`,
    };

    const queryMailOption = {
      from: "codejackers@outlook.com",
      subject: "You've reported a college",
      to: UserContact,
      html: `

      <h1>Suspicious College details: </h1>
      <ul>
          <li>College Name: ${CollegeName} </li>
          <li>College Contact: ${CollegeContact} </li>
          ${
            CollegeWebsite &&
            "<li>College Website: " + CollegeWebsite + " </li>"
          }
          ${Doc && "<li>Related Docs: " + Doc + " </li>"}
      </ul>

      <h1>User details: </h1>
      <ul>
          <li>User Name: ${UserName} </li>
          <li>User Contact: ${UserContact} </li>
          ${Message && "<li>User Query Message: ${Message} </li>"}
      </ul>`,
    };

    const newQuery = new QueryInfo({
      UserContact,
      Message,
      UserName,
      CollegeName,
      CollegeContact,
      CollegeWebsite,
      Doc,
    });
    await newQuery.save();

    if (CollegeContact) {
      await transporter.sendMail(collegeMailOption);
    }
    await transporter.sendMail(queryMailOption);

    return res
      .status(200)
      .json({ status: "Success", message: "Your Query has been submitted." });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: `Server error ${error}`,
    });
  }
};

const captchaVerify = async (req, res) => {
  if (!req.body.captcha)
    return res.json({ success: false, msg: "Please select captcha" });

  // Secret key
  const secretKey = "6LfSr6ghAAAAAHydd0hPC6w6LwTatQ3HGL-9LssD";

  // Verify URL
  const query = JSON.stringify({
    secret: secretKey,
    response: req.body.captcha,
    remoteip: req.connection.remoteAddress,
  });
  // console.log(query);

  const verifyURL = `https://google.com/recaptcha/api/siteverify`;

  const bodyValue = `secret=${secretKey}&response=${req.body.captcha}`;

  // Make a request to verifyURL
  const body = await fetch(verifyURL, {
    method: "post",
    body: bodyValue,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  }).then((res) => res.json());

  // console.log(body);
  // If not successful
  if (body.success !== undefined && !body.success)
    return res.json({ success: false, msg: "Failed captcha verification" });

  // If successful
  return res.json({ success: true, msg: "Captcha passed" });
};

module.exports = { createQuery, captchaVerify };
