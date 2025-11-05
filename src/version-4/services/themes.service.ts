import { Request } from "express";
import { addActivityLogs, columnValueLowerCase, fontFileAddAndEditInDBAndS3ForOriginalFileName, getInitialPaginationFromQuery, getLocalDate, imageAddAndEditInDBAndS3, imageAddAndEditInDBAndS3ForOriginalFileName, prepareMessageFromParams, refreshMaterializedProductListView, resBadRequest, resErrorDataExit, resNotFound, resSuccess, resUnknownError, resUnprocessableEntity } from "../../utils/shared-functions";
import { ActiveStatus, DeletedStatus, FontStyleType, FontType, IMAGE_TYPE, LogsActivityType, LogsType, ThemeSectionType } from "../../utils/app-enumeration";
import { ATTRIBUTE_NOT_CHANGEABLE, DEFAULT_STATUS_CODE_SUCCESS, ERROR_NOT_FOUND, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { Op, QueryTypes, Sequelize, Transaction, where } from "sequelize";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import { IMAGE_TYPE_LOCATION, LOG_FOR_SUPER_ADMIN, sectionTypeMapWithCompanyInfo, GLEAMORA_KEY } from "../../utils/app-constants";
import { initModels } from "../model/index.model";
import { s3UploadObject } from "../../helpers/s3-client.helper";
import { ThemeAttributeCustomers } from "../model/theme/theme-attribute-customers.model";

export const addTheme = async (req: Request) => {
    const trn = await (req.body.db_connection).transaction();
    const {Themes, ThemeAttributes} = initModels(req); 
    try {
        const files: any = req.files as { [fieldname: string]: Express.Multer.File[] }
        const { name, key, description, attributes = [] } = req.body

        // check same name value exists
        const theme = await Themes.findOne({
            where:
                [columnValueLowerCase("name", name),
                { is_deleted: DeletedStatus.No },
                { section_type: req.params.section_type }]
        })
        if (theme && theme.dataValues) {
            return resErrorDataExit()
        }

        // check same key value exists
        const themeKey = await Themes.findOne({
            where:
                [columnValueLowerCase("key", key),
                { is_deleted: DeletedStatus.No },
                { section_type: req.params.section_type }]
        })
        if (themeKey && themeKey.dataValues) {
            return resErrorDataExit()
        }
        //find theme image
        const imageFile = files.find((t: any) => t.fieldname === "image")

        // add image in bucket
        let idImage = null;
        if (imageFile) {
            const imageData = await imageAddAndEditInDBAndS3(req,
                imageFile,
                IMAGE_TYPE.ThemeProvider,
                req.body.session_res.id_app_user,
                "",
                req.body.session_res.client_id
            );
            if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                trn.rollback();
                return imageData;
            }

            // store image ID
            idImage = imageData.data;
        }

        // add theme data 
        const addTheme = await Themes.create({
            name: name,
            description: description,
            key: key,
            attributes: attributes,
            id_image: idImage,
            section_type: req.params.section_type,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No
        }, { transaction: trn })


        if (addTheme && addTheme.dataValues && attributes.length > 0) {
            const themeAttributes = await setAddThemeAttributeData(addTheme.dataValues.id, attributes, files, req.body.session_res.id_app_user, trn,req?.body?.session_res?.client_id, req.body.db_connection)

            // if status code is not 200 then return error 
            if (themeAttributes.code != DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback()
                return themeAttributes
            }

            // attributes bulk create
            const thems = await ThemeAttributes.bulkCreate(themeAttributes.data)


            await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                old_data: null,
                new_data: {
                    theme_id: addTheme?.dataValues?.id, data: {
                        ...addTheme?.dataValues
                    },
                    themes_attributes: thems.map((t) => t.dataValues)
                }
            }], addTheme?.dataValues?.id, LogsActivityType.Add, LogsType.Themes, req?.body?.session_res?.id_app_user, trn)

            await trn.commit()
            return resSuccess()
        }

        await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
            old_data: null,
            new_data: {
                theme_id: addTheme?.dataValues?.id, data: {
                    ...addTheme?.dataValues
                },
            }
        }], addTheme?.dataValues?.id, LogsActivityType.Add, LogsType.Themes, req?.body?.session_res?.id_app_user, trn)
        await trn.commit()
        return resSuccess()
    } catch (error) {
        await trn.rollback()
        throw error
    }
}

const setAddThemeAttributeData = async (themeId: any, attributes: any, files: any, id_app_user: number, trn: Transaction,client_id:any, req:any) => {
    try {
        // store attributes value
        const attributeList = []

        for (let index = 0; index < attributes.length; index++) {
            const element = attributes[index]

            // find image based on array index
            const imageFile = files.find((t: any) => t.fieldname === `attributes[${index}][image]`)

            // store image in s3
            let idImage = null;
            if (imageFile) {
                const imageData = await imageAddAndEditInDBAndS3(req,
                    imageFile,
                    IMAGE_TYPE.ThemeProvider,
                    id_app_user,
                    "",
                    client_id
                );
                if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                    trn.rollback();
                    return imageData;
                }
                idImage = imageData.data;
            }

            // add data in array
            attributeList.push({
                id_theme: themeId,
                key_value: element.key_value,
                value: element.value,
                link: element.link,
                is_changeable: element.is_changeable,
                id_image: idImage,
                created_date: getLocalDate(),
                created_by: id_app_user,
                is_deleted: DeletedStatus.No
            })
        }

        return resSuccess({ data: attributeList })
    } catch (error) {

        return resUnknownError({ data: error })
    }
}

export const getThemes = async (req: Request) => {
    try {
        const {  CompanyInfo } = initModels(req);
        let pagination: IQueryPagination = {
            ...getInitialPaginationFromQuery(req.query),
        };

        let where = [
            { is_deleted: DeletedStatus.No },
            req.query.section_type && req.query.section_type != "" ? { section_type: req.query.section_type } : {},
        ];       
        const companyInfo = await CompanyInfo.findOne({
            where: { id: req.body.session_res.client_id }, attributes: ['id_header', 'id_footer', 'id_home_page', "key",
                'id_product_grid', 'id_product_card', 'id_product_filter', 'id_product_detail', 'id_create_your_own', 'id_profile',
                'id_login_page', 'id_registration_page', 'id_toast', 'id_button', 'id_cart', 'id_checkout', 'id_otp_verify', 'id_config_detail'
            ],
        })

        const themeFields = [
            'id_header', 'id_footer', 'id_home_page', 'id_product_grid', 'id_product_card',
            'id_product_filter', 'id_product_detail', 'id_create_your_own', 'id_login_page', 'id_profile',
            'id_registration_page', 'id_toast', 'id_button', 'id_cart', 'id_checkout', 'id_otp_verify', 'id_config_detail'
        ];

        const themeIDs = themeFields
            .map(field => companyInfo.dataValues[field])
            .filter(Boolean);

        const result = await req.body.db_connection.query(`(SELECT Themes.id,name,key,description,is_active,section_type,
        images.image_path as image_path,images.id as id_image, CASE WHEN CASE WHEN ${themeIDs.length} = 0 THEN FALSE ELSE Themes.id IN (:themeIDs) END THEN true ELSE false END AS selected_value,
        CASE WHEN '${companyInfo.dataValues.key}' = '${GLEAMORA_KEY}' THEN true ELSE false END as is_theme_update,
        COALESCE(JSONB_agg(DISTINCT CASE WHEN theme_att.id = theme_cus.id_theme_attribute THEN JSONB_BUILD_OBJECT('id', theme_att.id,
					'id_theme', theme_att.id_theme,
					'key_value', theme_att.key_value,
					'value', theme_cus.value,
					'link', theme_cus.link,
					'image_path', att_cus_image.image_path,
					'id_image', att_cus_image.id,
                    'is_changeable', theme_att.is_changeable
				) ELSE JSONB_BUILD_OBJECT('id', theme_att.id,
					'id_theme', theme_att.id_theme,
					'key_value', theme_att.key_value,
					'value', theme_att.value,
                    'link', theme_att.link,
					'image_path', att_image.image_path,
					'id_image', att_image.id,
                    'is_changeable', theme_att.is_changeable
				) END) FILTER (WHERE theme_att.id IS NOT NULL),
                '[]'::jsonb
                ) as attributes
        FROM themes
        LEFT JOIN images ON images.id = Themes.id_image AND images.is_deleted = '0'
        LEFT JOIN theme_attributes theme_att ON theme_att.id_theme = Themes.id AND theme_att.is_deleted = '0'
        LEFT JOIN theme_attribute_customers as theme_cus ON theme_cus.id_theme = Themes.id AND theme_att.id = theme_cus.id_theme_attribute	AND theme_cus.id_company_info = ${req.body.session_res.client_id}
        LEFT JOIN images as att_image ON att_image.id = theme_att.id_image
        LEFT JOIN images as att_cus_image ON att_cus_image.id = theme_cus.id_image
        WHERE Themes.is_deleted = '${DeletedStatus.No}' ${req.query.section_type && req.query.section_type != "" ? `AND Themes.section_type = '${req.query.section_type}'` : ""} 
        GROUP BY Themes.id,images.id
        ORDER BY Themes.${pagination.sort_by} ${pagination.order_by}
        )`, { type: QueryTypes.SELECT, replacements: { themeIDs: themeIDs.length > 0 ? themeIDs : [0] } })
        return resSuccess({ data: {  result } })
    } catch (error) {
        throw error
    }
}

