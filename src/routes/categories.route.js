const express = require("express");
const categoriesRouter = express.Router();
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
} = require("../controllers/categories.controller.js");
const {
  authValidator,
  loginRules,
} = require("../middlewares/validators/auth.validator.js");
const { verifyAdmin, authRoles } = require("../middlewares/roles.middleware.js");
const { categoriesValidator, createCategoryRules } = require("../middlewares/validators/categories.validator.js");
const authenticateToken = require("../middlewares/auth.middleware.js");

// categoriesRouter.route("/create").post(authenticateToken, verifyAdmin,createCategory)
categoriesRouter.route("/").post(authenticateToken, verifyAdmin,createCategoryRules,categoriesValidator,createCategory)
categoriesRouter.route("/:id").put(authenticateToken, verifyAdmin,updateCategory)
categoriesRouter.route("/:id").delete(authenticateToken, verifyAdmin,deleteCategory)
categoriesRouter.route("/").get(authenticateToken,authRoles(["client", "tasker", "admin"]) ,getAllCategories)


module.exports = categoriesRouter;
