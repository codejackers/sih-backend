const express = require("express");
const { rateLimiterUsingThirdParty } = require("../middlewares/rateLimiter");
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
  deleteCollege,
} = require("../controller/collegeController");

const collegeRouter = express.Router();

collegeRouter.get("/college/list", getAllColleges);
collegeRouter.get("/college/:id", getCollege);
collegeRouter.post( "/college/register",rateLimiterUsingThirdParty,registerCollege);
collegeRouter.post("/college/login", rateLimiterUsingThirdParty, loginCollege);
collegeRouter.post("/college/updatePassword", updatePassword);
collegeRouter.put("/college/updateCollege", updateCollege);
collegeRouter.delete("/college/deleteCollege", deleteCollege);
collegeRouter.post("/college/sendotp", rateLimiterUsingThirdParty, sendOtp);
collegeRouter.get("/verify/:userId/:uniquestring", verificationCollege);
collegeRouter.get("/reject/:userId/:uniquestring", rejectCollege);
collegeRouter.get("/verified", verified);
collegeRouter.get("/rejected", rejected);

module.exports = collegeRouter;
