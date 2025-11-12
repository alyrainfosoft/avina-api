import { BIGINT, DATE, INTEGER, JSON, STRING } from "sequelize";
import { AppUser } from "./app-user.model";

export const ActivityLogs = (dbContext: any) => {
    let activityLogs = dbContext.define("activity_logs", {
        id: {
            type: BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        log_type: {
            type: STRING,
        },
        activity_type: {
            type: STRING,
        },
        created_date: {
            type: DATE,
        },
        created_by: {
            type: INTEGER,
        },
        modified_by: {
            type: INTEGER,
        },
        modified_date: {
            type: DATE,
        },
        old_value_json: {
            type: JSON
        },
        updated_value_json: {
            type: JSON
        },
        ref_id: {
            type: INTEGER
        },
        company_info_id: {
            type: INTEGER
        }
    });

    return activityLogs;
}