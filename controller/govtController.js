const GovernmentInfo = require("../models/GovernmentInfo");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const createData = async (req, res) => {
  try {
    const { UID } = req.body;

    const token = jwt.sign(
      {
        data: uuidv4(),
      },
      UID
    );

    // create new VerificationToken
    const newGovt = new GovernmentInfo({
      UID: UID,
      VerificationToken: token,
    });

    await newGovt.save();

    res.status(200).json({
      message: `Saved with uid: ${UID}, token: ${token} saved`,
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

const getToken = async (req, res) => {
  try {
    const { UID } = req.body;
    const dataInDB = await GovernmentInfo.findOne({ UID });
    console.log(dataInDB);
    return res
      .status(200)
      .json({
        VerificationToken: dataInDB.VerificationToken,
        UID: dataInDB.UID,
      });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

module.exports = {
  createData,
  getToken,
};
