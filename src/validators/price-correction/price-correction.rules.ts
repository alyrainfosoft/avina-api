import { PRICE_CORRECTION_PRODUCT_TYPE_LIST } from "../../utils/app-constants";
import { ERROR_INVALID_MASSAGE } from "../../utils/app-messages";
import { prepareMessageFromParams } from "../../utils/shared-functions";
import { fieldBitChain, fieldIntegerChain, fieldIntegerNotReqChain, fieldStringChain } from "../common-validation-rules";

export const priceCorrectionRules = [
    fieldStringChain("Product Type", "product_type")
    .custom(async (type) => {
          if (!PRICE_CORRECTION_PRODUCT_TYPE_LIST.includes(type)) {
            throw false;
          }
        })
        .withMessage(
          prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
            ["field_name", "Product type"],
          ])
        ),
   fieldBitChain("Is Active", "is_active")
]
