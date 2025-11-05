import { INTEGER, STRING, DATE, DOUBLE } from "sequelize"
import dbContext from "../../../config/db-context";

const ItemSizeData = dbContext.define("items_sizes", {
    id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    size: {
        type: STRING,
        allowNull: false
    },
    slug: {
        type: STRING,
        allowNull: false
    },
    is_active: {
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
    is_deleted: {
        type: STRING,
    }

});



export default ItemSizeData;