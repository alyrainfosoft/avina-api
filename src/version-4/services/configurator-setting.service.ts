import { Request } from "express";
import { addActivityLogs, columnValueLowerCase, fileAddAndEditInDBAndS3ForOriginalFileName, getExtensionFromMimeType, getInitialPaginationFromQuery, getLocalDate, imageAddAndEditInDBAndS3, imageAddAndEditInDBAndS3ForOriginalFileName, prepareMessageFromParams, resErrorDataExit, resNotFound, resSuccess, statusUpdateValue } from "../../utils/shared-functions";
import { ActiveStatus, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType } from "../../utils/app-enumeration";
import { DATA_ALREADY_EXIST, DEFAULT_STATUS_CODE_SUCCESS, ERROR_NOT_FOUND, MISSING_ID_CONFIGURATOR, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { Op, Sequelize } from "sequelize";
import { LOG_FOR_SUPER_ADMIN } from "../../utils/app-constants";
import { initModels } from "../model/index.model";

export const addConfigurator = async (req: Request) => {
    try {
        const { key, name, description, link } = req.body;
        const {ConfiguratorSetting} = initModels(req)
        const findSameConfigurator = await ConfiguratorSetting.findOne({ where: [columnValueLowerCase("key", key), { is_deleted: DeletedStatus.No }] })
        const findSameNameConfigurator = await ConfiguratorSetting.findOne({ where: [columnValueLowerCase("name", name), { is_deleted: DeletedStatus.No }] })
       
        if ((findSameConfigurator && findSameConfigurator.dataValues) || (findSameNameConfigurator && findSameNameConfigurator.dataValues)) {
            return resErrorDataExit()
        }
        const trn = await req.body.db_connection.transaction();
        try {
            let idImage = null;
            if (req.file) {
                const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                req,
                    { ...req.file, originalname: `${key}.${getExtensionFromMimeType(req.file)}` },
                    IMAGE_TYPE.ConfigProduct,
                    req.body.session_res.id_app_user,
                    '',
                    req.body.session_res.client_id,
                );
                if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                    trn.rollback();
                    return imageData;
                }
                idImage = imageData.data;
            }

            const payload = {
                name,
                key,
                id_image: idImage,
                description,
                link,
                created_date: getLocalDate(),
                is_active: ActiveStatus.Active,
                is_deleted: DeletedStatus.No,
                created_by: req.body.session_res.id_app_user,
            };

            const configurator = await ConfiguratorSetting.create(payload, { transaction: trn });

            await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
                old_data: null,
                new_data: {
                    configurator_id: configurator?.dataValues?.id, data: {
                        ...configurator?.dataValues
                    }
                }
            }], configurator?.dataValues?.id, LogsActivityType.Add, LogsType.configurator_setting, req?.body?.session_res?.id_app_user,trn)

            await trn.commit();
            return resSuccess({ data: configurator.dataValues });
        } catch (e) {
            await trn.rollback();
            throw e;
        }
    } catch (error) {
        throw error
    }
};

