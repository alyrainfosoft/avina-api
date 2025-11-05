import { Request } from "express";
import { initModels } from "../model/index.model";
import { getCompanyIdBasedOnTheCompanyKey, getInitialPaginationFromQuery, getLocalDate, prepareMessageFromParams, refreshMaterializedStudConfiguratorPriceFindView, resBadRequest, resNotFound, resSuccess, resUnknownError, resUnprocessableEntity } from "../../utils/shared-functions";
import { BLANK_FILE_ERROR_MESSAGE, DATA_NOT_FOUND, DEFAULT_STATUS_CODE_SUCCESS, ERROR_INVALID_MASSAGE, ERROR_NOT_FOUND, FILE_NOT_FOUND, INVALID_HEADER, INVALID_HEADER_ERROR_MESSAGE, NO_DATA_IN_EXCEL_FILE_ERROR_MESSAGE, PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE, RECORD_DELETE_SUCCESSFULLY, REQUIRED_ERROR_MESSAGE } from "../../utils/app-messages";
import { PRODUCT_BULK_UPLOAD_FILE_SIZE, PRODUCT_CSV_FOLDER_PATH } from "../../config/env.var";
import { moveFileToLocation } from "../../helpers/file.helper";
import { ActiveStatus, DeletedStatus, DIAMOND_TYPE, FILE_BULK_UPLOAD_TYPE, FILE_STATUS, PRICE_CORRECTION_PRODUCT_TYPE, STUD_PRODUCT_TYPE } from "../../utils/app-enumeration";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import { CONFIG_PRODUCT_METAL_DETAILS } from "../../utils/app-constants";
import dbContext from "../../config/db-context";
import { literal, Op, QueryTypes, Sequelize, where } from "sequelize";

const readXlsxFile = require("read-excel-file/node");

export const addStudConfigProduct = async (req: Request) => {
    try {
        const { ProductBulkUploadFile } = initModels(req);
        if (!req.file) {
            return resUnprocessableEntity({
                message: FILE_NOT_FOUND,
            });
        }

        if (req.file.size > PRODUCT_BULK_UPLOAD_FILE_SIZE * 1024 * 1024) {
            return resUnprocessableEntity({
                message: PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
            });
        }

        const resMFTL = moveFileToLocation(
            req.file.filename,
            req.file.destination,
            PRODUCT_CSV_FOLDER_PATH,
            req.file.originalname
        );

        if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return resMFTL;
        }

        const resPBUF = await ProductBulkUploadFile.create({
            file_path: resMFTL.data,
            status: FILE_STATUS.Uploaded,
            file_type: FILE_BULK_UPLOAD_TYPE.ConfigProductUpload,
            created_by: req.body.session_res.id_app_user,
            company_info_id: req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
        });

        const PPBUF = await processProductBulkUploadFile(
            resPBUF.dataValues.id,
            resMFTL.data,
            req
        );

        return PPBUF;
    } catch (e) {
        return resUnknownError({ data: e });
    }
};

const processProductBulkUploadFile = async (id: number, path: string, req: Request) => {
    try {
        const { ProductBulkUploadFile } = initModels(req);
        const data = await processCSVFile(path, req);
        if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            await ProductBulkUploadFile.update(
                {
                    status: FILE_STATUS.ProcessedError,
                    error: JSON.stringify({
                        ...data,
                        data: parseError(data.data),
                    }),
                    modified_date: getLocalDate(),
                },
                { where: { id } }
            );
        } else {
            await ProductBulkUploadFile.update(
                {
                    status: FILE_STATUS.ProcessedSuccess,
                    modified_date: getLocalDate(),
                },
                { where: { id } }
            );
        }
        return data;
    } catch (e) {
        return resUnknownError({ data: e });
    }
};

const parseError = (error: any) => {
    let errorDetail = "";
    try {
        if (error) {
            if (error instanceof Error) {
                errorDetail = error.toString();
            } else {
                errorDetail = JSON.stringify(error);
            }
        }
    } catch (e) { }
    return errorDetail;
};

const processCSVFile = async (path: string, req: Request) => {
    try {
        const resRows = await getArrayOfRowsFromCSVFile(path);

        if (resRows.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return resRows;
        }

        if (resRows.data.results.length === 0) {
            return resUnprocessableEntity({
                message: BLANK_FILE_ERROR_MESSAGE,
            });
        }

        if (resRows.data.headers.length !== 25) {
            return resUnprocessableEntity({
                message: prepareMessageFromParams(INVALID_HEADER_ERROR_MESSAGE, [["field_name", "25"]]),
            });
        }

        const resVH = await validateHeaders(resRows.data.headers);

        if (resVH.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return resVH;
        }

        const resProducts = await getProductsFromRows(resRows.data.results, req);
        if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return resProducts;
        }

        const resAddToDB = await addProductToDB(resProducts.data, req);
        if (resAddToDB.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return resAddToDB;
        }

        return resSuccess({ data: resProducts.data });

    } catch (error) {
        console.log("\n\n\n\n\n\n\n", error, "\n\n\n\n\n\n\n")
        return resUnknownError({ data: error });
    }
}