export const updateTheme = async (req: Request) => {
    const { Themes,Image,ThemeAttributes,ThemeAttributeCustomers } = initModels(req);
    const trn = await (req.body.db_connection).transaction();
    try {
        const files: any = req.files as { [fieldname: string]: Express.Multer.File[] }
        const { name, key, description, attributes = [] } = req.body

        // check data exists or not based on ID
        const findTheme = await Themes.findOne({
            where: {
                id: req.params.id,
                is_deleted: DeletedStatus.No,
            }
        })

        if (!(findTheme && findTheme.dataValues)) {
            return resNotFound()
        }
        // check same name value exists
        const theme = await Themes.findOne({
            where:
                [columnValueLowerCase("name", name),
                { is_deleted: DeletedStatus.No },
                { section_type: findTheme.dataValues.section_type },
                { id: { [Op.ne]: req.params.id } },
                ]
        })
        if (theme && theme.dataValues) {
            return resErrorDataExit()
        }

        // check same key value exists
        const themeKey = await Themes.findOne({
            where:
                [columnValueLowerCase("key", key),
                { is_deleted: DeletedStatus.No },
                { section_type: findTheme.dataValues.section_type },
                { id: { [Op.ne]: req.params.id } },
                ]
        })
        if (themeKey && themeKey.dataValues) {
            return resErrorDataExit()
        }
        //find theme image
        const imageFile = files.find((t: any) => t.fieldname === "image")

        // add image in bucket
        let idImage = null;
        if (imageFile) {
            const findImage = await Image.findOne({
                where: {
                    id: findTheme.dataValues.id_image,
                    is_deleted: DeletedStatus.No,
                }
            })
            const imageData = await imageAddAndEditInDBAndS3(req,
                imageFile,
                IMAGE_TYPE.ThemeProvider,
                req.body.session_res.id_app_user,
                findImage,
                req.body.session_res.client_id
            );
            if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback();
                return imageData;
            }
            // store image ID
            idImage = imageData.data;
        } else {
            idImage = findTheme.dataValues.id_image
        }

        // add theme data 
        await Themes.update({
            name: name,
            key: key,
            description: description,
            attributes: attributes,
            id_image: idImage,
            section_type: req.params.section_type,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No
        }, { where: { id: req.params.id }, transaction: trn })


        if (findTheme && findTheme.dataValues && attributes.length > 0) {

            const themeAttributes = await setEditThemeAttributeData(findTheme.dataValues.id, attributes, files, req.body.session_res.id_app_user, trn,req?.body?.session_res?.client_id, req)

            // if status code is not 200 then return error 
            if (themeAttributes.code != DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback()
                return themeAttributes
            }

            // attributes bulk create
            const addData = await ThemeAttributes.bulkCreate(themeAttributes.data.add, { transaction: trn })
            // attributes bulk update
            await ThemeAttributes.bulkCreate(themeAttributes.data.edit, { updateOnDuplicate: ['key_value', 'value', 'link', 'id_image', 'modified_by', 'modified_date', 'id_theme', 'is_changeable'], transaction: trn })

            const customerData = addData?.map((item) => ({
                id_theme_attribute: item.id, // reusing the same id
                id_theme: item.id_theme,
                value: item.value,
                link: item.link,
                id_image: item.id_image,
                created_date: item.created_date,
                created_by: item.created_by,
                id_company_info:req?.body?.session_res?.client_id
            }));

            // same attribute added for customer as well
            if (customerData?.length > 0) {
                await ThemeAttributeCustomers.bulkCreate(customerData, { transaction: trn })
            }
            // same data update for customer attributes bulk update
            if (themeAttributes?.data?.editCustomer?.length > 0) {
                await ThemeAttributeCustomers.bulkCreate(themeAttributes.data.editCustomer, { updateOnDuplicate: ['value', 'link', 'id_image', 'modified_by', 'modified_date', 'id_theme','id_theme_attribute','id_company_info'], transaction: trn })
            }
            const addDataIds = addData.map((t: any) => t.dataValues.id)
            const editDataIds = themeAttributes.data.edit.map((t: any) => t.id)

            await ThemeAttributes.update({
                is_deleted: DeletedStatus.yes,
                deleted_by: req.body.session_res.id_app_user,
                deleted_date: getLocalDate(),
            }, {
                where: {
                    id: {
                        [Op.notIn]: [...addDataIds, ...editDataIds]
                    },
                    id_theme: findTheme.dataValues.id,
                }
            })
            const afterUpdateFindTheme = await Themes.findOne({
                where: {
                    id: req.params.id,
                    is_deleted: DeletedStatus.No
                }
            });
            const afterUpdatethemeAttributes = await ThemeAttributes.findAll({
                where: {
                    id_theme: findTheme.dataValues.id
                }
            });
            await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                old_data: { theme_id: findTheme?.dataValues?.id, data: findTheme?.dataValues },
                new_data: {
                    theme_id: findTheme?.dataValues?.id, data: {
                        ...findTheme?.dataValues, ...afterUpdateFindTheme?.dataValues,
                        theme_attributes: afterUpdatethemeAttributes.map((t) => t.dataValues)
                    }
                }
            }], findTheme?.dataValues?.id, LogsActivityType.Edit, LogsType.Themes, req?.body?.session_res?.id_app_user, trn)

            await trn.commit()
            return resSuccess()

        } else {
            // delete theme attributes

            const themeAttributes = await ThemeAttributes.update({
                is_deleted: DeletedStatus.yes,
                deleted_by: req.body.session_res.id_app_user,
                deleted_date: getLocalDate(),
            }, {
                where: { id_theme: findTheme.dataValues.id }
            })
            const afterUpdateFindTheme = await Themes.findOne({
                where: {
                    id: req.params.id,
                    is_deleted: DeletedStatus.No
                }
            });
            const afterUpdatethemeAttributes = await ThemeAttributes.findAll({
                where: {
                    id_theme: findTheme.dataValues.id
                }
            });
            await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                old_data: { theme_id: findTheme?.dataValues?.id, data: findTheme?.dataValues },
                new_data: {
                    theme_id: findTheme?.dataValues?.id, data: {
                        ...findTheme?.dataValues, ...afterUpdateFindTheme?.dataValues,
                        theme_attributes: afterUpdatethemeAttributes
                    }
                }
            }], findTheme?.dataValues?.id, LogsActivityType.Edit, LogsType.Themes, req?.body?.session_res?.id_app_user, trn)

            await trn.commit()
            return resSuccess()
        }


    } catch (error) {
        await trn.rollback()
        throw error
    }
}

