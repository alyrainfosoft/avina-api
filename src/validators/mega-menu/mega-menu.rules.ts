import { fieldIntegerChain, fieldIntegerOptionalChain, fieldStringChain } from "../common-validation-rules";

export const addMegaMenuValidationRule = [
    fieldStringChain("Name", "name"),
    fieldStringChain("Menu Type", "menu_type")
] 

export const addMegaMenuAttributeValidationRule = [
    fieldStringChain("Title", "title"),
    fieldStringChain("Menu Type", "menu_type"),
    fieldStringChain("Target Type", "target_type"),
    fieldIntegerChain("Id Menu", "id_menu"),
    fieldIntegerChain("Sort Order", "sort_order"),
]