export const getConfigurator = async (req: Request) => {
    try {
        let paginationProps = {};
        const {ConfiguratorSetting,CompanyInfo,Image} = initModels(req)
        let pagination = {
            ...getInitialPaginationFromQuery(req.query),
            search_text: req.query.search_text,
        };
        let noPagination = req.query.no_pagination === "1";

        let where = [
            { is_deleted: DeletedStatus.No },
            pagination.is_active ? { is_active: pagination.is_active } : {},
            pagination.search_text
                ? {
                    [Op.or]: [
                        { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                        { key: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                    ],
                }
                : {},
        ];

        if (!noPagination) {
            const totalItems = await ConfiguratorSetting.count({
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

        const companyInfo = await CompanyInfo.findOne({ where: { is_active: ActiveStatus.Active, id: req.body.session_res.client_id } })
        
        const idConfigurator = companyInfo?.dataValues?.id_configurator;

        const idArrayLiteral = idConfigurator
        ? `ARRAY[${idConfigurator.replaceAll("|", ",")}]::int[]`
        : `ARRAY[]::int[]`;  


        const result = await ConfiguratorSetting.findAll({
            ...paginationProps,
            where,
            order: [[pagination.sort_by, pagination.order_by]],
            attributes: [
                "id",
                "name",
                "key",
                "id_image",
                "is_active",
                "description",
                "link",
                [Sequelize.literal("image.image_path"), "image_path"],
                [
                    Sequelize.literal(`configurator_setting.id = ANY(${idArrayLiteral})`),
                    "is_selected"
                ]
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
        });

        return resSuccess({ data: noPagination ? result : { pagination, result } });
    } catch (error) {
        throw error;
    }
}

export const updateConfigurator = async (req: Request) => {
    try {
        const { name, description, link } = req.body;
        const { id } = req.params;
        const { ConfiguratorSetting,Image } = initModels(req)
        const findConfigurator = await ConfiguratorSetting.findOne({ where: [{ id: { [Op.eq]: id } }, { is_deleted: DeletedStatus.No }] })
        const findSameNameConfigurator = await ConfiguratorSetting.findOne({ where: [columnValueLowerCase("name", name),{id: { [Op.ne]: id }}, { is_deleted: DeletedStatus.No }] })

        if (!(findConfigurator && findConfigurator.dataValues)) {
            return resNotFound()
        }

        if(findSameNameConfigurator && findSameNameConfigurator.dataValues){
            return resErrorDataExit()
        }
        const trn = await req.body.db_connection.transaction();
        try {
            let idImage = null;
            if (req.file) {
                const findImage = await Image.findOne({
                    where: { id: findConfigurator.dataValues.id_image },
                    transaction: trn,
                });
                const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                    req,
                    req.file,
                    IMAGE_TYPE.ConfigProduct,
                    req.body.session_res.id_app_user,
                    findImage,
                    req.body.session_res.client_id,
                );
                if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                    await trn.rollback();
                    return imageData;
                }
                idImage = imageData.data;
            } else {
                idImage = findConfigurator.dataValues.id_image
            }

            const payload = {
                name,
                id_image: idImage,
                description,
                link,
                modified_date: getLocalDate(),
                is_active: ActiveStatus.Active,
                is_deleted: DeletedStatus.No,
                modified_by: req.body.session_res.id_app_user,
            };

            await ConfiguratorSetting.update(payload, { where: { id: id}, transaction: trn });


            await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
                old_data: findConfigurator.dataValues,
                new_data: {
                    configurator_id: findConfigurator?.dataValues?.id, data: {
                        ...findConfigurator?.dataValues, ...payload
                    }
                }
            }], findConfigurator?.dataValues?.id, LogsActivityType.Edit, LogsType.configurator_setting, req?.body?.session_res?.id_app_user,trn)
            await trn.commit();
            return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY, data: { ...findConfigurator?.dataValues, ...payload} });
        } catch (e) {
            await trn.rollback();
            throw e;
        }
    } catch (error) {
        throw error
    }
};

export const deleteConfigurator = async (req: Request) => {
    try {
        const { ConfiguratorSetting,ConfiguratorSettingFile } = initModels(req)
        const { id } = req.params;
        const findConfigurator = await ConfiguratorSetting.findOne({ where: { id, is_deleted: DeletedStatus.No } });
        const findConfiguratorFIle = await ConfiguratorSettingFile.findAll({ where: { id_config_setting: id, is_deleted: DeletedStatus.No } });

        if (!(findConfigurator && findConfigurator.dataValues)) {
            return resNotFound()
        }

        await ConfiguratorSetting.update({
            is_deleted: DeletedStatus.yes,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
        }, { where: { id } });

        await ConfiguratorSettingFile.update({
            is_deleted: DeletedStatus.yes,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
        }, { where: { id_config_setting: id } });

        await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
            old_data: { configurator_setting: findConfigurator.dataValues, configurator_setting_file: findConfiguratorFIle.map((t: any) => t.dataValues) },
            new_data: {
                configurator_id: findConfigurator?.dataValues?.id, data: {
                    configurator_setting: {
                        ...findConfigurator?.dataValues, is_deleted: DeletedStatus.yes,
                        modified_by: req?.body?.session_res?.id_app_user,
                        modified_date: getLocalDate()
                    }, configurator_setting_file: findConfiguratorFIle.map((t: any) => {
                        return {
                            ...t.dataValues, is_deleted: DeletedStatus.yes,
                            modified_date: getLocalDate(),
                            modified_by: req.body.session_res.id_app_user
                        }
                    })
                }
            }
        }], findConfigurator?.dataValues?.id, LogsActivityType.Delete, LogsType.configurator_setting, req?.body?.session_res?.id_app_user)
        return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
    } catch (error) { throw error }
}