const setEditThemeAttributeData = async (themeId: any, attributes: any, files: any, id_app_user: number, trn: Transaction,client_id:any, req: Request) => {
    try {
        const {ThemeAttributes,Image,ThemeAttributeCustomers} = initModels(req);
        // store attributes value
        const addAttributeList = []
        const editAttributeList = []
        const editAttributeCustomerList = []
        for (let index = 0; index < attributes.length; index++) {
            const element = attributes[index]

            // check id is not 0 then edit data & id is 0 then add new data
            if (element.id && element.id != 0) {
                // check data exists or not based on ID

                const findAttribute = await ThemeAttributes.findOne({
                    where: {
                        id: element.id,
                        is_deleted: DeletedStatus.No,
                    }
                })
                if (!(findAttribute && findAttribute.dataValues)) {
                    return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", `Attribute #key-${element.key}`]]) })
                }
                // check customer data exists or not based on them , them attribute and client id
                const findAttributeCustomer = await ThemeAttributeCustomers.findOne({
                    where: {
                        id_theme_attribute: element.id,
                        id_theme: themeId,
                        id_company_info:req?.body?.session_res?.client_id
                    }
                })
                // find image based on array index
                const imageFile = files.find((t: any) => t.fieldname === `attributes[${index}][image]`)

                // store image in s3
                let idImage = null;
                if (imageFile) {
                    // find existing image
                    const findImage = await Image.findOne({
                        where: {
                            id: findAttribute.dataValues.id_image,
                            is_deleted: DeletedStatus.No,
                        }
                    })

                    const imageData = await imageAddAndEditInDBAndS3(req,
                        imageFile,
                        IMAGE_TYPE.ThemeProvider,
                        id_app_user,
                        findImage,
                        client_id,
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        trn.rollback();
                        return imageData;
                    }
                    idImage = imageData.data;
                } else {
                    idImage = element.image_delete && element.image_delete == "1" ? null : findAttribute.dataValues.id_image
                }

                // edit data in array
                editAttributeList.push({
                    id: element.id,
                    id_theme: themeId,
                    key_value: element.key_value,
                    value: element.value,
                    link: element.link,
                    is_changeable: element.is_changeable,
                    id_image: idImage,
                    modified_date: getLocalDate(),
                    modified_by: id_app_user,
                })

                // if customer attributes data have then customer attribute edit data in array
                if (findAttributeCustomer && findAttributeCustomer.dataValues) {
                editAttributeCustomerList.push({
                    id:findAttributeCustomer?.dataValues?.id,
                    id_theme_attribute: element.id, // reusing the same id
                    id_theme: themeId,
                    value: element.value,
                    link: element.link,
                    id_image: idImage,
                    modified_date: getLocalDate(),
                    modified_by: id_app_user,
                    id_company_info:req?.body?.session_res?.client_id
                })
            }
            } else {
                // find image based on array index
                const imageFile = files.find((t: any) => t.fieldname === `attributes[${index}][image]`)

                // store image in s3
                let idImage = null;
                if (imageFile) {
                    const imageData = await imageAddAndEditInDBAndS3(req,
                        imageFile,
                        IMAGE_TYPE.ThemeProvider,
                        id_app_user,
                        "",
                        client_id
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        trn.rollback();
                        return imageData;
                    }
                    idImage = imageData.data;
                }

                // add data in array
                addAttributeList.push({
                    id_theme: themeId,
                    key_value: element.key_value,
                    value: element.value,
                    link: element.link,
                    id_image: idImage,
                    is_changeable: element.is_changeable,
                    created_date: getLocalDate(),
                    created_by: id_app_user,
                    is_deleted: DeletedStatus.No
                })
            }
        }

        return resSuccess({ data: { add: addAttributeList, edit: editAttributeList, editCustomer: editAttributeCustomerList } })
    } catch (error) {

        return resUnknownError({ data: error })
    }
}

export const updateAttributeValue = async (req: Request) => {
    const trn = await (req.body.db_connection).transaction();
    const {Themes,ThemeAttributes,Image,CompanyInfo,ThemeAttributeCustomers} = initModels(req);
    try {
        const { attributes = [] } = req.body
        // check data exists or not based on ID
        const findTheme = await Themes.findOne({
            where: {
                id: req.params.id_theme,
                is_deleted: DeletedStatus.No,
            }, transaction: trn
        })

        if (!(findTheme && findTheme.dataValues)) {
            return resNotFound()
        }
        const fieldToUpdate = sectionTypeMapWithCompanyInfo[findTheme.dataValues.section_type];
        if (fieldToUpdate) {
            await CompanyInfo.update(
                { [fieldToUpdate]: req.params.id_theme },
                { where: { id: req.body.session_res.client_id }, transaction: trn }
            );
        }
        if (attributes && attributes.length > 0) {

            const errors = []
            const addAttributeList = []
            const editAttributeList = []
            const files: any = req.files as { [fieldname: string]: Express.Multer.File[] }
            for (let index = 0; index < attributes.length; index++) {
                const value = attributes[index];

                const findAttribute = await ThemeAttributes.findOne({
                    where: { id: value.id, is_deleted: DeletedStatus.No }, transaction: trn
                })

                if (!(findAttribute)) {
                    errors.push({ value: value.value, error_message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", `Attribute #id-${value.id}`]]) })
                }

                if (findAttribute && findAttribute.dataValues.is_changeable == "0") {
                    errors.push({ value: value.value, error_message: prepareMessageFromParams(ATTRIBUTE_NOT_CHANGEABLE, [["field_name", `#id-${value.id}`]]) })
                }
                if (errors.length > 0) {
                    await trn.rollback()
                    return resUnprocessableEntity({ data: errors })
                }

                //find same data from customer attribute value

                const findSameAttribute = await ThemeAttributeCustomers.findOne({ where: { id_company_info: req?.body?.session_res?.client_id, id_theme: findTheme.dataValues.id, id_theme_attribute: findAttribute.dataValues.id }, transaction: trn })

                if (!(findSameAttribute && findSameAttribute.dataValues)) {
                    // find image based on array index
                    const imageFile = files.find((t: any) => t.fieldname === `attributes[${index}][image]`)
                    // store image in s3
                    let idImage = null;
                    if (imageFile) {
                        const imageData = await imageAddAndEditInDBAndS3(req,
                            imageFile,
                            IMAGE_TYPE.ThemeProvider,
                            req.body.session_res.id_app_user,
                            "",
                            req?.body?.session_res?.client_id
                        );
                        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                            await trn.rollback()
                            return imageData;
                        }
                        idImage = imageData.data;
                    } else {
                        idImage = findAttribute.dataValues.id_image
                    }
                    addAttributeList.push({
                        id_company_info: req?.body?.session_res?.client_id,
                        id_theme: findTheme.dataValues.id,
                        id_theme_attribute: findAttribute.dataValues.id,
                        value: value.value,
                        link: value.link,
                        id_image: idImage,
                        created_by: req.body.session_res.id_app_user,
                        created_date: getLocalDate(),

                    })
                } else {
                    const imageFile = files.find((t: any) => t.fieldname === `attributes[${index}][image]`)
                    // store image in s3
                    let idImage = null;
                    if (imageFile) {
                        const findImage = await Image.findOne({ where: { id: findSameAttribute.dataValues.id_image, is_deleted: DeletedStatus.No }, transaction: trn })
                        const imageData = await imageAddAndEditInDBAndS3(req,
                            imageFile,
                            IMAGE_TYPE.ThemeProvider,
                            req.body.session_res.id_app_user,
                            findImage,
                            req?.body?.session_res?.client_id
                        );
                        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                            await trn.rollback()
                            return imageData;
                        }
                        idImage = imageData.data;
                    } else {
                        idImage = findSameAttribute.dataValues.id_image
                    }


                    editAttributeList.push({
                        id: findSameAttribute.dataValues.id,
                        id_theme: findTheme.dataValues.id,
                        id_theme_attribute: findAttribute.dataValues.id,
                        value: value.value,
                        link: value.link,
                        id_image: idImage,
                        modified_by: req.body.session_res.id_app_user,
                        modified_date: getLocalDate()
                    })
                }


            }

            if (errors.length > 0) {
                await trn.rollback()
                return resUnprocessableEntity({ data: errors })
            } else {
                if (attributes.length > 0) {
                    const beforeUpdatethemeAttributes = await ThemeAttributes.findAll({
                        where: {
                            id_theme: findTheme.dataValues.id
                        }
                    });
                    await ThemeAttributeCustomers.bulkCreate(addAttributeList)
                    await ThemeAttributeCustomers.bulkCreate(editAttributeList, { updateOnDuplicate: ["value", "link", "id_image", "modified_by", "modified_date"] })

                    const afterUpdatethemeAttributes = await ThemeAttributes.findAll({
                        where: {
                            id_theme: findTheme.dataValues.id
                        }
                    });
                    await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                        old_data: { beforeUpdatethemeAttributes: beforeUpdatethemeAttributes?.map((t) => t.dataValues) },
                        new_data: {
                            afterUpdatethemeAttributes: afterUpdatethemeAttributes?.map((t) => t.dataValues),
                            them_id: findTheme?.dataValues?.id
                        }
                    }], findTheme?.dataValues?.id, LogsActivityType.Edit, LogsType.Themes, req?.body?.session_res?.id_app_user, trn)

                    await trn.commit()
                    return resSuccess()
                }
            }
        }

        await trn.commit()
        return resSuccess()
    } catch (error) {
        console.log("---------------", error);
        await trn.rollback()
        throw error
    }
}

