import { body, param, query, ValidationChain } from "express-validator";
import { BIT_FIELD_VALUES, PASSWORD_REGEX } from "../utils/app-constants";
import {
  CONFIRM_PASSWORD_IS_REQUIRED,
  DUPLICATE_VALUE_ERROR_MESSAGE,
  INVALID_PASSWORD,
  IS_ACTIVE_EXPECTED_TYPE_STRING,
  IS_ACTIVE_REQUIRED,
  MIN_MAX_LENGTH_ERROR_MESSAGE,
  ONLY_AI_EXPECTED_TYPE_STRING,
  PASSWORD_IS_REQUIRED,
  PASSWORD_MUST_BE_SAME,
  PASSWORD_TYPE_NON_EMPTY_STRING,
  REQUIRED_ERROR_MESSAGE,
  TYPE_ARRAY_ERROR_MESSAGE,
  TYPE_BIT_ERROR_MESSAGE,
  TYPE_DECIMAL_ERROR_MESSAGE,
  TYPE_MIN_MAX_FLOAT_ERROR_MESSAGE,
  TYPE_INTEGER_ERROR_MESSAGE,
  TYPE_NON_EMPTY_STRING_ERROR_MESSAGE,
  TYPE_ARRAY_NON_EMPTY_ERROR_MESSAGE,
  TYPE_SHOULD_ERROR_MESSAGE,
  TYPE_FLOAT_ERROR_MESSAGE,
  TYPE_BOOLEAN_ERROR_MESSAGE,
  FIXED_LENGTH_INTEGER_ERROR_MESSAGE,
  ERROR_INVALID_MASSAGE,
  FIELD_IS_REQUIRED,
  MUST_BE_STRING,
  CAN_NOT_BE_EMPTY,
  ONLY_SMALL_CAPITAL_UNDERSCORES_OR_HYPHENS_ALLOWED,
} from "../utils/app-messages";
import { prepareMessageFromParams } from "../utils/shared-functions";
import { EMAIL_LENGTH_MAX, EMAIL_LENGTH_MIN, PHONE_NUMBER_LENGTH_MAX, PHONE_NUMBER_LENGTH_MIN } from "./validation.constant";

export const isActiveChain = body("is_active")
  .exists()
  .withMessage(IS_ACTIVE_REQUIRED)
  .isString()
  .withMessage(IS_ACTIVE_EXPECTED_TYPE_STRING)
  .isIn(BIT_FIELD_VALUES)
  .withMessage(IS_ACTIVE_EXPECTED_TYPE_STRING);

export const isOnlyAIChain = body("only_active_inactive")
  .optional()
  .isString()
  .withMessage(ONLY_AI_EXPECTED_TYPE_STRING)
  .isIn(BIT_FIELD_VALUES)
  .withMessage(ONLY_AI_EXPECTED_TYPE_STRING);

export const passwordChain = body("password")
  .exists()
  .withMessage(PASSWORD_IS_REQUIRED)
  .isString()
  .withMessage(PASSWORD_TYPE_NON_EMPTY_STRING)
  .not()
  .isEmpty()
  .withMessage(PASSWORD_TYPE_NON_EMPTY_STRING)
  .matches(PASSWORD_REGEX)
  .withMessage(INVALID_PASSWORD);

export const confirmPasswordChain = body("confirm_password")
  .exists()
  .withMessage(CONFIRM_PASSWORD_IS_REQUIRED)
  .custom(async (confirmPassword, { req }) => {
    if (req.body.password !== confirmPassword) {
      throw false;
    }
  })
  .withMessage(PASSWORD_MUST_BE_SAME);

export const fieldStringMinMaxChain = (
  name: string,
  field: string,
  min: number,
  max: number
) =>
  body(field)
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]])
    )
    .isString()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    )
    .not()
    .isEmpty()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    )
    .trim()
    .isLength({
      min,
      max,
    })
    .withMessage(
      prepareMessageFromParams(MIN_MAX_LENGTH_ERROR_MESSAGE, [
        ["field_name", name],
        ["min", min.toString()],
        ["max", max.toString()],
      ])
    );

