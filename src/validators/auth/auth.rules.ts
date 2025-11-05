import { body } from "express-validator";
import {
  PASSWORD_REGEX,
  SING_UP_TYPE_LIST,
  USER_TYPE_LIST,
} from "../../utils/app-constants";
import { SIGN_UP_TYPE, USER_TYPE } from "../../utils/app-enumeration";
import {
  CONFIRM_PASSWORD_IS_REQUIRED,
  ERROR_INVALID_MASSAGE,
  ID_APP_USER_TYPE_INTEGER,
  INVALID_PASSWORD,
  INVALID_USERNAME,
  NAME_IS_NON_EMPTY_STRING,
  NAME_IS_REQUIRED,
  PASSWORD_IS_REQUIRED,
  PASSWORD_MUST_BE_SAME,
  PASSWORD_TYPE_NON_EMPTY_STRING,
  PHONE_NUMBER_IS_NON_EMPTY_STRING,
  PHONE_NUMBER_IS_REQUIRED,
  PHONE_NUMBER_LENGTH_MIN_MAX,
  REQUIRED_ERROR_MESSAGE,
  TYPE_NON_EMPTY_STRING_ERROR_MESSAGE,
  USERNAME_IS_REQUIRED,
} from "../../utils/app-messages";
import { prepareMessageFromParams } from "../../utils/shared-functions";
import {  fieldAlphaHyphenUnderscore, passwordChain } from "../common-validation-rules";
import {
  PHONE_NUMBER_LENGTH_MAX,
  PHONE_NUMBER_LENGTH_MIN,
} from "../validation.constant";

const usernameChain = body("username")
  .exists()
  .withMessage(USERNAME_IS_REQUIRED)
  .isEmail()
  .withMessage(INVALID_USERNAME)
  .trim();

const newPasswordChain = body("new_password")
  .exists()
  .withMessage(
    prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
      ["field_name", "New password"],
    ])
  )
  .isString()
  .withMessage(
    prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
      ["field_name", "New password"],
    ])
  )
  .not()
  .isEmpty()
  .withMessage(
    prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
      ["field_name", "New password"],
    ])
  )
  .matches(PASSWORD_REGEX)
  .withMessage(INVALID_PASSWORD)
  .trim();

export const registerUserValidationRule = [
  body("username")
    .exists()
    .withMessage("Username is required!")
    .isEmail()
    .withMessage("Invalid username!"),
  body("password")
    .exists()
    .withMessage("Password is required!")
    .isString()
    .withMessage("Password must be a string!")
    .not()
    .isEmpty()
    .withMessage("Password should not be empty string!")
    .matches(PASSWORD_REGEX)
    .withMessage("Invalid password"),
  body("confirm_password")
    .exists()
    .withMessage("Confirm password is required!")
    .custom(async (confirmPassword, { req }) => {
      if (req.body.password !== confirmPassword) {
        throw false;
      }
    })
    .withMessage(PASSWORD_MUST_BE_SAME),
  body("user_type")
    .exists()
    .withMessage("User type is required!")
    .isInt()
    .withMessage("User type must be a integer!")
    .custom(async (userType) => {
      if (!USER_TYPE_LIST.includes(userType)) {
        throw false;
      }
    })
    .withMessage("Invalid user type!"),
];

