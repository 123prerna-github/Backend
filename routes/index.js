const express = require("express");
const {verifyToken} = require("../middleware/auth");
const router = express.Router();

const User = require("../controller/userController");


/****************************** Login-api *******************************/

router
  .route("/login")
  .post([User.login]);


/****************************** Register-api *******************************/
router
  .route("/register")
  .post([User.userRegister]);

/****************************** User profile-api *******************************/
router
  .route("/profile")
  .get([verifyToken, User.userProfile])
  .patch([verifyToken, User.updateEmail]);

/****************************** Update user profile-api *******************************/
router
    .route("/update")
    .patch([User.updateEmail]);



router
    .route("/update1")
    .patch([verifyToken,User.updateUserProfile]);


module.exports = router;