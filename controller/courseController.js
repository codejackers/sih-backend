const CoursesInfo = require("../models/CoursesInfo");
const UniversityInfo = require("../models/UniversityInfo");

const createCourse = async (req, res) => {
  try {
    const { UID, CID, CourseName, CourseDesc, CourseIntakeCap, AdmissionDOC } =
      req.body;

    let college = await UniversityInfo.findOne({ UID });

    if (!college)
      return res.status(200).json({
        message: "The Entered UID is incorrect",
      });

    // create new course
    const newCourse = new CoursesInfo({
      CID: CID,
      CourseName: CourseName,
      CourseDesc: CourseDesc,
      CourseIntakeCap: CourseIntakeCap,
      AdmissionDOC: AdmissionDOC,
    });
    await newCourse.save();

    // add that course in university
    let newArr = [];

    college._doc.Courses.forEach((element) => {
      newArr.push(element.toString());
    });
    newArr.push(newCourse._id.toString());

    const universityUpdate = await UniversityInfo.updateOne(
      { UID },
      { $set: { Courses: newArr } }
    );

    res.status(200).json({
      message: "Course Created Successfully!!",
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { UID, CID } = req.body;
    let college = await UniversityInfo.findOne({ UID });

    if (!college)
      return res.status(200).json({
        message: "The Entered UID is incorrect",
      });

    let udpatedObj = college.Courses.filter((item) => item.toString() !== CID);

    let newArr = [];

    udpatedObj.forEach((element) => {
      newArr.push(element.toString());
    });

    // delete from college model
    const universityUpdate = await UniversityInfo.updateOne(
      { UID },
      { $set: { Courses: newArr } }
    );

    // delete from course model
    const courseDelete = await CoursesInfo.deleteOne({ CID });

    res.status(200).json({
      message: `Course Id ${CID} has been deleted from college successfully`,
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

module.exports = {
  createCourse,
  deleteCourse,
};
