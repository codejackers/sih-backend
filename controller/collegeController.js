// models
const UniversityInfo = require("../models/UniversityInfo");
const CoursesInfo = require("../models/CoursesInfo");
const UserVerification = require("../models/UserVerification");

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid"); // for unique string
const capitalizeString = require("capitalize-string");
const { transporter, getZoomLink } = require("../utils/lib");
const { default: fetch } = require("node-fetch");

const getAllColleges = async (req, res) => {
  try {
    let city = req.query.city;
    let collegename = req.query.collegename;

    if (collegename) {
      const collegesname = await UniversityInfo.find({
        Uname: { $regex: collegename, $options: "i" },
      });
      return res.status(200).json(collegesname);
    }

    if (city) {
      city = capitalizeString(city);
      const colleges = await UniversityInfo.find({
        UCity: { $regex: city, $options: "i" },
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
    const college = await UniversityInfo.findById(id)
      .populate("Courses")
      .populate("Notifications");

    return res.status(200).json({ college });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
};

const registerCollege = async (req, res) => {
  try {
    // details
    // console.log(req.body);
    const { UID, Uname, DOC, Uemail, Pass, VerificationToken } = req.body;

    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(Pass, salt);

    // Check if this uni already exisits
    let college = await UniversityInfo.findOne({ UID: req.body.UID });
    if (college)
      return res.status(200).send({ message: "You are already registered" });

    // Send /gov/verify/token -> token / uid

    const body = { UID: UID };
    const getTokenFromGov = await fetch(`http://localhost:3001/govt/getToken`, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const tokenData = await getTokenFromGov.json();
    const { UID: uidFromGov, VerificationToken: tokenFromGov } = tokenData;

    // req.token + req.uid === token / uid
    if (uidFromGov !== UID && tokenFromGov !== VerificationToken) {
      // return failed, token not verified
      return res.status(403).json({
        status: "failed",
        message: "Your token is not valid",
      });
    }

    // save() return success
    const newUni = new UniversityInfo({
      UID,
      Uname,
      DOC,
      Uemail,
      Pass: hashpassword,
      VerificationToken,
      verified: true,
    });
    await newUni.save();

    return res.status(200).json({ message: "College Registered" });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

const loginCollege = async (req, res) => {
  try {
    const { Uemail, Pass } = req.body;

    console.log(Uemail);
    // check if user exists
    let user = await UniversityInfo.findOne({ Uemail: Uemail });

    if (!user)
      return res.status(200).json({ message: "You are not registered" });
    if (user && !user.verified)
      return res.status(200).json({ message: "You are not verified yet" });

    await bcrypt.compare(Pass, user.Pass).then((isMatch) => {
      console.log(isMatch);

      if (!isMatch) {
        res.status(401).json({ message: "Password is incorrect" });
      } else {
        console.log("password matches");

        let { Pass, verified, OTP, ...userData } = user._doc;

        return res
          .status(200)
          .json({ message: "Login Successful", data: userData });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const updatePassword = async (req, res) => {
  const { Uemail, Pass } = req.body;

  try {
    let user = await UniversityInfo.findOne({ Uemail: Uemail });
    if (!user)
      return res.status(400).json({ message: "You are not registered" });
    if (user && !user.verified)
      return res.status(400).json({ message: "You are not verified yet" });

    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(Pass, salt);

    await UniversityInfo.findOneAndUpdate(
      { Uemail: Uemail },
      { Pass: hashpassword }
    );

    return res.status(200).json({
      message:
        "Your password has been updated , you can login now with new password",
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

const sendOtp = async (req, res) => {
  const { Uemail } = req.body;

  try {
    let college = await UniversityInfo.findOne({ Uemail: Uemail });
    if (!college)
      return res.status(400).json({ message: "You are not registered" });
    if (college && !college.verified)
      return res.status(400).json({ message: "You are not verified yet" });

    const OTP = uuidv4().slice(0, 4);
    college.OTP = OTP;
    // const salt = await bcrypt.genSalt(10);
    // const hashOTP = await bcrypt.hash(OTP, salt);

    const updatedClg = await UniversityInfo.updateOne({ Uemail }, college);
    const ResetPasswordOptions = {
      from: "codejackers@outlook.com",
      subject: "Reset Password OTP",
      to: Uemail,
      html: `
      <p>Here is Your OTP : </p>
      <strong>${OTP}</strong> 
      `,
    };
    transporter.sendMail(ResetPasswordOptions).then(() => {
      res.status(200).json({
        status: "OTP verify Pending",
        message: "OTP sent in email",
      });
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { OTP, Uemail } = req.body;

    const college = await UniversityInfo.findOne({ Uemail });
    if (!college)
      return res.status(400).json({ message: "You are not registered" });

    if (college && !college.verified)
      return res.status(400).json({ message: "You are not verified yet" });

    if (!OTP) return res.status(400).json({ message: "OTP cannot be null" });

    if (OTP === college.OTP) {
      college.OTP = "";
      const updatedClg = await UniversityInfo.updateOne({ Uemail }, college);

      return res
        .status(201)
        .json({ status: "success", message: "OTP verified" });
    }

    res
      .status(403)
      .json({ status: "failed", message: "You have entered wrong OTP" });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

const updateCollege = async (req, res) => {
  const { UID } = req.body;

  try {
    let uidindb = await UniversityInfo.findOne({ UID });

    if (!uidindb)
      return res.status(200).json({
        message: "The Entered UID is incorrect",
      });

    const universityUpdate = await UniversityInfo.updateOne(
      { UID },
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      message: "College Updated Successfully",
    });
  } catch (error) {
    res.status(400).json({ status: "Failed", error: error });
  }
};

const deleteCollege = async (req, res) => {
  const { UID } = req.body;

  try {
    let uidindb = await UniversityInfo.findOne({ UID });

    if (!uidindb)
      return res.status(200).json({
        message: "The Entered UID is incorrect",
      });

    const universityDelete = await UniversityInfo.deleteOne({ UID });

    res.status(200).json({
      message: "College Deleted Successfully",
      deletedCollege: uidindb,
    });
  } catch (error) {
    res.status(500).json({ status: "Failed", error: error });
  }
};

module.exports = {
  getAllColleges,
  getCollege,
  registerCollege,
  // verificationCollege,
  // rejectCollege,
  loginCollege,
  updatePassword,
  sendOtp,
  verifyOtp,
  updateCollege,
  deleteCollege,
};

// // send verification email
// const sendVerificationEmail = async ({ _id, Uemail, Slot }, res) => {
//   const currentUrl = "http://localhost:3000/";

//   // unique verification string
//   const uniquestring = uuidv4() + _id;

//   // get zoom link
//   const zoomlink = await getZoomLink();
//   // console.log(zoomlink);

//   // send one email
//   // -> to govt official (email content: zoom link + verfication btns)
//   // vs361017@gmail.com === govt official
//   const govtMailOptions = {
//     from: "codejackers@outlook.com",
//     subject: "A new University registered!",
//     to: "vs361017@gmail.com",
//     html: `
//     <p>Here is the </p>
//     <a href=${zoomlink.start_url}>zoom link</a>
//     <p> for verification meet </p>
//     <p>Also Below is the verification options which you need to select <strong>after the zoom meet</strong> in order to verify the university</p>
//     <a href=${currentUrl + "verify/" + _id + "/" + uniquestring}>
//       <button> Click here to verify.</button>
//     </a>
//     <a href=${currentUrl + "reject/" + _id + "/" + uniquestring}>
//       <button> Click here to reject.</button>
//     </a>
//     <p> The assigned slot is ${Slot}</p>
//         <p>Zoom password is: ${zoomlink.password} </p>`,
//   };

//   // send another email
//   // -> to register guy  (email content: zoom link)
//   const registerMailOptions = {
//     from: "codejackers@outlook.com",
//     subject: "Zoom Link for verification process",
//     to: Uemail,
//     html: `
//     <p>Here is the </p>
//     <a href=${zoomlink.join_url}>zoom link</a>
//     <p> The assigned slot is ${Slot}</p>
//     <p> for verification meet </p>
//     <p>Zoom password is: ${zoomlink.password} </p>

//     <strong>Please Note That The link will expire in 6hours</strong>
//     `,
//   };

//   // hash the unquie verification string
//   const saltrounds = 10;

//   try {
//     const hashUniqueString = await bcrypt.hash(uniquestring, saltrounds);

//     // set values in userverification collection
//     const newVerification = await new UserVerification({
//       userId: _id,
//       uniquestring: hashUniqueString,
//       createdAt: Date.now(),
//       expiresAt: Date.now() + 21600000,
//     });

//     await newVerification.save();
//     await transporter.sendMail(govtMailOptions);
//     await transporter.sendMail(registerMailOptions);
//     return res
//       .status(200)
//       .json({ status: "Registration Pending", message: "zoom link sent" });
//   } catch (error) {
//     console.log(error);
//     res.json({ status: "Failed", error: error });
//   }
// };

// const verificationCollege = async (req, res) => {
//   let { userId, uniqueString } = req.params;

//   try {
//     const result = await UserVerification.find({ userId });

//     if (!result)
//       res.status(400).json({ status: "Failed", message: "Data not found" });

//     const { expiresAt } = result[0];
//     const hashUniqueString = result[0].uniquestring;

//     if (expiresAt < Date.now()) {
//       await UserVerification.deleteOne({ userId });
//       await UniversityInfo.deleteOne({ _id: userId });
//       res
//         .status(200)
//         .json({ status: "Failed", message: "Verification Link has expireed" });
//     } else {
//       const isMatch = bcrypt.compare(uniqueString, hashUniqueString);

//       if (!isMatch)
//         res
//           .status(400)
//           .json({ status: "Failed", message: "Link is incorrect" });

//       await UniversityInfo.updateOne({ _id: userId }, { verified: true });
//       await UserVerification.deleteOne({ userId });
//       res.status(200).json({ message: "Successfully Verified" });
//     }
//   } catch (error) {
//     res.status(400).json({ status: "Failed", error: error });
//   }
// };

// const rejectCollege = async (req, res) => {
//   let { userId, uniqueString } = req.params;

//   try {
//     const result = await UserVerification.find({ userId });

//     if (!result)
//       res.status(400).json({ status: "Failed", message: "Data not found" });

//     const { expiresAt } = result[0];
//     const hashUniqueString = result[0].uniquestring;

//     if (expiresAt < Date.now()) {
//       await UserVerification.deleteOne({ userId });
//       await UniversityInfo.deleteOne({ _id: userId });
//       res
//         .status(200)
//         .json({ status: "Failed", message: "Reject Link has expireed" });
//     } else {
//       const isMatch = bcrypt.compare(uniqueString, hashUniqueString);

//       if (!isMatch)
//         res
//           .status(400)
//           .json({ status: "Failed", message: "Link is incorrect" });

//       await UniversityInfo.deleteOne({ _id: userId });
//       await UserVerification.deleteOne({ userId });
//       res.status(200).json({ message: "Successfully Rejected" });
//     }
//   } catch (error) {
//     res.status(400).json({ status: "Failed", error: error });
//   }
// };
