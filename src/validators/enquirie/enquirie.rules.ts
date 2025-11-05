import { body, CustomValidator, Meta } from "express-validator";
import {
  EMAIL_IS_REQUIRED,
  EMAIL_LENGTH_MIN_MAX,
  FIRST_NAME_IS_NON_EMPTY_STRING,
  FIRST_NAME_IS_REQUIRED,
  FIRST_NAME_LENGTH_MIN_MAX,
  INVALID_EMAIL,
  LAST_NAME_IS_NON_EMPTY_STRING,
  LAST_NAME_IS_REQUIRED,
  LAST_NAME_LENGTH_MIN_MAX,
  MESSAGE_IS_NON_EMPTY_STRING,
  MESSAGE_IS_REQUIRED,
  NAME_IS_REQUIRED,
} from "../../utils/app-messages";
import {
  EMAIL_LENGTH_MAX,
  EMAIL_LENGTH_MIN,
  NAME_LENGTH_MAX,
  NAME_LENGTH_MIN,
} from "../validation.constant";
import {
  fieldBitChain,
  fieldIntegerChain,
  fieldStringMinMaxChain,
} from "../common-validation-rules";

const checkOnlyAI = (onlyAI: boolean, req: Meta["req"]) => {
  if (onlyAI) {
    return !Object.keys(req.body).includes("only_active_inactive");
  }
  return true;
};

const validateIf =
  (onlyAI: boolean): CustomValidator =>
  (input, { req }) =>
    checkOnlyAI(onlyAI, req);

const firstNameChain = (onlyAI: boolean) =>
  body("first_name")
    .if(validateIf(onlyAI))
    .exists()
    .withMessage(FIRST_NAME_IS_REQUIRED)
    .isString()
    .withMessage(FIRST_NAME_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(FIRST_NAME_IS_NON_EMPTY_STRING)
    .isLength({
      min: NAME_LENGTH_MIN,
      max: NAME_LENGTH_MAX,
    })
    .withMessage(FIRST_NAME_LENGTH_MIN_MAX)
    .trim();

const lastNameChain = (onlyAI: boolean) =>
  body("last_name")
    .if(validateIf(onlyAI))
    .exists()
    .withMessage(LAST_NAME_IS_REQUIRED)
    .isString()
    .withMessage(LAST_NAME_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(LAST_NAME_IS_NON_EMPTY_STRING)
    .isLength({
      min: NAME_LENGTH_MIN,
      max: NAME_LENGTH_MAX,
    })
    .withMessage(LAST_NAME_LENGTH_MIN_MAX)
    .trim();

const emailChain = (onlyAI: boolean) =>
  body("email")
    .if(validateIf(onlyAI))
    .exists()
    .withMessage(EMAIL_IS_REQUIRED)
    .isEmail()
    .withMessage(INVALID_EMAIL)
    .isLength({
      min: EMAIL_LENGTH_MIN,
      max: EMAIL_LENGTH_MAX,
    })
    .withMessage(EMAIL_LENGTH_MIN_MAX)
    .trim();

const messageChain = (onlyAI: boolean) =>
  body("message")
    .if(validateIf(onlyAI))
    .exists()
    .withMessage(MESSAGE_IS_REQUIRED)
    .isString()
    .withMessage(MESSAGE_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(MESSAGE_IS_NON_EMPTY_STRING)
    .trim();

export const addEnquiriesValidationRule = [
  firstNameChain(false),
  emailChain(false),
  messageChain(false),
];

export const addProductEnquiriesValidationRule = [
  fieldStringMinMaxChain("full name", "full_name", 2, 100),
  emailChain(false),
  messageChain(false),
];

export const addSubscriptionsValidationRule = [emailChain(true)];

export const activeInactiveSubscriptionRule = [
  fieldIntegerChain("subscription id", "id"),
  fieldBitChain("Is subscribe", "is_subscribe"),
];