export const getThemeDataForUser = async (req: Request) => {
    try {
        const { CompanyInfo} = initModels(req);
        const companyInfo = await CompanyInfo.findOne({
            where: { key: req.params.company_key }, attributes: ['id','id_header', 'id_footer', 'id_home_page',
                'id_product_grid', 'id_product_card', 'id_product_filter', 'id_product_detail', 'id_create_your_own', 'id_profile',
                'id_login_page', 'id_registration_page', 'id_toast', 'id_button', 'id_cart', 'id_checkout', 'id_otp_verify', 'id_config_detail'
            ],
        })
        if (!(companyInfo && companyInfo.dataValues)) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Company key"]]) });
        }

        const themeFields = [
            'id_header', 'id_footer', 'id_home_page', 'id_product_grid', 'id_product_card',
            'id_product_filter', 'id_product_detail', 'id_create_your_own', 'id_login_page', 'id_profile',
            'id_registration_page', 'id_toast', 'id_button', 'id_cart', 'id_checkout', 'id_otp_verify', 'id_config_detail'
        ];

        const themeIDs = themeFields
            .map(field => companyInfo.dataValues[field])
            .filter(Boolean);

        const result = await req.body.db_connection.query(`(SELECT Themes.id,name,key,description,is_active,section_type,images.image_path as image_path,images.id as id_image,
JSONB_agg(DISTINCT CASE WHEN theme_att.id = theme_cus.id_theme_attribute THEN JSONB_BUILD_OBJECT('id', theme_att.id,
									  'id_theme', theme_att.id_theme,
									  'key_value', theme_att.key_value,
									  'value', theme_cus.value,
									  'link', theme_cus.link,
									  'image_path', att_cus_image.image_path,
									  'id_image', att_cus_image.id,
                                      'is_changeable', theme_att.is_changeable
									 ) ELSE JSONB_BUILD_OBJECT('id', theme_att.id,
									  'id_theme', theme_att.id_theme,
									  'key_value', theme_att.key_value,
									  'value', theme_att.value,
									  'link', theme_att.link,
									  'image_path', att_image.image_path,
									  'id_image', att_image.id,
                                      'is_changeable', theme_att.is_changeable
									 ) END) as attributes
FROM themes
LEFT JOIN images ON images.id = Themes.id_image AND images.is_deleted = '${DeletedStatus.No}'
LEFT JOIN theme_attributes theme_att ON theme_att.id_theme = Themes.id AND theme_att.is_deleted = '${DeletedStatus.No}'
LEFT JOIN theme_attribute_customers as theme_cus ON theme_cus.id_theme = Themes.id AND theme_att.id = theme_cus.id_theme_attribute AND id_company_info = ${companyInfo.dataValues.id}
LEFT JOIN images as att_image ON att_image.id = theme_att.id_image
LEFT JOIN images as att_cus_image ON att_cus_image.id = theme_cus.id_image
WHERE Themes.is_deleted = '${DeletedStatus.No}' AND Themes.id IN (${themeIDs.join(',')})
GROUP BY Themes.id,images.id)`, { type: QueryTypes.SELECT })

        return resSuccess({ data: result })
    } catch (error) {
        throw error
    }
}

/* general Settings */

// update company details
export const updateGeneralCompanyInfo = async (req: Request) => {
    try {
        const { CompanyInfo} = initModels(req);

        const { company_name, company_email, company_phone, company_address, address_embed_map, address_map_link,copy_right } = req.body

        const companyInfoDetails: any = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

        if (!(companyInfoDetails && companyInfoDetails.dataValues)) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Company Detail"]]) })
        }
        await CompanyInfo.update({
            company_name,
            company_email,
            company_phone,
            company_address,
            address_embed_map,
            address_map_link,
            copy_right
        }, { where: { id: companyInfoDetails.dataValues.id } })

        const AfterUpdatecompanyInfoDetails = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

        await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
            old_data: { compony_id: companyInfoDetails?.dataValues?.id, data: companyInfoDetails?.dataValues },
            new_data: {
                compony_id: companyInfoDetails?.dataValues?.id, data: { ...companyInfoDetails?.dataValues, ...AfterUpdatecompanyInfoDetails?.dataValues }
            }
        }], companyInfoDetails?.dataValues?.id, LogsActivityType.Edit, LogsType.ThemeComponyInfo, req?.body?.session_res?.id_app_user)

        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
    } catch (error) {
        throw error
    }
}

