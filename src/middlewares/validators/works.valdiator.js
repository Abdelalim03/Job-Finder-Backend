const { body, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const prisma = require("../../models/prismaClient");


const messageRules = [
    body('destinationUserId').notEmpty().withMessage('destinationUserId is required')
    .isInt({ min: 1 }).withMessage('destinationUserId  must be a positive integer')
    .trim(),
    body('content').notEmpty().withMessage('content is required').trim(),
    body('categoryId').notEmpty().withMessage('categoryId is required')
    .isInt({ min: 1 }).withMessage('categoryId  must be a positive integer')
    .trim(),
    
];

const updateWorkRules = [
  body("status").notEmpty().withMessage("status is required").trim(),

]

const workValidator = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: errors.array()[0].msg });
    }
    next();
  };
  
  module.exports = {
    messageRules,
    workValidator,
    updateWorkRules
  };