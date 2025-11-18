import { DATE, INTEGER, STRING } from "sequelize";

export const BlogCategoryData = (dbContext: any) => {
  let blogCategoryData = dbContext.define("blog_categories", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
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
    },
    modified_by: {
      type: INTEGER,
    },
    is_deleted: {
      type: STRING,
    },
    sort_order: {
      type: INTEGER,
    },
    company_info_id: {
      type: INTEGER
    }
  });
  return blogCategoryData;
}
