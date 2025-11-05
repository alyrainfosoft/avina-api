import { BIGINT, DATE, INTEGER, STRING } from "sequelize";

export const ThemeAttributeCustomers = (dbContext: any) => {
  let themeAttributeCustomers = dbContext.define("theme_attribute_customers", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_company_info: {
      type: INTEGER
    },
    id_theme: {
      type: INTEGER,
    },
    id_theme_attribute: {
      type: BIGINT
    },
    value: {
      type: 'character varying',
    },
    link: {
      type: 'character varying',
    },
    id_image: {
      type: INTEGER,
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
    }
  });
  return themeAttributeCustomers;
}