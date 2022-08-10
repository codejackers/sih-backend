const capitalizeString = require("capitalize-string");
const CoursesInfo = require("../../models/course.model");

const getAllCourses = async (req, res) => {
  try {
      let name = req.query.name;
      if (name)
      {
        name = capitalizeString(name);
        const courses = await CoursesInfo.find({
          CID: name,
        });
        return res.status(200).json(courses);
      }
      const courses = await CoursesInfo.find({});
      return res.status(200).json(courses);

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getCourse = async (req, res) => {
  try {
    const id = req.params.id; // ask
    const course = await CoursesInfo.findById(id);
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({
      message: "Server error not responding",
    });
  }
};

const createCourse = async (req, res) => {
  console.log(req.body);
  const {CID ,CourseName , CourseDesc , CourseIntakeCap , AdmissionDOC } = req.body;
  let course = await CoursesInfo.findOne({ CourseName: req.body.CourseName });
  if (course) {
    return res.status(200).send("That course already exisits!");
  }
  else{
    const newCourse = new CoursesInfo({
      CID: CID,
      CourseName: CourseName,
      CourseDesc: CourseDesc,
      CourseIntakeCap: CourseIntakeCap,
      AdmissionDOC: AdmissionDOC,
    });
    newCourse
      .save()
      .then(() => {
        console.log(CourseName);
        res.status(200).json({
          message: "Course Created Successfully!!"
        });
      })
      .catch((error) => {
        res.json({
          status: "FAILED",
          message: "An error occured while creating course",
        });
      });
  }
}
const updateCourse = async (req, res) => {
  const { CID , CourseName , CourseDesc , CourseIntakeCap , AdmissionDOC   } = req.body;
  // const changesobj = {CID , CourseName , CourseDesc , CourseIntakeCap , AdmissionDOC };
  let CourseNameindb = await CoursesInfo.findOne({ CourseName });
  if(CourseNameindb!=null)
  {
  const courseUpdate = await CoursesInfo.updateOne({ CourseName }, {$set:req.body} )
  res.status(200).json({
    message: "Course Updated Successfully!!"
  })
  }
  else{
    res.status(200).json({
      message: "The Entered CourseName is incorrect"
    })
  }
}


module.exports = {
  getAllCourses,
  getCourse,
  updateCourse,
  createCourse
};
