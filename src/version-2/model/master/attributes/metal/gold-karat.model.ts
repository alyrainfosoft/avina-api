import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../../../../config/db-context";
import Image from "../../../image.model";
import MetalMaster from "./metal-master.model";

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
  is_config: {
    type: INTEGER,
  },
  is_band: {
    type: STRING,
  },
  is_three_stone: {
    type: STRING,
  },
  is_bracelet: {
    type: STRING,
  },
  is_pendant: {
    type: STRING,
  },
  is_earring: {
    type: STRING,
  },
});

GoldKarat.hasOne(Image, {
  as: "image",
  foreignKey: "id",
  sourceKey: "id_image",
});
GoldKarat.hasOne(MetalMaster, {
  as: "metal",
  foreignKey: "id",
  sourceKey: "id_metal",
});
export default GoldKarat;
