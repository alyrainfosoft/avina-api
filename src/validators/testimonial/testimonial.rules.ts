import { body, CustomValidator, Meta } from "express-validator";
import { BIT_FIELD_VALUES } from "../../utils/app-constants";
import { CODE_IS_NON_EMPTY_STRING, CODE_IS_REQUIRED, IS_ACTIVE_EXPECTED_TYPE_STRING, IS_ACTIVE_REQUIRED, NAME_IS_NON_EMPTY_STRING, NAME_IS_REQUIRED, NAME_LENGTH_MIN_MAX, RATE_IS_NON_EMPTY_STRING, RATE_IS_REQUIRED, SLUG_IS_NON_EMPTY_STRING, SLUG_IS_REQUIRED, SLUG_LENGTH_MIN_MAX } from "../../utils/app-messages";
import { NAME_LENGTH_MAX, NAME_LENGTH_MIN } from "../validation.constant";

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

const testimonialNameChain = (onlyAI: boolean) =>
    body("name")
        .if(validateIf(onlyAI))
        .exists()
        .withMessage(NAME_IS_REQUIRED)
        .isString()
        .withMessage(NAME_IS_NON_EMPTY_STRING)
        .not()
        .isEmpty()
        .withMessage(NAME_IS_NON_EMPTY_STRING)
        .isLength({ min: NAME_LENGTH_MIN, max: NAME_LENGTH_MAX })
        .withMessage(NAME_LENGTH_MIN_MAX)
        .trim();

const testimonialDesignationChain = (onlyAI: boolean) =>
    body("designation")
        .if(validateIf(onlyAI))
        .exists()
        .withMessage(CODE_IS_REQUIRED)
        .isString()
        .withMessage(CODE_IS_NON_EMPTY_STRING)
        .not()
        .isEmpty()
        .withMessage(CODE_IS_NON_EMPTY_STRING)
        .trim();

        export const addTestimonialValidationRule = [
            testimonialNameChain(false),
            testimonialDesignationChain(false)
        ];
        
        export const updateTestimonialValidationRule = [
            testimonialNameChain(true),
            testimonialDesignationChain(true)
        ];