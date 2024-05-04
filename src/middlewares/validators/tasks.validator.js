const { body, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const prisma = require("../../models/prismaClient");


const createTaskRules = [
    body('description').notEmpty().withMessage('description is required').trim(),
    body('price')
        .notEmpty().withMessage('price is required')
        .isFloat({ min: 0 }).withMessage('price must be a positive number')
        .trim(),
    body('categoryId')
        .notEmpty().withMessage('categoryId is required')
        .isInt({ min: 1 }).withMessage('categoryId  must be a positive integer')
        .trim(),
];
const updateTaskRules =[
    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('price must be a positive number')
        .trim(),
    body('categoryId')
        .optional()
        .isInt({ min: 1 }).withMessage('categoryId  must be a positive integer')
        .trim(),

]

const tasksValidator = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: errors.array()[0].msg });
    }
    next();
  };
  
  module.exports = {
    createTaskRules,
    updateTaskRules,
    tasksValidator,
  };