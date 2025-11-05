import { INTEGER, STRING, DATE, JSON } from "sequelize";
import dbContext from "../../../../config/db-context";
import Image from "../../image.model";

const DiamondCaratSize = dbContext.define("carat_sizes", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  value: {
    type: STRING,
    allowNull: false,
  },
  slug: {
    type: STRING,
    allowNull: false,
  },
  sort_code: {
    type: INTEGER,
  },
  is_active: {
    type: STRING,
    allowNull: false,
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
    allowNull: false,
  },
  modified_by: {
    type: INTEGER,
  },
  is_deleted: {
    type: STRING,
  },
  is_diamond: {
    type: JSON,
  },
  is_diamond_shape: {
    type: STRING,
  },
  id_image: {
    type: INTEGER,
  },
  is_config: {
    type: STRING,
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

DiamondCaratSize.hasOne(Image, {
  as: "image",
  foreignKey: "id",
  sourceKey: "id_image",
});

export default DiamondCaratSize;
