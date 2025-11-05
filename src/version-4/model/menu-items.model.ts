import { BOOLEAN, DATE, DECIMAL, INTEGER, STRING } from "sequelize";
export const MenuItem = (dbContext: any) => {
  let menuItem = dbContext.define("menu_items", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: STRING,
  },
  id_parent_menu: {
    type: INTEGER,
  },
  nav_path: {
    type: STRING,
  },
  menu_location: {
    type: STRING,
  },
  sort_order: {
    type: DECIMAL,
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
  icon: {
    type: STRING,
  },
  company_info_id :{ 
    type:INTEGER
  },
  is_for_super_admin: {
    type: BOOLEAN
  }
});

  return menuItem;
}