// update logos
export const updateLogos = async (req: Request) => {
    try {
        const { CompanyInfo, Image} = initModels(req);

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const companyInfoDetails: any = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

        if (!(companyInfoDetails && companyInfoDetails.dataValues)) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Company Detail"]]) })
        }
        const trn = await (req.body.db_connection).transaction();
        let headerLogoIdImage = null;
        console.log("files[loader]", files["loader"]);
        if (files["header_logo"]) {
            let findImage = null;
            if (companyInfoDetails.dataValues.dark_id_image) {
                findImage = await Image.findOne({
                    where: { id: companyInfoDetails.dataValues.dark_id_image, company_info_id: req?.body?.session_res?.client_id },
                    transaction: trn,
                });
            }
            const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                req,
                files["header_logo"][0],
                IMAGE_TYPE.headerLogo,
                req.body.session_res.id_app_user,
                findImage,
                req?.body?.session_res?.client_id,);
            if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback();
                return imageData;
            }
            headerLogoIdImage = imageData.data;
        } else {
            headerLogoIdImage = companyInfoDetails.dataValues.dark_id_image
        }
        let footerLogoIdImage = null;
        if (files["footer_logo"]) {
            let findImage = null;
            if (companyInfoDetails.dataValues.light_id_image) {
                findImage = await Image.findOne({
                    where: { id: companyInfoDetails.dataValues.light_id_image, company_info_id: req?.body?.session_res?.client_id },
                    transaction: trn,
                });
            }
            const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                req,
                files["footer_logo"][0],
                IMAGE_TYPE.footerLogo,
                req.body.session_res.id_app_user,
                findImage,
                req?.body?.session_res?.client_id
            );
            if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback();
                return imageData;
            }
            footerLogoIdImage = imageData.data;
        } else {
            footerLogoIdImage = companyInfoDetails.dataValues.light_id_image
        }
        let faviconImage = null;
        if (files["favicon"]) {
            let findImage = null;
            if (companyInfoDetails.dataValues.favicon_image) {
                findImage = await Image.findOne({
                    where: { id: companyInfoDetails.dataValues.favicon_image, company_info_id: req?.body?.session_res?.client_id },
                    transaction: trn,
                });
            }
            const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                req,
                files["favicon"][0],
                IMAGE_TYPE.FaviconImage,
                req.body.session_res.id_app_user,
                findImage,
                req?.body?.session_res?.client_id
            );
            if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback();
                return imageData;
            }
            faviconImage = imageData.data;
        } else {
            faviconImage = companyInfoDetails.dataValues.favicon_image;

        }

        let loaderImage = null;
        if (files["loader"]) {
            let findImage = null;
            if (companyInfoDetails.dataValues.loader_image) {
                findImage = await Image.findOne({
                    where: { id: companyInfoDetails.dataValues.loader_image, company_info_id: req?.body?.session_res?.client_id },
                    transaction: trn,
                });
            }
            const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                req,
                files["loader"][0],
                IMAGE_TYPE.loaderImage,
                req.body.session_res.id_app_user,
                findImage,
                req?.body?.session_res?.client_id
            );
            if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback();
                return imageData;
            }
            loaderImage = imageData.data;
        } else {
            loaderImage = companyInfoDetails.dataValues.loader_image;
        }

        let mailTempLogo = null;
        if (files["mail_tem_logo"]) {
           
            const destinationPath = IMAGE_TYPE_LOCATION[IMAGE_TYPE.mailTemplateLogo] + "/" + files["mail_tem_logo"][0].originalname;
            const data = await s3UploadObject(
                req.body.db_connection,
                files["mail_tem_logo"][0].buffer,
                  destinationPath,
                  files["mail_tem_logo"][0].mimetype,
                  req.body.session_res.client_id
                );
            if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                    await trn.rollback()
                  return data;
            }
            const imageResult = await Image.create({
                image_path: destinationPath,
                image_type: IMAGE_TYPE.mailTemplateLogo,
                created_by: req.body.session_res.id_app_user,
                company_info_id :req.body.session_res.client_id,
                created_date: getLocalDate(),
              });
            mailTempLogo = imageResult.dataValues.id;
        } else {
            mailTempLogo = companyInfoDetails.dataValues.mail_tem_logo;
        }

        let defaultImage = null;
        if (files["default_image"]) {
            let findImage = null;
            if (companyInfoDetails.dataValues.default_image) {
                findImage = await Image.findOne({
                    where: { id: companyInfoDetails.dataValues.default_image, company_info_id: req?.body?.session_res?.client_id },
                    transaction: trn,
                });
            }
            const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                req,
                files["default_image"][0],
                IMAGE_TYPE.defaultImage,
                req.body.session_res.id_app_user,
                findImage,
                req?.body?.session_res?.client_id
            );
            if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback();
                return imageData;
            }
            defaultImage = imageData.data;
        } else {
            defaultImage = companyInfoDetails.dataValues.default_image
        }

        let pageNotFoundImage = null;
        if (files["page_not_found_image"]) {
            let findImage = null;
            if (companyInfoDetails.dataValues.page_not_found_image) {
                findImage = await Image.findOne({
                    where: { id: companyInfoDetails.dataValues.page_not_found_image, company_info_id: req?.body?.session_res?.client_id },
                    transaction: trn,
                });
            }
            const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                req,
                files["page_not_found_image"][0],
                IMAGE_TYPE.pageNotFoundImage,
                req.body.session_res.id_app_user,
                findImage,
                req?.body?.session_res?.client_id
            );
            if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback();
                return imageData;
            }
            pageNotFoundImage = imageData.data;
        } else {
            pageNotFoundImage = companyInfoDetails.dataValues.page_not_found_image
        }

        let shareImage = null;
        if (files["share_image"]) {
            let findImage = null;
            if (companyInfoDetails.dataValues.share_image) {
                findImage = await Image.findOne({
                    where: { id: companyInfoDetails.dataValues.share_image, company_info_id: req?.body?.session_res?.client_id },
                    transaction: trn,
                });
            }
            const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                req,
                files["share_image"][0],
                IMAGE_TYPE.shareImage,
                req.body.session_res.id_app_user,
                findImage,
                req?.body?.session_res?.client_id
            );
            if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback();
                return imageData;
            }
            shareImage = imageData.data;
        } else {
            shareImage = companyInfoDetails.dataValues.share_image;
        }
        let productNotFoundImage = null;
        if (files["product_not_found_image"]) {
            let findImage = null;
            if (companyInfoDetails.dataValues.product_not_found_image) {
                findImage = await Image.findOne({
                    where: { id: companyInfoDetails.dataValues.product_not_found_image, company_info_id: req?.body?.session_res?.client_id },
                    transaction: trn,
                });
            }
            const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                req,
                files["product_not_found_image"][0],
                IMAGE_TYPE.productNotFound,
                req.body.session_res.id_app_user,
                findImage,
                req?.body?.session_res?.client_id
            );
            if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback();
                return imageData;
            }
            productNotFoundImage = imageData.data;
        } else {
            productNotFoundImage = companyInfoDetails.dataValues.product_not_found_image;
        }
        let orderNotFoundImage = null;
        if (files["order_not_found_image"]) {
            let findImage = null;
            if (companyInfoDetails.dataValues.order_not_found_image) {
                findImage = await Image.findOne({
                    where: { id: companyInfoDetails.dataValues.order_not_found_image, company_info_id: req?.body?.session_res?.client_id },
                    transaction: trn,
                });
            }
            const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                req,
                files["order_not_found_image"][0],
                IMAGE_TYPE.orderNotFound,
                req.body.session_res.id_app_user,
                findImage,
                req?.body?.session_res?.client_id
            );
            if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback();
                return imageData;
            }
            orderNotFoundImage = imageData.data;
        } else {
            orderNotFoundImage = companyInfoDetails.dataValues.order_not_found_image;
        }
        await CompanyInfo.update({
            dark_id_image: headerLogoIdImage,
            light_id_image: footerLogoIdImage,
            loader_image: loaderImage,
            mail_tem_logo: mailTempLogo,
            default_image: defaultImage,
            page_not_found_image: pageNotFoundImage,
            favicon_image: faviconImage,
            share_image: shareImage,
            product_not_found_image: productNotFoundImage,
            order_not_found_image: orderNotFoundImage
        }, { where: { id: companyInfoDetails.dataValues.id }, transaction: trn })

        const AfterUpdatecompanyInfoDetails = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

        await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
            old_data: { compony_id: companyInfoDetails?.dataValues?.id, data: companyInfoDetails?.dataValues },
            new_data: {
                compony_id: companyInfoDetails?.dataValues?.id, data: { ...companyInfoDetails?.dataValues, ...AfterUpdatecompanyInfoDetails?.dataValues }
            }
        }], companyInfoDetails?.dataValues?.id, LogsActivityType.LogoUpdate, LogsType.ThemeComponyInfo, req?.body?.session_res?.id_app_user, trn)

        await trn.commit()
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
    } catch (error) {
        throw error
    }
}

// update scripts

export const updateScripts = async (req: Request) => {
    try {
        const { CompanyInfo} = initModels(req);

        const companyInfoDetails: any = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

        if (!(companyInfoDetails && companyInfoDetails.dataValues)) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Company Detail"]]) })
        }

        await CompanyInfo.update({
            script: req.body.script
        }, { where: { id: companyInfoDetails.dataValues.id } })

        const AfterUpdatecompanyInfoDetails = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

        await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
            old_data: { compony_id: companyInfoDetails?.dataValues?.id, data: companyInfoDetails?.dataValues },
            new_data: {
                compony_id: companyInfoDetails?.dataValues?.id, data: { ...companyInfoDetails?.dataValues, ...AfterUpdatecompanyInfoDetails?.dataValues }
            }
        }], companyInfoDetails?.dataValues?.id, LogsActivityType.Script, LogsType.ThemeComponyInfo, req?.body?.session_res?.id_app_user)

        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
    } catch (error) {
        throw error
    }
}

// update font style

