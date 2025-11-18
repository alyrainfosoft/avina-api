import { DATE, INTEGER, SMALLINT, STRING } from "sequelize";
export const Image = (dbContext: any) => {
  let image = dbContext.define("images", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  image_path: {
    type: STRING,
  },
  image_type: {
    type: SMALLINT,
  },
  is_deleted: {
    type: STRING,
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
  company_info_id :{ 
      type:INTEGER
    }
});
  return image;
}
