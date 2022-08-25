const GovernmentInfo = require("../models/GovernmentInfo");

const verify = async (req, res) => {
  try {
    const { UID, VerificationToken } = req.body;
    // create new VerificationToken
    const newGovt = new GovernmentInfo({
      UID: UID,
      VerificationToken: VerificationToken,
    });
    await newGovt.save();
    res.status(200).json({
      message: `${UID} ${VerificationToken}`,
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

module.exports = {
  verify,
};