export const registerCustomerValidationRule = [
  body("username")
    .exists()
    .withMessage(USERNAME_IS_REQUIRED)
    .isEmail()
    .withMessage(INVALID_USERNAME),
  body("password")
    .exists()
    .withMessage(PASSWORD_IS_REQUIRED)
    .isString()
    .withMessage(PASSWORD_TYPE_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(PASSWORD_TYPE_NON_EMPTY_STRING)
    .matches(PASSWORD_REGEX)
    .withMessage(INVALID_PASSWORD),
  body("confirm_password")
    .exists()
    .withMessage(CONFIRM_PASSWORD_IS_REQUIRED)
    .custom(async (confirmPassword, { req }) => {
      if (req.body.password !== confirmPassword) {
        throw false;
      }
    })
    .withMessage(PASSWORD_MUST_BE_SAME),

  body("full_name")
    .exists()
    .withMessage(NAME_IS_REQUIRED)
    .isString()
    .withMessage(NAME_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(NAME_IS_NON_EMPTY_STRING),
];

export const registerCustomerWithThirdPartyValidationRule = [
  body("username")
    .if(
      (value, { req }) =>
        req.body.sign_up_type &&
        [SIGN_UP_TYPE.System, SIGN_UP_TYPE.Google].includes(
          req.body.sign_up_type
        )
    )
    .exists()
    .withMessage(USERNAME_IS_REQUIRED)
    .isEmail()
    .withMessage(INVALID_USERNAME),

  body("full_name")
    .if((value, { req }) => req.body.sign_up_type !== SIGN_UP_TYPE.CadcoPanel)
    .exists()
    .withMessage(NAME_IS_REQUIRED)
    .isString()
    .withMessage(NAME_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(NAME_IS_NON_EMPTY_STRING),
  body("mobile")
    .if((value, { req }) => req.body.sign_up_type === SIGN_UP_TYPE.System)
    .exists()
    .withMessage(PHONE_NUMBER_IS_REQUIRED)
    .isString()
    .withMessage(PHONE_NUMBER_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(PHONE_NUMBER_IS_NON_EMPTY_STRING)
    .isLength({
      min: PHONE_NUMBER_LENGTH_MIN,
      max: PHONE_NUMBER_LENGTH_MAX,
    })
    .withMessage(PHONE_NUMBER_LENGTH_MIN_MAX),
  body("sign_up_type")
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field_name", "Sign up type"],
      ])
    )
    .isString()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", "Sign up type"],
      ])
    )
    .custom(async (type) => {
      if (!SING_UP_TYPE_LIST.includes(type)) {
        throw false;
      }
    })
    .withMessage(
      prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
        ["type", "Sign up type"],
      ])
    ),

  body("password")
    .if((value, { req }) => req.body.sign_up_type === "system") // Apply only for 'system' sign-ups
    .exists()
    .withMessage(PASSWORD_IS_REQUIRED)
    .isString()
    .withMessage(PASSWORD_TYPE_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(PASSWORD_TYPE_NON_EMPTY_STRING)
    .matches(PASSWORD_REGEX)
    .withMessage(INVALID_PASSWORD),

  body("confirm_password")
    .if((value, { req }) => req.body.sign_up_type === "system") // Apply only for 'system' sign-ups
    .exists()
    .withMessage(CONFIRM_PASSWORD_IS_REQUIRED)
    .custom(async (confirmPassword, { req }) => {
      if (req.body.password !== confirmPassword) {
        throw new Error(PASSWORD_MUST_BE_SAME);
      }
    }),
];

export const loginValidationRule = [usernameChain, passwordChain];
export const vfourloginValidationRule = [usernameChain, passwordChain,fieldAlphaHyphenUnderscore("company_key", "Company Key"),
];
export const resendOtpValidationRule = [
    fieldAlphaHyphenUnderscore("company_key", "Company Key","query"),  
];

export const customerLoginValidationRule = [
  body("username")
    .exists()
    .withMessage(USERNAME_IS_REQUIRED)
    .isString()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", "Username"],
      ])
    )
    .not()
    .isEmpty()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", "Username"],
      ])
    ),  
];


export const changePasswordnValidationRule = [
  body("old_password")
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field_name", "Old password"],
      ])
    )
    .isString()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", "Old password"],
      ])
    )
    .not()
    .isEmpty()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", "Old password"],
      ])
    ),
  newPasswordChain,
  body("confirm_password")
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field_name", "Confirm password"],
      ])
    )
    .custom(async (confirmPassword, { req }) => {
      if (req.body.new_password !== confirmPassword) {
        throw false;
      }
    })
    .withMessage(PASSWORD_MUST_BE_SAME),
];

export const forgotPasswordValidationRule = [usernameChain];

export const resetPasswordValidationRule = [
  newPasswordChain,
  body("token")
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field_name", "Token"],
      ])
    )
    .isString()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", "Token"],
      ])
    )
    .not()
    .isEmpty()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", "Token"],
      ])
    ),
];

export const refreshTokenValidationRule = [
  body("refresh_token")
    .exists()
    .withMessage("Refresh token is required!")
    .isString()
    .withMessage("Refresh token must be a string!")
    .not()
    .isEmpty()
    .withMessage("Refresh token should not be empty string!"),
];

export const changeAnyUserPasswordValidationRule = [
  body("id_app_user")
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field_name", "App user id"],
      ])
    )
    .isInt()
    .withMessage(ID_APP_USER_TYPE_INTEGER),
  newPasswordChain,
];
