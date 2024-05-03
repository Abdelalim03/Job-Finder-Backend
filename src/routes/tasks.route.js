const express = require("express");
const tasksRouter = express.Router();

const { upload } = require("../configs/index.js");

const authenticateToken = require("../middlewares/auth.middleware.js");
const { createTask } = require("../controllers/tasks.controller.js");
const { tasksValidator, createTaskRules } = require("../middlewares/validators/tasks.validator.js");
const { verifyTasker } = require("../middlewares/roles.middleware.js");

// categoriesRouter.route("/create").post(authenticateToken, verifyAdmin,createCategory)
tasksRouter.route("/create").post(authenticateToken,         upload.array('taskimages'), verifyTasker,createTaskRules,tasksValidator,createTask)


module.exports = tasksRouter;
