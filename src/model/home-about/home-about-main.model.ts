import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";

const HomeAboutMain = dbContext.define("home_about_mains", {
    id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sort_title: {
        type: STRING,
    },
    title: {
        type: STRING,
    },
    content: {
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

});

export default HomeAboutMain;