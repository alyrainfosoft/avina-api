import { DATE, INTEGER, SMALLINT, STRING } from "sequelize";
import dbContext from "../config/db-context";

const Image = dbContext.define("images", {
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
});

export default Image;
