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

const loginRules = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .trim()
    .isEmail()
    .withMessage("Email is invalid"),
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
];

const registerTaskerRules = [
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .trim()
    .custom(async (email) => {
      const user = await prisma.tasker.findUnique({ where: { email } });
      if (user) {
        return Promise.reject("Email already in use");
      }
    }),
  // body("addresses")
  //   .notEmpty()
  //   .withMessage("Addresses are required")
  //   .isArray({ min: 1 }),
  // body("addresses.*").custom(async (value, { req }) => {
  //   // Iterate over each address in addresses array
  //   for (const address of req.body.addresses) {
  //     // Check if address exists in the database
  //     const existingAddress = await prisma.address.findUnique({
  //       where: {
  //         wilaya: address.wilaya,
  //         commune: address.commune
  //       }
  //     });

  //     // If address does not exist, throw an error
  //     if (!existingAddress) {
  //       throw new Error(`Address ${address.wilaya}, ${address.commune} does not exist`);
  //     }
  //   }
  //   // If all addresses exist, return true
  //   return true;
  // })
];

const registerClientRules = [
  custom(async (email) => {
    const user = await prisma.client.findUnique({ where: { email } });
    if (user) {
      return Promise.reject("Email already in use");
    }
  }),
];

// const updateRules = [
//   body('newPassword')
//     .optional()
//     .trim()
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters'),
//   body('email')
//     .optional()
//     .trim()
//     .custom(async (email, { req }) => {
//       if (email === req.user.email) {
//         return;
//       }
//       const user = await prisma.user.findUnique({ where: { email } });
//       if (user) {
//         return Promise.reject('Email already in use');
//       }
//     }),
// ];
const authValidator = (req, res, next) => {
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
  loginRules,
  registerClientRules,
  registerTaskerRules,
  authValidator,
};
