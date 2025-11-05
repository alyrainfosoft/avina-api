import { Request } from "express";
import { addActivityLogs, createNewDatabase, getInitialPaginationFromQuery, getLocalDate, prepareMessageFromParams, resErrorDataExit, resNotFound, resSuccess, resUnknownError, statusUpdateValue } from "../../utils/shared-functions";
import { DATA_ALREADY_EXIST, DEFAULT_STATUS_CODE_SUCCESS, ERROR_NOT_FOUND, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { ActiveStatus, DeletedStatus, LogsActivityType, LogsType, Pagination } from "../../utils/app-enumeration";
import { Op, QueryTypes, Sequelize, where } from "sequelize";
import { LOG_FOR_SUPER_ADMIN, SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY } from "../../utils/app-constants";
import { updateWebConfigSetting } from "./themes.service";
import getSubSequelize from "../../utils/sub-db-connector";
import dbContext from "../../config/db-context";
import { initModels } from "../model/index.model";
import { AppUser } from "../model/app-user.model";
import { Role } from "../model/role.model";
import { Action } from "../model/action.model";
import { MenuItem } from "../model/menu-items.model";
import { RoleApiPermission } from "../model/role-api-permission.model";
import { MetalMaster } from "../model/master/attributes/metal/metal-master.model";
import { Themes } from "../model/theme/themes.model";
import { Image } from "../model/image.model";
import { ThemeAttributes } from "../model/theme/theme-attributes.model";
import { EmailTemplate } from "../model/email-template.model";
import { ConfiguratorSetting } from "../model/configurator-setting.model";
import { ConfiguratorSettingFile } from "../model/configurator-setting-file.model";
import { FiltersData } from "../model/filters.model";
import { GoldKarat } from "../model/master/attributes/metal/gold-karat.model";
import { MetalTone } from "../model/master/attributes/metal/metalTone.model";
import { DiamondShape } from "../model/master/attributes/diamondShape.model";
import { DiamondCaratSize } from "../model/master/attributes/caratSize.model";
import { HeadsData } from "../model/master/attributes/heads.model";
import { ShanksData } from "../model/master/attributes/shanks.model";
import { SideSettingStyles } from "../model/master/attributes/side-setting-styles.model";
import { StoneData } from "../model/master/attributes/gemstones.model";
import { SettingTypeData } from "../model/master/attributes/settingType.model";
import { CategoryData } from "../model/category.model";
import { Colors } from "../model/master/attributes/colors.model";
import { ClarityData } from "../model/master/attributes/clarity.model";
import { SizeData } from "../model/master/attributes/item-size.model";
import { LengthData } from "../model/master/attributes/item-length.model";
import { Collection } from "../model/master/attributes/collection.model";
import { CutsData } from "../model/master/attributes/cuts.model";
import { SystemConfiguration } from "../model/system-configuration.model";
import { WebConfigSetting } from "../model/theme/web-config-setting.model";
const { Umzug, SequelizeStorage } = require('umzug');

// Add client while new customer created from Admin 
export const addClient = async (req: Request) => {
    const trn:any = await (dbContext).transaction();
    try {
        const { company_name, company_key, db_name, db_host, db_port, db_user_name, db_password, db_dialect, db_ssl_unauthorized } = req.body

        const reqValue = {
      body :{
        db_connection : dbContext,
        company_key : company_key
      }
    }
        const { CompanyInfo } = await initModels(reqValue)
        
        const companyKey = await CompanyInfo.findOne({ where: { key: company_key }, transaction: trn })
        if ((companyKey && companyKey.dataValues)) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return resErrorDataExit({ message: prepareMessageFromParams(DATA_ALREADY_EXIST, [["field_name", "Company key"]]) });
        }

        const addCompanyInfo =  await CompanyInfo.create({
            company_name,
            key: company_key,
            db_name,
            db_host,
            db_port,
            db_user_name,
            db_password,
            db_dialect,
            db_ssl_unauthorized,
            is_active: ActiveStatus.Active
        }, { transaction: trn });
        const findCompanyDetail = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id } })
        if (findCompanyDetail && findCompanyDetail.dataValues.db_name == db_name && findCompanyDetail.dataValues.db_host == db_host && findCompanyDetail.dataValues.db_port == db_port && findCompanyDetail.dataValues.db_user_name == db_user_name) {
            const addNewClientData = await addDefaultDataForNewClient(req, addCompanyInfo, trn, "same_db")
            if (addNewClientData && addNewClientData.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            }
                return addNewClientData
            }
            await trn.commit()
            return resSuccess({data: addNewClientData.data.addCompanyInfo})
        } else {
            const addNewClientData = await addDefaultDataForNewClient(req, addCompanyInfo, trn, "different_db")
            if (addNewClientData && addNewClientData.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
                }
                return resSuccess({data: addNewClientData.data.addCompanyInfo})
            }

            
            await trn.commit()
            // run seeders
            const runMigration = await runMigrationForNewClient(db_host, db_port, db_user_name, db_password, db_name,'src/version-4/seeders/*.js')
            if (runMigration && runMigration.code != DEFAULT_STATUS_CODE_SUCCESS) {
                return runMigration
            } 
            await initModels(addNewClientData.data.db_connection, true)
            return resSuccess({data: addNewClientData.data.addCompanyInfo})
        }
    } catch (error) {
        console.log("Error in addClient:", error);
        if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
        throw error
    }
}

// const addSameDBDetailsForNewClient = async (req: Request, companyInfo: any, trn: any) => {
//     try {
//         const { company_name, company_key, db_name, db_host, db_port, db_user_name, db_password, db_dialect, db_ssl_unauthorized } = req.body
//         const clientId = companyInfo?.dataValues?.id;
//         const {  WebConfigSetting, MetalMaster,Action,MenuItem,RoleApiPermission,FiltersData } = await initModels(req)
//         const findWebSetting = await WebConfigSetting.findOne({ where: { company_info_id: req.body.session_res.client_id }, transaction: trn })

//         // metal create
//         const findMetalList = await MetalMaster.findAll({ where: { company_info_id: findWebSetting.dataValues.company_info_id }, transaction: trn })
//         const addMetal = await MetalMaster.bulkCreate(findMetalList.map((t: any) => {
//             return {
//                 name: t.dataValues.name,
//                 slug: t.dataValues.slug,
//                 company_info_id: clientId,
//                 created_by: req.body.session_res.id_app_user,
//                 created_date: getLocalDate(),
//                 is_active: ActiveStatus.Active,
//                 is_deleted: DeletedStatus.No,
//                 metal_rate: 1
//             }
//         }), { transaction: trn })

//         // web setting Create
//         const addWebSetting = await updateWebConfigSetting({
//             ...req, body: {
//                 ...req.body, smtp_user_name: findWebSetting.dataValues.smtp_user_name,
//                 smtp_password: findWebSetting.dataValues.smtp_password,
//                 smtp_host: findWebSetting.dataValues.smtp_host,
//                 smtp_port: findWebSetting.dataValues.smtp_port,
//                 smtp_secure: findWebSetting.dataValues.smtp_secure,
//                 smtp_from: findWebSetting.dataValues.smtp_from,
//                 smtp_service: findWebSetting.dataValues.smtp_service,
//                 metal_gold_id: addMetal[0].dataValues.id,
//                 metal_silver_id: addMetal[1].dataValues.id,
//                 metal_platinum_id: addMetal[2].dataValues.id
//             }
//         }, clientId)