export const fieldEmailChain = (
  name: string,
  field: string
) =>
  body(field)
    .exists()
    .withMessage(prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]]))
    .isEmail()
    .withMessage(prepareMessageFromParams(ERROR_INVALID_MASSAGE, [["field_name", name]]))
    .isLength({
      min: EMAIL_LENGTH_MIN,
      max: EMAIL_LENGTH_MAX,
    })
    .withMessage(prepareMessageFromParams(MIN_MAX_LENGTH_ERROR_MESSAGE, [["field_name", name], ["min", EMAIL_LENGTH_MIN.toString()], ["max", EMAIL_LENGTH_MAX.toString()]]))
    .trim();

    export const fieldPhoneNumberChain = (
      name: string,
      field: string
    ) =>
     body(field)
         .exists()
         .withMessage(prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]]))
         .isString()
         .withMessage(prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
          ["field_name", name],
        ]))
         .not()
         .isEmpty()
         .withMessage(prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
          ["field_name", name],
        ]))
        .matches(/^(?:\+?\d{1,3}\s?)?\d{10}$/)
        .withMessage(prepareMessageFromParams(ERROR_INVALID_MASSAGE, [["field_name", name]]))
         .isLength({
           min: PHONE_NUMBER_LENGTH_MIN,
           max: PHONE_NUMBER_LENGTH_MAX,
         })
         .withMessage(prepareMessageFromParams(MIN_MAX_LENGTH_ERROR_MESSAGE, [["field_name", name], ["min", PHONE_NUMBER_LENGTH_MIN.toString()], ["max", PHONE_NUMBER_LENGTH_MAX.toString()]]))
         .trim();
export const fieldStringNotReqChain = (name: string, field: string) => {
  return body(field)
    .optional()
    .isString()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    )
    .trim();
};

export const fieldStringChain = (name: string, field: string) =>
  body(field)
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]])
    )
    .isString()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    )
    .not()
    .isEmpty()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    )
    .trim();

export const fieldIntegerChain = (name: string, field: string) =>
  body(field)
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]])
    )
    .isInt()
    .withMessage(
      prepareMessageFromParams(TYPE_INTEGER_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    );

export const fieldIntegerNotReqChain = (name: string, field: string) =>
  body(field)
    .optional()
    .isInt()
    .withMessage(
      prepareMessageFromParams(TYPE_INTEGER_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    );


export const fieldStringCheckInArrayChain = (
  name: string,
  field: string,
  list: any,
  value1: any,
  value2: any
) =>
  body(field)
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]])
    )
    .isString()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    )
    .not()
    .isEmpty()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    )
    .isIn(list)
    .withMessage(
      prepareMessageFromParams(TYPE_SHOULD_ERROR_MESSAGE, [
        ["field_name", name],
        ["value1", value1],
        ["value2", value2],
      ])
    );

export const fieldIntegerOptionalChain = (name: string, field: string) =>
  body(field)
    .optional()
    .isInt()
    .withMessage(
      prepareMessageFromParams(TYPE_INTEGER_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    );

export const fieldDecimalChain = (name: string, field: string) =>
  body(field)
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]])
    )
    .isDecimal()
    .withMessage(
      prepareMessageFromParams(TYPE_DECIMAL_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    );
export const fieldDecimalOptionalChain = (name: string, field: string) =>
  body(field)
    .optional()
    .isDecimal()
    .withMessage(
      prepareMessageFromParams(TYPE_DECIMAL_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    );
export const fieldFloatMinMaxChain = (
  name: string,
  field: string,
  min: number,
  max: number
) =>
  body(field)
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]])
    )
    .isFloat({ min, max })
    .withMessage(
      prepareMessageFromParams(TYPE_MIN_MAX_FLOAT_ERROR_MESSAGE, [
        ["field_name", name],
        ["min", min.toString()],
        ["max", max.toString()],
      ])
    );

export const fieldFloatMinMaxOptionalChain = (
  name: string,
  field: string,
  min: number,
  max: number
) =>
  body(field)
    .optional()
    .isFloat({ min, max })
    .withMessage(
      prepareMessageFromParams(TYPE_MIN_MAX_FLOAT_ERROR_MESSAGE, [
        ["field_name", name],
        ["min", min.toString()],
        ["max", max.toString()],
      ])
    );

export const fieldArrayChain = (name: string, field: string) =>
  body(field)
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]])
    )
    .isArray()
    .withMessage(
      prepareMessageFromParams(TYPE_ARRAY_ERROR_MESSAGE, [["field_name", name]])
    );

