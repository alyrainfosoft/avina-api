import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";

export const MegaMenus = (dbContext: any) => {
    let megaMenus = dbContext.define("mega_menus", {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: 'character varying',
        },
        menu_type: {
            type: 'character varying',
        },
        is_active: {
            type: 'bit',
        },
        created_date: {
            type: DATE,
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
        company_info_id: {
            type: INTEGER,
        },
        is_deleted: {
            type: 'bit',
        }
    });
    return megaMenus;
}
