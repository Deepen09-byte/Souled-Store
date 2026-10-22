import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const [error] = errors.array();
        return res.status(400).json({
            success: false,
            message: error.msg,
            field: error.path,
        });
    }

    next();
}

export const validateRegister = [
  body("email").isEmail().withMessage("Please provide a valid email address."),
  body("contact")
    .isString()
    .withMessage("Contact number must be a string.")
    .bail()
    .notEmpty()
    .withMessage("Contact number is required.")
    .bail()
    .customSanitizer((value) => value.replace(/[\s()-]/g, ""))
    .isMobilePhone()
    .withMessage("Please provide a valid contact number."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
  body("fullName").notEmpty().withMessage("Full name is required."),
  body("isSeller")
  .isBoolean().withMessage("isSeller must be a boolean value."),

    validateRequest
];

export const validateLogin = [
  body("email").isEmail().withMessage("Please provide a valid email address."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),

  validateRequest
];