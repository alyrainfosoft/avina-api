import { DATE, INTEGER, STRING } from "sequelize";
import { Image } from "./image.model";
export const OurStory = (dbContext: any) => {
  let ourStory = dbContext.define("our_stories", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: STRING,
    },
    content: {
      type: STRING
    },
    id_image: {
      type: INTEGER,
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
    }

  });

  return ourStory;
};