import { body, CustomValidator, Meta, param } from "express-validator";
import { BIT_FIELD_VALUES, FILTER_ITEM_SCOPE_LIST, FILTER_TYPE_LIST, FONT_STYLE_TYPE_LIST, FONT_TYPE_LIST, SING_UP_TYPE_LIST, THEME_SECTION_TYPE_LIST } from "../../utils/app-constants";
import { CODE_IS_NON_EMPTY_STRING, CODE_IS_REQUIRED, DUPLICATE_ATTRIBUTE_VALUE_NOT_ALLOWED, ERROR_INVALID_MASSAGE, IS_ACTIVE_EXPECTED_TYPE_STRING, IS_ACTIVE_REQUIRED, NAME_IS_NON_EMPTY_STRING, NAME_IS_REQUIRED, NAME_LENGTH_MIN_MAX, RATE_IS_NON_EMPTY_STRING, RATE_IS_REQUIRED, REQUIRED_ERROR_MESSAGE, SLUG_IS_NON_EMPTY_STRING, SLUG_IS_REQUIRED, SLUG_LENGTH_MIN_MAX, TYPE_ARRAY_ERROR_MESSAGE, TYPE_NON_EMPTY_STRING_ERROR_MESSAGE } from "../../utils/app-messages";
import { NAME_LENGTH_MAX, NAME_LENGTH_MIN } from "../validation.constant";
import { prepareMessageFromParams } from "../../utils/shared-functions";
import { fieldAlphaHyphenUnderscore, fieldBooleanChain, fieldEmailChain, fieldFloatMinMaxChain, fieldIntegerChain, fieldIntegerLengthChain, fieldLinkChain, fieldPhoneNumberChain, fieldStringChain, fieldUniqueValueArrayChain } from "../common-validation-rules";
import { query } from "express";

const checkOnlyAI = (onlyAI: boolean, req: Meta["req"]) => {
    if (onlyAI) {
        return !Object.keys(req.body).includes("only_active_inactive");
    }
    return true;
};

const themeSectionType = (onlyAI: boolean) =>
    param("section_type")
        .exists()
        .withMessage(prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", "Section Type"]]))
        .isString()
        .withMessage(prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [["field_name", "Section Type"]]))
        .not()
        .isEmpty()
        .withMessage(prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [["field_name", "Section Type"]]))
        .custom(async (section_type) => {
            if (!THEME_SECTION_TYPE_LIST.includes(section_type)) {
                throw false;
            }
        })
        .trim()

const themeAttribute = (onlyAI: boolean) =>
    body("attributes")
        .optional()
        .isArray()
        .withMessage(prepareMessageFromParams(TYPE_ARRAY_ERROR_MESSAGE, [["field_name", "attributes"]]))
        .custom((value) => {
            const keys = value.map((item) => item.key_value);
            const uniqueKeys = new Set(keys);
            if (keys.length !== uniqueKeys.size) {
                throw new Error(DUPLICATE_ATTRIBUTE_VALUE_NOT_ALLOWED);
            }
            return true;
        })

export const addThemeValidationRule = [
    themeSectionType(false),
    themeAttribute(false)
];

export const updateThemeValidationRule = [
    fieldStringChain("Name", "name"),
    fieldStringChain("Key", "key"),
    themeAttribute(false)
];

export const generalCompanyInfoValidationRule = [
    fieldStringChain("Company name", "company_name"),
    fieldEmailChain("Company email", "company_email"),
    fieldPhoneNumberChain("Company phone", "company_phone"),
    fieldStringChain("Company address", "company_address"),
    fieldLinkChain("Company address embed map link", "address_embed_map"),
    fieldLinkChain("Company address map link", "address_map_link"),
]

export const systemColorValidationRule = [
    fieldStringChain("Primary color", "primary_color"),
    fieldStringChain("Secondary color", "secondary_color"),
]