export const statusUpdateForConfigurator = async (req: Request) => {
    try {
        const { ConfiguratorSetting } = initModels(req)
        const { id } = req.params
        const findConfigurator = await ConfiguratorSetting.findOne({ where: { id, is_deleted: DeletedStatus.No } });
        if (!(findConfigurator && findConfigurator.dataValues)) {
            return resNotFound()
        }

        await ConfiguratorSetting.update({
            is_active: statusUpdateValue(findConfigurator),
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
        }, { where: { id } });

        await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
            old_data: findConfigurator.dataValues, new_data: {
                config_setting_id: findConfigurator.dataValues.id, data: {
                    ...findConfigurator.dataValues,
                    is_active: statusUpdateValue(findConfigurator),
                    modified_date: getLocalDate(),
                    modified_by: req.body.session_res.id_app_user
                }
            }
        }], findConfigurator.dataValues.id, LogsActivityType.StatusUpdate, LogsType.configurator_setting, req?.body?.session_res?.id_app_user)
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
    } catch (error) {
        throw error
    }
}

export const addAndEditConfiguratorFile = async (req: Request) => {
    const trn = await req.body.db_connection.transaction()
    const { ConfiguratorSetting, ConfiguratorSettingFile } = initModels(req)
    try {
        const { config_id, configurator_files = [] } = req.body
        const findConfigurator = await ConfiguratorSetting.findOne({ where: { id: config_id, is_deleted: DeletedStatus.No } })
        if (!(findConfigurator && findConfigurator.dataValues)) {
            await trn.rollback()
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Configurator"]]) })
        }
        const findConfigSettingFile = await ConfiguratorSettingFile.findAll({ where: { id_config_setting: config_id, is_deleted: DeletedStatus.No } })
        const files: any = req.files as { [fieldname: string]: Express.Multer.File[] }
        for (let index = 0; index < configurator_files.length; index++) {
            const element = configurator_files[index];

            if (!(element.id) || element.id == 0) {
                const imageFile = files.find((t: any) => t.fieldname === `configurator_files[${index}][file]`)
                // store image in s3
                let fileData = null;
                if (imageFile) {
                    const imageData = await fileAddAndEditInDBAndS3ForOriginalFileName(
                        req.body.db_connection,
                        ConfiguratorSettingFile,
                        config_id,
                        imageFile,
                        `files/configurator/${findConfigurator.dataValues.key}`,
                        req.body.session_res.id_app_user,
                        null,
                        trn,
                        req.body.session_res.client_id,
                        require
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        await trn.rollback();
                        return imageData;
                    }
                    fileData = imageData?.data?.new_data?.id;
                }

                await ConfiguratorSettingFile.update({
                    key: element.key
                }, { where: { id: fileData }, transaction: trn })
            } else {
                const findFile = await ConfiguratorSettingFile.findOne({ where: { id: element.id, is_deleted: DeletedStatus.No} })
                if (!(findFile && findFile.dataValues)) {
                    return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", `Configurator File #${element.id} `]]) })
                }
                const configFile = files.find((t: any) => t.fieldname === `configurator_files[${index}][file]`)
                
                // store image in s3
                let fileData = null;
                if (configFile) {
                    
                    const imageData = await fileAddAndEditInDBAndS3ForOriginalFileName(
                        req.body.db_connection,
                        ConfiguratorSettingFile,
                        config_id,
                        configFile,
                        `files/configurator/${findConfigurator.dataValues.key}`,
                        req.body.session_res.id_app_user,
                        findFile,
                        trn,
                        req.body.session_res.client_id,
                        req
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        await trn.rollback();
                        
                        return imageData;
                    }
                    fileData = imageData?.data?.new_data?.id;
                }

                await ConfiguratorSettingFile.update({
                    key: element.key
                }, { where: { id: fileData }, transaction: trn })
            }
        }

        const updatedConfigSettingFile = await ConfiguratorSettingFile.findAll({ where: { id_config_setting: config_id, is_deleted: DeletedStatus.No } })

        await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
            old_data: findConfigSettingFile.map((t: any) => t.dataValues), new_data: {
                config_setting_id: findConfigurator.dataValues.id, data: updatedConfigSettingFile.map((t: any) => t.dataValues)
            }
        }], findConfigurator.dataValues.id, LogsActivityType.Edit, LogsType.configurator_setting, req?.body?.session_res?.id_app_user,trn)
        await trn.commit()
        return resSuccess()

    } catch (error) {
        await trn.rollback()
        throw error
    }
};

