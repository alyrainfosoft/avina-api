import { DATE, INTEGER, STRING, TIME } from "sequelize";

export const Enquiries = (dbContext: any) => {
    let enquiries = dbContext.define("enquiries", {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        first_name: {
            type: STRING,
        },
        last_name: {
            type: STRING,
        },
        email: {
            type: STRING,
        },
        phone_number: {
            type: STRING,
        },
        message: {
            type: STRING,
        },
        enquirie_type: {
            type: INTEGER
        },
        created_date: {
            type: DATE,
            allowNull: false
        },
        created_by: {
            type: INTEGER,
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
    return enquiries;
}