const dotenv = require("dotenv");
dotenv.config();
const capitalizeString = require("capitalize-string");
const UniversityInfo = require("../../models/college.model");

//mongodb user verifgication model
const userverification = require("../../models/UserVerification");

const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');

// unique string
const {v4: uuidv4} = require("uuid");
const UserVerification = require("../../models/UserVerification");


const jwt = require("jsonwebtoken");
const fetch = require('node-fetch');
const { json } = require("express");

const getAllColleges = async (req, res) => {
  try {
    let city = req.query.city;
    let collegename = req.query.collegename;

    if (collegename)
    {
      const collegesname = await UniversityInfo.find(
      {
        Uname: { $regex: collegename , '$options' : 'i'},
      });
      return res.status(200).json(collegesname);
    }

    if (city) {
      city = capitalizeString(city);
      // console.log(city);
      const colleges = await UniversityInfo.find({
        UCity: city,
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
    ciphers: 'SSLv3'
  }
});
// get zoom link
const getZoomLink = async (req, res) => {

  const payload = {
    iss: process.env.ZOOMAPI_KEY, //your zoom API KEY
    exp: new Date().getTime() + 5000,
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
  }

  const response = await fetch(`https://api.zoom.us/v2/users/${email}/meetings`, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      "User-Agent": "Zoom-api-Jwt-Request",
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + token
    },
  });
  const data = await response.json();
  // console.log(data);
  return data;


};


// send verification email
 const sendVerificationEmail = async ({_id , Uemail} , res) => {
  const currentUrl = "http://localhost:3000/";

  const uniquestring = uuidv4() + _id;

  const zoomlink = await getZoomLink(); 
  
  // mail options
  //vs361017@gmail.com == govt official
  const mailOptions = {
    from: "codejackers@outlook.com",
    subject: 'Please verify your account',
    to:   'vs361017@gmail.com',
    html: `<p>Verify your email address to complete the signup
    and login into your account </p><b><p> This link expires in 6 hours</b></p> <p> Press <a href=${
       currentUrl + "verify/" + _id + "/" + uniquestring
       }> here</a> to proceed. </p>
       Press to reject <a href=${
        currentUrl + "reject/" + _id + "/" + uniquestring
        }> here</a>
        here is the zoom <a href=${zoomlink.start_url}>link</a>
        <p>Zoom password is: ${zoomlink.password} </p>`,
  };
    
  // hash the unquie string
  const saltrounds = 10; 
  bcrypt.hash(uniquestring,saltrounds)
  .then(hashUniqueString => {
    // set values in userverification collection
    const newVerification = new UserVerification({
      userId: _id,
      uniquestring: hashUniqueString,
      createdAt: Date.now(),
      expiresAt: Date.now() + 21600000,
    })

    newVerification.save().
    then(() => {
      transporter.sendMail(mailOptions)
      .then(() => {
        // email send and verification record saved
        res.json({
          status: "Pending",
          message: "Verification email sent"
        });
      })
      .catch((error) => {
        console.log(error);
        res.json({
          status: "FAILED",
          message: "Verification email failed"
        });
      })


    }).catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "coundt save verification email data"
      });
    })

  }).catch(() => {
    res.json({
      status: "FAILED",
      message: "An error"
    })
  })
 };





const verificationCollege = async(req , res) => {
  let {userId , uniquestring} = req.params;

  UserVerification
  .find({userId})
  .then((result) =>{
    if (result.length > 0)
    {
            // user verification record exist



            const {expiresAt} = result[0];
           const hashUniqueString = result[0].uniquestring;


            // checking for expired unquie string 
            if (expiresAt < Date.now()) {
                // record has expired so we delete it.
                UserVerification.deleteOne({ userId})
                .then((result) => {
                  UniversityInfo
                  .deleteOne({_id: userId})
                  .then(() => {
                    let message =  "Link has expired. Please sign up again";
                    res.redirect(`/verified/error=true&message=${message}`)
                  })
                  .catch(error => {
                    let message =  "Clearing user with expired unique strong failed";
                    res.redirect(`/verified/error=true&message=${message}`)
                  })
                })
                .catch((error) => {
                  console.log(error);
                  let message =  "An error occured while checking for existing user verification record";
                  res.redirect(`/verified/error=true&message=${message}`)
                })
            }
            else{
              // valid record exists so we valide the user string
              // first compare the hashed unique string 


              bcrypt.compare(uniquestring , hashUniqueString)
              .then((result) => {
                if (result) {
                  // string match

                  UniversityInfo.updateOne({_id: userId} , {verified: true})
                  .then(() => {
                    userverification.deleteOne({userId})
                    .then(() => {
                      res.send("Successfully verified");
                    })
                    .catch(error => {
                      console.log(error);
                      let message = "An error occured while finilizing successful verification";
                    res.redirect(`/verified/error=true&message=${message}`)
                    })
                  })
                  .catch(error => {
                    console.log(error);
                    let message = "An error occured while updating user record";
                  res.redirect(`/verified/error=true&message=${message}`)
                  })


                }
                else{
                  // existing record but incorrect verification details passed 
                  let message = "Incorred verification details";
                  res.redirect(`/verified/error=true&message=${message}`)
                }
              })
              .catch(error => {
                let message = "an error when comparing unique token";
                res.redirect(`/verified/error=true&message=${message}`)
              })


            }

    }
    else{
        // user verification record dosent exist
        let message = "Account record dosent exist or has been verified already";
        res.redirect(`/verified/error=true&message=${message}`)
    }
  })
  
  .catch((error) => {
    console.log(error);
    let message = "An error occured while checking for existing user verification record";
    res.redirect(`/verified/error=true&message=${message}`);
  })
}

