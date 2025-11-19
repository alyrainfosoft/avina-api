import { INTEGER, STRING, DATE } from "sequelize"

export const StateData = (dbContext: any) => {
    let stateData = dbContext.define("states", {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        state_name: {
            type: STRING,
            allowNull: false
        },
        state_code: {
            type: STRING,
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
        id_country: {
            type: INTEGER,
        },
        company_info_id: {
            type: INTEGER
        }
    });
    return stateData;
}