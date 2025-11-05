import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../../config/db-context";
import Image from "../../image.model";

const ShanksData = dbContext.define("shanks", {
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
    sort_code: {
        type: STRING
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
    }

});

ShanksData.hasOne(Image, { as: "image", foreignKey: "id", sourceKey: "id_image" });


export default ShanksData;