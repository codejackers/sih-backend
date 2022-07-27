const capitalizeString = require("capitalize-string");
const UniversityInfo = require("../../models/college.model");
const bcrypt = require("bcrypt");

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

<<<<<<< HEAD
const registerCollege = async(req , res) => {
      try {
        console.log(req.body);
        const { UID , DOC , Uemail , Pass } = req.body;
        // hashing the password
        const salt = await bcrypt.genSalt(10); 
        const hashpassword = await bcrypt.hash(Pass , salt);
        
        // verifying university 
        // govt official email + Uemail send zoom link




        // create new university
        const newUni = new UniversityInfo({
          UID: UID,
          Doc: DOC,
          Uemail: Uemail,
          Pass: Pass
        })

        const Uni = await newUni.save()
        return res.status(200).json(Uni);  
        
      } catch (error) {
        console.log(error);
      }
}

=======
>>>>>>> 8e3f8823a5124938e3514170479f48dcd19d8eab
module.exports = {
  getAllColleges,
  getCollege,
  registerCollege
};
