import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../../config/db-context";
import Image from "../../image.model";

const HeadsData = dbContext.define("heads", {
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
    id_image: {
        type: INTEGER
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
    sort_code: {
        type: STRING
    },
    created_by: {
        type: INTEGER,
    },
    modified_by: {
        type: INTEGER,
    },
    is_deleted: {
        type: STRING,
    }

});

HeadsData.hasOne(Image, { as: "image", foreignKey: "id", sourceKey: "id_image" });


export default HeadsData;