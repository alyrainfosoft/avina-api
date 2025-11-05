import { DATE, INTEGER, STRING } from "sequelize";
import { Image } from "./image.model";
export const CategoryData = (dbContext: any) => {
    let categoryData = dbContext.define("categories", {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        parent_id: {
            type: INTEGER,

        },
        slug: {
            type: STRING,
            allowNull: false
        },
        position: {
            type: INTEGER,
        },
        is_searchable: {
            type: INTEGER,
            allowNull: false
        },
        is_active: {
            type: INTEGER,
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
        },
        category_name: {
            type: STRING,
            allowNull: false
        },
        id_image: {
            type: INTEGER,
        },
        is_setting_style: {
            type: STRING
        },
        is_size: {
            type: STRING
        },
        is_length: {
            type: STRING
        },
        id_size: {
            type: STRING
        },
        id_length: {
            type: STRING
        },
        company_info_id: {
            type: INTEGER
        }
    });

    return categoryData;
}