export const updateFontStyle = async (req: Request) => {
    try {
        const { CompanyInfo} = initModels(req);

        const files: any = req.files as { [fieldname: string]: Express.Multer.File[] };
        const { font, font_type, font_family, font_weight, link } = req.body
        const companyInfoDetails: any = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })
        if (!(companyInfoDetails && companyInfoDetails.dataValues)) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Company Detail"]]) })
        }
        if (font_type == FontStyleType.Google) {

            if (font == FontType.Primary) {

                await CompanyInfo.update({
                    primary_font: font_family,
                    primary_font_weight: font_weight,
                    primary_font_type: font_type,
                    primary_font_json: { link: link }
                }, { where: { id: companyInfoDetails.dataValues.id } })
                const AfterUpdatecompanyInfoDetails = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

                await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                    old_data: { compony_id: companyInfoDetails?.dataValues?.id, data: companyInfoDetails?.dataValues },
                    new_data: {
                        compony_id: companyInfoDetails?.dataValues?.id, data: { ...companyInfoDetails?.dataValues, ...AfterUpdatecompanyInfoDetails?.dataValues }
                    }
                }], companyInfoDetails?.dataValues?.id, LogsActivityType.UpdateFontStyle, LogsType.ThemeComponyInfo, req?.body?.session_res?.id_app_user)

            } else {
                await CompanyInfo.update({
                    secondary_font: font_family,
                    secondary_font_weight: font_weight,
                    secondary_font_type: font_type,
                    secondary_font_json: { link: link }
                }, { where: { id: companyInfoDetails.dataValues.id } })
            }

            const AfterUpdatecompanyInfoDetails = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

            await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                old_data: { compony_id: companyInfoDetails?.dataValues?.id, data: companyInfoDetails?.dataValues },
                new_data: {
                    compony_id: companyInfoDetails?.dataValues?.id, data: { ...companyInfoDetails?.dataValues, ...AfterUpdatecompanyInfoDetails?.dataValues }
                }
            }], companyInfoDetails?.dataValues?.id, LogsActivityType.UpdateFontStyle, LogsType.ThemeComponyInfo, req?.body?.session_res?.id_app_user)


            return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
        } else {
            const fontFile = []
            const trn = await (req.body.db_connection).transaction();
            for (let index = 0; index < files?.files?.length; index++) {
                const addFile = await fontFileAddAndEditInDBAndS3ForOriginalFileName(files.files[index], "files/font", req.body.session_res.id_app_user, null, req.body.session_res.client_id, req)

                if (addFile.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                    await trn.rollback();
                    return addFile;
                }
                fontFile.push(addFile.data)
            }

            if (font == FontType.Primary) {

                const fileJson = companyInfoDetails.dataValues.primary_font_type == FontStyleType.Font && font_type == FontStyleType.Font ?
                    { file: fontFile }
                    : { file: fontFile }
                await CompanyInfo.update({
                    primary_font: font_family,
                    primary_font_weight: font_weight,
                    primary_font_type: font_type,
                    primary_font_json: fileJson
                }, { where: { id: companyInfoDetails.dataValues.id }, transaction: trn })
                const AfterUpdatecompanyInfoDetails = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

                await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                    old_data: { compony_id: companyInfoDetails?.dataValues?.id, data: companyInfoDetails?.dataValues },
                    new_data: {
                        compony_id: companyInfoDetails?.dataValues?.id, data: { ...companyInfoDetails?.dataValues, ...AfterUpdatecompanyInfoDetails?.dataValues }
                    }
                }], companyInfoDetails?.dataValues?.id, LogsActivityType.UpdateFontStyle, LogsType.ThemeComponyInfo, req?.body?.session_res?.id_app_user, trn)

                await trn.commit()
                return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
            } else {
                const fileJson = companyInfoDetails.dataValues.secondary_font_type == FontStyleType.Font && font_type == FontStyleType.Font ?
                    { file: [...companyInfoDetails.dataValues.secondary_font_json.file, ...fontFile] }
                    : { file: fontFile }
                await CompanyInfo.update({
                    secondary_font: font_family,
                    secondary_font_weight: font_weight,
                    secondary_font_type: font_type,
                    secondary_font_json: fileJson
                }, { where: { id: companyInfoDetails.dataValues.id }, transaction: trn })

                const AfterUpdatecompanyInfoDetails = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

                await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                    old_data: { compony_id: companyInfoDetails?.dataValues?.id, data: companyInfoDetails?.dataValues },
                    new_data: {
                        compony_id: companyInfoDetails?.dataValues?.id, data: { ...companyInfoDetails?.dataValues, ...AfterUpdatecompanyInfoDetails?.dataValues }
                    }
                }], companyInfoDetails?.dataValues?.id, LogsActivityType.UpdateFontStyle, LogsType.ThemeComponyInfo, req?.body?.session_res?.id_app_user, trn)

                await trn.commit()
                return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
            }
        }
    } catch (error) {
        throw error
    }
}

// delete font style file

export const deleteFontStyleFile = async (req: Request) => {
    const trn = await (req.body.db_connection).transaction();
    try {
        const { CompanyInfo, FontStyleFiles} = initModels(req);

        const { font, id } = req.params
        const companyInfoDetails: any = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 }, transaction: trn })
        if (!(companyInfoDetails && companyInfoDetails.dataValues)) {
            await trn.rollback()
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Company Detail"]]) })
        }
        const fontFile = await FontStyleFiles.findOne({ where: { id: id, is_deleted: DeletedStatus.No }, transaction: trn })

        if (!(fontFile && fontFile.dataValues)) {
            await trn.rollback()
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "File"]]) })
        }
        const deleteFile = await fontFileAddAndEditInDBAndS3ForOriginalFileName(null, "file/font", req.body.session_res.id_app_user, fontFile, req.body.session_res.client_id, req)

        if (deleteFile.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            await trn.rollback();
            return deleteFile;
        }

        if (font == FontType.Primary) {
            const fontJson = companyInfoDetails.dataValues.primary_font_json && companyInfoDetails.dataValues.primary_font_json.file && companyInfoDetails.dataValues.primary_font_json.file.length > 0 ?
                { file: companyInfoDetails.dataValues.primary_font_json.file.filter((t: any) => t.id != id) } : companyInfoDetails.dataValues.primary_font_json
            await CompanyInfo.update({
                primary_font_json: fontJson
            }, { where: { id: companyInfoDetails.dataValues.id }, transaction: trn })

            const AfterUpdatecompanyInfoDetails = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

            await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                old_data: { compony_id: companyInfoDetails?.dataValues?.id, data: companyInfoDetails?.dataValues },
                new_data: {
                    compony_id: companyInfoDetails?.dataValues?.id, data: { ...companyInfoDetails?.dataValues, ...AfterUpdatecompanyInfoDetails?.dataValues }
                }
            }], companyInfoDetails?.dataValues?.id, LogsActivityType.DeleteFontStyle, LogsType.ThemeComponyInfo, req?.body?.session_res?.id_app_user, trn)

        } else {
            const fontJson = companyInfoDetails.dataValues.secondary_font_json && companyInfoDetails.dataValues.secondary_font_json.file && companyInfoDetails.dataValues.secondary_font_json.file.length > 0 ?
                { file: companyInfoDetails.dataValues.secondary_font_json.file.filter((t: any) => t.id != id) } : companyInfoDetails.dataValues.secondary_font_json
            await CompanyInfo.update({
                secondary_font_json: fontJson
            }, { where: { id: companyInfoDetails.dataValues.id }, transaction: trn })
            const AfterUpdatecompanyInfoDetails = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

            await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                old_data: { compony_id: companyInfoDetails?.dataValues?.id, data: companyInfoDetails?.dataValues },
                new_data: {
                    compony_id: companyInfoDetails?.dataValues?.id, data: { ...companyInfoDetails?.dataValues, ...AfterUpdatecompanyInfoDetails?.dataValues }
                }
            }], companyInfoDetails?.dataValues?.id, LogsActivityType.DeleteFontStyle, LogsType.ThemeComponyInfo, req?.body?.session_res?.id_app_user, trn)

        }

        await trn.commit()
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
    } catch (error) {
        await trn.rollback()
        throw error
    }
}

// delete all font style file

export const deleteAllFontStyleFile = async (req: Request) => {
    try {
        const { CompanyInfo} = initModels(req);

        const { font } = req.params

        const companyInfoDetails: any = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })
        if (!(companyInfoDetails && companyInfoDetails.dataValues)) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Company Detail"]]) })
        }

        if (font == FontType.Primary && companyInfoDetails.dataValues.primary_font_type == FontStyleType.Font) {
            await CompanyInfo.update({
                primary_font_json: { file: [] }
            }, { where: { id: companyInfoDetails.dataValues.id } })

        } else if (font == FontType.Secondary && companyInfoDetails.dataValues.secondary_font_type == FontStyleType.Font){
            await CompanyInfo.update({
                secondary_font_json: { file: [] }
            }, {where: { id: companyInfoDetails.dataValues.id }})
        }

            const AfterUpdatecompanyInfoDetails = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id} })
            await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                old_data: { compony_id: companyInfoDetails?.dataValues?.id, data: companyInfoDetails?.dataValues },
                new_data: {
                    compony_id: companyInfoDetails?.dataValues?.id, data: { ...companyInfoDetails?.dataValues, ...AfterUpdatecompanyInfoDetails?.dataValues }
                }
            }], companyInfoDetails?.dataValues?.id, LogsActivityType.DeleteFontStyle, LogsType.ThemeComponyInfo, req?.body?.session_res?.id_app_user, null)
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })

    } catch (error) {
        throw error
    }
}

