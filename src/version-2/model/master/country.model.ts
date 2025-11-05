import { INTEGER, STRING, DATE } from "sequelize"
import dbContext from "../../../config/db-context";

const ContryData = dbContext.define("contries", {
    id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    country_name: {
        type: STRING,
        allowNull: false
    },
    country_code: {
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
    }
});



export default ContryData;