const getArrayOfRowsFromCSVFile = async (path: string): Promise<TResponseReturn> => {
    try {
        const data = await readXlsxFile(path);
        if (!data || data.length === 0) {
            return resUnprocessableEntity({ message: NO_DATA_IN_EXCEL_FILE_ERROR_MESSAGE });
        }

        const headers = data[0];
        const results = data.slice(1).map((row) => {
            return headers.reduce(
                (acc, header, index) => ({ ...acc, [header]: row[index] }),
                {} as Record<string, unknown>
            );
        });

        return resSuccess({ data: { results, batchSize: results.length, headers } });
    } catch (e) {
        throw e;
    }
};

const validateHeaders = async (headers: string[]) => {
    const PRODUCT_BULK_UPLOAD_HEADERS = [
        "parent_sku_details",
        "product_style",
        "huggies_setting_type",
        "setting_type",
        "center_dia_wt",
        "center_dia_shape",
        "center_dia_mm_size",
        "center_dia_count",
        "side_dia_prod_type",
        "side_dia_shape",
        "side_dia_mm_size",
        "side_dia_carat",
        "side_dia_count",
        "style_no",
        "huggies_no",
        "drop_no",
        "KT_9",
        "KT_14",
        "KT_18",
        "silver",
        "platinum",
        "sort_description",
        "long_description",
        "labour_charge",
        "other_charge",
    ];
    let errors: {
        row_id: number;
        column_id: number;
        column_name: string;
        error_message: string;
    }[] = [];
    let i;
    for (i = 0; i < headers.length; i++) {
        if (headers[i] !== PRODUCT_BULK_UPLOAD_HEADERS[i]) {
            errors.push({
                row_id: 1,
                column_id: i,
                column_name: headers[i],
                error_message: INVALID_HEADER,
            });
        }
    }
    if (errors.length > 0) {
        return resUnprocessableEntity({ data: errors });
    }
    return resSuccess();
};

const getIdFromName = (
    name: string,
    list: any,
    fieldName: string,
    field_name: any
) => {
    if ((name == "" && !name) || name == null) {
        return null;
    }
    let findItem = list.find(
        (item: any) => {
            return item.dataValues[fieldName].toString().trim().toLowerCase() ==
                name.toString().trim().toLowerCase()
        }
    );

    return findItem
        ? { data: parseInt(findItem.dataValues.id), error: null }
        : {
            data: null,
            error: prepareMessageFromParams(ERROR_NOT_FOUND, [
                ["field_name", `${name} ${field_name}`],
            ]),
        };
};

const addProductMetalDetail = async (
    row: any,
    productList: any,
    currentProductIndex: number,
    diamondShapeList: any,
    mmSizeList: any,
    stoneList: any
) => {
    if (productList[currentProductIndex]) {
        CONFIG_PRODUCT_METAL_DETAILS.forEach((detail) => {
            if (row[detail.key] && row[detail.key] !== "") {
                productList[currentProductIndex].product_metal_details[
                    detail.productListField
                ] = {
                    metal: detail.metal,
                    karat: detail.karat,
                    metal_weight: row[detail.key],
                    labor_charge: row.labour_charge ? row.labour_charge : null,
                };
            }
        });

        if (!!row.side_dia_prod_type && row.side_dia_prod_type?.length > 0) {
            if (row.side_dia_prod_type && row.side_dia_prod_type !== "") {
                productList[currentProductIndex].side_diamond.push({
                    side_dia_type: row.side_dia_prod_type?.toString().trim().toLowerCase(),
                    shape: await getIdFromName(
                        row.side_dia_shape,
                        diamondShapeList,
                        "name",
                        "side diamond shape"
                    )?.data,
                    mm_size: row.side_dia_mm_size
                        ? await getIdFromName(
                            row.side_dia_mm_size.toString(),
                            mmSizeList,
                            "value",
                            "Side diamond mm size"
                        )?.data
                        : null,
                    carat: row.side_dia_carat,
                    stone_count: row.side_dia_count,
                });
            }
        }
    }
};

const setMetalProductList = async (
    productList: any,
    metalMaster: any,
    karatMaster: any,
    currentProductIndex: number
) => {
    let errors: {
        style_no: any;
        error_message: string;
    }[] = [];

    try {
        const productData = [];

        for (const product of productList) {
            const { product_metal_details } = product;
            const keysToCheck = [
                "product9KTList",
                "product14KTList",
                "product18KTList",
                "productSilverList",
                "productPlatinumList",
            ];

            for (const key of keysToCheck) {
                const details = product_metal_details[key];

                if (details && Object.keys(details).length > 0) {
                    const metal = await getIdFromName(
                        details.metal,
                        metalMaster,
                        "name",
                        "Metal"
                    );

                    if (metal.error) {
                        errors.push({
                            style_no: product.style_no,
                            error_message: metal.error,
                        });
                    }

                    if (details.karat) {
                        const karat = await getIdFromName(
                            details.karat,
                            karatMaster,
                            "name",
                            "Karat"
                        );

                        if (karat.error) {
                            errors.push({
                                style_no: product.style_no,
                                error_message: karat.error,
                            });
                        }

                        details.id_karat = karat.data;
                    } else {
                        details.id_karat = null;
                    }

                    details.id_metal = metal.data;

                    productData.push({
                        ...product,
                        product_metal_data: details,
                        product_metal_details: {},
                    });
                }
            }
        }

        if (errors.length > 0) {
            return resBadRequest({ data: errors });
        } else {
            return resSuccess({ data: productData });
        }
    } catch (error) {
        throw error;
    }
};