export const systemFontStyleValidationRule = [
    fieldStringChain("Font family", "font_family"),
    fieldStringChain("Font weight", "font_weight"),
    fieldStringChain("Font", "font")
        .custom(async (type) => {
            if (!FONT_TYPE_LIST.includes(type)) {
                throw false;
            }
        })
        .withMessage(
            prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
                ["field_name", "Font type"],
            ])
        ), ,
    fieldStringChain("font_type", "font_type")
        .custom(async (type) => {
            if (!FONT_STYLE_TYPE_LIST.includes(type)) {
                throw false;
            }
        })
        .withMessage(
            prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
                ["field_name", "Font Style type"],
            ])
        ),
]

const fontType = (onlyAI: boolean) =>
    param("font")
        .exists()
        .withMessage(prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", "Font Type"]]))
        .isString()
        .withMessage(prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [["field_name", "Font Type"]]))
        .not()
        .isEmpty()
        .withMessage(prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [["field_name", "Font Type"]]))
        .custom(async (font) => {
            if (!FONT_TYPE_LIST.includes(font)) {
                throw false;
            }
        })
        .trim()

export const deleteFontFileValidationRule = [
    fontType(true)
]

export const addClientValidationRule = [
    fieldStringChain("Client name", "company_name"),
    fieldAlphaHyphenUnderscore("company_key","Client Key"),
    fieldStringChain("Client Key", "company_key"),
    fieldStringChain("Database name", "db_name"),
    fieldStringChain("Database user name", "db_user_name"),
    fieldStringChain("Database password", "db_password"),
    fieldStringChain("Database host", "db_host"),
    fieldIntegerLengthChain("Database port", "db_port", 4),
    fieldStringChain("Database dialect", "db_dialect"),
    fieldBooleanChain("Database ssl unauthorized", "db_ssl_unauthorized"),
]
export const updateClientValidationRule = [
    fieldStringChain("Database name", "db_name"),
    fieldStringChain("Database user name", "db_user_name"),
    fieldStringChain("Database password", "db_password"),
    fieldStringChain("Database host", "db_host"),
    fieldIntegerLengthChain("Database port", "db_port", 4),
    fieldStringChain("Database dialect", "db_dialect"),
    fieldBooleanChain("Database ssl unauthorized", "db_ssl_unauthorized"),
]

export const addFiltersValidationRule = [
    fieldStringChain("Filter name", "name"),
    fieldStringChain("Filter key", "key"),
    fieldStringChain("Filter type", "filter_select_type")
        .custom(async (filter_select_type) => {
            if (!FILTER_TYPE_LIST.includes(filter_select_type)) {
                throw false;
            }
        })
        .withMessage(
            prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
                ["field_name", "Filter type"],
            ])
    ),
    fieldStringChain("Item scope", "item_scope")
        .custom(async (item_scope) => {
            if (!FILTER_ITEM_SCOPE_LIST.includes(item_scope)) {
                throw false;
            }
        })
        .withMessage(
            prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
                ["field_name", "Filter Item scope Type"],
            ])
    ),
    fieldUniqueValueArrayChain("Filter selected values", "selected_value", 0),
]

export const updateFiltersValidationRule = [
    fieldStringChain("Filter name", "name"),
    fieldStringChain("Filter type", "filter_select_type")
        .custom(async (filter_select_type) => {
            if (!FILTER_TYPE_LIST.includes(filter_select_type)) {
                throw false;
            }
        })
        .withMessage(
            prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
                ["field_name", "Filter type"],
            ])
    ),
    fieldStringChain("Item scope", "item_scope")
        .custom(async (item_scope) => {
            if (!FILTER_ITEM_SCOPE_LIST.includes(item_scope)) {
                throw false;
            }
        })
        .withMessage(
            prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
                ["field_name", "Filter Item scope type"],
            ])
    ),
    fieldUniqueValueArrayChain("Filter selected values", "selected_value", 0),
]