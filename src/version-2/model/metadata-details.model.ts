import { BIGINT, DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import PageData from "./pages.model";

const MetaDataDetails = dbContext.define("metadata_details", {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: STRING,
  },
  description: {
    type: STRING,
  },
  key_word: {
    type: STRING,
  },
  id_page: {
    type: BIGINT,
  },
  is_active: {
    type: STRING,
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
MetaDataDetails.belongsTo(PageData, { foreignKey: "id_page", as: "page" });
export default MetaDataDetails;