const formatForSku = (str?: string): string =>
    str?.trim().toLowerCase().replace(/\s+/g, "-") ?? "";

const formatForNamePart = (value?: string, suffix: string = ""): string =>
    value ? `${value} ${suffix}`.trim() : "";

const generateSlug = (str: string): string =>
    str
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-");

const createNameAndSkuList = (productList: any[]): any[] => {
    return productList.map((product) => {
        const metalData = product.product_metal_data ?? {};
        const name = `${metalData.karat ? `${metalData.karat}K ` : ""}${metalData.metal ?? ""} ${formatForNamePart(product.center_dia_wt_value, "carat")} ${formatForNamePart(product.center_dia_shape_value, "Diamond")} ${product.setting_type_value ?? ""} ${product.product_style ?? ""}`;
        const slug = generateSlug(name);
        const skuParts = [
            metalData.karat ? `${metalData.karat}k` : "",
            formatForSku(metalData.metal),
            product.center_dia_wt_value ?? "",
            formatForSku(product.center_dia_shape_value),
            formatForSku(product.setting_type_value),
            formatForSku(product.product_style),
            formatForSku(product.huggies_setting_type_value)
        ];

        const sku = skuParts.filter(Boolean).join("-");

        return {
            ...product,
            name,
            sku,
            slug
        };
    });
};

