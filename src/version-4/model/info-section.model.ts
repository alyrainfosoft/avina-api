import { BIGINT, DATE, INTEGER, STRING, TEXT } from "sequelize";

export const InfoSection = (dbContext: any) => {
  let infoSection = dbContext.define("info_sections", {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  key: {
    type: STRING,
  },
  title: {
    type: STRING,
  },
  description: {
    type: TEXT,
  },
  created_at: {
    type: DATE
  },
  created_by: {
    type: BIGINT
  },
  modified_at: {
    type: DATE
  },
  modified_by: {
    type: BIGINT
  },
  company_info_id :{ 
    type:INTEGER
  }
});
  return infoSection;
};
