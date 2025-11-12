import { DATE, INTEGER, STRING } from "sequelize";

export const HomeAboutMain = (dbContext: any) => {
    let homeAboutMain = dbContext.define("home_about_mains", {
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
        company_info_id: {
            type: INTEGER
        }
    });
    return homeAboutMain;
}