const getProductsFromRows = async (rows: any, req: Request) => {
    const { HeadsData, DiamondShape, StoneData, DiamondCaratSize, MMSizeData, MetalMaster, GoldKarat, SideSettingStyles } = initModels(req);

    let currentProductIndex = -1;
    let productList = [];
    let where = { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id };
    try {
        let errors: {
            style_no: any;
            error_message: string;
        }[] = [];
        const headList = await HeadsData.findAll({ where });
        const diamondShapeList = await DiamondShape.findAll({ where });
        const DiamondCaratSizeList = await DiamondCaratSize.findAll({ where });
        const stoneList = await StoneData.findAll({ where });
        const mmSizeList = await MMSizeData.findAll({ where });
        const metalList = await MetalMaster.findAll({ where });
        const karatList = await GoldKarat.findAll({ where });
        const sideSetting = await SideSettingStyles.findAll({ where });

        for (const row of rows) {
            // check required value exists or not
            if (row.parent_sku_details == "1") {
                // check the product style
                if (row.product_style == null) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "product Type"],
                        ]),
                    });
                }

                // check the huggies setting type
                if (
                    row.product_style.toLowerCase() == STUD_PRODUCT_TYPE.HUGGIES &&
                    row.huggies_setting_type == null
                ) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Huggies setting Type"],
                        ]),
                    });
                }

                // check setting type
                if (
                    row.setting_type == null
                ) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Setting Type"],
                        ]),
                    });
                }

                // check style no
                if (row.style_no == null) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Style No"],
                        ]),
                    })
                }

                // check huggies no
                if (row.product_style.toLowerCase() == STUD_PRODUCT_TYPE.HUGGIES && row.huggies_no == null) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Huggies No"],
                        ]),
                    })
                }

                // check drop no
                if (row.product_style.toLowerCase() == STUD_PRODUCT_TYPE.HUGGIES && row.drop_no == null) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Drop No"],
                        ]),
                    })
                }

                // check center diamond weight
                if (row.center_dia_wt == null) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Center Diamond Weight"],
                        ]),
                    })
                }

                // check center diamond shape
                if (row.center_dia_shape == null) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Center Diamond Shape"],
                        ]),
                    })
                }

                // check center diamond mm size
                if (row.center_dia_mm_size == null) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Center Diamond MM Size"],
                        ]),
                    })
                }

                // check metal
                if (row.KT_9 == null || row.KT_14 == null || row.KT_18 == null || row.silver == null || row.platinum == null) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Metal"],
                        ]),
                    })
                }

                // check value of each field
                // check product style
                if (!Object.values(STUD_PRODUCT_TYPE).includes(row.product_style?.trim()?.toLowerCase())) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
                            ["field_name", "Product Style"],
                        ]),
                    })
                }

                // check setting type
                let setting_type = await getIdFromName(row.setting_type, headList, "name", "Setting type");
                if (setting_type && setting_type.error != undefined) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: setting_type.error,
                    });
                } else if (setting_type && setting_type.data) {
                    setting_type = setting_type?.data;
                } else {
                    setting_type = null;
                }

                // check huggies setting type
                let huggies_setting_type;
                if (!!row?.huggies_setting_type) {
                    huggies_setting_type = await getIdFromName(row.huggies_setting_type, sideSetting, "name", "Huggies Setting type");
                    if (huggies_setting_type && huggies_setting_type.error != undefined) {
                        errors.push({
                            style_no: row.style_no,
                            error_message: huggies_setting_type.error,
                        });
                    } else if (huggies_setting_type && huggies_setting_type.data) {
                        huggies_setting_type = huggies_setting_type?.data;
                    } else {
                        huggies_setting_type = null;
                    }
                }

                // check diamond weight
                let center_dia_wt = await getIdFromName(row.center_dia_wt, DiamondCaratSizeList, "value", "Center Diamond Weight");
                if (center_dia_wt && center_dia_wt.error != undefined) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: center_dia_wt.error,
                    });
                } else if (center_dia_wt && center_dia_wt.data) {
                    center_dia_wt = center_dia_wt?.data;
                } else {
                    center_dia_wt = null;
                }

                // check center diamond shape
                let center_dia_shape = await getIdFromName(row.center_dia_shape, diamondShapeList, "name", "Center Diamond Shape");
                if (center_dia_shape && center_dia_shape.error != undefined) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: center_dia_shape.error,
                    });
                } else if (center_dia_shape && center_dia_shape.data) {
                    center_dia_shape = center_dia_shape?.data;
                } else {
                    center_dia_shape = null;
                }

                // check center diamond mm size
                let center_dia_mm_size = await getIdFromName(row.center_dia_mm_size, mmSizeList, "value", "Center Diamond MM Size");
                if (center_dia_mm_size && center_dia_mm_size.error != undefined) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: center_dia_mm_size.error,
                    });
                } else if (center_dia_mm_size && center_dia_mm_size.data) {
                    center_dia_mm_size = center_dia_mm_size?.data;
                } else {
                    center_dia_mm_size = null;
                }

                // check center diamond count
                if (row.center_dia_count == null || row.center_dia_count < 1) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Center Diamond Count"],
                        ]),
                    })
                }

                currentProductIndex++;
                // create product list
                productList.push({
                    product_style: Object.values(STUD_PRODUCT_TYPE).find(type => type.toLowerCase() === row.product_style?.trim()?.toLowerCase()),
                    huggies_setting_type: huggies_setting_type,
                    huggies_setting_type_value: row.huggies_setting_type,
                    setting_type: setting_type,
                    setting_type_value: row.setting_type,
                    center_dia_wt: center_dia_wt,
                    center_dia_wt_value: row.center_dia_wt,
                    center_dia_shape: center_dia_shape,
                    center_dia_shape_value: row.center_dia_shape,
                    center_dia_mm_size: center_dia_mm_size,
                    center_dia_mm_size_value: row.center_dia_mm_size,
                    center_dia_count: row.center_dia_count,
                    style_no: row.style_no,
                    huggies_no: row.huggies_no,
                    drop_no: row.drop_no,
                    sort_description: row.sort_description,
                    long_description: row.long_description,
                    labour_charge: row.labour_charge,
                    other_charge: row.other_charge,
                    product_metal_details: {
                        product9KTList: {},
                        product14KTList: {},
                        product18KTList: {},
                        productSilverList: {},
                        productPlatinumList: {},
                    },
                    side_diamond: []
                })

                await addProductMetalDetail(row, productList, currentProductIndex, diamondShapeList, mmSizeList, stoneList);
            } else if (row.parent_sku_details == "0") {
                await addProductMetalDetail(row, productList, currentProductIndex, diamondShapeList, mmSizeList, stoneList);
            }
        }

        if (errors?.length > 0) {
            return resBadRequest({ data: errors });
        }

        const metalProductList = await setMetalProductList(productList, metalList, karatList, currentProductIndex);

        if (metalProductList.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return resBadRequest({ data: metalProductList.data });
        }

        const createNameAndSku = await createNameAndSkuList(metalProductList.data);

        return resSuccess({ data: createNameAndSku });
    } catch (e) {
        throw e;
    }
};

