const express = require("express");
const worksRouter = express.Router();


const authenticateToken = require("../middlewares/auth.middleware.js");
const { tasksValidator, createTaskRules, updateTaskRules } = require("../middlewares/validators/tasks.validator.js");
const { verifyTasker, authRoles } = require("../middlewares/roles.middleware.js");
const { sendMessage, updateWork, deleteWork } = require("../controllers/works.controller.js");
const { messageRules, workValidator } = require("../middlewares/validators/works.valdiator.js");

worksRouter.route("/messages").post(authenticateToken,authRoles(['client','tasker']),messageRules,workValidator,sendMessage)
worksRouter.route("/:id").put(authenticateToken, verifyTasker,updateTaskRules,tasksValidator,updateWork) 
worksRouter.route("/:id").delete(authenticateToken, verifyTasker,deleteWork)


module.exports = worksRouter;
