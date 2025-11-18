import { DATE, INTEGER, STRING } from "sequelize";
import { MenuItem } from "./menu-items.model";
import { RolePermissionAccess } from "./role-permission-access.model";
import { Role } from "./role.model";

export const RolePermission = (dbContext: any) => {
  let rolePermission = dbContext.define("role_permissions", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_role: {
      type: INTEGER,
    },
    id_menu_item: {
      type: INTEGER,
    },
    is_active: {
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
  return rolePermission;
}