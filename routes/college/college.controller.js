const capitalizeString = require("capitalize-string");
const UniversityInfo = require("../../models/college.model");

//mongodb user verifgication model
const userverification = require("../../models/UserVerification");

const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');

// unique string
const {v4: uuidv4} = require("uuid");
const UserVerification = require("../../models/UserVerification");


const getAllColleges = async (req, res) => {
  try {
    let city = req.query.city;
    let collegename = req.query.collegename;

    if (collegename)
    {
      const collegesname = await UniversityInfo.find(
      {
        Uname: { $regex: collegename },
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
    } else {
      const colleges = await UniversityInfo.find({});
      return res.status(200).json(colleges);
    }
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
    user: "codejackers@outlook.com",
    pass: "we@recoders#"
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

// send verification email
 const sendVerificationEmail = ({_id , Uemail} , res) => {
  const currentUrl = "http://localhost:3000/";

  const uniquestring = uuidv4() + _id;

  // mail options
  const mailOptions = {
    from: "codejackers@outlook.com",
    subject: 'Please verify your account',
    to:   Uemail,
    html: `<p>Verify your email address to complete the signup
    and login into your account </p><b><p> This link expires in 6 hours</b></p> <p> Press <a href=${
       currentUrl + "verify/" + _id + "/" + uniquestring
       }> here</a> to proceed. </p>`,
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
                    res.redirect('/verified/error=true&message=${message}')
                  })
                  .catch(error => {
                    let message =  "Clearing user with expired unique strong failed";
                    res.redirect('/verified/error=true&message=${message}')
                  })
                })
                .catch((error) => {
                  console.log(error);
                  let message =  "An error occured while checking for existing user verification record";
                  res.redirect('/verified/error=true&message=${message}')
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
                    res.redirect('/verified/error=true&message=${message}')
                    })
                  })
                  .catch(error => {
                    console.log(error);
                    let message = "An error occured while updating user record";
                  res.redirect('/verified/error=true&message=${message}')
                  })


                }
                else{
                  // existing record but incorrect verification details passed 
                  let message = "Incorred verification details";
                  res.redirect('/verified/error=true&message=${message}')
                }
              })
              .catch(error => {
                let message = "an error when comparing unique token";
                res.redirect('/verified/error=true&message=${message}')
              })


            }

    }
    else{
        // user verification record dosent exist
        let message = "Account record dosent exist or has been verified already";
        res.redirect('/verified/error=true&message=${message}')
    }
  })
  
  .catch((error) => {
    console.log(error);
    let message = "An error occured while checking for existing user verification record";
    res.redirect('/verified/error=true&message=${message}');
  })
}

const verified = async(req , res) => {
  res.send("verified");
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
  verified
}
