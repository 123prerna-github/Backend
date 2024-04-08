const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");

const config = require("../config.json");
const conUser = mongoose.createConnection(config.mongo.companyUrl);

const userSchema = require("../models/users");
const userModel = conUser.model("User", userSchema);

 let user = {};


  const encryptOption = (option, salt = 10) => {
    try {
      const genSalt = genSaltSync(salt);
      return hashSync(option, genSalt);
    } catch (error) {}
  };

  const userRegister = async (req, res) => {
    try {
      console.log(req.body.firstName);
      const { firstName, lastName, email, password } = req.body;
  
      ``;
      if (!firstName) {
        res.status(404).json({ success: 0, message: "First name is required" });
        return;
      }
      if (!lastName) {
        res.status(404).json({ success: 0, message: "Last name is required" });
        return;
      }
      if (!email) {
        res.status(404).json({ success: 0, message: "Email is required" });
        return;
      }
      if (!password) {
        res.status(404).json({ success: 0, message: "Password is required" });
        return;
      }
  
      const result = await userModel.findOne({ email: email }).lean();
      console.log(result);
      if (result !== null && result !== undefined && result !== "") {
        //if (result)
        res.status(400).json({ success: 0, message: "Email already exists" });
        return;
      }
      console.log("hi");
      const pass = encryptOption(password);
  
      const user = userModel.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        password: pass,
      });
  
      if (user) {
        res
          .status(200)
          .json({ success: 1, message: "User successfully created" });
        return;
      } else {
        res.status(404).json({ success: 0, message: "error occurred" });
      }
    } catch (error) {
      res.status(404).json({ success: 0, message: "error occurred" });
    }
  };
  
  


const decryptOption = (data, encryptedData) => {
  try {
    if (data && encryptedData) {
      const result = compareSync(data?.toString(), encryptedData?.toString());
      return result;
    }
    return false;
  } catch (error) {
    return false;
  }
};

const generateToken = (userData, JWT_SECRET, option = {}) => {
    var token = jwt.sign({ id: userData }, JWT_SECRET, option);
    return token;
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      res.status(400).json({ success: 0, message: "Username is required" });
      return;
    }
    if (!password) {
      res.status(400).json({ success: 0, message: "Password is required" });
      return;
    }

    const result = await userModel.findOne({ email: username });
    if (!result) {
      res
        .status(400)
        .json({ succsess: 0, message: "This email doesn't exist" });
      return;
    }

    const isPasswordMatch = decryptOption(password, result.password);
    if (isPasswordMatch === false) {
      res.status(400).json({ succsess: 0, message: "Password is incorrect" });
      return;
    } else {
      const token = await generateToken(
        { _id: result._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE_IN }
      );
      res
        .status(200)
        .json({ succsess: 1, message: "Login Success", accessToken: token });
      return;
    }
  } catch (error) {
    res.status(404).json({ success: 0, message: "error occurred" });
  }
};




const userProfile = async (req, res) => {
  try {
    console.log(req.authUser);
    const { _id, firstName, lastName, email, role, createdAt } = req.authUser;
    const result = {
      _id: _id,
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: role,
      createdAt: createdAt,
    };
    res
      .status(200)
      .json({
        success: 1,
        message: "User profile fetched successfully",
        data: result,
      });
  } catch (error) {
    res.status(404).json({ success: 0, message: "error occurred" });
  }
};




const updateEmail = async (req, res) => {
  try {
    const {firstName,email } = req.body;

    
    if (!firstName) {
     res.status(400).json({ success: 0, message: "First name is required" });
     return ;
    }

    if (!email) {
     res.status(400).json({ success: 0, message: "Email is required" });
     return ;
    }

    // Check if the user exists
    const user = await userModel.findOne({firstName:firstName });
    if (!user) {
      res.status(400).json({ success: 0, message: "User not found" });
      return ;
    }

    // Update the email
    const updatedUser= await user.updateOne({ email: email });

     res.status(200).json({ success: 1, message: "Email updated successfully",data:updatedUser});
     return;
  } catch (error) {
    res.status(500).json({ success: 0, message: "Error occurred" });
    return;
  }
};




// const updateUserProfile = async (req, res) => {
//   try {

//     console.log(req.authUser);
//     const { _id, firstName, lastName, email, role, createdAt,password } = req.authUser;
//     const { first_Name, last_Name, updatedEmail, updatedPassword } = req.body;
//     if (updatedEmail) {
//       if (updatedEmail !== email) {
//         const user = await userModel.findOne({ email: updatedEmail }).lean();
//         if (user) {
//           res
//             .status(400)
//             .json({ success: 0, message: "Email is already in use !" });
//           return;
//         }
//       }
//     }
    
