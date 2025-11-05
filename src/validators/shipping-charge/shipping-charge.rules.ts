import {
  fieldDoublePrecisionChain,
  fieldIntegerChain,
  fieldStringChain,
} from "../common-validation-rules";

export const addShippingChargeValidatorRule = [
  fieldDoublePrecisionChain("amount", "amount"),
];

export const updateShippingChargeValidatorRule = [
  fieldDoublePrecisionChain("amount", "amount"),
];
export const applyShippingChargeValidatorRule: any = [
  fieldDoublePrecisionChain("Amount", "amount"),
];
