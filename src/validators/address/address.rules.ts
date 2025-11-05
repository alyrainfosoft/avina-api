import { body } from "express-validator";
import {
  AREA_NAME_IS_NON_EMPTY_STRING,
  AREA_NAME_IS_REQUIRES,
  HOUSE_AND_BUILDING_NAME_IS_NON_EMPTY_STRING,
  HOUSE_AND_BUILDING_NAME_IS_REQUIRES,
  NAME_IS_NON_EMPTY_STRING,
  NAME_IS_REQUIRED,
  PHONE_NUMBER_IS_NON_EMPTY_STRING,
  PHONE_NUMBER_IS_REQUIRED,
  PHONE_NUMBER_LENGTH_MIN_MAX,
  PIN_CODE_IS_REQUIRES,
  PIN_CODE_LENGTH_MIN_MAX,
  USERNAME_IS_REQUIRED,
} from "../../utils/app-messages";
import {
  PHONE_NUMBER_LENGTH_MAX,
  PHONE_NUMBER_LENGTH_MIN,
  PINCODE_MAX_NUMBER_LENGTH,
  PINCODE_MIN_NUMBER_LENGTH,
} from "../validation.constant";
import { fieldStringChain } from "../common-validation-rules";

export const addressValidationRule = [
  body("house_building")
    .exists()
    .withMessage(HOUSE_AND_BUILDING_NAME_IS_REQUIRES)
    .isString()
    .withMessage(HOUSE_AND_BUILDING_NAME_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(HOUSE_AND_BUILDING_NAME_IS_NON_EMPTY_STRING),
  body("full_name")
    .exists()
    .withMessage(NAME_IS_REQUIRED)
    .isString()
    .withMessage(NAME_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(AREA_NAME_IS_NON_EMPTY_STRING),
  body("pincode")
    .exists()
    .withMessage(PIN_CODE_IS_REQUIRES)
    .isLength({
      min: PINCODE_MIN_NUMBER_LENGTH,
      max: PINCODE_MAX_NUMBER_LENGTH,
    })
    .withMessage(PIN_CODE_LENGTH_MIN_MAX),
  body("phone_number")
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
];


export const addStoreAddressValidationRule = [
  fieldStringChain("Address", "address"),
  fieldStringChain("Map Link", "map_link"),
  fieldStringChain("Branch Name", "branch_name"),
]