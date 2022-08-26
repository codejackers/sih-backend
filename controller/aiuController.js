const AIUInfo = require("../models/AIUInfo");

const createCollege = async (req, res) => {
  try {
    // details
    // console.log(req.body);
    const { UID, Uname, Uemail } = req.body;

    // save() return success
    const newUni = new AIUInfo({
      UID,
      Uname,
      Uemail,
    });
    await newUni.save();

    return res.status(200).json({ message: "College Registered" });
  } catch (error) {
    return res.status(400).json({ status: "Failed", error: error });
  }
};

module.exports = { createCollege };
