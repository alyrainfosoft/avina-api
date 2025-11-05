import { DATE, INTEGER, STRING } from "sequelize";
import { Image } from "./image.model";
export const TestimonialData = (dbContext: any) => {

    let testimonialData = dbContext.define("testimonials", {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        person_name: {
            type: INTEGER,
            allowNull: false
        },
        designation: {
            type: STRING,
            allowNull: false
        },
        text: {
            type: INTEGER,
        },
        id_image: {
            type: INTEGER,
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
        company_info_id: {
            type: INTEGER
        }
    });
    return testimonialData;
};