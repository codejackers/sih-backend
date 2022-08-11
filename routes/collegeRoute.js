const express = require("express");

const {
  getAllColleges,
  getCollege,
  registerCollege,
  verificationCollege,
  verified,
  rejectCollege,
  loginCollege,
  rejected,
  updatePassword,
  sendOtp,
  updateCollege,
} = require("../controller/collegeController");

const collegeRouter = express.Router();

collegeRouter.get("/college/list", getAllColleges);
collegeRouter.get("/college/:id", getCollege);
collegeRouter.post("/college/register", registerCollege);
collegeRouter.post("/college/login", loginCollege);
collegeRouter.post("/college/updatePassword", updatePassword);
collegeRouter.put("/college/updateCollege", updateCollege);
collegeRouter.post("/college/sendotp", sendOtp);
collegeRouter.get("/verify/:userId/:uniquestring", verificationCollege);
collegeRouter.get("/reject/:userId/:uniquestring", rejectCollege);
collegeRouter.get("/verified", verified);
collegeRouter.get("/rejected", rejected);

module.exports = collegeRouter;
