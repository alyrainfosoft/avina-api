import { DATE, INTEGER, JSON, STRING, SMALLINT, TIME } from "sequelize";
import { Product } from "./product.model";
export const ProductEnquiries = (dbContext: any) => {
    let productEnquiries = dbContext.define("product_enquiries", {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        full_name: {
            type: STRING,
        },
        email: {
            type: STRING,
        },
        contact_number: {
            type: STRING,
        },
        message: {
            type: STRING,
        },
        product_id: {
            type: INTEGER
        },
        product_json: {
            type: JSON
        },
        created_date: {
            type: DATE,
            allowNull: false
        },
        created_by: {
            type: INTEGER,
        },
        admin_action: {
            type: SMALLINT
        },
        admin_comments: {
            type: STRING
        },
        modified_by: {
            type: INTEGER,
        },
        modified_date: {
            type: DATE,
        },
        date: {
            type: DATE
        },
        time: {
            type: TIME
        },
        company_info_id: {
            type: INTEGER
        }
    });
    return productEnquiries;
}