export const addCommonConfiguratorFile = async (req: Request) => {
    const trn = await req.body.db_connection.transaction()
    const {ConfiguratorSettingFile} = initModels(req)
    try {
        const files: any = req.files as { [fieldname: string]: Express.Multer.File[] }

        const { configurator_files = [] } = req.body
        let activityLogList = [];
        if(configurator_files.length > 0){
            for (let index = 0; index < configurator_files.length; index++) {
                const element = configurator_files[index];
                const findSameKey = await ConfiguratorSettingFile.findOne({ where: { key: element.key, is_deleted: DeletedStatus.No, id: { [Op.ne]: element.id } } })
                if (findSameKey && findSameKey.dataValues) {
                    await trn.rollback();
                    return resErrorDataExit({ message: prepareMessageFromParams(DATA_ALREADY_EXIST, [["field_name", `Configurator File key #${element.key}`]]) })
                }
                if (!(element.id) || element.id == 0) {
                    const imageFile = files.find((t: any) => t.fieldname === `configurator_files[${index}][file]`)
                    // store image in s3
                    let fileData = null;
                    if (imageFile) {
                        const imageData = await fileAddAndEditInDBAndS3ForOriginalFileName(
                            req.body.db_connection,
                            ConfiguratorSettingFile,
                            null,
                            imageFile,
                            "files/configurator",
                            req.body.session_res.id_app_user,
                            null,
                            trn,
                            req.body.session_res.client_id,
                            req
                        );
                        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                            await trn.rollback();
                            return imageData;
                        }
                        fileData = imageData.data.new_data.id;
                        activityLogList.push({ old_data: imageData.data.old_data, new_data: { ...imageData.data.new_data, key: element.key } })
                    }
                    
                    await ConfiguratorSettingFile.update({
                        key: element.key
                    }, { where: { id: fileData }, transaction: trn })
                } else {
                    const findFile = await ConfiguratorSettingFile.findOne({ where: { id: element.id, is_deleted: DeletedStatus.No } })
                    if (!(findFile && findFile.dataValues)) {
                        return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", `Configurator File #${element.id} `]]) })
                    }
                    const imageFile = files.find((t: any) => t.fieldname === `configurator_files[${index}][file]`)
                    // store image in s3
                    let fileData = null;
                    if (imageFile) {
    
                        const imageData = await fileAddAndEditInDBAndS3ForOriginalFileName(
                            req.body.db_connection,
                            ConfiguratorSettingFile,
                            null,
                            imageFile,
                            "files/configurator",
                            req.body.session_res.id_app_user,
                            findFile,
                            trn,
                            req.body.session_res.client_id,
                            req
                        );
                        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                            await trn.rollback();
                            return imageData;
                        }
                        fileData = imageData.data.new_data.id;
                        activityLogList.push({ old_data: imageData.data.old_data, new_data: { ...imageData.data.new_data, key: element.key } })
                    }

                    await ConfiguratorSettingFile.update({
                        key: element.key
                    }, { where: { id: findFile.dataValues.id }, transaction: trn })
                }
            }
            await addActivityLogs(req,activityLogList, null, LogsActivityType.Edit, LogsType.configurator_setting, req?.body?.session_res?.id_app_user,trn)
        }
        await trn.commit()
        return resSuccess()
    } catch (error) {
        await trn.rollback()
        throw error
    }
}

