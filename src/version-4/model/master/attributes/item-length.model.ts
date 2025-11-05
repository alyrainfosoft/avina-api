import { INTEGER, STRING, DATE, DOUBLE } from "sequelize";

export const LengthData = (dbContext: any) => { 
  
let lengthData = dbContext.define("items_lengths", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  length: {
    type: STRING,
    allowNull: false,
  },
  slug: {
    type: STRING,
    allowNull: false,
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
  company_info_id :{ 
    type:INTEGER
  }
});
  return lengthData;
}