//         // add action
//         const findAction = await Action.findAll({ where: { company_info_id: req.body.session_res.client_id, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No }, transaction: trn })
//         const addAction = await Action.bulkCreate(findAction.map((item) => {
//             return {
//                 action_name: item.dataValues.action_name,
//                 is_active: ActiveStatus.Active,
//                 is_deleted: DeletedStatus.No,
//                 company_info_id: clientId,
//                 created_by: req.body.session_res.id_app_user,
//                 created_date: getLocalDate(),
//             }
//         }))
//         // get and add menu item

//         const updateMenuItemParentId = []
//         const menuItemList = await MenuItem.findAll({
//             transaction: trn,
//             where: { company_info_id: findWebSetting.dataValues.company_info_id },
//             attributes: [
//                 "id",
//                 "name",
//                 "id_parent_menu",
//                 "company_info_id",
//                 "nav_path",
//                 "menu_location",
//                 "sort_order",
//                 "is_active",
//                 "is_deleted",
//                 "created_by",
//                 "created_date",
//                 "modified_by",
//                 "modified_date",
//                 "icon",
//                 "is_for_super_admin",
//                 [Sequelize.literal("parent_menu.name"), "parent_menu_name"],
//             ],
//             include: [
//                 { required: false, model: MenuItem, as: 'parent_menu', attributes: [] }
//             ]
//         });
//         const createMenuItem = await MenuItem.bulkCreate(menuItemList.map((item: any) => {
//             return {
//                 name: item.dataValues.name,
//                 id_parent_menu: null,
//                 company_info_id: clientId,
//                 nav_path: item.dataValues.nav_path,
//                 menu_location: item.dataValues.menu_location,
//                 sort_order: item.dataValues.sort_order,
//                 is_active: item.dataValues.is_active,
//                 is_deleted: item.dataValues.is_deleted,
//                 created_by: req.body.session_res.id_app_user,
//                 created_date: getLocalDate(),
//                 modified_by: req.body.session_res.id_app_user,
//                 modified_date: getLocalDate(),
//                 icon: item.dataValues.icon,
//                 is_for_super_admin: item.dataValues.is_for_super_admin,

//             }
//         }));

//         for (let index = 0; index < createMenuItem.length; index++) {
//             const element = createMenuItem[index].dataValues;

//             const findParentMenu = await menuItemList.find((item: any) => item.dataValues.name == element.name && item.dataValues.nav_path == element.nav_path)

//             if (findParentMenu && findParentMenu.dataValues.parent_menu_name) {
//                 const parentMenu = await createMenuItem.find((item: any) => item.dataValues.name == findParentMenu.dataValues.parent_menu_name)
//                 updateMenuItemParentId.push({ ...element, id_parent_menu: parentMenu.dataValues.id })
//             } else {
//                 updateMenuItemParentId.push({ ...element, parent_menu_id: null })
//             }
//         }
//         await MenuItem.bulkCreate(updateMenuItemParentId, { updateOnDuplicate: ["id_parent_menu"] })

//         const createdMenuList = await MenuItem.findAll({
//             where: { company_info_id: clientId },
//             attributes: [
//                 "id",
//                 "name",
//                 "id_parent_menu",
//                 "company_info_id",
//                 "nav_path",
//                 "menu_location",
//                 "sort_order",
//                 "is_active",
//                 "is_deleted",
//                 "created_by",
//                 "created_date",
//                 "modified_by",
//                 "modified_date",
//                 "icon",
//                 "is_for_super_admin",
//                 [Sequelize.literal("parent_menu.name"), "parent_menu_name"],
//             ],
//             include: [
//                 { required: false, model: MenuItem, as: 'parent_menu', attributes: [] }
//             ],
//             transaction: trn
//         });
//         // get and add role api permission

//         const rolePermissionApiList = []
//         const findRoleApi = await RoleApiPermission.findAll({
//             where: { company_info_id: findWebSetting.dataValues.company_info_id, is_active: ActiveStatus.Active },
//             attributes: [
//                 "id",
//                 "id_menu_item",
//                 "id_action",
//                 "api_endpoint",
//                 "http_method",
//                 "is_active",
//                 "master_type",
//                 "company_info_id",
//                 [Sequelize.literal("rap.name"), "menu_item_name"],
//                 [Sequelize.literal(`"rap->parent_menu"."name"`), "parent_menu_item_name"],
//                 [Sequelize.literal("action.action_name"), "action_name"],
//             ],
//             include: [
//                 { required: false, model: MenuItem, as: 'rap', attributes: [], include: [{ required: false, model: MenuItem, as: 'parent_menu', attributes: [] }] },
//                 { required: false, model: Action, as: 'action', attributes: [] }
//             ],
//             transaction: trn
//         });
//         for (let index = 0; index < findRoleApi.length; index++) {
//             const element = findRoleApi[index];

//             const findMenuItem = createdMenuList.find(
//                 (t: any) => t.dataValues.name === element.dataValues.menu_item_name && t.dataValues.parent_menu_name === element.dataValues.parent_menu_item_name
//             )



//             const findAction = addAction.find(
//                 (t: any) => t.dataValues.action_name === element.dataValues.action_name
//             )

//             if (findMenuItem) {

//                 rolePermissionApiList.push({
//                     id_menu_item: findMenuItem.dataValues.id,
//                     id_action: findAction.dataValues.id,
//                     api_endpoint: element.dataValues.api_endpoint,
//                     http_method: element.dataValues.http_method,
//                     is_active: element.dataValues.is_active,
//                     master_type: element.dataValues.master_type,
//                     company_info_id: clientId,
//                 });
//             }
//         }
//         const createRoleApi = await RoleApiPermission.bulkCreate(rolePermissionApiList, { transaction: trn })

//         // add filters

//         const findFilter = await FiltersData.findAll({
//             where: { company_info_id: req.body.session_res.client_id },
//             transaction: trn
//         })

//         await FiltersData.bulkCreate(findFilter.map((item: any) => {
//             let data = {
//                 ...item.dataValues,
//                 company_info_id: clientId,
//                 created_by: req.body.session_res.id_app_user,
//                 created_date: getLocalDate(),
//                 modified_by: null,
//                 modified_date: null,
//             }

//             delete data.id
//             return data
//         }), {transaction: trn})


//         await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
//             old_data: null,
//             new_data: {
//                 companyInfo_id: companyInfo?.dataValues?.id, data: {
//                     ...companyInfo?.dataValues
//                 },
//                 action: addAction.map((item: any) => item.dataValues),
//                 menu_item: createMenuItem.map((item: any) => item.dataValues),
//                 role_api_permission: createRoleApi.map((item: any) => item.dataValues)
//             }
//         }], companyInfo?.dataValues?.id, LogsActivityType.Add, LogsType.ClientManage, req?.body?.session_res?.id_app_user, trn)
//         return resSuccess({ data: companyInfo })
//     } catch (error) {
//         console.log("Error in addSameDBDetailsForNewClient:", error);
//         return resUnknownError({ data: error })
//     }

