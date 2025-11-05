import { INTEGER, STRING, DATE } from "sequelize"
import dbContext from "../../config/db-context";

const CurrencyData = dbContext.define("currency_rates", {
    id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    currency: {
        type: STRING,
        allowNull: false
    },
    rate: {
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
    is_default: {
        type: STRING
    }
});



export default CurrencyData;