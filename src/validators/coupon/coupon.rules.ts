import { body, CustomValidator, Meta, Schema } from "express-validator";
import {
  fieldStringChain,
  fieldStringCheckInArrayChain,
} from "../common-validation-rules";
import {
  COUPON_DISCOUNT_TYPE_LIST,
  COUPON_DURATION_LIST,
} from "../../utils/app-constants";
import {
  COUPON_DISCOUNT_TYPE,
  COUPON_DURATION,
} from "../../utils/app-enumeration";
import { prepareMessageFromParams } from "../../utils/shared-functions";
import {
  COUPON_CURRENCY_REQUIRED_MESSAGE,
  COUPON_MIN_AMOUNT_DISCOUNT_AMOUNT_ERROR,
  DATE_FORMAT_ERROR,
  ERROR_AMOUNT_INVALID,
  ERROR_AMOUNT_NEGATIVE,
  ERROR_FUTURE_DATE,
  ERROR_MAX_GREATER_THAN_MIN,
  ERROR_ORDER_DATE,
  ERROR_PERCENTAGE_INVALID,
  ERROR_PERCENTAGE_TOO_LOW_AND_HIGH,
  ERROR_VALID_DATE,
  REQUIRED_ERROR_MESSAGE,
  TYPE_NON_EMPTY_STRING_ERROR_MESSAGE,
} from "../../utils/app-messages";

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

export const addCouponValidationRule = [
  fieldStringChain("name", "name"),
  fieldStringChain("coupon_code", "coupon_code"),
  fieldStringCheckInArrayChain(
    "Discount Type",
    "discount_type",
    COUPON_DISCOUNT_TYPE_LIST,
    COUPON_DISCOUNT_TYPE.PercentageDiscount,
    COUPON_DISCOUNT_TYPE.FixedAmountDiscount
  ),
  fieldStringCheckInArrayChain(
    "Duration",
    "duration",
    COUPON_DURATION_LIST,
    COUPON_DURATION.Forever,
    COUPON_DURATION.Once
  ),
  body("percentage_off").custom((value, { req }) => {
    const { discount_type } = req.body;
    if (discount_type === COUPON_DISCOUNT_TYPE.PercentageDiscount) {
      if (value === undefined || value === null || value === "") {
        throw new Error(
          prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field", "percentage_off"],
          ])
        );
      }
      if (isNaN(value)) {
        throw new Error(ERROR_PERCENTAGE_INVALID);
      }
      if (value < 0 || value > 100) {
        console.log(value);
        throw new Error(ERROR_PERCENTAGE_TOO_LOW_AND_HIGH);
      }
    }
    return true;
  }),
  body("discount_amount").custom((value, { req }) => {
    const { discount_type } = req.body;
    // Validate fixed_amount based on type
    if (discount_type === COUPON_DISCOUNT_TYPE.FixedAmountDiscount) {
      if (value === undefined || value === null || value === "") {
        throw new Error(ERROR_AMOUNT_INVALID);
      }
      if (isNaN(value) || value < 0) {
        throw new Error(ERROR_AMOUNT_NEGATIVE);
      }
    }

    return true;
  }),
  body("usage_limit")
    .optional({ checkFalsy: true }) // Optional and will check for falsy values like '' or null
    .isFloat({ min: 0 }), // Allows the field to be omitted

  body("start_date")
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field", "Start Date"],
      ])
    )
    .custom((value, { req }) => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(value)) {
        throw new Error(DATE_FORMAT_ERROR);
      }
      const start_date = new Date(value);
      if (isNaN(start_date.getTime())) {
        throw new Error(
          prepareMessageFromParams(ERROR_VALID_DATE, [["field", "Start Date"]])
        );
      }
      if (start_date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
        throw new Error(
          prepareMessageFromParams(ERROR_FUTURE_DATE, [["field", "Start Date"]])
        );
      }
      req.body.start_date = start_date; // Store as Date object for comparison
      return true;
    }),
  body("end_date")
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field", "End Date"]])
    )

    .custom((value, { req }) => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(value)) {
        throw new Error(DATE_FORMAT_ERROR);
      }
      const { start_date } = req.body;
      const end_date = new Date(value);
      if (isNaN(end_date.getTime())) {
        throw new Error(
          prepareMessageFromParams(ERROR_VALID_DATE, [["field", "End Date"]])
        );
      }
      if (end_date <= new Date()) {
        throw new Error(
          prepareMessageFromParams(ERROR_FUTURE_DATE, [["field", "End Date"]])
        );
      }
      // Ensure 'start_date' is before 'end_date'
      if (start_date && end_date <= start_date) {
        throw new Error(
          prepareMessageFromParams(ERROR_ORDER_DATE, [
            ["field1", "Start Date"],
            ["field2", "End Date"],
          ])
        );
      }
      req.body.end_date = end_date; // Store as Date object for comparison
      return true;
    }),
  body("min_total_amount")
    .isFloat({ min: 0 })
    .withMessage(ERROR_AMOUNT_INVALID)
    .custom((value, { req }) => {
      const { discount_type, discount_amount } = req.body;
      // Validate fixed_amount based on type
      if (
        discount_type === COUPON_DISCOUNT_TYPE.FixedAmountDiscount &&
        value <= discount_amount
      ) {
        throw new Error(COUPON_MIN_AMOUNT_DISCOUNT_AMOUNT_ERROR);
      }
      return true;
    }),
  body("max_total_amount")
    .isFloat({ min: 0 })
    .withMessage(ERROR_AMOUNT_INVALID)
    .custom((value, { req }) => {
      const { min_total_amount } = req.body;
      if (min_total_amount && min_total_amount >= value) {
        throw new Error(
          prepareMessageFromParams(ERROR_MAX_GREATER_THAN_MIN, [
            ["maxValue", `${value}`],
            ["minValue", `${min_total_amount}`],
          ])
        );
      }
      req.body.max_total_amount = value; // Store as Date object for comparison
      return true;
    }),
  body("maximum_discount_amount")
    .optional({ checkFalsy: true }) // Optional and will check for falsy values like '' or null
    .isFloat({ min: 0 }) // Validate that it's a float and >= 0
    .withMessage(ERROR_AMOUNT_INVALID)
    .toFloat(), // Convert to float (if you need to ensure type conversion)
];