const addProductToDB = async (productList: any, req: Request) => {
    let trn;
    try {
        const { StudConfigProduct, StudDiamonds, StudMetal } = initModels(req)

        trn = await dbContext.transaction();

        const metalList = [];
        const diamondList = [];

        for (const product of productList) {
            const stud = await StudConfigProduct.create(
                {
                    setting_type: product.setting_type,
                    huggies_setting_type: product.huggies_setting_type,
                    center_dia_wt: product.center_dia_wt,
                    center_dia_shape: product.center_dia_shape,
                    center_dia_mm_size: product.center_dia_mm_size,
                    center_dia_count: product.center_dia_count,
                    style_no: product.style_no,
                    huggies_no: product.huggies_no,
                    drop_no: product.drop_no,
                    sort_description: product.sort_description,
                    long_description: product.long_description,
                    labour_charge: product.labour_charge,
                    other_charge: product.other_charge,
                    created_at: getLocalDate(),
                    created_by: req.body.session_res.id_app_user,
                    is_active: ActiveStatus.Active,
                    is_deleted: DeletedStatus.No,
                    product_style: product.product_style,
                    name: product.name,
                    sku: product.sku,
                    slug: product.slug,
                    company_info_id: req?.body?.session_res?.client_id
                },
                {
                    transaction: trn
                }
            );
            metalList.push({
                stud_id: stud.dataValues.id,
                metal_id: product.product_metal_data.id_metal,
                karat_id: product.product_metal_data.id_karat,
                metal_wt: product.product_metal_data.metal_weight,
                company_info_id: req?.body?.session_res?.client_id
            })
            for (const diamond of product.side_diamond) {
                diamondList.push({
                    stud_id: stud.dataValues.id,
                    dia_shape: diamond.shape,
                    dia_weight: diamond.carat,
                    dia_mm_size: diamond.mm_size,
                    dia_count: diamond.stone_count,
                    company_info_id: req?.body?.session_res?.client_id,
                    side_dia_prod_type: diamond.side_dia_type,
                })
            }
        }

        await StudMetal.bulkCreate(metalList, { transaction: trn });
        await StudDiamonds.bulkCreate(diamondList, { transaction: trn });

        await refreshMaterializedStudConfiguratorPriceFindView(dbContext);
        await trn.commit();

        return resSuccess({ data: productList });

    } catch (error) {
        if (trn) {
            await trn.rollback();
        }
        return resUnknownError({ data: error });
    }
}

export const studProductQuery = `
        WITH side_diamond_summary AS (
            SELECT
                sd.stud_id,
                SUM(sd.dia_weight * sd.dia_count::DOUBLE PRECISION) AS total_dia_weight,
                SUM(sd.dia_count) AS total_dia_count,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', sd.id,
                        'shape', sd.dia_shape,
                        'shape_name', ds.name,
                        'mm_size', sd.dia_mm_size,
                        'mm_size_value', ms.value,
                        'count', sd.dia_count,
                        'weight', sd.dia_weight,
                        'side_dia_type', sd.side_dia_prod_type
                    )
                ) AS all_diamonds
            FROM stud_diamonds sd
            LEFT JOIN diamond_shapes ds ON ds.id = sd.dia_shape
            LEFT JOIN mm_sizes ms ON ms.id = sd.dia_mm_size
            GROUP BY sd.stud_id
        )
        SELECT
            SCP.ID,
            SCP.SETTING_TYPE,
            SCP.CENTER_DIA_SHAPE,
            SCP.CENTER_DIA_WT,
            SCP.CENTER_DIA_MM_SIZE,
            SCP.CENTER_DIA_COUNT,
            SCP.STYLE_NO,
            SCP.HUGGIES_NO,
            SCP.DROP_NO,
            SCP.SORT_DESCRIPTION,
            SCP.LONG_DESCRIPTION,
            SCP.LABOUR_CHARGE,
            SCP.OTHER_CHARGE,
            SCP.IS_ACTIVE,
            SCP.PRODUCT_STYLE,
            SCP.HUGGIES_SETTING_TYPE,
            SCP.NAME,
            SCP.SKU,
            SCP.SLUG,
            SCP.COMPANY_INFO_ID,
            SM.METAL_ID,
            SM.KARAT_ID,
            SM.METAL_WT,
            MM.METAL_RATE,
            MM.CALCULATE_RATE,
            GK.NAME AS KARAT_NAME,
            CS.VALUE AS CENTER_DIA_WT_VALUE,
            DS.NAME AS CENTER_DIA_SHAPE_NAME,
            H.NAME AS SETTING_TYPE_NAME,
            MS.VALUE AS MM_SIZE_VALUE,
            SSS.NAME AS HUGGIES_SETTING_NAME,
            COALESCE(SD.total_dia_weight, 0::DOUBLE PRECISION) AS side_dia_weight,
            COALESCE(SD.total_dia_count, 0::NUMERIC) AS side_dia_count,
            CS.VALUE::DOUBLE PRECISION * SCP.CENTER_DIA_COUNT::DOUBLE PRECISION + COALESCE(SD.total_dia_weight, 0::DOUBLE PRECISION) AS total_weight,
            SCP.CENTER_DIA_COUNT::DOUBLE PRECISION + COALESCE(SD.total_dia_count::DOUBLE PRECISION, 0::DOUBLE PRECISION) AS total_count,
            SD.all_diamonds,
            CASE
                WHEN SM.KARAT_ID IS NULL THEN
                    MM.METAL_RATE * SM.METAL_WT + COALESCE(SCP.LABOUR_CHARGE, 0::DOUBLE PRECISION) + COALESCE(SCP.OTHER_CHARGE, 0::DOUBLE PRECISION)
                ELSE
                    MM.METAL_RATE / MM.CALCULATE_RATE * GK.CALCULATE_RATE::DOUBLE PRECISION * SM.METAL_WT +
                    COALESCE(SCP.LABOUR_CHARGE, 0::DOUBLE PRECISION) + COALESCE(SCP.OTHER_CHARGE, 0::DOUBLE PRECISION)
            END AS metal_price
        
        FROM stud_config_products SCP
        LEFT JOIN stud_metals SM ON SM.stud_id = SCP.ID
        LEFT JOIN metal_masters MM ON MM.ID = SM.metal_id
        LEFT JOIN gold_kts GK ON GK.ID = SM.karat_id
        LEFT JOIN carat_sizes CS ON CS.ID = SCP.center_dia_wt
        LEFT JOIN diamond_shapes DS ON DS.ID = SCP.center_dia_shape
        LEFT JOIN heads H ON H.ID = SCP.setting_type
        LEFT JOIN mm_sizes MS ON MS.ID = SCP.center_dia_mm_size
        LEFT JOIN side_setting_styles SSS ON SSS.ID = SCP.huggies_setting_type
        LEFT JOIN side_diamond_summary SD ON SD.stud_id = SCP.ID
        WHERE SCP.IS_DELETED = '0'::bit
`

