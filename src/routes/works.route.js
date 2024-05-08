

const express = require("express");
const worksRouter = express.Router();

const authenticateToken = require("../middlewares/auth.middleware.js");
const {
  tasksValidator,
  createTaskRules,
  updateTaskRules,
} = require("../middlewares/validators/tasks.validator.js");
const { 
  verifyTasker,
  authRoles,
} = require("../middlewares/roles.middleware.js");
const {
  sendMessage,
  updateWork,
  deleteWork,
  createWorkReview,
} = require("../controllers/works.controller.js");

worksRouter
  .route("/messages")
  .post(authenticateToken, authRoles(["client", "tasker"]), sendMessage);
worksRouter
  .route("/:id")
  .put(
    authenticateToken,
    verifyTasker,
    updateTaskRules,
    tasksValidator,
    updateWork
  );
worksRouter.route("/:id").delete(authenticateToken, verifyTasker, deleteWork);
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
