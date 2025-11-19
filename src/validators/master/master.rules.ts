import { body, check, CustomValidator, Meta } from "express-validator";
import {
  BIT_FIELD_VALUES,
  CURRENCY_RATE_EXCHANGE_TYPE_LIST,
  CURRENCY_SYMBOL_PLACEMENT_LIST,
} from "../../utils/app-constants";
import {
  CODE_IS_NON_EMPTY_STRING,
  CODE_IS_REQUIRED,
  DIAMOND_GROUP_MASTER_RATE_SYNTHETIC_RATE_VALIDATION,
  ERROR_INVALID_MASSAGE,
  IS_ACTIVE_EXPECTED_TYPE_STRING,
  IS_ACTIVE_REQUIRED,
  NAME_IS_NON_EMPTY_STRING,
  NAME_IS_REQUIRED,
  NAME_LENGTH_MIN_MAX,
  RATE_IS_NON_EMPTY_STRING,
  RATE_IS_REQUIRED,
  REQUIRED_ERROR_MESSAGE,
  SLUG_IS_NON_EMPTY_STRING,
  SLUG_IS_REQUIRED,
  SLUG_LENGTH_MIN_MAX,
  TYPE_NON_EMPTY_STRING_ERROR_MESSAGE,
  VALUE_IS_NON_EMPTY,
  VALUE_IS_REQUIRED,
} from "../../utils/app-messages";
import {
  fieldBitChain,
  fieldDecimalChain,
  fieldDecimalOptionalChain,
  fieldDoublePrecisionChain,
  fieldIntegerChain,
  fieldStringChain,
  fieldStringMinMaxChain,
  fieldStringNotReqChain,
} from "../common-validation-rules";
import { NAME_LENGTH_MAX, NAME_LENGTH_MIN } from "../validation.constant";
import { prepareMessageFromParams } from "../../utils/shared-functions";
import { ActiveStatus, CURRENCY_RATE_EXCHANGE_TYPE, DeletedStatus } from "../../utils/app-enumeration";
import { initModels } from "../../version-one/model/index.model";

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