export const PriceFindAdmin = async (req: any) => {
    try {
        const { stud_id } = req.params;
        const { color = null, clarity = null, cut = null, diamond_type, id_stone } = req.body

        const company_info_id = req?.body?.session_res?.client_id

        const { DiamondGroupMaster, StoneData } = initModels(req)

        const sqlQuery = `
            ${studProductQuery} AND SCP.is_active = '${ActiveStatus.Active}' AND
                SCP.company_info_id = ${company_info_id} AND
                SCP.id = '${stud_id}'
        `;

        const product: any = await dbContext.query(
            sqlQuery,
            { type: QueryTypes.SELECT }
        )

        if (product.length === 0) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Product"]]) });
        }

        const diamondGroups = await DiamondGroupMaster.findAll({
            where: {
                company_info_id: company_info_id,
                is_active: ActiveStatus.Active,
                is_deleted: DeletedStatus.No,
                id_color: color,
                id_clarity: clarity,
                id_cuts: cut,
                id_stone
            }
        })

        const diamondGroup = diamondGroups.find((group: any) => {
            return group.id_carat == product[0].center_dia_wt && group.id_shape == product[0].center_dia_shape
        })

        // if (!(diamondGroup || diamondGroup?.dataValues)) {
        //     return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Diamond Group"]]) });
        // }

        let sideDiamondPrice = 0;

        if (product[0]?.all_diamonds?.length > 0) {
            for (const sidDiamond of product[0].all_diamonds) {
                const diamond = diamondGroups.find((d: any) => {
                    return sidDiamond.weight >= d.min_carat_range &&
                        sidDiamond.weight <= d.max_carat_range &&
                        d.id_shape == sidDiamond.shape;
                });

                if (diamond && diamond.dataValues) {
                    const rate = diamond_type === DIAMOND_TYPE.natural ? diamond.rate : diamond.synthetic_rate;
                    sideDiamondPrice += rate * sidDiamond.weight * sidDiamond.count;
                }
            }
        }

        const findStone = await StoneData.findOne({
            where: {
                id: id_stone,
                is_active: ActiveStatus.Active,
                is_deleted: DeletedStatus.No,
            }
        })

        const rate = (diamondGroup || diamondGroup?.dataValues) ? diamond_type == DIAMOND_TYPE.natural ? diamondGroup.rate : diamondGroup.synthetic_rate : 0;

        product[0].is_diamond = findStone?.dataValues?.is_diamond
        product[0].total_price = (product[0].metal_price ?? 0) + (sideDiamondPrice ?? 0) + (rate * Number(product[0].center_dia_wt_value) * Number(product[0].center_dia_count));
        product[0].group_id = diamondGroup?.dataValues?.id
        product[0].metal_price = product[0].metal_price;
        product[0].center_dia_price = rate * Number(product[0].center_dia_wt_value) * Number(product[0].center_dia_count);
        product[0].side_diamond_price = sideDiamondPrice;

        return resSuccess({ data: product[0] })
    } catch (error) {
        console.log(error)
        return resUnknownError({ data: error });
    }
}

