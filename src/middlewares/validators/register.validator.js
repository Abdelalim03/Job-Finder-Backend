const { body, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const prisma = require("../../models/prismaClient");

const registerRules = [
  body("firstName").notEmpty().withMessage("First name is required").trim(),
  body("lastName").notEmpty().withMessage("Last name is required").trim(),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .trim()
    .isEmail()
    .withMessage("Email is invalid")
    .normalizeEmail()
    .custom(async (email) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        return Promise.reject("Email already in use");
      }
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[A-Z])[ -~]*$/)
    .withMessage(
      "Password must contain at least one uppercase letter and can contain only printable characters"
    ),

  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .trim()
    .isNumeric()
    .withMessage("Phone number must contain only numeric characters")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be 10 digits long")
    .custom((value) => {
      if (
        !(
          value.startsWith("05") ||
          value.startsWith("06") ||
          value.startsWith("07")
        )
      ) {
        throw new Error("Phone number must start with 05|06|07");
      }
      return true;
    }),
];

const registerTaskerRules = [
  body("description").notEmpty().withMessage("Description is required").trim(),
  // body("addresses")
  //   .notEmpty()
  //   .withMessage("addresses are required")
  //   .trim()
  //   .isArray({ min: 1 }),
];

// const updateRules = [
//   body('newPassword')
//     .optional()
//     .trim()
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters'),
//   body('username')
//     .optional()
//     .trim()
//     .isLength({ min: 3, max: 20 })
//     .withMessage('Username must be between 3 and 20 characters')
//     .matches(/^[A-Za-z0-9]+$/)
//     .withMessage('Username must only include alphanumeric characters')
//     .custom(async (username, { req }) => {
//       if (username === req.user.username) {
//         return;
//       }
//       const user = await prisma.user.findUnique({ where: { username } });
//       if (user) {
//         return Promise.reject('Username already in use');
//       }
//     }),
// ];
const registerValidator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: errors.array()[0].msg });
  }
  next();
};

module.exports = {
  registerRules,
  // updateRules,
  registerTaskerRules,
  registerValidator,
};