const masterNameChain = (onlyAI: boolean) =>
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
const masterSlugChain = (onlyAI: boolean) =>
  body("slug")
    .if(validateIf(onlyAI))
    .exists()
    .withMessage(SLUG_IS_REQUIRED)
    .isString()
    .withMessage(SLUG_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(SLUG_IS_NON_EMPTY_STRING)
    .trim();
const masterCodeChain = (onlyAI: boolean) =>
  body("code")
    .if(validateIf(onlyAI))
    .exists()
    .withMessage(CODE_IS_REQUIRED)
    .isString()
    .withMessage(CODE_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(CODE_IS_NON_EMPTY_STRING)
    .trim();

const masterRateChain = (onlyAI: boolean) =>
  body("rate")
    .if(validateIf(onlyAI))
    .exists()
    .withMessage(RATE_IS_REQUIRED)
    // .isInt()
    // .withMessage(RATE_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(RATE_IS_NON_EMPTY_STRING)
    .trim();

const masterValueChain = (onlyAI: boolean) =>
  body("value")
    .if(validateIf(onlyAI))
    .exists()
    .withMessage(VALUE_IS_REQUIRED)
    // .isInt()
    // .withMessage(RATE_IS_NON_EMPTY_STRING)
    .not()
    .isEmpty()
    .withMessage(VALUE_IS_NON_EMPTY)
    .trim();
const masterIsActiveChain = body("is_active")
  .exists()
  .withMessage(IS_ACTIVE_REQUIRED)
  .isString()
  .withMessage(IS_ACTIVE_EXPECTED_TYPE_STRING)
  .isIn(BIT_FIELD_VALUES)
  .withMessage(IS_ACTIVE_EXPECTED_TYPE_STRING);

export const addMasterValidationRule = [
  masterNameChain(false),
  masterCodeChain(false),
];

export const updateMasterValidationRule = [
  masterNameChain(true),
  masterCodeChain(true),
];

export const statusUpdateMasterValidationRule = [masterIsActiveChain];

export const addMasterCurrencyValidationRule = [
  fieldDecimalOptionalChain("Rate", "rate"),
];
export const addMasterCurrencyRateValidationRule = [
  fieldStringChain("Currency", "currency"),
  fieldDecimalOptionalChain("Rate", "rate"),
  fieldBitChain("Is Use Api", "is_use_api"),
  fieldStringChain("Symbol", "symbol"),
  fieldStringChain("Code", "code"),
  fieldStringNotReqChain("API", "api"),
  fieldStringNotReqChain("API Key", "api_key"),
  fieldStringChain("Thousand Token", "thousand_token"),
  body("code").isISO4217().withMessage("Invalid currency code!"),
  body("api").custom(async (value, { req }) => {
    const { is_use_api, exchange_rate_type } = req.body;
    if (
      is_use_api === "1" &&
      exchange_rate_type != CURRENCY_RATE_EXCHANGE_TYPE.Manually &&
      exchange_rate_type !== CURRENCY_RATE_EXCHANGE_TYPE.FreeApi
    ) {
      throw new Error(
        prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
          ["field_name", "API"],
        ])
      );
    }
    return true;
  }),
  body("rate").custom(async (value, { req }) => {
    const { is_use_api } = req.body;
    if (is_use_api === "0" && !value) {
      throw new Error(
        prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
          ["field_name", "rate"],
        ])
      );
    }
    return true;
  }),
  body("thousand_token").custom(async (value) => {
    const regex = /^[., ]+$/;
    if (!regex.test(value)) {
      throw new Error(
        prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
          ["field_name", "thousand_token"],
        ])
      );
    }
    return true;
  }),
  body("symbol_placement")
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field_name", "Symbol Placement"],
      ])
    )
    .isString()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", "Symbol Placement"],
      ])
    )
    .not()
    .isEmpty()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", "Symbol Placement"],
      ])
    )
    .trim()
    .custom(async (userType) => {
      if (!CURRENCY_SYMBOL_PLACEMENT_LIST.includes(userType)) {
        throw false;
      }
    })
    .withMessage("Invalid symbol placement!"),

  body("exchange_rate_type")
    .exists()
    .withMessage(
      prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field_name", "Exchange Rate Type"],
      ])
    )
    .isString()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", "Exchange Rate Type"],
      ])
    )
    .not()
    .isEmpty()
    .withMessage(
      prepareMessageFromParams(TYPE_NON_EMPTY_STRING_ERROR_MESSAGE, [
        ["field_name", "Exchange Rate Type"],
      ])
    )
    .trim()
    .custom(async (userType) => {
      if (!CURRENCY_RATE_EXCHANGE_TYPE_LIST.includes(userType)) {
        throw false;
      }
    })
    .withMessage("Invalid exchange rate type!"),
];
export const updateMasterCurrencyValidationRule = [
  fieldDecimalChain("Rate", "rate"),
];

export const addMasterNameSlugValidationRule = [masterNameChain(false)];

export const updateMasterNameSlugValidationRule = [masterNameChain(true)];

export const addMasterValueValidationRule = [masterValueChain(false)];

export const updateMasterValueValidationRule = [masterValueChain(true)];

export const addTagRule = [masterNameChain(false)];

export const updateTagRule = [masterNameChain(false)];

export const deleteMasterIdRule = [fieldIntegerChain("Id", "id")];

export const statusTagRule = [masterIsActiveChain];

export const addMasterValueSortCodeRule = [
  fieldStringMinMaxChain("value", "value", 1, 80),
  fieldStringMinMaxChain("sort code", "sort_code", 1, 80),
];

