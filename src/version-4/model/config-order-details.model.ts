import { DOUBLE, INTEGER, JSON, SMALLINT } from "sequelize"
import { Orders } from "./order.model";

export const ConfigOrdersDetails = (dbContext: any) => {
    let configOrderDetails = dbContext.define("config_order_details", {
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
        labor_charge: {
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
        },
        company_info_id: {
            type: INTEGER
        }
    })

    return configOrderDetails;
}