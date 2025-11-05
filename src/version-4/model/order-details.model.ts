import { BIGINT, DOUBLE, INTEGER, JSON, SMALLINT } from "sequelize"
import { Product } from "./product.model";
import { Orders } from "./order.model";
export const OrdersDetails = (dbContext: any) => {
    let ordersDetails = dbContext.define("order_details", {
        id: {
            type: BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        order_id: {
            type: INTEGER,
        },
        product_id: {
            type: INTEGER
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
        },
        variant_id: {
            type: INTEGER
        },
        product_details_json: {
            type: JSON
        },
        company_info_id: {
            type: INTEGER
        },
        offer_details: {
            type: JSON
        }
        
    })

    return ordersDetails;
}