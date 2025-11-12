import { DATE, INTEGER, STRING } from "sequelize";

export const RolePermissionAccessAuditLog = (dbContext: any) => {
  let rolePermissionAccessAuditLog = dbContext.define(
    "role_permission_access_audit_logs",
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_role_permission_access: {
        type: INTEGER,
      },
      old_value: {
        type: STRING,
      },
      new_value: {
        type: STRING,
      },
      changed_by: {
        type: INTEGER,
      },
      changed_date: {
        type: DATE,
      },
      company_info_id: {
        type: INTEGER
      }
    }
  );

  return rolePermissionAccessAuditLog;
}