// update system color 

export const updateSystemColor = async (req: Request) => {
    try {
        const { CompanyInfo} = initModels(req);

        const companyInfoDetails: any = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })
        if (!(companyInfoDetails && companyInfoDetails.dataValues)) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Company Detail"]]) })
        }

        await CompanyInfo.update({
            web_primary_color: req.body.primary_color,
            web_secondary_color: req.body.secondary_color
        }, { where: { id: companyInfoDetails.dataValues.id } })

        const AfterUpdatecompanyInfoDetails = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id || 0 } })

        await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
            old_data: { compony_id: companyInfoDetails?.dataValues?.id, data: companyInfoDetails?.dataValues },
            new_data: {
                compony_id: companyInfoDetails?.dataValues?.id, data: { ...companyInfoDetails?.dataValues, ...AfterUpdatecompanyInfoDetails?.dataValues }
            }
        }], companyInfoDetails?.dataValues?.id, LogsActivityType.UpdateSystemColor, LogsType.ThemeComponyInfo, req?.body?.session_res?.id_app_user)

        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
    } catch (error) {
        throw error
    }
}

// get general setting API 

export const getGeneralSetting = async (req: Request) => {
    try {
        const { CompanyInfo,Image} = initModels(req);

        const data = await CompanyInfo.findOne({
            where: { id: req.body.session_res.client_id },
            attributes: [
                "id",
                "company_name",
                "company_email",
                "company_phone",
                "copy_right",
                "copy_right",
                "sort_about",
                ["web_primary_color", "primary_color"],
                ["web_secondary_color", "secondary_color"],
                "key",
                "company_address",
                "script",
                "address_embed_map",
                "address_map_link",
                "primary_font",
                "primary_font_weight",
                "primary_font_json",
                "secondary_font",
                "secondary_font_weight",
                "secondary_font_json",
                "secondary_font_type",
                "primary_font_type",
                [Sequelize.literal(`CASE WHEN key = '${GLEAMORA_KEY}' THEN true ELSE false END`), "is_theme_update"],
                [Sequelize.literal(`"dark_image"."image_path"`), "header_logo"],
                [Sequelize.literal(`"light_image"."image_path"`), "footer_logo"],
                [Sequelize.literal(`"favicon"."image_path"`), "favicon_logo"],
                [Sequelize.literal(`"loader"."image_path"`), "loader_image"],
                [Sequelize.literal(`"default"."image_path"`), "default_image"],
                [Sequelize.literal(`"page_not_image"."image_path"`), "page_not_found_image"],
                [Sequelize.literal(`"mail_logo"."image_path"`), "mail_logo_image"],
                [Sequelize.literal(`"share_images"."image_path"`), "share_image_path"],
                [Sequelize.literal(`"product_not_images"."image_path"`), "product_not_found_image"],
                [Sequelize.literal(`"order_not_images"."image_path"`), "order_not_found_image"],
            ],
            include: [
                { model: Image, as: "dark_image", attributes: [] },
                { model: Image, as: "light_image", attributes: [] },
                { model: Image, as: "favicon", attributes: [] },
                { model: Image, as: "loader", attributes: [] },
                { model: Image, as: "default", attributes: [] },
                { model: Image, as: "page_not_image", attributes: [] },
                { model: Image, as: "mail_logo", attributes: [] },
                { model: Image, as: "share_images", attributes: [] },
                { model: Image, as: "product_not_images", attributes: [] },
                { model: Image, as: "order_not_images", attributes: [] }

            ]
        })

        return resSuccess({ data: data })
    } catch (error) {
        throw error
    }
}

// payment method, smtp, image manage , secure communication, order and invoice 

