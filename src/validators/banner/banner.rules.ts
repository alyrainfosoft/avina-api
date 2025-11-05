import { body, CustomValidator, Meta, Schema } from "express-validator";
import { BIT_FIELD_VALUES } from "../../utils/app-constants";
import {
  DATE_TYPE_VALIDATION_MESSAGE,
  IS_ACTIVE_EXPECTED_TYPE_STRING,
  IS_ACTIVE_REQUIRED,
  NAME_IS_NON_EMPTY_STRING,
  NAME_IS_REQUIRED,
  NAME_LENGTH_MIN_MAX,
  ONLY_AI_EXPECTED_TYPE_STRING,
  TARGET_URL_NON_EMPTY_STRING,
  TARGET_URL_REQUIRED,
  URL_TYPE_VALIDATION_MESSAGE,
} from "../../utils/app-messages";
import { NAME_LENGTH_MAX, NAME_LENGTH_MIN } from "../validation.constant";
import { fieldStringChain, fieldStringMinMaxChain } from "../common-validation-rules";

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

const bannerNameChain = (onlyAI: boolean) =>
  body("name")
    .if(validateIf(onlyAI))
    .exists()
    .withMessage(NAME_IS_REQUIRED)
    .isString()
    .withMessage(NAME_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(NAME_IS_NON_EMPTY_STRING)
    .trim();

const bannerTargetUrlChain = (onlyAI: boolean) =>
  body("target_url")
    .if(validateIf(onlyAI))
    .exists()
    .withMessage(TARGET_URL_REQUIRED)
    .isString()
    .withMessage(TARGET_URL_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(TARGET_URL_NON_EMPTY_STRING)
    .trim();

const bannerIsActiveChain = body("is_active")
  .exists()
  .withMessage(IS_ACTIVE_REQUIRED)
  .isString()
  .withMessage(IS_ACTIVE_EXPECTED_TYPE_STRING)
  .isIn(BIT_FIELD_VALUES)
  .withMessage(IS_ACTIVE_EXPECTED_TYPE_STRING);

const bannerIsOnlyAIChain = body("only_active_inactive")
  .optional()
  .isString()
  .withMessage(ONLY_AI_EXPECTED_TYPE_STRING)
  .isIn(BIT_FIELD_VALUES)
  .withMessage(ONLY_AI_EXPECTED_TYPE_STRING);

const bannerActiveDateChain = (onlyAI: boolean) =>
  body("active_date")
    .if(validateIf(onlyAI))
    .optional()
    .isDate()
    .withMessage(DATE_TYPE_VALIDATION_MESSAGE);

const bannerExpiryDateChain = (onlyAI: boolean) =>
  body("expiry_date")
    .if(validateIf(onlyAI))
    .optional()
    .isDate()
    .withMessage(DATE_TYPE_VALIDATION_MESSAGE);

export const addBannerValidationRule = [
  bannerNameChain(false),
  bannerTargetUrlChain(false),
  bannerActiveDateChain(false),
  bannerExpiryDateChain(false),
];

export const updateBannerValidationRule = [
  bannerNameChain(true),
  bannerTargetUrlChain(true),
  bannerActiveDateChain(true),
  bannerExpiryDateChain(true),
];

export const addMarketingBannerValidationRule = [
  bannerNameChain(false),
  bannerTargetUrlChain(false),
  bannerActiveDateChain(false),
  bannerExpiryDateChain(false),
];

export const updateMarketingBannerValidationRule = [
  bannerNameChain(true),
  bannerTargetUrlChain(true),
  bannerActiveDateChain(true),
  bannerExpiryDateChain(true),
];

export const addOurStoryValidationRule = [
  fieldStringMinMaxChain("Title", "title", 1, 100),
  fieldStringChain("Content", "content")
]