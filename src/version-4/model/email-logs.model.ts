import { DataType } from "sequelize-typescript";
import { BOOLEAN, ENUM, DATE, INTEGER, STRING, TEXT, JSON, ARRAY, Sequelize } from "sequelize";
import { DYNAMIC_MAIL_TYPE } from "../../utils/app-enumeration";
export const EamilLog = (dbContext: Sequelize) => {
    let emailLog = dbContext.define("email_logs", {
        id: {
            type: INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        raw_subject: {
            type: STRING,
            allowNull: true
        },
        actual_subject: {
            type: JSON,
            allowNull: true
        },
        containt_replace_payload: {
            type: JSON,
            allowNull: true
        },
        raw_body: {
            type: TEXT,
            allowNull: true
        },
        actual_body: {
            type: JSON,
            allowNull: true
        },
        to: {
            type: STRING,
            allowNull: true
        },
        from: {
            type: STRING,
            allowNull: true
        },
        cc: {
            type: STRING,
            allowNull: true
        },
        configuration_value: {
            type: JSON,
        },
        mail_type: {
            type: TEXT,
            allowNull: true,
        },
        response_status: {
            type: ENUM('success', 'error', 'pending'),
            allowNull: true,
            defaultValue: 'pending'
        },
        mail_for: {
            type: DataType.ENUM(...Object.values(DYNAMIC_MAIL_TYPE).filter(v => typeof v === 'number').map(v => v.toString())),
            allowNull: true,
        },
        attachment: {
            type: JSON,
            allowNull: true,
        },
        success_response: {
            type: JSON,
            allowNull: true
        },
        error_message: {
            type: JSON,
            allowNull: true
        },
        is_dunamic: {
            type: BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        created_by: {
            type: INTEGER,
            allowNull: true
        },
        updated_by: {
            type: INTEGER,
            allowNull: true
        },
        created_at: {
            allowNull: true,
            type: DATE,
        },
        updated_at: {
            allowNull: true,
            type: DATE,
        },
        company_info_id: {
            allowNull: true,
            type: INTEGER,
        }
    });
    return emailLog;
}