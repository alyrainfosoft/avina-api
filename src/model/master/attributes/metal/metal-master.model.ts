import { DATE, INTEGER, STRING, FLOAT } from "sequelize";
import dbContext from "../../../../config/db-context";

const MetalMaster = dbContext.define("metal_masters", {
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
        allowNull: false
    },
    is_active: {
        type: STRING,
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
    },
    modified_by: {
        type: INTEGER,
    },
    is_deleted: {
        type: STRING,
    },
    metal_rate: {
        type: FLOAT
    }

});

export default MetalMaster