// }
    const addDefaultDataForNewClient = async (req: Request, companyInfo: any, trn: any, db_type: any) => {
    try {

        const { db_name, db_host, db_port, db_user_name, db_password } = req.body
  
        let reqValue = null
        let addCompanyInfo = null
        let dbConnection = req.body.db_connection
        let createdDatabaseValue = null
        if (db_type != "same_db") {
            // create database
            createdDatabaseValue = await createNewDatabase(db_host, db_port, db_user_name, db_password, db_name)
            if (createdDatabaseValue && createdDatabaseValue.code != DEFAULT_STATUS_CODE_SUCCESS) {
                return createdDatabaseValue
            }

            // run migration
            if (createdDatabaseValue && createdDatabaseValue.code == DEFAULT_STATUS_CODE_SUCCESS) {
                const runMigration = await runMigrationForNewClient(db_host, db_port, db_user_name, db_password, db_name, 'src/version-4/migrations/*.js')
                if (runMigration && runMigration.code != DEFAULT_STATUS_CODE_SUCCESS) {
                    return runMigration
                }
            }
            dbConnection = await getSubSequelize(req.body.company_key, trn)
            reqValue = {
                body: {
                    db_connection: dbConnection,
                    company_key: req.body.company_key
                }
            }
            // create default data

            const data = await dbConnection.query(`
            INSERT INTO "company_infoes" (id, company_name, key, db_name, db_host, db_port, db_user_name, db_password, db_dialect, db_ssl_unauthorized, is_active)
            OVERRIDING SYSTEM VALUE
            VALUES (:id, :company_name, :key, :db_name, :db_host, :db_port, :db_user_name, :db_password, :db_dialect, :db_ssl_unauthorized, :is_active)
            `, {
                replacements: {
                    id: companyInfo.dataValues.id, company_name: companyInfo.dataValues.company_name, key: companyInfo.dataValues.key, db_name: companyInfo.dataValues.db_name, db_host: companyInfo.dataValues.db_host, db_port: companyInfo.dataValues.db_port, db_user_name: companyInfo.dataValues.db_user_name, db_password: companyInfo.dataValues.db_password, db_dialect: companyInfo.dataValues.db_dialect, db_ssl_unauthorized: companyInfo.dataValues.db_ssl_unauthorized, is_active: ActiveStatus.Active
                },
                type: QueryTypes.INSERT,
            });
            addCompanyInfo = companyInfo
            const model = await initModels(reqValue)
        } else {
            addCompanyInfo = companyInfo
            reqValue = req
        }

        const primaryKey = await restartPrimaryKey(reqValue)

        if (primaryKey && primaryKey.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return primaryKey
        }

        // role 
        if (db_type != "same_db") {
            const addRoles = await createRoleForDifferentDBClient(req, reqValue, addCompanyInfo, trn, db_type)

            if (addRoles && addRoles.code != DEFAULT_STATUS_CODE_SUCCESS) {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    await trn.rollback()
                }
                return addRoles
            }
        }
        // super admin user create
        if (db_type != "same_db") {
            const addUsers = await createUserForDifferentDBClient(req, reqValue, addCompanyInfo, trn, db_type)

            if (addUsers && addUsers.code != DEFAULT_STATUS_CODE_SUCCESS) {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    await trn.rollback()
                }
                return addUsers
            }
        }
        
        // find super admin users
        const users = await AppUser(dbConnection).findOne({
            where: { id_role: 0 },
        })
        // action

        const addAction = await createActionForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)
       
        if (addAction && addAction.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addAction
        }
        
        // menu item
        let addMenuItem: any
        if (db_type != "same_db") {
            addMenuItem = await createMenuItemForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)
            if (addMenuItem && addMenuItem.code != DEFAULT_STATUS_CODE_SUCCESS) {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    await trn.rollback()
                }
                return addMenuItem
            }
        } else {
            addMenuItem = await createMenuItemForSameDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)
            
            if (addMenuItem && addMenuItem.code != DEFAULT_STATUS_CODE_SUCCESS) {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    await trn.rollback()
                }
                return addMenuItem
            }
        }
        
        // role api permission

        if (db_type != "same_db") {
            const addRoleApiPermission = await createRoleApiPermissionForDifferentDBClient(req, reqValue, addCompanyInfo, trn, db_type)
            if (addRoleApiPermission && addRoleApiPermission.code != DEFAULT_STATUS_CODE_SUCCESS) {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    await trn.rollback()
                }
                return addRoleApiPermission
            }
        } else {
            const addRoleApiPermission = await createRoleApiPermissionForSameDBClient(req, reqValue, addCompanyInfo, trn, db_type, addAction.data, addMenuItem.data)
            if (addRoleApiPermission && addRoleApiPermission.code != DEFAULT_STATUS_CODE_SUCCESS) {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    await trn.rollback()
                }
                return addRoleApiPermission
            }
        }


        // metals

        const addMetals = await createMetalsForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)

        if (addMetals && addMetals.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addMetals
        }

        // themes

        if (db_type != "same_db") {
            const addThemes = await createThemesForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users)

            if (addThemes && addThemes.code != DEFAULT_STATUS_CODE_SUCCESS) {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    await trn.rollback()
                }
                return addThemes
            }

            // themes attributes

            const addThemeAttribute = await createThemesAttributesForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users)

            if (addThemeAttribute && addThemeAttribute.code != DEFAULT_STATUS_CODE_SUCCESS) {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    await trn.rollback()
                }
                return addThemeAttribute
            }
        }
        // mail template

        const addMailTemplate = await createMailTemplateForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)
        if (addMailTemplate && addMailTemplate.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addMailTemplate
        }


        // configurator settings
        if (db_type != "same_db") {
            const addConfiguratorSetting = await createConfiguratorSettingForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users)
            if (addConfiguratorSetting && addConfiguratorSetting.code != DEFAULT_STATUS_CODE_SUCCESS) {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    await trn.rollback()
                }
                return addConfiguratorSetting
            }

            // configurator settings file

            const addConfiguratorSettingFile = await createConfiguratorSettingFileForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users)
            if (addConfiguratorSettingFile && addConfiguratorSettingFile.code != DEFAULT_STATUS_CODE_SUCCESS) {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    await trn.rollback()
                }
                return addConfiguratorSettingFile
            }
        }
        
        // filters

        const addFilters = await createFiltersForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)
        if (addFilters && addFilters.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addFilters
        }

        // system settings

        if (db_type != "same_db") {
            await SystemConfiguration(dbConnection).create({
                "id": 1,
                "config_key": "VIEW_ACCESS_ID_ACTION",
                "config_value": "6",
                "user_friendly_name": "Action Id for View Access",
                "display_sequence": null,
                "config_group": null,
                "id_metal": null,
                "formula": null,
                "company_info_id": addCompanyInfo.dataValues.id
            })
        } else {
            await SystemConfiguration(dbConnection).create({
                "config_key": "VIEW_ACCESS_ID_ACTION",
                "config_value": "6",
                "user_friendly_name": "Action Id for View Access",
                "display_sequence": null,
                "config_group": null,
                "id_metal": null,
                "formula": null,
                "company_info_id": addCompanyInfo.dataValues.id
            })
        }
        

        // metal karat
        const addMetalKarat = await createMetalKaratForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type, addMetals.data)
        if (addMetalKarat && addMetalKarat.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addMetalKarat
        }

        // metal tone
        const addMetalTone = await createMetalToneForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type, addMetals.data)

        if (addMetalTone && addMetalTone.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addMetalTone
        }

        // diamond shape

        const addDiamondShape = await createDiamondShapeForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)

        if (addDiamondShape && addDiamondShape.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addDiamondShape
        }

        // diamond carat size

        const addDiamondCaratSize = await createDiamondSizeForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)

        if (addDiamondCaratSize && addDiamondCaratSize.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addDiamondCaratSize
        }

        // diamond color

        const addDiamondColor = await createColorForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)

        if (addDiamondColor && addDiamondColor.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addDiamondColor
        }

        // diamond clarity

        const addDiamondClarity = await createClarityForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)

        if (addDiamondClarity && addDiamondClarity.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addDiamondClarity
        }

        // diamond cut

        const addDiamondCut = await createCutForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)

        if (addDiamondCut && addDiamondCut.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addDiamondCut
        }

        // head

        const addHead = await createHeadForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)

        if (addHead && addHead.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addHead
        }

        // shank

        const addShank = await createShankForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)
        if (addShank && addShank.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addShank
        }

        // side setting

        const addSideSetting = await createSideSettingForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)

        if (addSideSetting && addSideSetting.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addSideSetting
        }

        // setting style

        const addSettingStyle = await createSettingStyleForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)

        if (addSettingStyle && addSettingStyle.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addSettingStyle
        }

        // stone

        const addStone = await createStoneForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)
        if (addStone && addStone.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addStone
        }

        // item size

        const addItemSize = await createItemSizeForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)

        if (addItemSize && addItemSize.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addItemSize
        }

        // item length

        const addItemLength = await createItemLengthForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)

        if (addItemLength && addItemLength.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    await trn.rollback()
                }
            }
            return addItemLength
        }

        // category
        if (db_type != "same_db") {
            const addCategory = await createCategoryForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)
            if (addCategory && addCategory.code != DEFAULT_STATUS_CODE_SUCCESS) {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    
                    await trn.rollback()
                }
                
                return addCategory
            }
        } else {
            const addCategory = await createCategoryForSameDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)
            if (addCategory && addCategory.code != DEFAULT_STATUS_CODE_SUCCESS) {
                if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                    await trn.rollback()
                }

                return addCategory
            }
        }

        // web config setting
        const addWebConfigSetting = await createWebSettingsDataForDifferentDBClient(req, reqValue, addCompanyInfo, trn, users, db_type)
        if (addWebConfigSetting && addWebConfigSetting.code != DEFAULT_STATUS_CODE_SUCCESS) {
            if (trn && trn.finished !== 'rollback' && trn.finished !== 'commit') {
                await trn.rollback()
            }
            return addWebConfigSetting
        }
        return resSuccess({data: {addCompanyInfo, db_connection: reqValue}})

    } catch (error) {
        return resUnknownError({ data: error })
    }

}

