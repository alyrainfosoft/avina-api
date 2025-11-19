import { DATE, INTEGER, TEXT } from "sequelize";
import { Image } from "./image.model";

export const ConfiguratorSetting = (dbContext: any) => {
  let configuratorSetting = dbContext.define("configurator_setting", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: 'character varying',
    },
    key: {
      type: 'character varying',
    },
    description: {
      type: TEXT,
    },
    link: {
      type: "character varying"
    },
    is_active: {
      type: 'bit',
    },
    id_image: {
      type: INTEGER,
    },
    created_by: {
      type: INTEGER,
    },
    created_date: {
      type: DATE,
    },
    modified_by: {
      type: INTEGER,
    },
    modified_date: {
      type: DATE,
    },
    is_deleted: {
      type: 'bit',
    }
  });

  return configuratorSetting
};