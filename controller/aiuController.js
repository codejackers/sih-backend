const fs = require("fs");
const AIUInfo = require("../models/AIUInfo");
var path = require("path");

const createCollege = async (req, res) => {
  try {
    // details
    // const { Uname, Address } = req.body;

    const resultBuffer = await fs.readFileSync(
      path.join(__dirname, "result.txt")
    );

    var textFile = resultBuffer.toString();

    // console.log(textFile);

    const data = textFile.split("\r\n");
    // console.log(data);

    for (var i = 0; i < 100; i++) {
      let singleString = data[i].trim().replaceAll('"', "").split(",");

      let newObj = {
        Uname: singleString[0],
        Address: singleString.slice(1, singleString?.length).join().trim(),
        Verified: i % 2 ? true : false,
        Fake: i % 2 ? true : false,
      };

      // save() return success
      const newUni = new AIUInfo(newObj);
      await newUni.save();
    }

    return res.status(200).json({ message: "Colleges Registered" });
  } catch (error) {
    return res.status(400).json({ status: "Failed", error: error });
  }
};

module.exports = { createCollege };
