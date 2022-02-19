const UniversityInfo = require("../../models/college.model");

const getAllColleges = async (req, res) => {
  try {
    const colleges = await UniversityInfo.find({});
    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getAllColleges,
};