export const StudPriceFind = async (req: any) => {
    try {
        const { DiamondGroupMaster, ProductWish, WebConfigSetting } = initModels(req)
        const {
            setting_type,
            huggies_setting_type = null,
            center_dia_wt,
            center_dia_shape,
            product_style,
            metal_id,
            karat_id = null,
            color = null,
            clarity = null,
            cut = null,
            diamond_type,
            id_stone,
            user_id = null
        } = req.body;

        const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query, req.body.db_connection);
        if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return company_info_id;
        }

        const webConfig = await WebConfigSetting?.findOne({
            where: {
                company_id: company_info_id?.data
            }
        })

        if (!Object.values(STUD_PRODUCT_TYPE).includes(product_style?.trim()?.toLowerCase())) {
            return resNotFound({
                message: prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
                    ["field_name", "Product Style"],
                ])
            })
        }

        const diamondGroups = await DiamondGroupMaster.findAll({
            where: {
                company_info_id: company_info_id?.data,
                is_active: ActiveStatus.Active,
                is_deleted: DeletedStatus.No,
                id_color: color,
                id_clarity: clarity,
                id_cuts: cut,
                id_stone,
            }
        })

        const product: any = await dbContext.query(
            `
                ${studProductQuery} AND SCP.is_active = '${ActiveStatus.Active}' AND SCP.SETTING_TYPE = ${setting_type} AND
                        ${huggies_setting_type ? `SCP.HUGGIES_SETTING_TYPE = ${huggies_setting_type} AND` : ""}
                        SCP.CENTER_DIA_WT = ${center_dia_wt} AND
                        SCP.CENTER_DIA_SHAPE = ${center_dia_shape} AND
                        SCP.PRODUCT_STYLE::TEXT ILIKE '%${product_style}%' AND
                        SM.METAL_ID = ${metal_id} AND
                        ${webConfig?.dataValues?.metal_gold_id == metal_id ? `SM.KARAT_ID = ${karat_id} AND` : ""}
                        SCP.COMPANY_INFO_ID = ${company_info_id?.data}
            `,
            { type: QueryTypes.SELECT }
        )

        if (product.length === 0) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Product"]]) });
        }

        const diamondGroup = diamondGroups.find((group: any) => {
            return group.id_carat == product[0].center_dia_wt && group.id_shape == product[0].center_dia_shape
        })

        // if (!(diamondGroup || diamondGroup?.dataValues)) {
        //     return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Diamond Group"]]) });
        // }

        let sideDiamondPrice = 0;
        const error = []

        if (product[0]?.all_diamonds?.length > 0) {
            for (const sidDiamond of product[0].all_diamonds) {
                const diamond = diamondGroups.find((d: any) => {
                    return sidDiamond.weight >= d.min_carat_range &&
                        sidDiamond.weight <= d.max_carat_range &&
                        d.id_shape == sidDiamond.shape;
                });

                if (diamond && diamond.dataValues) {
                    const rate = diamond_type === DIAMOND_TYPE.natural ? diamond.rate : diamond.synthetic_rate;
                    sideDiamondPrice += rate * sidDiamond.weight * sidDiamond.count;
                } else {
                    error.push(`${sidDiamond.weight} carat ${sidDiamond.shape} diamond group not found for side diamonds`);
                }
            }
        }

        // if (error.length > 0) {
        //     return resNotFound({ data: error });
        // }

        const rate = (diamondGroup || diamondGroup?.dataValues) ? diamond_type == DIAMOND_TYPE.natural ? diamondGroup.rate : diamondGroup.synthetic_rate : 0;

        product[0].total_price = await req.formatPrice((product[0].metal_price ?? 0) + (sideDiamondPrice ?? 0) + (rate * Number(product[0].center_dia_wt_value) * Number(product[0].center_dia_count)), PRICE_CORRECTION_PRODUCT_TYPE.StudConfigProduct);
        product[0].group_id = diamondGroup?.dataValues?.id
        product[0].metal_price = await req.formatPrice(product[0].metal_price,null)

        const whereConditions: any[] = [
            { product_id: product[0]?.id },
            { user_id: user_id },
            Sequelize.where(
                Sequelize.literal(`product_details->>'diamond_type'`),
                `${diamond_type}`
            )
        ];

        if (color !== null && color !== '' && color !== 'null') {
            whereConditions.push(
                Sequelize.where(
                    Sequelize.literal(`product_details->>'color'`),
                    `${color}`
                )
            );
        }
        if (clarity !== null && clarity !== '' && clarity !== 'null') {
            whereConditions.push(
                Sequelize.where(
                    Sequelize.literal(`product_details->>'clarity'`),
                    `${clarity}`
                )
            );
        }
        if (cut !== null && cut !== '' && cut !== 'null') {
            whereConditions.push(
                Sequelize.where(
                    Sequelize.literal(`product_details->>'cut'`),
                    `${cut}`
                )
            );
        }

        const findWishlist = await ProductWish?.findOne({
            where: whereConditions
        });

        if (findWishlist && findWishlist?.dataValues) {
            product[0].wishlist_id = findWishlist?.dataValues?.id
        }

        return resSuccess({ data: product[0] });
    } catch (error) {
        console.log(error)
        return resUnknownError({ data: error });
    }
}

export const DeleteStudProduct = async (req: Request) => {
    try {
        const { stud_id } = req.params;
        const { StudConfigProduct } = initModels(req)

        const stud = await StudConfigProduct.findOne({
            where: {
                id: stud_id,
                is_deleted: DeletedStatus.No,
                company_info_id: req?.body?.session_res?.client_id
            }
        })

        if (!(stud && stud.dataValues)) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Product"]]) });
        }

        await StudConfigProduct.update({
            is_deleted: DeletedStatus.yes,
            deleted_at: getLocalDate(),
            deleted_by: req.body.session_res.id_app_user
        }, {
            where: {
                id: stud_id,
                company_info_id: req?.body?.session_res?.client_id
            }
        })

        await refreshMaterializedStudConfiguratorPriceFindView(dbContext);
        return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
    } catch (error) {
        throw error;
    }
}

