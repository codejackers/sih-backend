const rateLimit = require("express-rate-limit");

const rateLimiterUsingThirdParty = (max) =>
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    max: max,
    message: "You have exceeded the 50 requests in 24 hrs limit!",
    standardHeaders: true,
    legacyHeaders: false,
  });

module.exports = { rateLimiterUsingThirdParty };
