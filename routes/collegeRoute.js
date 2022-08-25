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
  verifyOtp,
  updateCollege,
  deleteCollege,
} = require("../controller/collegeController");

const collegeRouter = express.Router();

collegeRouter.get("/college/list", getAllColleges);
collegeRouter.get("/college/:id", getCollege);
collegeRouter.post("/college/updatePassword", updatePassword);
collegeRouter.put("/college/updateCollege", updateCollege);
collegeRouter.delete("/college/deleteCollege", deleteCollege);
// collegeRouter.get("/verify/:userId/:uniqueString", verificationCollege);
// collegeRouter.get("/reject/:userId/:uniqueString", rejectCollege);
collegeRouter.post(
  "/college/register",
  rateLimiterUsingThirdParty(50),
  registerCollege
);
collegeRouter.post(
  "/college/login",
  rateLimiterUsingThirdParty(50),
  loginCollege
);
collegeRouter.post("/college/sendotp", rateLimiterUsingThirdParty(3), sendOtp);
collegeRouter.post(
  "/college/verifyotp",
  rateLimiterUsingThirdParty(3),
  verifyOtp
);

module.exports = collegeRouter;
