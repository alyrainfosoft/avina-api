import { INTEGER, STRING, DATE } from "sequelize"
export const CityData = (dbContext: any) => {
    let cityData = dbContext.define("cities", {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        city_name: {
            type: STRING,
            allowNull: false
        },
        city_code: {
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
            type: INTEGER
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
        id_state: {
            type: INTEGER,
        },
        company_info_id: {
            type: INTEGER
        }
    });
    return cityData;
}