export const updateCouponValidationRule = [
  fieldStringChain("name", "name"),
  fieldStringChain("coupon_code", "coupon_code"),
  fieldStringCheckInArrayChain(
    "Discount Type",
    "discount_type",
    COUPON_DISCOUNT_TYPE_LIST,
    COUPON_DISCOUNT_TYPE.PercentageDiscount,
    COUPON_DISCOUNT_TYPE.FixedAmountDiscount
  ),
  fieldStringCheckInArrayChain(
    "Duration",
    "duration",
    COUPON_DURATION_LIST,
    COUPON_DURATION.Forever,
    COUPON_DURATION.Once
  ),
  body("percentage_off").custom((value, { req }) => {
    const { discount_type } = req.body;
    if (discount_type === COUPON_DISCOUNT_TYPE.PercentageDiscount) {
      if (value === undefined || value === null || value === "") {
        throw new Error(
          prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field", "percentage_off"],
          ])
        );
      }
      if (isNaN(value)) {
        throw new Error(ERROR_PERCENTAGE_INVALID);
      }
      if (value < 0 || value > 100) {
        console.log(value);
        throw new Error(ERROR_PERCENTAGE_TOO_LOW_AND_HIGH);
      }
    }
    return true;
  }),
  body("discount_amount").custom((value, { req }) => {
    const { discount_type } = req.body;
    // Validate fixed_amount based on type
    if (discount_type === COUPON_DISCOUNT_TYPE.FixedAmountDiscount) {
      if (value === undefined || value === null || value === "") {
        throw new Error(ERROR_AMOUNT_INVALID);
      }
      if (isNaN(value) || value < 0) {
        throw new Error(ERROR_AMOUNT_NEGATIVE);
      }
    }

    return true;
  }),

  body("discount_amount_currency")
    .isISO4217()
    .custom((value, { req }) => {
      const { discount_type } = req.body;
      // Validate fixed_amount based on type
      if (discount_type === COUPON_DISCOUNT_TYPE.FixedAmountDiscount) {
        if (value === undefined || value === null || value === "") {
          throw new Error(COUPON_CURRENCY_REQUIRED_MESSAGE);
        }
      }
      return true;
    })
    .optional({ checkFalsy: true }),
  body("usage_limit")
    .optional({ checkFalsy: true }) // Optional and will check for falsy values like '' or null
    .isFloat({ min: 0 }), // Allows the field to be omitted

  body("end_date")
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field", "End Date"]])
    )

    .custom((value, { req }) => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(value)) {
        throw new Error(DATE_FORMAT_ERROR);
      }
      const { start_date } = req.body;
      const end_date = new Date(value);
      if (isNaN(end_date.getTime())) {
        throw new Error(
          prepareMessageFromParams(ERROR_VALID_DATE, [["field", "End Date"]])
        );
      }
      if (end_date <= new Date()) {
        throw new Error(
          prepareMessageFromParams(ERROR_FUTURE_DATE, [["field", "End Date"]])
        );
      }
      // Ensure 'start_date' is before 'end_date'
      if (start_date && end_date <= start_date) {
        throw new Error(
          prepareMessageFromParams(ERROR_ORDER_DATE, [
            ["field1", "Start Date"],
            ["field2", "End Date"],
          ])
        );
      }
      req.body.end_date = end_date; // Store as Date object for comparison
      return true;
    }),
  body("min_total_amount")
    .isFloat({ min: 0 })
    .withMessage(ERROR_AMOUNT_INVALID)
    .custom((value, { req }) => {
      const { discount_type, discount_amount } = req.body;
      // Validate fixed_amount based on type
      if (
        discount_type === COUPON_DISCOUNT_TYPE.FixedAmountDiscount &&
        value <= discount_amount
      ) {
        throw new Error(COUPON_MIN_AMOUNT_DISCOUNT_AMOUNT_ERROR);
      }
      return true;
    }),
  body("max_total_amount")
    .isFloat({ min: 0 })
    .withMessage(ERROR_AMOUNT_INVALID)
    .custom((value, { req }) => {
      const { min_total_amount } = req.body;
      if (min_total_amount && min_total_amount >= value) {
        throw new Error(
          prepareMessageFromParams(ERROR_MAX_GREATER_THAN_MIN, [
            ["maxValue", `${value}`],
            ["minValue", `${min_total_amount}`],
          ])
        );
      }
      req.body.max_total_amount = value; // Store as Date object for comparison
      return true;
    }),
  body("maximum_discount_amount")
    .optional({ checkFalsy: true }) // Optional and will check for falsy values like '' or null
    .isFloat({ min: 0 }) // Validate that it's a float and >= 0
    .withMessage(ERROR_AMOUNT_INVALID)
    .toFloat(), // Convert to float (if you need to ensure type conversion)
];
