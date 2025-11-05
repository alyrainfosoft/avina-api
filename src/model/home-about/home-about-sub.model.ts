import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import Image from "../image.model";


const HomeAboutSub = dbContext.define("home_subs", {
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
    }

});

HomeAboutSub.hasOne(Image, { as: "image", foreignKey: "id", sourceKey: "id_image" });


export default HomeAboutSub;