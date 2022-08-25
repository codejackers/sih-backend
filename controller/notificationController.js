const NotificationInfo = require("../models/NotificationInfo");
const UniversityInfo = require("../models/UniversityInfo");

const createNotification = async (req, res) => {
  try {
    const { UID, Title, Doc } = req.body;

    let college = await UniversityInfo.findOne({ UID });

    if (!college)
      return res.status(200).json({
        message: "The Entered UID is incorrect",
      });

    // create new notif
    const newNotification = new NotificationInfo({ Title, Doc });
    await newNotification.save();

    // add that notif in university
    let newArr = [];

    college._doc.Notifications.forEach((element) => {
      newArr.push(element.toString());
    });
    newArr.push(newNotification._id.toString());

    const universityUpdate = await UniversityInfo.updateOne(
      { UID },
      { $set: { Notifications: newArr } }
    );

    res.status(200).json({
      message: "Notification Created Successfully!!",
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};
const deleteNotification = async (req, res) => {
  try {
    const { UID, _id } = req.body;
    let college = await UniversityInfo.findOne({ UID });

    if (!college)
      return res.status(200).json({
        message: "The Entered UID is incorrect",
      });

    let udpatedObj = college.Notifications.filter(
      (item) => item.toString() !== _id
    );

    let newArr = [];

    udpatedObj.forEach((element) => {
      newArr.push(element.toString());
    });

    // delete from college model
    const universityUpdate = await UniversityInfo.updateOne(
      { UID },
      { $set: { Courses: newArr } }
    );

    // delete from notif model
    const notificationDelete = await NotificationInfo.deleteOne({ _id });

    res.status(200).json({
      message: `Notification Id ${_id} has been deleted from college successfully`,
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

module.exports = {
  createNotification,
  deleteNotification,
};