const restartPrimaryKey = async (req: any) => {
    try {
        const tablesList = ['actions', 'app_users', 'carat_sizes', 'categories', 'clarities', 'colors',
            'cuts', 'diamond_group_masters', 'diamond_shapes', 'filters', 'gemstones', 'gold_kts',
            'heads', 'images', 'items_lengths', 'items_sizes', 'menu_items', 'metal_masters', 'metal_tones', 'role_api_permissions',
            'roles', 'setting_styles', 'shanks', 'system_configurations', 'theme_attributes', 'themes', 'web_config_setting'
        ]; 

        for (const table of tablesList) {
            await req.body.db_connection.query(`
                SELECT setval(
                pg_get_serial_sequence('"${table}"', 'id'),
                COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1
                );
            `);
        }

        return resSuccess()

    } catch (error) {
       return resUnknownError({ data: error })
    }   
}

const runMigrationForNewClient = async (db_host:any, db_port:any, db_user_name:any, db_password:any, db_name:any, file_path: any) => {
    try {
         const sequelize = new Sequelize({
                dialect: 'postgres', // or your db
                host: db_host,
                username: db_user_name,
                password: db_password,
                database: db_name,
                port: db_port
            });
            await sequelize.authenticate();
            const umzug = new Umzug({
                migrations: {
                    glob: file_path,
                    resolve: ({ name, path, context }) => {
                        const migration = require(path);
                        return {
                            name,
                            up: async () => migration.up(context.queryInterface, context.Sequelize),
                            down: async () => migration.down(context.queryInterface, context.Sequelize),
                        };
                    },
                },
                context: {
                    queryInterface: sequelize.getQueryInterface(),
                    Sequelize: Sequelize, // pass Sequelize class
                },
                storage: new SequelizeStorage({ sequelize }),
                logger: console,
            });

        await umzug.up();
        return resSuccess({ data: umzug})
    } catch (error) {

        return resUnknownError({ data: error })
    }
}

const createRoleForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any, db_type: any) => {
   try {
    //    
       // find super admin roles 
        const users = await AppUser(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               is_super_admin: true
           }
       }, { transaction: trn }) 
       // find super admin roles 
       const roles = await Role(req.body.db_connection).findAll({
           where: [
               {[Op.or]: [
                   { company_info_id: 0 },
                   { id: users.map((item: any) => item?.dataValues?.id_role) }
               ]}
           ]
       }, { transaction: trn })

       // add roles for client
       if(roles && roles.length > 0) {
           await Role(clientDBConnection.body.db_connection).bulkCreate(roles.map((item: any) => {
               let data = {...item.dataValues, company_info_id: companyInfo?.dataValues?.id,created_by: null, modified_by: null}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
    console.log("Error in createRoleForDifferentDBClient:", error);
     return resUnknownError({ data: error })
   } 
}
const createUserForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any, db_type: any) => {
   try {
       
       // find super admin users 
       const users = await AppUser(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               is_super_admin: true
           }
           
       }, { transaction: trn })

       // add roles for client
       if(users && users.length > 0) {
           await AppUser(clientDBConnection.body.db_connection).bulkCreate(users.map((item: any) => {
               let data = {...item.dataValues, company_info_id: companyInfo?.dataValues?.id }
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createActionForDifferentDBClient = async (req: any,clientDBConnection: any, companyInfo: any, trn: any, users: any, db_type: any) => {
   try {

       // find super admin users 
       const actions = await Action(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: [req.body.session_res.client_id, 0]
           }
       }, { transaction: trn })
    //    await clientDBConnection.body.db_connection.query(`SELECT setval(
    //       pg_get_serial_sequence('actions', 'id'),
    //       1
    //     );`)
       // add roles for client

      let actionData = []
       if (actions && actions.length > 0) {
        if(db_type != "same_db") {
                 actionData =  await Action(clientDBConnection.body.db_connection).bulkCreate(actions.map((item: any) => {
               let data = {...item.dataValues, company_info_id: companyInfo?.dataValues?.id, created_by:  users?.dataValues?.id, modified_by: null}
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
        } else {
            actionData = actions
        }
    
       }

        return resSuccess({ data: actionData });

   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createMenuItemForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {

       // find menu items
       const menuItems = await MenuItem(req.body.db_connection).findAll({
           where: {
                company_info_id: [req.body.session_res.client_id, 0],
            }
       }, { transaction: trn })

       // add menu items for client
       if(menuItems && menuItems.length > 0) {
           await MenuItem(clientDBConnection.body.db_connection).bulkCreate(menuItems.map((item: any) => {
               let data = {...item.dataValues, company_info_id: companyInfo?.dataValues?.id, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null}
               return data
           }), { transaction:  null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createMenuItemForSameDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,user: any, db_type: any) => {
    try {
 
        const models = await initModels(req)
        const updateMenuItemParentId = []
        const menuItemList = await models.MenuItem.findAll({
            where: { 
                company_info_id: req.body.session_res.client_id,
                is_for_super_admin: false
             },
            attributes: [
                "id",
                "name",
                "id_parent_menu",
                "company_info_id",
                "nav_path",
                "menu_location",
                "sort_order",
                "is_active",
                "is_deleted",
                "created_by",
                "created_date",
                "modified_by",
                "modified_date",
                "icon",
                "is_for_super_admin",
                [Sequelize.literal("parent_menu.name"), "parent_menu_name"],
            ],
            include: [
                { required: false, model: models.MenuItem, as: 'parent_menu', attributes: [] }
            ]
        });
        const createMenuItem = await MenuItem(clientDBConnection.body.db_connection).bulkCreate(menuItemList.map((item: any) => {
            return {
                name: item.dataValues.name,
                id_parent_menu: null,
                company_info_id: companyInfo?.dataValues?.id,
                nav_path: item.dataValues.nav_path,
                menu_location: item.dataValues.menu_location,
                sort_order: item.dataValues.sort_order,
                is_active: item.dataValues.is_active,
                is_deleted: item.dataValues.is_deleted,
                created_by: req.body.session_res.id_app_user,
                created_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
                icon: item.dataValues.icon,
                is_for_super_admin: item.dataValues.is_for_super_admin,

            }
        }));

        for (let index = 0; index < createMenuItem.length; index++) {
            const element = createMenuItem[index].dataValues;

            const findParentMenu = await menuItemList.find((item: any) => item.dataValues.name == element.name && item.dataValues.nav_path == element.nav_path)

            if (findParentMenu && findParentMenu.dataValues.parent_menu_name) {
                const parentMenu = await createMenuItem.find((item: any) => item.dataValues.name == findParentMenu.dataValues.parent_menu_name)
                updateMenuItemParentId.push({ ...element, id_parent_menu: parentMenu.dataValues.id })
            } else {
                updateMenuItemParentId.push({ ...element, parent_menu_id: null })
            }
        }
       const createdMenuList = await MenuItem(clientDBConnection.body.db_connection).bulkCreate(updateMenuItemParentId, { updateOnDuplicate: ["id_parent_menu"] })
        return resSuccess({data: createdMenuList})
    } catch (error) {
        return resUnknownError({ data: error })
    }
}
const createRoleApiPermissionForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any, db_type: any) => {
   try {
       
       // find role api permissions
       const roleAPIPermissions = await req.body.db_connection.query(`(SELECT role_api_permissions.* FROM role_api_permissions 
LEFT JOIN menu_items ON menu_items.id = role_api_permissions.id_menu_item
WHERE role_api_permissions.company_info_id = ${req.body.session_res.client_id})`, { type: QueryTypes.SELECT }, { transaction: trn })

       // add role api permissions for client
       if(roleAPIPermissions && roleAPIPermissions.length > 0) {
           await RoleApiPermission(clientDBConnection.body.db_connection).bulkCreate(roleAPIPermissions.map((item: any) => {
               const data = { ...item, company_info_id: companyInfo?.dataValues?.id }
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createRoleApiPermissionForSameDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any, db_type: any,actionList:any,menuList:any ) => {
    try {

        const models = initModels(req);

        const newModels = initModels(clientDBConnection);
        const rolePermissionApiList = []
        const findRoleApi = await models.RoleApiPermission.findAll({
            where: { company_info_id: req.body.session_res.client_id, is_active: ActiveStatus.Active },
            attributes: [
                "id",
                "id_menu_item",
                "id_action",
                "api_endpoint",
                "http_method",
                "is_active",
                "master_type",
                "company_info_id",
                [Sequelize.literal("rap.name"), "menu_item_name"],
                [Sequelize.literal(`"rap->parent_menu"."name"`), "parent_menu_item_name"],
                [Sequelize.literal("action.action_name"), "action_name"],
            ],
            include: [
                { required: false, model: models.MenuItem, as: 'rap', attributes: [], include: [{ required: false, model: models.MenuItem, as: 'parent_menu', attributes: [] }] },
                { required: false, model: models.Action, as: 'action', attributes: [] }
            ],
            transaction: trn
        });
        const createdMenuList = await newModels.MenuItem.findAll({
            where: { company_info_id: companyInfo?.dataValues?.id },
            attributes: [
                "id",
                "name",
                "id_parent_menu",
                "company_info_id",
                "nav_path",
                "menu_location",
                "sort_order",
                "is_active",
                "is_deleted",
                "created_by",
                "created_date",
                "modified_by",
                "modified_date",
                "icon",
                "is_for_super_admin",
                [Sequelize.literal("parent_menu.name"), "parent_menu_name"],
            ],
            include: [
                { required: false, model: newModels.MenuItem, as: 'parent_menu', attributes: [] }
            ],
            transaction: trn
        });

        for (let index = 0; index < findRoleApi.length; index++) {
            const element = findRoleApi[index];

            const findMenuItem = createdMenuList.find(
                (t: any) => t.dataValues.name === element.dataValues.menu_item_name && t.dataValues.parent_menu_name === element.dataValues.parent_menu_item_name
            )

            const findAction = actionList.find(
                (t: any) => t.dataValues.action_name === element.dataValues.action_name
            )

            if (findMenuItem) {

                rolePermissionApiList.push({
                    id_menu_item: findMenuItem.dataValues.id,
                    id_action: findAction.dataValues.id,
                    api_endpoint: element.dataValues.api_endpoint,
                    http_method: element.dataValues.http_method,
                    is_active: element.dataValues.is_active,
                    master_type: element.dataValues.master_type,
                    company_info_id: companyInfo?.dataValues?.id,
                });
            }
        }


        const createRoleApi = await RoleApiPermission(clientDBConnection.body.db_connection).bulkCreate(rolePermissionApiList, { transaction: trn })

        return resSuccess()
    } catch (error) {
        console.log("-----------------------------", error)
        return resUnknownError({ data: error })
    }
}
const createMetalsForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any, users: any, db_type: any) => {
   try {
       // find metals
       const metals = await MetalMaster(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       let metalData = []
       if (metals && metals.length > 0) {
          metalData = await MetalMaster(clientDBConnection.body.db_connection).bulkCreate(metals.map((item: any) => {
               let data = {...item.dataValues, company_info_id: companyInfo?.dataValues?.id, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess({data: metalData})
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createThemesForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any) => {
   try {
       // find themes
       const themes = await Themes(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
           }
       }, { transaction: trn })
       // find theme images
       const themeImages = await Image(req.body.db_connection).findAll({
           where: {id: themes.map((item: any) => item?.dataValues?.id_image)}
       })

       // add theme images for client
       if(themeImages && themeImages.length > 0) {
           await Image(clientDBConnection.body.db_connection).bulkCreate(themeImages.map((item: any) => {
               return {...item.dataValues, created_by: users.dataValues.id, modified_by: null}
           }))
       }
       // add themes for client
       if(themes && themes.length > 0) {
           await Themes(clientDBConnection.body.db_connection).bulkCreate(themes.map((item: any) => {
               return {...item.dataValues, created_by: users.dataValues.id, modified_by: null}
           }))
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createThemesAttributesForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any) => {
   try {

       // find theme attributes
       const themeAttributes = await ThemeAttributes(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
           }
       }, { transaction: trn })
       // find theme attributes images
       const themeImages = await Image(req.body.db_connection).findAll({
           where: {id: themeAttributes.map((item: any) => item?.dataValues?.id_image)}
       })

       // add theme attributes images for client
       if(themeImages && themeImages.length > 0) {
           await Image(clientDBConnection.body.db_connection).bulkCreate(themeImages.map((item: any) => {
               return {...item.dataValues, created_by: users.dataValues.id, modified_by: null}
           }))
       }
       // add theme attributes for client
       if(themeAttributes && themeAttributes.length > 0) {
           await ThemeAttributes(clientDBConnection.body.db_connection).bulkCreate(themeAttributes.map((item: any) => {
               return {...item.dataValues, created_by: users.dataValues.id, modified_by: null, deleted_by: null}
           }))
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createMailTemplateForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {

       // find email template
       const emailTemplate = await EmailTemplate(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })
   
       // add email template for client
       if(emailTemplate && emailTemplate.length > 0) {
           await EmailTemplate(clientDBConnection.body.db_connection).bulkCreate(emailTemplate.map((item: any) => {
               let data = {...item.dataValues, company_info_id: companyInfo?.dataValues?.id, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createConfiguratorSettingForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any) => {
   try {

       // find configurator settings
       const configuratorSettings = await ConfiguratorSetting(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
           }
       }, { transaction: trn })

       // find configurator setting images
       const configuratorSettingImage = await Image(req.body.db_connection).findAll({
           where: {id: configuratorSettings.map((item: any) => item?.dataValues?.id_image)}
       })

       // add configurator setting images for client
       if(configuratorSettingImage && configuratorSettingImage.length > 0) {
           await Image(clientDBConnection.body.db_connection).bulkCreate(configuratorSettingImage.map((item: any) => {
               return {...item.dataValues, created_by: users.dataValues.id, modified_by: null}
           }))
       }
       // add configurator setting for client
       if(configuratorSettings && configuratorSettings.length > 0) {
           await ConfiguratorSetting(clientDBConnection.body.db_connection).bulkCreate(configuratorSettings.map((item: any) => {
               return {...item.dataValues, created_by: users.dataValues.id, modified_by: null}
           }))
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createConfiguratorSettingFileForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any) => {
   try {

       // find configurator setting files
       const configuratorSettingFiles = await ConfiguratorSettingFile(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
           }
       }, { transaction: trn })
       
       // add configurator setting files for client
       if(configuratorSettingFiles && configuratorSettingFiles.length > 0) {
           await ConfiguratorSettingFile(clientDBConnection.body.db_connection).bulkCreate(configuratorSettingFiles.map((item: any) => {
               return {...item.dataValues, created_by: users.dataValues.id, modified_by: null}
           }))
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createFiltersForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       // find filters
       const filters = await FiltersData(req.body.db_connection).findAll({
           where: {
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })
       // add filters for client

       if(filters && filters.length > 0) {
           await FiltersData(clientDBConnection.body.db_connection).bulkCreate(filters.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createMetalKaratForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any, metalData: any) => {
   try {

       const GoldId = metalData.map((item: any) => item?.dataValues).find((item: any) => item?.name?.toLocaleLowerCase() == "gold")?.id
       
       // find metal karats
       const metalKarat = await GoldKarat(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // find metal karat images
       const metalKaratImage = await Image(req.body.db_connection).findAll({
           where: {id: metalKarat.map((item: any) => item?.dataValues?.id_image)}
       })

       // add metal karat images for client
       if(db_type != "same_db" && metalKaratImage && metalKaratImage.length > 0) {
           await Image(clientDBConnection.body.db_connection).bulkCreate(metalKaratImage.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }
       // add metal karat for client
       if(metalKarat && metalKarat.length > 0) {
           await GoldKarat(clientDBConnection.body.db_connection).bulkCreate(metalKarat.map((item: any) => {
               let data = {
                   ...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null,
                   company_info_id: companyInfo?.dataValues?.id, id_image: db_type != "same_db" ? item?.dataValues?.id_image : null,
                   id_metal: db_type == "same_db" ? GoldId : item?.dataValues?.id_metal
               }
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createMetalToneForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any,metalData: any) => {
   try {
       const GoldId = metalData.map((item: any) => item?.dataValues).find((item: any) => item?.name?.toLocaleLowerCase() == "gold")?.id
       
       // find metal tones
       const metalTone = await MetalTone(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // find metal tone images
       const metalToneImage = await Image(req.body.db_connection).findAll({
           where: {id: metalTone.map((item: any) => item?.dataValues?.id_image)}
       })

       // add metal tone images for client
       if(db_type != "same_db" && metalToneImage && metalToneImage.length > 0) {
           await Image(clientDBConnection.body.db_connection).bulkCreate(metalToneImage.map((item: any) => {
               let data = {
                   ...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id,
                   modified_by: null, company_info_id: companyInfo?.dataValues?.id,
                   id_image: db_type != "same_db" ? item?.dataValues?.id_image : null
               }
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }
       // add metal tone for client
       if(metalTone && metalTone.length > 0) {
           await MetalTone(clientDBConnection.body.db_connection).bulkCreate(metalTone.map((item: any) => {
               let data = {
                   ...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null,
                   company_info_id: companyInfo?.dataValues?.id, id_image: db_type != "same_db" ? item?.dataValues?.id_image : null,
                   id_metal: db_type == "same_db" ? GoldId : item?.dataValues?.id_metal
               }
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createDiamondShapeForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find diamond shapes
       const diamondShape = await DiamondShape(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // find diamond shape images
       const diamondShapeImage = await Image(req.body.db_connection).findAll({
           where: {id: diamondShape.map((item: any) => item?.dataValues?.id_image)}
       })

       // add diamond shape images for client
       if(db_type != "same_db" && diamondShapeImage && diamondShapeImage.length > 0) {
           await Image(clientDBConnection.body.db_connection).bulkCreate(diamondShapeImage.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }
       // add diamond shape for client
       if(diamondShape && diamondShape.length > 0) {
           await DiamondShape(clientDBConnection.body.db_connection).bulkCreate(diamondShape.map((item: any) => {
               let data = {
                   ...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id,
                   modified_by: null, company_info_id: companyInfo?.dataValues?.id, id_image: db_type != "same_db" ? item?.dataValues?.id_image : null
               }
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createDiamondSizeForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find diamond carat sizes
       const diamondSize = await DiamondCaratSize(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // find diamond carat size images
       const diamondSizeImage = await Image(req.body.db_connection).findAll({
           where: {id: diamondSize.map((item: any) => item?.dataValues?.id_image)}
       })

       // add diamond carat size images for client
       if(db_type != "same_db" && diamondSizeImage && diamondSizeImage.length > 0) {
           await Image(clientDBConnection.body.db_connection).bulkCreate(diamondSizeImage.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }
       // add diamond carat size for client
       if(diamondSize && diamondSize.length > 0) {
           await DiamondCaratSize(clientDBConnection.body.db_connection).bulkCreate(diamondSize.map((item: any) => {
               let data = {
                   ...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id,
                   modified_by: null, company_info_id: companyInfo?.dataValues?.id, id_image: db_type != "same_db" ? item?.dataValues?.id_image : null
               }
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createHeadForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find heads
       const headData = await HeadsData(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // find head images
       const headImage = await Image(req.body.db_connection).findAll({
           where: {id: headData.map((item: any) => item?.dataValues?.id_image)}
       })

       // add head images for client
       if(db_type != "same_db" && headImage && headImage.length > 0) {
           await Image(clientDBConnection.body.db_connection).bulkCreate(headImage.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }
       // add head for client
       if(headData && headData.length > 0) {
           await HeadsData(clientDBConnection.body.db_connection).bulkCreate(headData.map((item: any) => {
               let data = {
                   ...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id,
                   modified_by: null, company_info_id: companyInfo?.dataValues?.id, id_image: db_type != "same_db" ? item?.dataValues?.id_image : null
               }
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createShankForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find shanks
       const shankData = await ShanksData(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // find shank images
       const shankImage = await Image(req.body.db_connection).findAll({
           where: {id: shankData.map((item: any) => item?.dataValues?.id_image)}
       })

       // add shank images for client
       if(db_type != "same_db" && shankImage && shankImage.length > 0) {
           await Image(clientDBConnection.body.db_connection).bulkCreate(shankImage.map((item: any) => {
               let data = {
                   ...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id,
                   modified_by: null, company_info_id: companyInfo?.dataValues?.id, id_image: db_type != "same_db" ? item?.dataValues?.id_image : null
               }
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }
       // add shank for client
       if(shankData && shankData.length > 0) {
           await ShanksData(clientDBConnection.body.db_connection).bulkCreate(shankData.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createSideSettingForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find side settings
       const sideSetting = await SideSettingStyles(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // find side setting images
       const sideSettingImage = await Image(req.body.db_connection).findAll({
           where: {id: sideSetting.map((item: any) => item?.dataValues?.id_image)}
       })

       // add side setting images for client
       if(db_type != "same_db" && sideSettingImage && sideSettingImage.length > 0) {
           await Image(clientDBConnection.body.db_connection).bulkCreate(sideSettingImage.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }
       // add side setting for client
       if(sideSetting && sideSetting.length > 0) {
           await SideSettingStyles(clientDBConnection.body.db_connection).bulkCreate(sideSetting.map((item: any) => {
               let data = {
                   ...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id,
                   modified_by: null, company_info_id: companyInfo?.dataValues?.id, id_image: db_type != "same_db" ? item?.dataValues?.id_image : null
               }
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createStoneForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find stones
       const stone = await StoneData(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // find stone images
       const stoneImage = await Image(req.body.db_connection).findAll({
           where: {id: stone.map((item: any) => item?.dataValues?.id_image)}
       })

       // add stone images for client
       if(db_type != "same_db" && stoneImage && stoneImage.length > 0) {
           await Image(clientDBConnection.body.db_connection).bulkCreate(stoneImage.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }
       // add stone for client
       if(stone && stone.length > 0) {
           await StoneData(clientDBConnection.body.db_connection).bulkCreate(stone.map((item: any) => {
               let data = {
                   ...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null,
                   company_info_id: companyInfo?.dataValues?.id, id_image: db_type != "same_db" ? item?.dataValues?.id_image : null
               }
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createSettingStyleForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find setting styles
       const settingStyle = await SettingTypeData(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // find setting style images
       const settingStyleImage = await Image(req.body.db_connection).findAll({
           where: {id: settingStyle.map((item: any) => item?.dataValues?.id_image)}
       })

       // add setting style images for client
       if(db_type != "same_db" && settingStyleImage && settingStyleImage.length > 0) {
           await Image(clientDBConnection.body.db_connection).bulkCreate(settingStyleImage.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }
       // add setting style for client
       if(settingStyle && settingStyle.length > 0) {
           await SettingTypeData(clientDBConnection.body.db_connection).bulkCreate(settingStyle.map((item: any) => {
               let data = {
                   ...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id,
                   modified_by: null, company_info_id: companyInfo?.dataValues?.id, id_image: db_type != "same_db" ? item?.dataValues?.id_image : null
               }
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createCategoryForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find Categories
       const category = await CategoryData(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       
       // add Category for client
       if(category && category.length > 0) {
           await CategoryData(clientDBConnection.body.db_connection).bulkCreate(category.map((item: any) => {
               let data = {...item.dataValues, id_image: null, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createCategoryForSameDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,user: any, db_type: any) => {
    try {
 
        const models = initModels(req);
        const menuItemList = await models.CategoryData.findAll({
            transaction: trn,
            where: { company_info_id: req.body.session_res.client_id, parent_id: null },
        });
        const createMenuItem = await CategoryData(clientDBConnection.body.db_connection).bulkCreate(menuItemList.map((item: any) => {

            let data = {...item.dataValues, parent_id: null, created_by: req.body.session_res.id_app_user, modified_by: null, company_info_id: companyInfo?.dataValues?.id, id_image: null, id_size: null, id_length: null, is_setting_style: null, modified_date: getLocalDate(), created_date: getLocalDate()}
            delete data.id
            delete data.parent_category_name
            return data
        }));

        return resSuccess()
    } catch (error) {
        return resUnknownError({ data: error })
    }
}
const createColorForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find colors
       const color = await Colors(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // add color for client
       if(color && color.length > 0) {
           await Colors(clientDBConnection.body.db_connection).bulkCreate(color.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createClarityForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find clarities
       const clarity = await ClarityData(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // add clarity for client
       if(clarity && clarity.length > 0) {
           await ClarityData(clientDBConnection.body.db_connection).bulkCreate(clarity.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createCutForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find cut
       const cuts = await CutsData(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // add cut for client
       if(cuts && cuts.length > 0) {
           await CutsData(clientDBConnection.body.db_connection).bulkCreate(cuts.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createItemSizeForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find size
       const sizes = await SizeData(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // add size for client
       if(sizes && sizes.length > 0) {
           await SizeData(clientDBConnection.body.db_connection).bulkCreate(sizes.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createItemLengthForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find length
       const lengths = await LengthData(req.body.db_connection).findAll({
           where: {
               is_deleted: DeletedStatus.No,
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // add length for client
       if(lengths && lengths.length > 0) {
           await LengthData(clientDBConnection.body.db_connection).bulkCreate(lengths.map((item: any) => {
               let data = {...item.dataValues, created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id, modified_by: null, company_info_id: companyInfo?.dataValues?.id}
               if(db_type == "same_db") {
                   delete data.id
               }
               return data
           }), { transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
const createWebSettingsDataForDifferentDBClient = async (req: Request,clientDBConnection: any, companyInfo: any, trn: any,users: any, db_type: any) => {
   try {
       
       // find Setting
       const Settings = await WebConfigSetting(req.body.db_connection).findOne({
           where: {
               company_info_id: req.body.session_res.client_id
           }
       }, { transaction: trn })

       // add Setting for client
       if(Settings && Settings.dataValues) {
           await WebConfigSetting(clientDBConnection.body.db_connection).create({
               smtp_user_name: Settings?.dataValues?.smtp_user_name,
               smtp_password: Settings?.dataValues?.smtp_password,
               smtp_host: Settings?.dataValues?.smtp_host,
               smtp_port: Settings?.dataValues?.smtp_port,
               smtp_secure: Settings?.dataValues?.smtp_secure,
               smtp_from: Settings?.dataValues?.smtp_from,
               smtp_service: Settings?.dataValues?.smtp_service,
               s3_bucket_name: Settings?.dataValues?.s3_bucket_name,
               s3_bucket_region: Settings?.dataValues?.s3_bucket_region,
               s3_bucket_secret_access_key: Settings?.dataValues?.s3_bucket_secret_access_key,
               s3_bucket_status: Settings?.dataValues?.s3_bucket_status,
               s3_bucket_access_key: Settings?.dataValues?.s3_bucket_access_key,
               glb_key: Settings?.dataValues?.glb_key,
               band_glb_key: Settings?.dataValues?.band_glb_key,
               eternity_band_glb_key: Settings?.dataValues?.eternity_band_glb_key,
               bracelet_glb_key: Settings?.dataValues?.bracelet_glb_key,
               pendant_glb_key: Settings?.dataValues?.pendant_glb_key,
               stud_glb_key: Settings?.dataValues?.stud_glb_key,
               is_login: Settings?.dataValues?.is_login,
               is_config_login: Settings?.dataValues?.is_config_login,
               google_map_api_key: Settings?.dataValues?.google_map_api_key,
               glb_url: Settings?.dataValues?.glb_url,
               otp_generate_digit_count: Settings?.dataValues?.otp_generate_digit_count,
               company_info_id: companyInfo?.dataValues?.id,
               company_id: companyInfo?.dataValues?.id,
               created_by: db_type == "same_db" ? req.body.session_res.id_app_user : users.dataValues.id,
               modified_by: null,
               created_date: getLocalDate()
           },{ transaction: db_type == "same_db" ? trn : null })
       }

       return resSuccess()
   } catch (error) {
     return resUnknownError({ data: error })
   } 
}
export const getAllClients = async (req: Request) => {
    try {
        const {CompanyInfo} = await initModels(req);
        let paginationProps = {};

        let pagination = {
            ...getInitialPaginationFromQuery(req.query),
            search_text: req.query.search_text,
        };
        let noPagination = req.query.no_pagination === Pagination.no;

        let where = [
            pagination.search_text
                ? {
                    [Op.or]: [
                        { company_name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                        { key: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                        { db_name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                    ],
                }
                : {},
        ];

        if (!noPagination) {
            const totalItems = await CompanyInfo.count({
                where,
            });

            if (totalItems === 0) {
                return resSuccess({ data: { pagination, result: [] } });
            }
            pagination.total_items = totalItems;
            pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

            paginationProps = {
                limit: pagination.per_page_rows,
                offset: (pagination.current_page - 1) * pagination.per_page_rows,
            };
        }

        const result = await CompanyInfo.findAll({
            ...paginationProps,
            where,
            order: [[pagination.sort_by, pagination.order_by]],
            attributes: [
                "id",
                "company_name",
                ["key", "company_key"],
                "db_name",
                "db_host",
                "db_port",
                "db_user_name",
                "db_password",
                "db_dialect",
                "db_ssl_unauthorized",
                "is_active"
            ],
        });

        return resSuccess({ data: noPagination ? result : { pagination, result } });
    } catch (error) {
        throw error;
    }
};

export const editClient = async (req: Request) => {
    try {
        const { db_name, db_host, db_port, db_user_name, db_password, db_dialect, db_ssl_unauthorized,company_name,company_key } = req.body
        const {CompanyInfo} = await initModels(req);
        const CategoryInformation = await CompanyInfo.findOne({where: {
            key: req.params.company_key
        }});

        await CompanyInfo.update({
            company_name,
            key:company_key,
            db_name,
            db_host,
            db_port,
            db_user_name,
            db_password,
            db_dialect,
            db_ssl_unauthorized
        }, {
            where: {
                key: req.params.company_key
            }
        })
        const AfterUpdateCategoryInformation = await CompanyInfo.findOne({where: {
            key: req.params.company_key
        }});
        await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
          old_data: { companyInfo_id: CategoryInformation?.dataValues?.id, data: CategoryInformation?.dataValues},
          new_data: {
            companyInfo_id: CategoryInformation?.dataValues?.id, data: { ...CategoryInformation?.dataValues }
          }
        }], CategoryInformation?.dataValues?.id,LogsActivityType.Edit, LogsType.ClientManage, req?.body?.session_res?.id_app_user)
        
        return resSuccess({ data: RECORD_UPDATE_SUCCESSFULLY })
    } catch (error) {
        throw error
    }
}

export const getClientDetail = async (req: Request) => {
    try {
        const {CompanyInfo} = await initModels(req);
        const result = await CompanyInfo.findOne({
            where: { key: req.params.company_key },
            attributes: [
                "id",
                "company_name",
                ["key", "company_key"],
                "db_name",
                "db_host",
                "db_port",
                "db_user_name",
                "db_password",
                "db_dialect",
                "db_ssl_unauthorized",
                "is_active"
            ]

        })

        if (!(result && result.dataValues)) {
            return resNotFound()
        }
        return resSuccess({ data: result })
    } catch (error) {
        throw error
    }
}

export const statusUpdateForClient = async (req: Request) => {
    try {
        const {CompanyInfo} = await initModels(req);
        const findClient = await CompanyInfo.findOne({
            where: {
                key: req.params.company_key
            }
        })
        if (!(findClient && findClient.dataValues)) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Company key"]]) })
        }
        await CompanyInfo.update({
            is_active: statusUpdateValue(findClient),
        },
            {
                where: {
                    key: req.params.company_key
                }
            }
        )
        await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
          old_data: { companyInfo_id: findClient?.dataValues?.id, data: {...findClient?.dataValues}},
          new_data: {
            companyInfo_id: findClient?.dataValues?.id, data: {
              ...findClient?.dataValues, is_active: statusUpdateValue(findClient),
              modified_date: getLocalDate(),
              modified_by: req?.body?.session_res?.id_app_user,
            },section_type: findClient?.dataValues?.section_type
          }
        }], findClient?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.ClientManage, req?.body?.session_res?.id_app_user)
            
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })

    } catch (error) {
        throw error
    }
}