import { PrimaryKey } from "sequelize-typescript";
import dbContext from "../config/db-context";
import {DOUBLE, INTEGER, JSON, SMALLINT} from "sequelize"
import Product from "./product.model";
import Orders from "./order.model";
const OrdersDetails = dbContext.define("order_details", {
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
    finding_charge: {
        type: DOUBLE
    },
    makring_charge: {
        type: DOUBLE
    },
    other_charge: {
        type: DOUBLE
    },
    diamond_count: {
        type: INTEGER
    },
    diamond_rate: {
        type: DOUBLE
    },
    metal_rate: {
        type: DOUBLE
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
    }, 
    order_details_json: {
        type: JSON
    }

})

OrdersDetails.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Product.hasMany(OrdersDetails, {
  foreignKey: "product_id",
  as: "product_image",
});
  
  OrdersDetails.belongsTo(Orders, {
    foreignKey: "order_id",
    as: "product_order",
  });
  Orders.hasMany(OrdersDetails, {
    foreignKey: "order_id",
    as: "order",
  });

export default OrdersDetails