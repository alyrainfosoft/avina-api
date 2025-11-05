import { DATE, INTEGER, STRING } from "sequelize";
import { MetalMaster } from "./metal-master.model";
import { GoldKarat } from "./gold-karat.model";

export const MetalGroupMaster = (dbContext: any) => {
  let metalGroupMaster = dbContext.define("metal_group_masters", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: STRING,
    },
    id_metal: {
      type: INTEGER,
    },
    id_kt: {
      type: INTEGER,
    },
    id_metal_tone: {
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
    company_info_id: {
      type: INTEGER
    }
  });
  return metalGroupMaster
}
