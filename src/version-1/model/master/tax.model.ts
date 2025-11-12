import { INTEGER, STRING, DATE, DOUBLE } from "sequelize"

export const TaxMaster = (dbContext: any) => {
    let taxMaster = dbContext.define("tax_masters", {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: STRING,
            allowNull: false
        },
        slug: {
            type: STRING,
            allowNull: true
        },
        rate: {
            type: DOUBLE,
            allowNull: false
        },
        created_date: {
            type: DATE,
            allowNull: false
        },
        modified_date: {
            type: DATE,
        },
        created_by: {
            type: INTEGER,
            allowNull: false
        },
        modified_by: {
            type: INTEGER,
        },
        is_active: {
            type: STRING,
            allowNull: false
        },
        is_deleted: {
            type: STRING,
        },
        company_info_id: {
            type: INTEGER
        }

    });
    return taxMaster;
}