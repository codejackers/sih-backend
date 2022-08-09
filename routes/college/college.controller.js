const dotenv = require("dotenv");
dotenv.config();
const capitalizeString = require("capitalize-string");
const UniversityInfo = require("../../models/college.model");

//mongodb user verifgication model
const userverification = require("../../models/UserVerification");

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// unique string
const { v4: uuidv4 } = require("uuid");
const UserVerification = require("../../models/UserVerification");

const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const { json } = require("express");

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
      // console.log(city);
      const colleges = await UniversityInfo.find({
        UCity: { $regex: city , '$options' : 'i'},
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
    const college = await UniversityInfo.findById(id);
    return res.status(200).json(college);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

//transpoter
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  secureConnection: false,
  port: 587,
  auth: {
    user: process.env.OUTLOOK_EMAIL,
    pass: process.env.OUTLOOK_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

// get zoom link
const getZoomLink = async (req, res) => {
  const payload = {
    iss: process.env.ZOOMAPI_KEY, //your zoom API KEY
    exp: new Date().getTime() + 21600000,
  };

  const token = jwt.sign(payload, process.env.ZOOMAPI_SECRET); //your zoom API SECRET HERE

  // console.log(token);
  email = "codejackers@outlook.com"; // your zoom developer email account

  const body = {
    topic: "Registration meet for university", //meeting title
    type: 1,
    settings: {
      host_video: "true",
      participant_video: "true",
    },
  };

  const response = await fetch(
    `https://api.zoom.us/v2/users/${email}/meetings`,
    {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "User-Agent": "Zoom-api-Jwt-Request",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );
  const data = await response.json();
  // console.log(data);
  return data;
};

// send verification email
const sendVerificationEmail = async ({ _id, Uemail }, res) => {
  const currentUrl = "http://localhost:3000/";

  // unique verification string
  const uniquestring = uuidv4() + _id;

  // get zoom link
  const zoomlink = await getZoomLink();
  // console.log(zoomlink);

  // send one email
  // -> to govt official (email content: zoom link + verfication btns)
  // vs361017@gmail.com === govt official
  const govtMailOptions = {
    from: "codejackers@outlook.com",
    subject: "A new University registered!",
    to: "vs361017@gmail.com",
    html: `
    <p>Here is the </p> 
    <a href=${zoomlink.start_url}>zoom link</a> 
    <p> for verification meet </p>
    <p>Also Below is the verification options which you need to select <strong>after the zoom meet</strong> in order to verify the university</p>
    <a href=${currentUrl + "verify/" + _id + "/" + uniquestring}>
      <button> Click here to verify.</button>
    </a>
    <a href=${currentUrl + "reject/" + _id + "/" + uniquestring}>
      <button> Click here to reject.</button>
    </a>
        <p>Zoom password is: ${zoomlink.password} </p>`,
  };

  // send another email
  // -> to register guy  (email content: zoom link)
  const registerMailOptions = {
    from: "codejackers@outlook.com",
    subject: "Zoom Link for verification process",
    to: Uemail,
    html: `
    <p>Here is the </p> 
    <a href=${zoomlink.join_url}>zoom link</a> 
    <p> for verification meet </p>
    <p>Zoom password is: ${zoomlink.password} </p>
    
    <strong>Please Note That The link will expire in 6hours</strong>
    `,
  };

  // hash the unquie verification string
  const saltrounds = 10;
  bcrypt
    .hash(uniquestring, saltrounds)
    .then((hashUniqueString) => {
      // set values in userverification collection
      const newVerification = new UserVerification({
        userId: _id,
        uniquestring: hashUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });

      // store verifcation info in db then send email
      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(govtMailOptions)
            .then(() => {
              res.json({
                status: "Registeration Pending",
                message: "Verification email sent",
              });
            })
            .catch((error) => {
              console.log(error);
              res.json({
                status: "FAILED",
                message: "Verification email failed",
              });
            });
        })
        .then(() => {
          transporter
            .sendMail(registerMailOptions)
            .then(() => {
              res.json({
                status: "Registeration Pending",
                message: "Zoom link sent",
              });
            })
            .catch((error) => {
              console.log(error);
              res.json({
                status: "FAILED",
                message: "Verification email failed",
              });
            });
        })
        .catch((error) => {
          console.log(error);
          res.json({
            status: "FAILED",
            message: "coundt save verification email data",
          });
        });
    })
    .catch(() => {
      res.json({
        status: "FAILED",
        message: "An error",
      });
    });
};

const verificationCollege = async (req, res) => {
  let { userId, uniquestring } = req.params;

  // search the user in user verfication db
  UserVerification.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        // user verification record exist
        const { expiresAt } = result[0];
        const hashUniqueString = result[0].uniquestring;

        // checking if unquie string is expired
        if (expiresAt < Date.now()) {
          // record has expired so we delete it.
          UserVerification.deleteOne({ userId })
            .then((result) => {
              UniversityInfo.deleteOne({ _id: userId })
                .then(() => {
                  let message = "Link has expired. Please sign up again";
                  res.redirect(`/verified/error=true&message=${message}`);
                })
                .catch((error) => {
                  let message =
                    "Clearing user with expired unique strong failed";
                  res.redirect(`/verified/error=true&message=${message}`);
                });
            })
            .catch((error) => {
              console.log(error);
              let message =
                "An error occured while checking for existing user verification record";
              res.redirect(`/verified/error=true&message=${message}`);
            });
        } else {
          // valid record exists so we valide the user string
          // first compare the hashed unique string
          bcrypt
            .compare(uniquestring, hashUniqueString)
            .then((result) => {
              if (result) {
                // string match then
                // verify Uni and delete verification record from univerify DB
                UniversityInfo.updateOne({ _id: userId }, { verified: true })
                  .then(() => {
                    userverification
                      .deleteOne({ userId })
                      .then(() => {
                        res.send("Successfully verified");
                      })
                      .catch((error) => {
                        console.log(error);
                        let message =
                          "An error occured while finilizing successful verification";
                        res.redirect(`/verified/error=true&message=${message}`);
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    let message = "An error occured while updating user record";
                    res.redirect(`/verified/error=true&message=${message}`);
                  });
              } else {
                // existing record but incorrect verification details passed
                let message = "Incorred verification details";
                res.redirect(`/verified/error=true&message=${message}`);
              }
            })
            .catch((error) => {
              let message = "an error when comparing unique token";
              res.redirect(`/verified/error=true&message=${message}`);
            });
        }
      } else {
        // user verification record dosent exist
        let message =
          "Account record dosent exist or has been verified already";
        res.redirect(`/verified/error=true&message=${message}`);
      }
    })

    .catch((error) => {
      console.log(error);
      let message =
        "An error occured while checking for existing user verification record";
      res.redirect(`/verified/error=true&message=${message}`);
    });
};

const verified = async (req, res) => {
  res.send("verified");
};

const rejectCollege = async (req, res) => {
  let { userId, uniquestring } = req.params;

  UserVerification.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        // user verification record exist
        const { expiresAt } = result[0];
        const hashUniqueString = result[0].uniquestring;

        // checking for expired unquie string
        if (expiresAt < Date.now()) {
          // record has expired so we delete it.
          UserVerification.deleteOne({ userId })
            .then((result) => {
              UniversityInfo.deleteOne({ _id: userId })
                .then(() => {
                  let message = "Link has expired. Please sign up again";
                  res.redirect(`/rejected/error=true&message=${message}`);
                })
                .catch((error) => {
                  let message =
                    "Clearing user with expired unique string failed";
                  res.redirect(`/rejected/error=true&message=${message}`);
                });
            })
            .catch((error) => {
              console.log(error);
              let message =
                "An error occured while checking for existing user verification record";
              res.redirect(`/rejected/error=true&message=${message}`);
            });
        } else {
          // valid record exists so we valide the user string
          // first compare the hashed unique string

          bcrypt
            .compare(uniquestring, hashUniqueString)
            .then((result) => {
              if (result) {
                // string match

                UniversityInfo.deleteOne({ _id: userId })
                  .then(() => {
                    userverification
                      .deleteOne({ userId })
                      .then(() => {
                        res.send("Successfully rejected");
                      })
                      .catch((error) => {
                        console.log(error);
                        let message =
                          "An error occured while finilizing successful rejection";
                        res.redirect(`/rejected/error=true&message=${message}`);
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    let message = "An error occured while updating user record";
                    res.redirect(`/rejected/error=true&message=${message}`);
                  });
              } else {
                // existing record but incorrect verification details passed
                let message = "Incorred verification details";
                res.redirect(`/rejected/error=true&message=${message}`);
              }
            })
            .catch((error) => {
              let message = "an error when comparing unique token";
              res.redirect(`/rejected/error=true&message=${message}`);
            });
        }
      } else {
        // user verification record dosent exist
        let message =
          "Account record dosent exist or has been accepted already";
        res.send(`/rejected/error=true&message=${message}`);
      }
    })

    .catch((error) => {
      console.log(error);
      let message =
        "An error occured while checking for existing user verification record";
      res.redirect(`/rejected/error=true&message=${message}`);
    });
};

