const express = require("express");
const tasksRouter = express.Router();

const { upload } = require("../configs/index.js");

const authenticateToken = require("../middlewares/auth.middleware.js");
const { createTask, deleteTask, updateTask } = require("../controllers/tasks.controller.js");
const { tasksValidator, createTaskRules, updateTaskRules } = require("../middlewares/validators/tasks.validator.js");
const { verifyTasker } = require("../middlewares/roles.middleware.js");

// categoriesRouter.route("/create").post(authenticateToken, verifyAdmin,createCategory)
tasksRouter.route("/create").post(authenticateToken,upload.array('taskimages'), verifyTasker,createTaskRules,tasksValidator,createTask)
// i need to add verification that who update or delete is the owner 
tasksRouter.route("/update/:id").put(authenticateToken, verifyTasker,updateTaskRules,tasksValidator,updateTask) //i need to add to the upload the images and deleted imgaes send in a list 
tasksRouter.route("/delete/:id").delete(authenticateToken, verifyTasker,deleteTask)


module.exports = tasksRouter;