// update web config setting
export const updateWebConfigSetting = async (req: any, clientId : number = 0) => {
    try {
        const { razorpay_public_key,
            razorpay_secret_key,
            razorpay_status,
            razorpay_script,
            stripe_public_key,
            stripe_secret_key,
            stripe_status,
            stripe_script,
            paypal_public_key,
            paypal_secret_key,
            paypal_status,
            paypal_script,
            yoco_public_key,
            yoco_secret_key,
            yoco_status,
            yoco_script,
            affirm_public_key,
            affirm_secret_key,
            affirm_status,
            affirm_script,
            smtp_user_name,
            smtp_password,
            smtp_host,
            smtp_port,
            smtp_secure,
            smtp_from,
            smtp_service,
            insta_api_endpoint,
            insta_access_token,
            image_local_path,
            file_local_path,
            local_status,
            s3_bucket_name,
            s3_bucket_region,
            s3_bucket_secret_access_key,
            s3_bucket_status,
            s3_bucket_access_key,
            
            fronted_base_url,
            reset_pass_url,
            otp_generate_digit_count,
            invoice_number_generate_digit_count,
            order_invoice_number_identity,
            allow_out_of_stock_product_order,
            image_base_url,
            metal_tone_identifier,
            three_stone_glb_key,
            band_glb_key,
            glb_key,
            metal_karat_value,
            metal_gold_id,
            metal_silver_id,
            metal_platinum_id,
            eternity_band_glb_key,
            bracelet_glb_key,
            google_font_key,
            google_auth_status,
            google_auth_key,
            facebook_auth_status,
            facebook_auth_key,
            insta_auth_key,
            insta_auth_status,
            apple_auth_status,
            apple_auth_key,
            glb_url,
            insta_secret_key,
            gust_user_allowed = true,
            promo_code_allowed = true,
            pickup_from_store = true,
            move_to_wishlist = false,
            shop_now = false,
            whats_app_send_message_status,
            whats_app_send_message_api_token,
            whats_app_send_message_api,
            pendant_glb_key,
            stud_glb_key,
            is_login,
            is_config_login,
            is_sign_up,
            google_map_api_key
        } = req.body
        const { WebConfigSetting, Image} = initModels(req);

        const findConfigSetting: any = await WebConfigSetting.findOne({ where: { company_id: (clientId == 0 ? req.body.session_res.client_id || 0 : clientId) } })
        let bucketStatus = (s3_bucket_status == 'active' ? "1" : "0")

        if (!(findConfigSetting && findConfigSetting.dataValues)) {
            const payamentStatusActive = stripe_status == "1" || paypal_status == "1" || yoco_status == "1" || affirm_status == "1" || razorpay_status == "1"

            const payload = {
                razorpay_public_key,
                razorpay_secret_key,
                razorpay_status,
                razorpay_script,
                stripe_public_key,
                stripe_secret_key,
                stripe_status,
                stripe_script,
                paypal_public_key,
                paypal_secret_key,
                paypal_status,
                paypal_script,
                yoco_public_key,
                yoco_secret_key,
                yoco_status,
                yoco_script,
                affirm_public_key,
                affirm_secret_key,
                affirm_status,
                affirm_script,
                smtp_user_name,
                smtp_password,
                smtp_host,
                smtp_port,
                smtp_secure,
                smtp_from,
                smtp_service,
                insta_api_endpoint,
                insta_access_token,
                image_local_path,
                file_local_path,
                local_status,
                s3_bucket_name,
                s3_bucket_region,
                s3_bucket_secret_access_key,
                s3_bucket_status: bucketStatus,
                s3_bucket_access_key,
                whats_app_send_message_status,
                whats_app_send_message_api,
                whats_app_send_message_api_token,
                pendant_glb_key,
                stud_glb_key,
                is_login,
                is_config_login,
                is_sign_up,
                google_map_api_key,
                fronted_base_url,
                reset_pass_url,
                otp_generate_digit_count,
                invoice_number_generate_digit_count,
                order_invoice_number_identity,
                allow_out_of_stock_product_order,
                modified_by: req.body.session_res.id_app_user ?? null,
                modified_date: getLocalDate(),
                is_active : ActiveStatus.Active,
                is_deleted: DeletedStatus.No,
                company_id: clientId == 0 ? req?.body?.session_res?.client_id : clientId,
                company_info_id: clientId == 0 ? req?.body?.session_res?.client_id : clientId,
                image_base_url,
                metal_tone_identifier,
                three_stone_glb_key,
                band_glb_key,
                glb_key,
                metal_karat_value,
                metal_gold_id,
                metal_silver_id,
                metal_platinum_id,
                eternity_band_glb_key,
                bracelet_glb_key,
                google_font_key,
                google_auth_status,
                google_auth_key,
                facebook_auth_status,
                facebook_auth_key,
                insta_auth_key,
                insta_auth_status,
                apple_auth_status,
                apple_auth_key,
                glb_url,
                insta_secret_key,
                gust_user_allowed,
                promo_code_allowed,
                pickup_from_store,
                move_to_wishlist,
                shop_now
            }

            const createPayload = payamentStatusActive ? payload : { ...payload, stripe_status: "1" }

            const WebConfigSettingData = await WebConfigSetting.create(createPayload)

            await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                old_data: null,
                new_data: {
                    web_config_id: WebConfigSettingData?.dataValues?.id, data: {
                        ...WebConfigSettingData?.dataValues
                    }
                }
            }], WebConfigSettingData?.dataValues?.id, LogsActivityType.Add, LogsType.WebConfig, req?.body?.session_res?.id_app_user)

        } else {
            const stripeStatus = stripe_status ?? findConfigSetting.dataValues.stripe_status
            const razorpayStatus = razorpay_status ?? findConfigSetting.dataValues.razorpay_status
            const paypalStatus = paypal_status ?? findConfigSetting.dataValues.paypal_status
            const yocoStatus = yoco_status ?? findConfigSetting.dataValues.yoco_status
            const affirmStatus = affirm_status ?? findConfigSetting.dataValues.affirm_status

            const metal_gold = metal_gold_id ?? findConfigSetting.dataValues.metal_gold_id
            const metal_silver = metal_silver_id ?? findConfigSetting.dataValues.metal_silver_id
            const metal_platinum = metal_platinum_id ?? findConfigSetting.dataValues.metal_platinum_id

            const payamentStatusActive = stripeStatus == "1" || razorpayStatus == "1" || paypalStatus == "1" || yocoStatus == "1" || affirmStatus == "1"

            if (!payamentStatusActive) {
                return resBadRequest({ message: "At least one payment gateway should be active" })
            }

            await WebConfigSetting.update({
                razorpay_public_key,
                razorpay_secret_key,
                razorpay_status,
                razorpay_script,
                stripe_public_key,
                stripe_secret_key,
                stripe_status,
                stripe_script,
                paypal_public_key,
                paypal_secret_key,
                paypal_status,
                paypal_script,
                yoco_public_key,
                yoco_secret_key,
                yoco_status,
                yoco_script,
                affirm_public_key,
                affirm_secret_key,
                affirm_status,
                affirm_script,
                smtp_user_name,
                smtp_password,
                smtp_host,
                smtp_port,
                smtp_secure,
                smtp_from,
                smtp_service,
                insta_api_endpoint,
                insta_access_token,
                image_local_path,
                file_local_path,
                local_status,
                s3_bucket_name,
                s3_bucket_region,
                s3_bucket_secret_access_key,
                s3_bucket_status: bucketStatus,
                s3_bucket_access_key,
                whats_app_send_message_status,
                whats_app_send_message_api,
                whats_app_send_message_api_token,
                pendant_glb_key,
                stud_glb_key,
                is_login,
                is_config_login,
                is_sign_up,
                google_map_api_key,
                fronted_base_url,
                reset_pass_url,
                otp_generate_digit_count,
                invoice_number_generate_digit_count,
                order_invoice_number_identity,
                allow_out_of_stock_product_order,
                modified_by: req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
                company_id: req.body.session_res.client_id,
                image_base_url,
                metal_tone_identifier,
                three_stone_glb_key,
                band_glb_key,
                glb_key,
                metal_karat_value,
                metal_gold_id:metal_gold,
                metal_platinum_id:metal_platinum,
                metal_silver_id:metal_silver,
                eternity_band_glb_key,
                bracelet_glb_key,
                google_font_key,
                google_auth_status,
                google_auth_key,
                facebook_auth_status,
                facebook_auth_key,
                insta_auth_key,
                insta_auth_status,
                apple_auth_status,
                apple_auth_key,
                glb_url,
                insta_secret_key,
                gust_user_allowed,
                promo_code_allowed,
                pickup_from_store,
                move_to_wishlist,
                shop_now

            }, { where: { id: findConfigSetting.dataValues.id } })
            const AfterUpdatefindConfigSetting: any = await WebConfigSetting.findOne({ where: { company_id: req.body.session_res.client_id || 0 } })

            await addActivityLogs(req,LOG_FOR_SUPER_ADMIN, [{
                old_data: { web_config_id: findConfigSetting?.dataValues?.id, data: findConfigSetting?.dataValues },
                new_data: {
                    web_config_id: findConfigSetting?.dataValues?.id, data: { ...findConfigSetting?.dataValues, ...AfterUpdatefindConfigSetting?.dataValues }
                }
            }], findConfigSetting?.dataValues?.id, LogsActivityType.Edit, LogsType.WebConfig, req?.body?.session_res?.id_app_user)

        }

        // await refreshMaterializedProductListView(req.body.db_connection)
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
    } catch (error) {
        throw error
    }
}

export const getWebConfigSetting = async (req: Request) => {
    try {
        const { WebConfigSetting } = initModels(req);
        const findConfigSetting: any = await WebConfigSetting.findOne({
            where: { company_id: req.body.session_res.client_id || 0 },
            attributes: [
                'razorpay_public_key',
                'razorpay_secret_key',
                'razorpay_status',
                'razorpay_script',
                'stripe_public_key',
                'stripe_secret_key',
                'stripe_status',
                'stripe_script',
                'paypal_public_key',
                'paypal_secret_key',
                'paypal_status',
                'paypal_script',
                'yoco_public_key',
                'yoco_secret_key',
                'yoco_status',
                'yoco_script',
                'affirm_public_key',
                'affirm_secret_key',
                'affirm_status',
                'affirm_script',
                'smtp_user_name',
                'smtp_password',
                'smtp_host',
                'smtp_port',
                'smtp_secure',
                'smtp_from',
                'smtp_service',
                'insta_api_endpoint',
                'insta_access_token',
                'image_local_path',
                'file_local_path',
                'local_status',
                's3_bucket_name',
                's3_bucket_region',
                's3_bucket_secret_access_key',
                's3_bucket_status',
                'fronted_base_url',
                'reset_pass_url',
                'otp_generate_digit_count',
                'invoice_number_generate_digit_count',
                'order_invoice_number_identity',
                'allow_out_of_stock_product_order',
                'image_base_url',
                'metal_tone_identifier',
                'three_stone_glb_key',
                'band_glb_key',
                'glb_key',
                'metal_karat_value',
                "metal_karat_value",
                "metal_gold_id",
                "metal_silver_id",
                "metal_platinum_id",
                "eternity_band_glb_key",
                "bracelet_glb_key",
                "google_font_key",
                "google_auth_status",
                "google_auth_key",
                "facebook_auth_status",
                "facebook_auth_key",
                "insta_auth_key",
                "insta_auth_status",
                "apple_auth_status",
                "apple_auth_key",
                "glb_url",
                "insta_secret_key",
                "gust_user_allowed",
                "promo_code_allowed",
                "s3_bucket_access_key",
                "pickup_from_store",
                "move_to_wishlist",
                "shop_now",
                "whats_app_send_message_status",
                "whats_app_send_message_api",
                "whats_app_send_message_api_token",
                "pendant_glb_key",
                "stud_glb_key",
                "is_login",
                "is_config_login",
                "is_sign_up",
                "google_map_api_key"
            ]
        })
        return resSuccess({ data: findConfigSetting })
    } catch (error) {
        throw error
    }
}