const rejected = async (req, res) => {
  res.send("rejected");
};

const registerCollege = async (req, res) => {
  console.log(req.body);
  const { UID, DOC, Uemail, Pass } = req.body;

  // hashing the password
  const salt = await bcrypt.genSalt(10);
  const hashpassword = await bcrypt.hash(Pass, salt);

  // Check if this user already exisits
  let user = await UniversityInfo.findOne({ Uemail: req.body.Uemail });

  if (user && !user.verified)
    return res.status(400).send("You are not verified yet! ");
  if (user) {
    return res.status(400).send("That user already exisits!");
  } else {
    // create new university
    const newUni = new UniversityInfo({
      UID: UID,
      Doc: DOC,
      Uemail: Uemail,
      Pass: hashpassword,
      verified: false,
    });

    newUni
      .save()
      .then((result) => {
        //handle account verification
        sendVerificationEmail(result, res);
        console.log(Uemail);
      })
      .catch((error) => {
        res.json({
          status: "FAILED",
          message: "An error",
        });
      });
  }
};

const loginCollege = async (req, res) => {
  try {
    const { Uemail, Pass } = req.body;

    console.log(Uemail);
    // check if user exists
    let user = await UniversityInfo.findOne({ Uemail: Uemail });
    console.log(user.Pass);

    if (!user)
      return res.status(400).json({ message: "You are not registered" });
    if (user && !user.verified)
      return res.status(400).json({ message: "You are not verified yet" });

    await bcrypt
      .compare(Pass, user.Pass)
      .then((isMatch) => {
        console.log(isMatch);

        if (!isMatch) {
          res.status(401).json({ message: "Password is incorrect" });
        } else {
          console.log("password matches");
          return res
            .status(200)
            .json({ message: "Login Successful", data: user });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};


const updatePassword =  async (req, res) => {
  const { Uemail , Pass } = req.body;
  let user = await UniversityInfo.findOne({ Uemail: Uemail });
   if (!user)
      return res.status(400).json({ message: "You are not registered" });
   if (user && !user.verified)
      return res.status(400).json({ message: "You are not verified yet" });

    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(Pass, salt);
    console.log(Pass);
    await UniversityInfo.findOneAndUpdate({ Uemail: Uemail }, { Pass: hashpassword })

    return res.status(200).json({
      message: "Your password has been updated , you can login now with new password",
    });

}
const sendOtp =  async (req, res) => {
  const { Uemail } = req.body;
  let user = await UniversityInfo.findOne({ Uemail: Uemail });
   if (!user)
      return res.status(400).json({ message: "You are not registered" });
   if (user && !user.verified)
      return res.status(400).json({ message: "You are not verified yet" });

   const OTP = uuidv4().slice(0, 6) 
   const salt = await bcrypt.genSalt(10);
   const hashOTP = await bcrypt.hash(OTP, salt);

   const ResetPasswordOptions = {
    from: "codejackers@outlook.com",
    subject: "Reset Password OTP",
    to: Uemail,
    html: `
    <p>Here is Your OTP : </p>
    <strong>${OTP}</strong> 
    `,
  };
            transporter
            .sendMail(ResetPasswordOptions)
            .then(() => {
              res.status(200).json({
                status: "OTP verify Pending",
                message: "OTP sent in email",
                hashedOTP: hashOTP
              });
            })
           
}

module.exports = {
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
};