export const updateMasterValueSortCodeRule = [
  fieldIntegerChain("Id", "id"),
  fieldStringMinMaxChain("value", "value", 1, 80),
  fieldStringMinMaxChain("sort code", "sort_code", 1, 80),
];

export const masterValidatorRule = [
  fieldStringChain("Name", "name"),
  fieldStringNotReqChain("Sort-Code", "sort_code"),
  fieldStringNotReqChain("Import Name", "import_name"),
  fieldStringNotReqChain("Value", "value"),
  fieldStringNotReqChain("stone type", "stone_type"),
  fieldStringNotReqChain("link", "link"),
];

export const diamondGroupMasterValidatorRule = [
  fieldIntegerChain("Stone Id", "id_stone"),
  fieldIntegerChain("Shape Id", "id_shape"),
  fieldIntegerChain("Carat Id", "id_carat"),
  fieldDoublePrecisionChain("Minimum Carat Range", "min_carat_range"),
  fieldDoublePrecisionChain("Maximum Carat Range", "max_carat_range"),
  check('rate')
  .custom((value, { req }) => {
    const { rate, synthetic_rate } = req.body;
    if (!rate && !synthetic_rate) {
      // Just throw a plain error string
      throw new Error(DIAMOND_GROUP_MASTER_RATE_SYNTHETIC_RATE_VALIDATION);
    }

    return true;
  }),
  check('id_color')
    .custom(async(value, { req }) => {
      const { StoneData } = initModels(req);
      const stoneDetails = await StoneData.findOne({
            where: [
          { id: req.body.id_stone },
          { is_active: ActiveStatus.Active },
          { is_deleted: DeletedStatus.No }
            ],
      });
      if(!(stoneDetails && stoneDetails.dataValues)) {
        throw new Error(prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
          ["field_name", "Stone Id"],
        ]));
      } 
      if (stoneDetails && stoneDetails.dataValues.is_diamond == 1) {
        if (!req.body.id_color && req.body.id_color !== null && req.body.id_color !== undefined) {
          throw new Error(prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Color Id"],
          ]));
        }
      }
      
      return true;
    }),
    check('id_clarity')
    .custom(async(value, { req }) => {
      const { StoneData } = initModels(req);
      const stoneDetails = await StoneData.findOne({
            where: [
          { id: req.body.id_stone },
          { is_active: ActiveStatus.Active },
          { is_deleted: DeletedStatus.No }
            ],
      });
      if (stoneDetails && stoneDetails.dataValues.is_diamond == 1) {
     if (!req.body.id_clarity && req.body.id_clarity !== null && req.body.id_clarity !== undefined) {
          throw new Error(prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Clarity Id"],
          ]));
        }
      }

      return true;
    }),
    check('id_cuts')
    .custom(async(value, { req }) => {
      const { StoneData } = initModels(req);
      const stoneDetails = await StoneData.findOne({
            where: [
          { id: req.body.id_stone },
          { is_active: ActiveStatus.Active },
          { is_deleted: DeletedStatus.No }
            ],
      });
      
      if (stoneDetails && stoneDetails.dataValues.is_diamond == 2) {
        if (!req.body.id_cuts && req.body.id_cuts !== null && req.body.id_cuts !== undefined) {
          throw new Error(prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Cut Id"],
          ]));
        }
      }

      return true;
    }),
    check('id_mm_size')
    .custom(async(value, { req }) => {
      const { StoneData } = initModels(req);
      const stoneDetails = await StoneData.findOne({
            where: [
          { id: req.body.id_stone },
          { is_active: ActiveStatus.Active },
          { is_deleted: DeletedStatus.No }
            ],
      });
      
      if (stoneDetails && stoneDetails.dataValues.is_diamond == 2) {
        if (!req.body.id_mm_size && req.body.id_mm_size !== null && req.body.id_mm_size !== undefined) {
          throw new Error(prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "MM Size Id"],
          ]));
        }
      }

      return true;
    }),
]

