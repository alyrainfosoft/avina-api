import { INTEGER, STRING } from "sequelize";
import {MetalMaster} from "./master/attributes/metal/metal-master.model";

export const SystemConfiguration = (dbContext: any) => {
let systemConfiguration = dbContext.define("system_configurations", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  config_key: {
    type: STRING,
  },
  config_value: {
    type: STRING,
  },
  user_friendly_name: {
    type: STRING,
  },
  display_sequence: {
    type: INTEGER,
  },
  config_group: {
    type: INTEGER,
  },
  id_metal: {
    type: INTEGER,
    references: {
      model: MetalMaster,
      key: "id",
    },
  },
  formula: {
    type: INTEGER,
  },
  company_info_id :{ 
    type:INTEGER
  }
});

  return systemConfiguration;
}
