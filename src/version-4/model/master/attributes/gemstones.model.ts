import { DATE, INTEGER, STRING } from "sequelize";
import { Image } from "../../image.model";

export const StoneData = (dbContext: any) => {
  let stoneData = dbContext.define("gemstones", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: STRING,
      allowNull: false,
    },
    slug: {
      type: STRING,
      allowNull: false,
    },
    sort_code: {
      type: STRING,
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
    is_diamond: {
      type: INTEGER,
    },
    gemstone_type: {
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
    company_info_id: {
      type: INTEGER
    }
  });
  return stoneData
};
