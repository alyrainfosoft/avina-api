import { DATE, INTEGER, JSON, STRING } from "sequelize";

export const ConfiguratorLogs = (dbContext: any) => {
  let configuratorLogs = dbContext.define("3D_configurator_logs", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: STRING,
    },
    otp: {
      type: INTEGER,
    },
    created_date: {
      type: DATE,
    },
    modified_date: {
      type: DATE,
    },
    otp_expiry_date: {
      type: DATE,
    },
    login_count: {
      type: INTEGER,
    },
    detail_json: {
      type: JSON,
    },
    company_info_id: {
      type: INTEGER
    }
  });
  return configuratorLogs;
}

