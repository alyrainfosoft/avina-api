import { fieldIntegerChain, fieldIntegerNotReqChain, fieldStringChain } from "../common-validation-rules";

export const studPriceRules = [
    fieldIntegerChain("Setting Type", "setting_type"),
    fieldIntegerNotReqChain("Huggies setting type", "huggies_setting_type"),
    fieldIntegerChain("Center Diamond Weight", "center_dia_wt"),
    fieldIntegerChain("Center Diamond Shape", "center_dia_shape"),
    fieldStringChain("Product Style", "product_style"),
    fieldIntegerChain("Metal Id", "metal_id"),
    fieldIntegerNotReqChain("Karat Id", "karat_id"),
    fieldIntegerNotReqChain("Color", "color"),
    fieldIntegerNotReqChain("Clarity", "clarity"),
    fieldIntegerNotReqChain("Cut", "cut"),
    fieldIntegerChain("Diamond Type", "diamond_type"),
    fieldIntegerChain("Stone Id", "id_stone"),
]


export const slugStudPriceRules = [
    fieldIntegerNotReqChain("Color", "color"),
    fieldIntegerNotReqChain("Clarity", "clarity"),
    fieldIntegerNotReqChain("Cut", "cut"),
    fieldIntegerChain("Diamond Type", "diamond_type"),
    fieldIntegerChain("Stone Id", "id_stone"),
]