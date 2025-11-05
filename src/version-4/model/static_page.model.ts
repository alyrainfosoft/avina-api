import { INTEGER, STRING, DATE } from "sequelize"
export const StaticPageData = (dbContext: any) => {
    let staticPageData = dbContext.define("static_pages", {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        page_title: {
            type: STRING,
            allowNull: false
        },
        slug: {
            type: STRING,
            allowNull: false
        },
        content: {
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
        },
        modified_by: {
            type: INTEGER,
        },
        is_active: {
            type: STRING,
        },
        is_deleted: {
            type: STRING,
        },
        company_info_id: {
            type: INTEGER
        }
    });
    return staticPageData;
}