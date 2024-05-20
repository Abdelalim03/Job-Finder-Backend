const express = require("express");
const tasksRouter = express.Router();

const { upload } = require("../configs/index.js");

const authenticateToken = require("../middlewares/auth.middleware.js");
const { createTask, deleteTask, updateTask, getTasks, getTaskById, filterTasks } = require("../controllers/tasks.controller.js");
const { tasksValidator, createTaskRules, updateTaskRules } = require("../middlewares/validators/tasks.validator.js");
const { verifyTasker, authRoles } = require("../middlewares/roles.middleware.js");

// categoriesRouter.route("/create").post(authenticateToken, verifyAdmin,createCategory)
tasksRouter.route("/").post(authenticateToken,upload.array('taskimages'), verifyTasker,createTaskRules,tasksValidator,createTask)
tasksRouter.route("/:id").put(authenticateToken, upload.array('taskimages'),verifyTasker,updateTaskRules,tasksValidator,updateTask) //i need to add to the upload the images and deleted imgaes send in a list 
tasksRouter.route("/:id").delete(authenticateToken, verifyTasker,deleteTask)
tasksRouter.route("/").get(authenticateToken,authRoles(["client", "tasker", "admin"]),getTasks)
tasksRouter.route("/filter").get(authenticateToken,authRoles(["client", "tasker", "admin"]),filterTasks)
tasksRouter.route("/:id").get(authenticateToken,authRoles(["client", "tasker", "admin"]),getTaskById)


module.exports = tasksRouter;
