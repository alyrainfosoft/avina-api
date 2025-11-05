import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../config/db-context";

const Enquiries = dbContext.define("enquiries", {
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


});

export default Enquiries;