//     if (updatedPassword) {
//       const updatedPass= encryptOption(updatedPassword);
//       if (!updatedPass) {
//         res.status(400).json({ success: 0, message: "Error encrypting updated password" });
//         return;
//       }else{
//         const updatedUser = await userModel.findByIdAndUpdate(
//           { _id: _id },
//           {
//             $set: {
//               firstName: first_Name,
//               lastName: last_Name,
//               email: updatedEmail,
//               password: updatedPass,
//               updatedAt: new Date(),
//             },
//           },
//           {new:true}
//         );

//         res.status(200).json({success:1, message:"Updation successful",data:updatedUser});
//         return;
//       }
//     }

//     const updatedUser = await userModel.findByIdAndUpdate(
//       { _id: _id },
//       {
//         $set: {
//           firstName: first_Name,
//           lastName: last_Name,
//           email: updatedEmail,
//           updatedAt: new Date(),
//         },
//       },
//       { new: true }
//     );

//     res
//       .status(200)
//       .json({
//         success: 1,
//         message: "User info updated successfully",
//         data: updatedUser,
//       });
//   } catch (error) {
//     res
//       .status(400)
//       .json({ success: 0, message: "Error occurred while updating user info" });
//   }
// };




const updateUserProfile = async (req, res) => {
  try {
    console.log(req.authUser);
    const { _id, firstName, lastName, email, role, createdAt } = req.authUser;
    const { first_Name, last_Name, updatedEmail, updatedPassword } = req.body;

    // Check if updated email is provided and not the same as the current email
    if (updatedEmail) {
      if(updatedEmail !== email){
      // Check if the updated email is already in use
      const user = await userModel.findOne({ email: updatedEmail }).lean();
      if (user) {
        return res.status(400).json({ success: 0, message: "Email is already in use!" });
      }
    }
  } 

    // Check if updated password is provided
    if (updatedPassword) {
      const updatedPass = encryptOption(updatedPassword);
      if (!updatedPass) {
       res.status(400).json({ success: 0, message: "Error encrypting updated password" });
       return;
      } else {
        // Update user with provided password
        const updatedUser = await userModel.findByIdAndUpdate(
          {_id:_id},
          {
            $set: {
              firstName: first_Name,
              lastName: last_Name,
              email: updatedEmail,
              password: updatedPass,
              updatedAt: new Date(),
            },
          },
          { new: true }
        );
        res.status(200).json({ success: 1, message: "User info and password updated successfully", data: updatedUser });
        return;
      }
    }

    // Update user info without password
    const updatedUser = await userModel.findByIdAndUpdate(
    {_id:_id},
      {
        $set: {
          firstName: first_Name,
          lastName: last_Name,
          email: updatedEmail,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: 1,
      message: "User info updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(400).json({ success: 0, message: "Error occurred while updating user info" });
  }
};



user={login,userRegister,userProfile,updateEmail,updateUserProfile};
module.exports=user;













// // if auth middleware is added in route, you can find user profile details using this
// //const { _id, role, status....} = req.authUser;

// f//for login api
// let res = await userModel.findOne({email:userName})
// if (!res) {
//     res.status(400).json({success:0, message: "user not registered"});
//   } else if (res.status == "inactive") {
//     res.status(400).json({success:0, message: "user deactivated"});
//   }  else {
//     const isPasswordMatch = decryptOption(
//       password,
//       res.password.toString()
//     );
//     if (isPasswordMatch) {
//       const accessToken = await generateToken(
//         {_id:res._id},
//         process.env.JWT_SECRET,
//         { expiresIn: process.env.JWT_EXPIRE_IN }
//       );
//       res.status(200).json({success:1, message: "Login successful", accessToken });

//     } else {
//         res.status(400).json({success:0, message: "Incorrect password"});
//     }
//   }

//   //for login api password compare
//   const decryptOption = (data, encryptedData) => {
//     try {
//       if (data && encryptedData) {
//         const result = compareSync(data?.toString(), encryptedData?.toString());
//         return result;
//       }
//       return false;
//     } catch (error) {
//       return false;
//     }
//   };
//   //for login api token generate
// const generateToken = (userData, JWT_SECRET, option = {}) => {
//     var token = jwt.sign({ id: userData }, JWT_SECRET, option);
//     return token;
//   };

//   f//for register api password encryption

//   const encryptOption = (option, salt = 10) => {
//     try {
//       const genSalt = genSaltSync(salt);
//       return hashSync(option, genSalt);
//     } catch (error) {}
//   };
