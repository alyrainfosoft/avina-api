import { body } from "express-validator";
import { COPYRIGHT_IS_NON_EMPTY_STRING, COPYRIGHT_IS_REQUIRED, EMAIL_IS_REQUIRED, INVALID_EMAIL, NAME_IS_NON_EMPTY_STRING, NAME_IS_REQUIRED, PHONE_NUMBER_IS_NON_EMPTY_STRING, PHONE_NUMBER_IS_REQUIRED } from "../../utils/app-messages";

export const companyInfoValidationRule = [
    body("company_name")
    .exists()
    .withMessage(NAME_IS_REQUIRED)
    .isString()
    .withMessage(NAME_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(NAME_IS_NON_EMPTY_STRING),
    body("company_email")
  .exists()
  .withMessage(EMAIL_IS_REQUIRED)
  .isEmail()
  .withMessage(INVALID_EMAIL),
  body("company_phone")
  .exists()
  .withMessage(PHONE_NUMBER_IS_REQUIRED)
  .isString()
  .withMessage(PHONE_NUMBER_IS_NON_EMPTY_STRING)
  .not()
  .isEmpty()
  .withMessage(PHONE_NUMBER_IS_NON_EMPTY_STRING),
  body("copy_right")
  .exists()
  .withMessage(COPYRIGHT_IS_REQUIRED)
  .isString()
  .withMessage(COPYRIGHT_IS_NON_EMPTY_STRING)
  .not()
  .isEmpty()
  .withMessage(COPYRIGHT_IS_NON_EMPTY_STRING),

]