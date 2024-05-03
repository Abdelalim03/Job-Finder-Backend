const { body, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const prisma = require("../../models/prismaClient");


const createCategoryRules = [
    body("name").notEmpty().withMessage("name is required").trim(),
    body("description").notEmpty().withMessage("description is required").trim(),
]


const categoriesValidator = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: errors.array()[0].msg });
    }
    next();
  };
  
  module.exports = {
    createCategoryRules,
    categoriesValidator,
  };