export const getConfiguratorFiles = async (req: Request) => {
    try {
        const {ConfiguratorSettingFile,AppUser} = initModels(req)
        const { config_id } = req.params
        let paginationProps = {};

        let pagination = {
            ...getInitialPaginationFromQuery(req.query),
            search_text: req.query.search_text,
        };
        let noPagination = req.query.no_pagination === "1";

        let where = [
            { is_deleted: DeletedStatus.No },
            {id_config_setting: config_id},
            pagination.is_active ? { is_active: pagination.is_active } : {},
            pagination.search_text
                ? {
                    [Op.or]: [
                        { file_path: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                        { key: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                    ],
                }
                : {},
        ];

        if (!noPagination) {
            const totalItems = await ConfiguratorSettingFile.count({
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
        const configSetting = await ConfiguratorSettingFile.findAll(
            {
                ...paginationProps,
                order: [[pagination.sort_by, pagination.order_by]],
                where: { id_config_setting: config_id, is_deleted: DeletedStatus.No },
                attributes: [
                    "id",
                    "file_path",
                    "key",
                    "created_date",
                    [Sequelize.literal("created_user.username"), "created_username"]
                ],  
                include: [{ model: AppUser, as: "created_user", attributes: [] } ]
            }
        )
        return resSuccess({ data: noPagination ? {result: configSetting} : {pagination, result:configSetting} })
    } catch (error) {
        throw error
    }
}
export const getConfiguratorCommonFiles = async (req: Request) => {
    try {
        const {ConfiguratorSettingFile} = initModels(req)
        let paginationProps = {};

        let pagination = {
            ...getInitialPaginationFromQuery(req.query),
            search_text: req.query.search_text,
        };
        let noPagination = req.query.no_pagination === "1";

        let where = [
            { is_deleted: DeletedStatus.No },
            {id_config_setting: null},
            pagination.is_active ? { is_active: pagination.is_active } : {},
            pagination.search_text
                ? {
                    [Op.or]: [
                        { file_path: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                        { key: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                    ],
                }
                : {},
        ];

        if (!noPagination) {
            const totalItems = await ConfiguratorSettingFile.count({
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
        const configSetting = await ConfiguratorSettingFile.findAll(
            {
                ...paginationProps,
                order: [[pagination.sort_by, pagination.order_by]],
                where: { id_config_setting: null, is_deleted: DeletedStatus.No },
                attributes: [
                    "id",
                    "file_path",
                    "key",
                ],  
            }
        )
        return resSuccess({ data: {pagination, result:configSetting} })
    } catch (error) {
        throw error
    }
}
export const deleteConfiguratorFile = async (req: Request) => {
    try {
        const {ConfiguratorSettingFile} = initModels(req)
        const { id } = req.params
        const findFile = await ConfiguratorSettingFile.findOne({ where: { id: id, is_deleted: DeletedStatus.No } })
        if (!(findFile && findFile.dataValues)) {
            return resNotFound()
        }

        await ConfiguratorSettingFile.update({
            is_deleted: DeletedStatus.yes,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate()
        }, { where: { id } })
        await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
            old_data: findFile.dataValues, new_data: {
                config_setting_file_id: findFile.dataValues.id, data: {
                    ...findFile.dataValues, is_deleted: DeletedStatus.yes,
                    modified_by: req.body.session_res.id_app_user,
                    modified_date: getLocalDate()
                }
            }
        }], findFile.dataValues.id_config_setting, LogsActivityType.Delete, LogsType.configurator_setting, req?.body?.session_res?.id_app_user)
        return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY })
    } catch (error) {
        throw error
    }
}

export const statusUpdateForClientConfigurator = async (req: Request) => {
    try {
        const { ids, id } = req.params
        const idArray =  id.split(",") || ids.split(",")
        const { ConfiguratorSetting, CompanyInfo } = initModels(req)
        const findConfigurator = await ConfiguratorSetting.findAll({ where: { id: idArray, is_deleted: DeletedStatus.No } })

        // Get matched IDs from DB results
        const foundIds = findConfigurator.map((config: any) => config.dataValues.id.toString());

        // Get IDs that were not found
        const missingIds = idArray.filter(id => !foundIds.includes(id));

        if (missingIds.length > 0) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", `IDS # ${missingIds.join(",")}`]]) })
        }

        await CompanyInfo.update({
            id_configurator: idArray.join(",")
        }, { where: { id: req.body.session_res.client_id, } })
        
    return resSuccess()
    } catch (error) {
        console.log("------------------652", error)
        throw error
    }
}

export const getConfiguratorForUser = async (req: Request) => {
    try {
        const {ConfiguratorSetting,CompanyInfo,ConfiguratorSettingFile, Image} = initModels(req)
        const companyInfo = await CompanyInfo.findOne({ where: { key: req.query.company_key } })
        
        const configSetting = await ConfiguratorSetting.findAll(
            {
                order: [["created_date", "ASC"]],
                where: { id: {[Op.in]: companyInfo.dataValues.id_configurator.split(",")}, is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
                attributes: [
                    "id",
                    "name",
                    "key",
                    "description",
                    "link",
                    [Sequelize.literal("image.image_path"), "image_path"],
                ],
                include: [{ model: Image, as: "image", attributes: [] },
                {
                    required: false,
                    model: ConfiguratorSettingFile,
                    as: "config_setting",
                    attributes: ["id", "file_path", "key"],
                    where: { is_deleted: DeletedStatus.No }
                }],

            }
        )

        const commonConfiguratorFiles = await ConfiguratorSettingFile.findAll(
            {
                where: { id_config_setting: null, is_deleted: DeletedStatus.No },
                attributes: [
                    "id",
                    "file_path",
                    "key",
                ],  
            }
        ) 
        return resSuccess({ data: {configurator: configSetting, common_files: commonConfiguratorFiles} })
    } catch (error) {
       throw error 
    }
}

export const getConfiguratorForAdmin = async (req: Request) => {
    try {
        const {ConfiguratorSetting,CompanyInfo,ConfiguratorSettingFile,Image} = initModels(req)
        const companyInfo = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id } })
        
        const configSetting = await ConfiguratorSetting.findAll(
            {
                where: { id: {[Op.in]: companyInfo.dataValues.id_configurator.split(",")}, is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
                attributes: [
                    "id",
                    "name",
                    "key",
                    "description",
                    "link",
                    [Sequelize.literal("image.image_path"), "image_path"],
                ],
                include: [{ model: Image, as: "image", attributes: [] },
                {
                    required: false,
                    model: ConfiguratorSettingFile,
                    as: "config_setting",
                    attributes: ["id", "file_path", "key"],
                    where: { is_deleted: DeletedStatus.No }
                }],

            }
        )

        const commonConfiguratorFiles = await ConfiguratorSettingFile.findAll(
            {
                where: { id_config_setting: null, is_deleted: DeletedStatus.No },
                attributes: [
                    "id",
                    "file_path",
                    "key",
                ],  
            }
        ) 
        return resSuccess({ data: {configurator: configSetting, common_files: commonConfiguratorFiles} })
    } catch (error) {
       throw error 
    }
}