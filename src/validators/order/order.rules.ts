import { DELIVERY_STATUS_LIST, ORDER_STATUS_LIST } from "../../utils/app-constants";
import { DELIVERY_STATUS_EXPECTED_TYPE, ORDER_STATUS_EXPECTED_TYPE } from "../../utils/app-messages";
import { fieldIntegerChain } from "../common-validation-rules";

export const orderSTatusUpdateRules = [
    fieldIntegerChain("Id order", "id"),
    fieldIntegerChain("order status", "order_status")
      .isIn(ORDER_STATUS_LIST)
      .withMessage(ORDER_STATUS_EXPECTED_TYPE),
  ];

  export const deliverySTatusUpdateRules = [
    fieldIntegerChain("Id order", "order_id"),
    fieldIntegerChain("delivery status", "delivery_status")
      .isIn(DELIVERY_STATUS_LIST)
      .withMessage(DELIVERY_STATUS_EXPECTED_TYPE),
  ];