const verified = async(req , res) => {
  res.send("verified");
}

const rejectCollege = async(req , res) => {
  let {userId , uniquestring} = req.params;

  UserVerification
  .find({userId})
  .then((result) =>{
    if (result.length > 0)
    {
            // user verification record exist
            const {expiresAt} = result[0];
           const hashUniqueString = result[0].uniquestring;


            // checking for expired unquie string 
            if (expiresAt < Date.now()) {
                // record has expired so we delete it.
                UserVerification.deleteOne({ userId})
                .then((result) => {
                  UniversityInfo
                  .deleteOne({_id: userId})
                  .then(() => {
                    let message =  "Link has expired. Please sign up again";
                    res.redirect(`/rejected/error=true&message=${message}`)
                  })
                  .catch(error => {
                    let message =  "Clearing user with expired unique string failed";
                    res.redirect(`/rejected/error=true&message=${message}`)
                  })
                })
                .catch((error) => {
                  console.log(error);
                  let message =  "An error occured while checking for existing user verification record";
                  res.redirect(`/rejected/error=true&message=${message}`)
                })
            }
            else{
              // valid record exists so we valide the user string
              // first compare the hashed unique string 


              bcrypt.compare(uniquestring , hashUniqueString)
              .then((result) => {
                if (result) {
                  // string match

                  UniversityInfo.deleteOne({_id: userId} )
                  .then(() => {
                    userverification.deleteOne({userId})
                    .then(() => {
                      res.send("Successfully rejected");
                    })
                    .catch(error => {
                      console.log(error);
                      let message = "An error occured while finilizing successful rejection";
                    res.redirect(`/rejected/error=true&message=${message}`)
                    })
                  })
                  .catch(error => {
                    console.log(error);
                    let message = "An error occured while updating user record";
                  res.redirect(`/rejected/error=true&message=${message}`)
                  })


                }
                else{
                  // existing record but incorrect verification details passed 
                  let message = "Incorred verification details";
                  res.redirect(`/rejected/error=true&message=${message}`)
                }
              })
              .catch(error => {
                let message = "an error when comparing unique token";
                res.redirect(`/rejected/error=true&message=${message}`)
              })


            }

    }
    else{
        // user verification record dosent exist
        let message = "Account record dosent exist or has been accepted already";
        res.send(`/rejected/error=true&message=${message}`)
    }
  })
  
  .catch((error) => {
    console.log(error);
    let message = "An error occured while checking for existing user verification record";
    res.redirect(`/rejected/error=true&message=${message}`);
  })
}

const rejected = async(req , res) => {
  res.send("rejected");
}




const registerCollege = async(req , res) => {
        console.log(req.body);
        const { UID , DOC , Uemail , Pass } = req.body;
        // hashing the password
        const salt = await bcrypt.genSalt(10); 
        const hashpassword = await bcrypt.hash(Pass , salt);
        
        // verifying university 
        // govt official email + Uemail send zoom link



         // Check if this user already exisits
         let user = await UniversityInfo.findOne({ Uemail: req.body.Uemail });
         if (user) {
          return res.status(400).send('That user already exisits!');
         }


         else {
        // create new university
        const newUni = new UniversityInfo({
          UID: UID,
          Doc: DOC,
          Uemail: Uemail,
          Pass: Pass,
          verified: false,
        })

        newUni.save().then((result) => {
          //handle account verification
          sendVerificationEmail(result,res);
          console.log(Uemail)
        })
        .catch((error) => {
          res.json({
            status: "FAILED",
            message: "An error"
          });
        });
      }
}

module.exports = {
  getAllColleges,
  getCollege,
  registerCollege,
  verificationCollege,
  verified,
  rejectCollege,
  rejected
}
