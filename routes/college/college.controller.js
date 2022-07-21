const capitalizeString = require("capitalize-string");
const UniversityInfo = require("../../models/college.model");

const getAllColleges = async (req, res) => {
  try {
    let city = req.query.city;
    let collegename = req.query.collegename;

    if (collegename) {
      const collegeDetail = await UniversityInfo.find({
        Uname: { $regex: collegename },
      });

      return res.status(200).json(collegeDetail);
    }

    if (city) {
      city = capitalizeString(city);
      // console.log(city);
      const colleges = await UniversityInfo.find({
        UCity: city,
      });
      return res.status(200).json(colleges);
    }

    const colleges = await UniversityInfo.find({});
    return res.status(200).json(colleges);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getCollege = async (req, res) => {
  try {
    const id = req.params.id;
    const college = await UniversityInfo.findById(id);
    return res.status(200).json(college);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getAllColleges,
  getCollege,
};
