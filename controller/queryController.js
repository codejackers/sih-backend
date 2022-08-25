const QueryInfo = require("../models/QueryInfo");
const { transporter } = require("../utils/lib");

const createQuery = async (req, res) => {
  try {
    const {
      UserContact,
      Message,
      UserName,
      CollegeName,
      CollegeContact,
      CollegeWebsite,
      Photo,
    } = req.body;

    const queryMailOption = {
      from: "codejackers@outlook.com",
      subject: "Suspicious college report",
      to: "vs361017@gmail.com", // govt official
      html: `

    <h1>Suspicious College details: </h1>
    <ul>
        <li>College Name: ${CollegeName} </li>
        <li>College Contact: ${CollegeContact} </li>
        ${CollegeWebsite && "<li>College Website: ${CollegeWebsite} </li>"}
        ${CollegePhotos && "<li>Related Photos: ${Photo} </li>"}
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
      Photo,
    });
    await newQuery.save();
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

module.exports = { createQuery };
