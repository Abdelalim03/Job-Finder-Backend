const express = require("express");
const worksRouter = express.Router();


const authenticateToken = require("../middlewares/auth.middleware.js");
const { tasksValidator, createTaskRules, updateTaskRules } = require("../middlewares/validators/tasks.validator.js");
const {  authRoles } = require("../middlewares/roles.middleware.js");
const {
    sendMessage,
    updateWork,
    deleteWork,
    createWorkReview,
    deleteWorkReview,
    updateWorkReview,
    getMyWorks,
    getMessagesByWork,
    SearchInMyWorks,
  } = require("../controllers/works.controller.js");
const { messageRules, workValidator, updateWorkRules } = require("../middlewares/validators/works.valdiator.js");

worksRouter.route("/messages").post(authenticateToken,authRoles(['client','tasker']),messageRules,workValidator,sendMessage)

worksRouter.route("/").get(authenticateToken,authRoles(['client','tasker']),getMyWorks)
worksRouter.route("/search").get(authenticateToken,authRoles(['client','tasker']),SearchInMyWorks)
worksRouter.route("/:id").get(authenticateToken,authRoles(['client','tasker']),getMessagesByWork)


worksRouter.route("/:id").put(authenticateToken, authRoles(['client','tasker']),updateWorkRules,workValidator,updateWork) 
worksRouter.route("/:id").delete(authenticateToken, authRoles(['tasker']),deleteWork)
worksRouter
  .route("/:id/workreviews")
  .post(authenticateToken, authRoles(["client"]), createWorkReview);
 
worksRouter
.route("/:id/workreviews/:workreviewId")
.delete(authenticateToken, authRoles(["client","admin"]), deleteWorkReview);

worksRouter
.route("/:id/workreviews/:workreviewId")
.put(authenticateToken, authRoles(["client","admin"]), updateWorkReview);


module.exports = worksRouter;
