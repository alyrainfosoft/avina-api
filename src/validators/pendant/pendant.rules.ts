import { fieldIntegerChain, fieldIntegerNotReqChain, fieldStringChain } from "../common-validation-rules";

export const pendantPriceRules = [
    fieldIntegerChain("Design Type", "design_type"),
    fieldIntegerChain("Center Diamond Weight", "center_dia_wt"),
    fieldIntegerChain("Center Diamond Shape", "center_dia_shape"),
    fieldStringChain("Bale Type", "bale_type"),
    fieldIntegerChain("Metal Id", "metal_id"),
    fieldIntegerNotReqChain("Karat Id", "karat_id"),
    fieldIntegerNotReqChain("Color", "color"),
    fieldIntegerNotReqChain("Clarity", "clarity"),
    fieldIntegerNotReqChain("Cut", "cut"),
    fieldIntegerChain("Diamond Type", "diamond_type"),
    fieldIntegerChain("Stone Id", "id_stone"),
]


export const slugPendantPriceRules = [
    fieldIntegerNotReqChain("Color", "color"),
    fieldIntegerNotReqChain("Clarity", "clarity"),
    fieldIntegerNotReqChain("Cut", "cut"),
    fieldIntegerChain("Diamond Type", "diamond_type"),
    fieldIntegerChain("Stone Id", "id_stone"),
]