import { BIGINT, DATE, INTEGER, STRING, TEXT } from "sequelize";
import { PageData } from "./pages.model";
export const MetaDataDetails = (dbContext: any) => {
  let metaDataDetails = dbContext.define("metadata_details", {
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
    company_info_id: {
      type: INTEGER
    },
    other_meta_data:{
      type: TEXT,
    }
  });
  return metaDataDetails;
}