export const fieldUniqueValueArrayChain = (
  name: string,
  field: string,
  min: number
) =>
  body(field)
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]])
    )
    .isArray({ min })
    .withMessage(
      prepareMessageFromParams(
        min > 0 ? TYPE_ARRAY_NON_EMPTY_ERROR_MESSAGE : TYPE_ARRAY_ERROR_MESSAGE,
        [["field_name", name]]
      )
    )
    .custom((input, meta) => {
      for (const [index, value] of input.entries()) {
        if (input.indexOf(value) !== index) {
          return false;
        }
      }
      return true;
    })
    .withMessage(
      prepareMessageFromParams(DUPLICATE_VALUE_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    );

export const fieldUniqueValueArrayChainOptional = (
  name: string,
  field: string
) =>
  body(field)
    .optional()

    .isArray()
    .withMessage(
      prepareMessageFromParams(TYPE_ARRAY_ERROR_MESSAGE, [["field_name", name]])
    )
    .custom((input, meta) => {
      for (const [index, value] of input.entries()) {
        if (input.indexOf(value) !== index) {
          return false;
        }
      }
      return true;
    })
    .withMessage(
      prepareMessageFromParams(DUPLICATE_VALUE_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    );

export const fieldBitChain = (name: string, field: string) =>
  body(field)
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]])
    )
    .isString()
    .withMessage(
      prepareMessageFromParams(TYPE_BIT_ERROR_MESSAGE, [["field_name", name]])
    )
    .isIn(BIT_FIELD_VALUES)
    .withMessage(
      prepareMessageFromParams(TYPE_BIT_ERROR_MESSAGE, [["field_name", name]])
    );
export const fieldDoublePrecisionChain = (name: string, field: string) =>
  body(field)
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]])
    )
    .isFloat()
    .withMessage(
      prepareMessageFromParams(TYPE_FLOAT_ERROR_MESSAGE, [["field_name", name]])
    );

export const fieldBooleanChain = (name: string, field: string) =>
  body(field)
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]])
    )
    .isBoolean()
    .withMessage(
      prepareMessageFromParams(TYPE_BOOLEAN_ERROR_MESSAGE, [["field_name", name]])
  );
    
export const fieldIntegerLengthChain = (
  name: string,
  field: string,
  length: number
) =>
  body(field)
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]])
    )
    .isInt()
    .withMessage(
      prepareMessageFromParams(TYPE_INTEGER_ERROR_MESSAGE, [
        ["field_name", name],
      ])
    )
    .custom((value) => {
      if (value.toString().length !== length) {
        throw new Error();
      }
      return true;
    })
    .withMessage(
      prepareMessageFromParams(FIXED_LENGTH_INTEGER_ERROR_MESSAGE, [
        ["field_name", name],
        ["length", length.toString()],
      ])
  );
    
export const fieldLinkChain = (
  name: string,
  field: string) =>
  body(field)
  .exists()
  .withMessage(prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", name]]))
  .isString()
  .withMessage(prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [["field_name", name]]))
  .not()
  .isEmpty()
  .withMessage(prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [["field_name", name]]))
  .isURL()
  .withMessage(prepareMessageFromParams(ERROR_INVALID_MASSAGE, [["field_name", name]]));


/**
 * Returns a validation chain that validates the field location,
 * requiring only letters, underscores, or hyphens.
 */
export function fieldAlphaHyphenUnderscore(
  field: string,
  fieldLabel: string,
  location: "body" | "query" | "param" = "body"
): ValidationChain {
  let validator: ReturnType<typeof body | typeof query | typeof param>;

  switch (location) {
    case "query":
      validator = query(field);
      break;
    case "param":
      validator = param(field);
      break;
    case "body":
    default:
      validator = body(field);
  }

  return validator
    .exists()
    .withMessage(
      prepareMessageFromParams(FIELD_IS_REQUIRED, [["field_name", fieldLabel]])
    )
    .isString()
    .withMessage(
      prepareMessageFromParams(MUST_BE_STRING, [["field_name", fieldLabel]])
    )
    .not()
    .isEmpty()
    .withMessage(
      prepareMessageFromParams(CAN_NOT_BE_EMPTY, [["field_name", fieldLabel]])
    )
    .matches(/^[A-Za-z_-]+$/)
    .withMessage(
      prepareMessageFromParams(ONLY_SMALL_CAPITAL_UNDERSCORES_OR_HYPHENS_ALLOWED
        ,
        [["field_name", fieldLabel]]
      )
    )
    .trim();
}
