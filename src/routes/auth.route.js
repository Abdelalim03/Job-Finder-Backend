const express = require("express");
const authRouter = express.Router();
const {
  login,
  register,
  registerClient,
  registerTasker,
} = require("../controllers/auth.controller");
const {
  registerRules,
  authValidator,
  registerTaskerRules,
  loginRules,
} = require("../middlewares/validators/auth.validator.js");
const { verifyUser } = require("../middlewares/roles.middleware.js");
const authenticateToken = require("../middlewares/auth.middleware.js");
const { upload } = require("../configs/index.js");

authRouter.route("/login").post(loginRules, authValidator, login);
authRouter.route("/register").post(registerRules, authValidator, register);
authRouter
  .route("/register/client")
  .post(authenticateToken, verifyUser, registerClient);

authRouter
  .route("/register/tasker")
  .post(
    authenticateToken,
    verifyUser,
    upload.single("profilePicture"),
    registerTaskerRules,
    authValidator,
    registerTasker
  );

module.exports = authRouter;
