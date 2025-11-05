import { PrimaryKey } from "sequelize-typescript";
import dbContext from "../../../config/db-context";
import {DOUBLE, INTEGER, JSON, SMALLINT} from "sequelize"
import GiftSetProduct from "./gift_set_product.model";
import giftSetProductOrder from "./gift_set_product_order.model";

const GiftSetOrdersDetails = dbContext.define("gift_set_product_order_details", {
    order_id: {
        type: INTEGER,
        primaryKey: true
    },
    product_id: {
        type: INTEGER,
        primaryKey: true
    },
    quantity: {
        type: INTEGER
    },
    sub_total: {
        type: DOUBLE
    },
    product_tax: {
        type: DOUBLE
    },
    discount_amount: {
        type: DOUBLE
    },
    shipping_cost: {
        type: DOUBLE
    },
    shipping_method_id: {
        type: INTEGER
    },
    delivery_status: {
        type: SMALLINT
    },
    payment_status: {
        type: SMALLINT
    },
    discount_type: {
        type: SMALLINT
    },
    refund_request_id: {
        type: INTEGER
    }

})

GiftSetOrdersDetails.belongsTo(GiftSetProduct, { foreignKey: "product_id", as: "product" });

GiftSetProduct.hasMany(GiftSetOrdersDetails, {
  foreignKey: "product_id",
  as: "gift_set_product_images",
});
  
GiftSetOrdersDetails.belongsTo(giftSetProductOrder, {
    foreignKey: "order_id",
    as: "gift_product_order",
  });
  giftSetProductOrder.hasMany(GiftSetOrdersDetails, {
    foreignKey: "order_id",
    as: "gift_order",
  });

export default GiftSetOrdersDetails