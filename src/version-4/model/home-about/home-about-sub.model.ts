import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import { Image } from "../image.model";

export const HomeAboutSub = (dbContext: any) => {
    let homeAboutSub = dbContext.define("home_subs", {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: STRING,
        },
        content: {
            type: STRING,
        },
        target_link: {
            type: STRING,
        },
        button_name: {
            type: STRING
        },
        id_image: {
            type: INTEGER
        },
        is_active: {
            type: STRING,
        },
        created_date: {
            type: DATE,
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
        id_home_main: {
            type: INTEGER
        },
        sort_order: {
            type: DOUBLE
        },
        company_info_id: {
            type: INTEGER
        },
        title_color: {type: STRING},
        description_color: {type: STRING},
    });
    return homeAboutSub;
}