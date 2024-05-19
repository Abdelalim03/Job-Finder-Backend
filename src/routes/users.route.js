const express = require("express");
const usersRouter = express.Router();
const {
  login,
  register,
  loginAdmin,
  registerTasker,
  registerClient,
} = require("../controllers/auth.controller");
const {
  registerRules,
  authValidator,
  registerTaskerRules,
  loginRules,
} = require("../middlewares/validators/auth.validator.js");
const { authRoles } = require("../middlewares/roles.middleware.js");
const authenticateToken = require("../middlewares/auth.middleware.js");
const { getCurrentUser } = require("../controllers/users.controller.js");


usersRouter.use(authenticateToken);
// usersRouter.get('/', userController.readAllUsers);
usersRouter.get('/me', getCurrentUser);

module.exports = usersRouter;
