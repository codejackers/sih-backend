const capitalizeString = require("capitalize-string");
const CoursesInfo = require("../models/CoursesInfo");

const getAllCourses = async (req, res) => {
  try {
    let name = req.query.name;

    if (name) {
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
    const id = req.params.id;
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

  try {
    const { CID, CourseName, CourseDesc, CourseIntakeCap, AdmissionDOC } =
      req.body;

    let course = await CoursesInfo.findOne({ CourseName: req.body.CourseName });
    if (course) return res.status(200).send("That course already exisits!");

    const newCourse = new CoursesInfo({
      CID: CID,
      CourseName: CourseName,
      CourseDesc: CourseDesc,
      CourseIntakeCap: CourseIntakeCap,
      AdmissionDOC: AdmissionDOC,
    });
    await newCourse.save();

    res.status(200).json({
      message: "Course Created Successfully!!",
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

const updateCourse = async (req, res) => {
  const { CID, CourseName } = req.body;

  try {
    let CourseNameindb = await CoursesInfo.findOne({ CourseName });

    if (!CourseNameindb)
      return res
        .status(200)
        .json({ message: "Entered course name is incorrect" });

    const courseUpdate = await CoursesInfo.updateOne(
      { CourseName },
      { $set: req.body }
    );

    res.status(200).json({
      message: "Course Updated Successfully!!",
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

const deleteCourse = async (req, res) => {
  const { CID } = req.body;

  try {
    let uidindb = await CoursesInfo.findOne({ CID });

    if (!uidindb)
      return res.status(200).json({
        message: "The Entered CID is incorrect",
      });

    const courseDelete = await CoursesInfo.deleteOne({ CID });

    res.status(200).json({
      message: "Course Deleted Successfully",
      deletedCourse: uidindb,
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

module.exports = {
  getAllCourses,
  getCourse,
  updateCourse,
  createCourse,
  deleteCourse,
};
