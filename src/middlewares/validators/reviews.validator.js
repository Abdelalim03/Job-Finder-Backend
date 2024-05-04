const { body, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const prisma = require("../../models/prismaClient.js");

const createReviewRules = [
  body("rating")
    .notEmpty()
    .withMessage("rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isString()
    .withMessage("comment must be a string")
    .trim(),
];

const updateReviewRules = [
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isString()
    .withMessage("comment must be a string")
    .trim(),
];

const reviewValidator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: errors.array()[0].msg });
  }
  next();
};

module.exports = {
  createReviewRules,
  updateReviewRules,
  reviewValidator,
};
