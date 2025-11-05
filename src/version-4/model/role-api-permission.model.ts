import { INTEGER, STRING } from "sequelize";
import { MenuItem } from "./menu-items.model";
import { Action } from "./action.model";

export const RoleApiPermission = (dbContext: any) => {
  let roleApiPermission = dbContext.define("role_api_permissions", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_menu_item: {
      type: INTEGER,
    },
    id_action: {
      type: INTEGER,
    },
    api_endpoint: {
      type: STRING,
    },
    http_method: {
      type: INTEGER,
    },
    is_active: {
      type: STRING,
    },
    master_type: {
      type: STRING
    },
    company_info_id: {
      type: INTEGER
    }
  });

  return roleApiPermission;
}