export const AdminStudList = async (req: Request) => {
    try {
        let pagination = {
            ...getInitialPaginationFromQuery(req.query),
            search_text: req.query.search_text ?? "0",
        };
        let noPagination = req.query.no_pagination === "1";

        const sqlQuery = `
            ${studProductQuery}
                AND SCP.company_info_id = ${req?.body?.session_res?.client_id} AND
                CASE WHEN '${pagination.search_text}' = '0' THEN TRUE ELSE
                (SCP.name ILIKE '%${pagination.search_text}%' OR SCP.slug ILIKE '%${pagination.search_text}%' OR SCP.sku ILIKE '%${pagination.search_text}%')
                END
            ORDER BY ${pagination.sort_by} ${pagination.order_by}
        `;

        const totalItems = await dbContext.query(
            `
                ${sqlQuery}
                `,
            { type: QueryTypes.SELECT }
        )

        if (!noPagination) {
            if (totalItems.length === 0) {
                return resSuccess({ data: { pagination, result: [] } });
            }

            pagination.total_items = totalItems.length;
            pagination.total_pages = Math.ceil(totalItems.length / pagination.per_page_rows);
        }

        const result = await dbContext.query(
            `
               ${sqlQuery}
                    OFFSET
                      ${(pagination.current_page - 1) * pagination.per_page_rows} ROWS
                      FETCH NEXT ${pagination.per_page_rows} ROWS ONLY
            `,
            { type: QueryTypes.SELECT }
        )

        return resSuccess({
            data: noPagination ? totalItems : { pagination, result }
        })

    } catch (error) {
        throw error
    }
}

export const AdminStudDetail = async (req: Request) => {
    try {
        const { stud_id } = req.params;

        const sqlQuery = `
            ${studProductQuery}
                AND SCP.company_info_id = ${req?.body?.session_res?.client_id} AND
                SCP.id = ${stud_id}
        `;

        const result = await dbContext.query(
            sqlQuery,
            { type: QueryTypes.SELECT }
        )

        if (result.length === 0) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Product"]]) });
        }

        return resSuccess({ data: result[0] })
    } catch (error) {
        throw error
    }
}

export const SlugPriceFind = async (req: any) => {
    try {
        const { stud_slug } = req.params;
        const { color = null, clarity = null, cut = null, diamond_type, id_stone } = req.body

        const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query, req.body.db_connection);
        if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return company_info_id;
        }

        const { DiamondGroupMaster, StoneData } = initModels(req)

        const sqlQuery = `
            ${studProductQuery} AND SCP.is_active = '${ActiveStatus.Active}' AND
                SCP.company_info_id = ${company_info_id?.data} AND
                SCP.slug = '${stud_slug}'
        `;

        const product: any = await dbContext.query(
            sqlQuery,
            { type: QueryTypes.SELECT }
        )

        if (product.length === 0) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Product"]]) });
        }

        const diamondGroups = await DiamondGroupMaster.findAll({
            where: {
                company_info_id: company_info_id?.data,
                is_active: ActiveStatus.Active,
                is_deleted: DeletedStatus.No,
                id_color: color,
                id_clarity: clarity,
                id_cuts: cut,
                id_stone
            }
        })

        const diamondGroup = diamondGroups.find((group: any) => {
            return group.id_carat == product[0].center_dia_wt && group.id_shape == product[0].center_dia_shape
        })

        // if (!(diamondGroup || diamondGroup?.dataValues)) {
        //     return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Diamond Group"]]) });
        // }

        let sideDiamondPrice = 0;

        if (product[0]?.all_diamonds?.length > 0) {
            for (const sidDiamond of product[0].all_diamonds) {
                const diamond = diamondGroups.find((d: any) => {
                    return sidDiamond.weight >= d.min_carat_range &&
                        sidDiamond.weight <= d.max_carat_range &&
                        d.id_shape == sidDiamond.shape;
                });

                if (diamond && diamond.dataValues) {
                    const rate = diamond_type === DIAMOND_TYPE.natural ? diamond.rate : diamond.synthetic_rate;
                    sideDiamondPrice += rate * sidDiamond.weight * sidDiamond.count;
                }
            }
        }

        const findStone = await StoneData.findOne({
            where: {
                id: id_stone,
                is_active: ActiveStatus.Active,
                is_deleted: DeletedStatus.No,
            }
        })

        const rate = (diamondGroup || diamondGroup?.dataValues) ? diamond_type == DIAMOND_TYPE.natural ? diamondGroup.rate : diamondGroup.synthetic_rate : 0;

        product[0].is_diamond = findStone?.dataValues?.is_diamond
        product[0].total_price = await req.formatPrice((product[0].metal_price ?? 0) + (sideDiamondPrice ?? 0) + (rate * Number(product[0].center_dia_wt_value) * Number(product[0].center_dia_count)), PRICE_CORRECTION_PRODUCT_TYPE.StudConfigProduct);
        product[0].group_id = diamondGroup?.dataValues?.id
        product[0].metal_price = await req.formatPrice(product[0].metal_price,null);

        return resSuccess({ data: product[0] })
    } catch (error) {
        console.log(error)
        return resUnknownError({ data: error });
    }
}