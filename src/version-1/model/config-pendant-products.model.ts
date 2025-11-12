import { BIGINT, DATE, DOUBLE, INTEGER, STRING, TEXT } from "sequelize";

export const ConfigPendantProduct = (dbContext: any) => {
    let configPendantProduct = dbContext.define("config_pendant_products", {
        id: {
            type: BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        bale_type: {
            type: STRING,
        },
        design_type: {
            type: BIGINT,
        },
        center_dia_wt: {
            type: BIGINT,
        },
        center_dia_shape: {
            type: BIGINT,
        },
        center_dia_mm_size: {
            type: BIGINT,
        },
        center_dia_count: {
            type: BIGINT,
        },
        style_no: {
            type: BIGINT,
        },
        sort_description: {
            type: STRING,
        },
        long_description: {
            type: TEXT,
        },
        labour_charge: {
            type: DOUBLE
        },
        other_charge: {
            type: DOUBLE
        },
        is_active: {
            type: STRING,
        },
        is_deleted: {
            type: STRING,
        },
        created_by: {
            type: BIGINT,
        },
        created_at: {
            type: DATE,
        },
        modified_by: {
            type: BIGINT,
        },
        modified_at: {
            type: DATE,
        },
        deleted_by: {
            type: BIGINT,
        },
        deleted_at: {
            type: DATE,
        },
        company_info_id: {
            type: INTEGER
        },
        name: {
            type: STRING
        },
        sku: {
            type: STRING
        },
        slug: {
            type: STRING
        }
    })
    return configPendantProduct
}