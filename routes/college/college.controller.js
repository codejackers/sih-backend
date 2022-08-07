const capitalizeString = require("capitalize-string");
const UniversityInfo = require("../../models/college.model");
const bcrypt = require("bcrypt");

const getAllColleges = async (req, res) => {
  try {
    let city = req.query.city;
    let collegename = req.query.collegename;

    if (collegename)
    {
      const collegesname = await UniversityInfo.find(
      {
        Uname: { $regex: collegename },
      });
      return res.status(200).json(collegesname);
    }

    if (city) {
      city = capitalizeString(city);
      // console.log(city);
      const colleges = await UniversityInfo.find({
        UCity: city,
      });
      return res.status(200).json(colleges);
    } else {
      const colleges = await UniversityInfo.find({});
      return res.status(200).json(colleges);
    }
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

const registerCollege = async(req , res) => {
      try {
        console.log(req.body);
        const { UID , DOC , Uemail , Pass } = req.body;
        // hashing the password
        const salt = await bcrypt.genSalt(10); 
        const hashpassword = await bcrypt.hash(Pass , salt);
        
        // verifying university 
        // govt official email + Uemail send zoom link



         // Check if this user already exisits
         let user = await UniversityInfo.findOne({ Uemail: req.body.Uemail });
         if (user) {
          return res.status(400).send('That user already exisits!');
         }
         else {

         
        // create new university
        const newUni = new UniversityInfo({
          UID: UID,
          Doc: DOC,
          Uemail: Uemail,
          Pass: Pass
        })

        const Uni = await newUni.save()
        return res.status(200).json(Uni);  
         }
        
      } catch (error) {
        console.log(error);
      }
    
    }    

module.exports = {
  getAllColleges,
  getCollege,
  registerCollege
};
