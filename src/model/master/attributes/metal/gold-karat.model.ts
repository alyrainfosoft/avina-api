import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../../../config/db-context";
import Image from "../../../image.model";

const GoldKarat = dbContext.define("gold_kts", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: INTEGER,
    allowNull: false,
  },
  slug: {
    type: STRING,
    allowNull: false,
  },
  id_image: {
    type: INTEGER,
  },
  is_active: {
    type: STRING,
  },
  created_date: {
    type: DATE,
    allowNull: false,
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
  id_metal: {
    type: INTEGER,
  },
});

GoldKarat.hasOne(Image, {
  as: "image",
  foreignKey: "id",
  sourceKey: "id_image",
});

export default GoldKarat;
