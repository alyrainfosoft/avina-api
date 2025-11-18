import { QueryTypes, Sequelize } from "sequelize";
import dbContext from "../../config/db-context";
import { PRODUCT_BULK_UPLOAD_FILE_SIZE, PRODUCT_CSV_FOLDER_PATH } from "../../config/env.var";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import { moveFileToLocation } from "../../helpers/file.helper";
import { CONFIG_PRODUCT_METAL_DETAILS } from "../../utils/app-constants";
import { ActiveStatus, Bale_Type, DeletedStatus, DIAMOND_TYPE, FILE_BULK_UPLOAD_TYPE, FILE_STATUS, PRICE_CORRECTION_PRODUCT_TYPE } from "../../utils/app-enumeration";
import { BLANK_FILE_ERROR_MESSAGE, DEFAULT_STATUS_CODE_SUCCESS, ERROR_INVALID_MASSAGE, ERROR_NOT_FOUND, FILE_NOT_FOUND, INVALID_HEADER, INVALID_HEADER_ERROR_MESSAGE, NO_DATA_IN_EXCEL_FILE_ERROR_MESSAGE, PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE, RECORD_DELETE_SUCCESSFULLY, REQUIRED_ERROR_MESSAGE } from "../../utils/app-messages";

import { getCompanyIdBasedOnTheCompanyKey, getInitialPaginationFromQuery, getLocalDate, prepareMessageFromParams, refreshMaterializedPendantConfiguratorPriceFindView, resBadRequest, resNotFound, resSuccess, resUnknownError, resUnprocessableEntity } from "../../utils/shared-functions";
import { initModels } from "../model/index.model";
import { Request } from "express";
const readXlsxFile = require("read-excel-file/node");

export const AddPendantConfigProduct = async (req: Request) => {
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

        if (resRows.data.headers.length !== 22) {
            return resUnprocessableEntity({
                message: prepareMessageFromParams(INVALID_HEADER_ERROR_MESSAGE, [["field_name", "22"]]),
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
        "bale_type",
        "design_type",
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
        const name = `${metalData.karat ? `${metalData.karat}K ` : ""}${metalData.metal ?? ""} ${formatForNamePart(product.center_dia_wt_value, "carat")} ${formatForNamePart(product.center_dia_shape_value, "Diamond")} ${product.bale_type ?? ""} ${product.design_type_value ?? ""}`;
        const slug = generateSlug(name);
        const skuParts = [
            metalData.karat ? `${metalData.karat}k` : "",
            formatForSku(metalData.metal),
            product.center_dia_wt_value ?? "",
            formatForSku(product.center_dia_shape_value),
            formatForSku(product.bale_type),
            formatForSku(product.design_type_value),
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
    const { HeadsData, DiamondShape, StoneData, DiamondCaratSize, MMSizeData, MetalMaster, GoldKarat } = initModels(req);

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

        for (const row of rows) {
            // check required value exists or not
            if (row.parent_sku_details == "1") {
                // check the bale type
                if (row.bale_type == null) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Bale Type"],
                        ]),
                    });
                }

                // check the Design Type
                if (row.design_type == null) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Design Type"],
                        ]),
                    });
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

                // check style no
                if (row.style_no == null) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                            ["field_name", "Style No"],
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
                // check bale type
                if (!Object.values(Bale_Type).includes(row.bale_type?.trim()?.toLowerCase())) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
                            ["field_name", "Bale Type"],
                        ]),
                    })
                }

                // check Design Type
                let design_type = await getIdFromName(row.design_type, headList, "name", "Design Type");
                if (design_type && design_type.error != undefined) {
                    errors.push({
                        style_no: row.style_no,
                        error_message: design_type.error,
                    });
                } else if (design_type && design_type.data) {
                    design_type = design_type?.data;
                } else {
                    design_type = null;
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
                    bale_type: Object.values(Bale_Type).find(type => type.toLowerCase() === row.bale_type?.trim()?.toLowerCase()),
                    design_type: design_type,
                    design_type_value: row.design_type,
                    center_dia_wt: center_dia_wt,
                    center_dia_wt_value: row.center_dia_wt,
                    center_dia_shape: center_dia_shape,
                    center_dia_shape_value: row.center_dia_shape,
                    center_dia_mm_size: center_dia_mm_size,
                    center_dia_mm_size_value: row.center_dia_mm_size,
                    center_dia_count: row.center_dia_count,
                    style_no: row.style_no,
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

                await addProductMetalDetail(row, productList, currentProductIndex, diamondShapeList, mmSizeList);
            } else if (row.parent_sku_details == "0") {
                await addProductMetalDetail(row, productList, currentProductIndex, diamondShapeList, mmSizeList);
            }
        }

        if (errors?.length > 0) {
            return resBadRequest({ data: errors });
        }

        const metalProductList = await setMetalProductList(productList, metalList, karatList,);

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
        const { ConfigPendantProduct, ConfigPendantDiamonds, ConfigPendantMetals } = initModels(req)

        trn = await dbContext.transaction();

        const metalList = [];
        const diamondList = [];

        for (const product of productList) {
            const pendant = await ConfigPendantProduct.create(
                {
                    bale_type: product.bale_type,
                    design_type: product.design_type,
                    center_dia_wt: product.center_dia_wt,
                    center_dia_shape: product.center_dia_shape,
                    center_dia_mm_size: product.center_dia_mm_size,
                    center_dia_count: product.center_dia_count,
                    style_no: product.style_no,
                    sort_description: product.sort_description,
                    long_description: product.long_description,
                    labour_charge: product.labour_charge,
                    other_charge: product.other_charge,
                    created_at: getLocalDate(),
                    created_by: req.body.session_res.id_app_user,
                    is_active: ActiveStatus.Active,
                    is_deleted: DeletedStatus.No,
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
                pendant_id: pendant.dataValues.id,
                metal_id: product.product_metal_data.id_metal,
                karat_id: product.product_metal_data.id_karat,
                metal_wt: product.product_metal_data.metal_weight,
                company_info_id: req?.body?.session_res?.client_id
            })
            for (const diamond of product.side_diamond) {
                diamondList.push({
                    pendant_id: pendant.dataValues.id,
                    dia_shape: diamond.shape,
                    dia_weight: diamond.carat,
                    dia_mm_size: diamond.mm_size,
                    dia_count: diamond.stone_count,
                    company_info_id: req?.body?.session_res?.client_id,
                    side_dia_prod_type: diamond.side_dia_type
                })
            }
        }

        await ConfigPendantMetals.bulkCreate(metalList, { transaction: trn });
        await ConfigPendantDiamonds.bulkCreate(diamondList, { transaction: trn });

        await refreshMaterializedPendantConfiguratorPriceFindView(dbContext);
        await trn.commit();

        return resSuccess({ data: productList });

    } catch (error) {
        if (trn) {
            await trn.rollback();
        }
        return resUnknownError({ data: error });
    }
}

export const pendantProductQuery = `
        WITH pendant_diamond_summary AS (
            SELECT
                PD.pendant_id,
                SUM(PD.dia_weight * PD.dia_count::DOUBLE PRECISION) AS total_dia_weight,
                SUM(PD.dia_count) AS total_dia_count,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', PD.id,
                        'shape', PD.dia_shape,
                        'shape_name', DS.name,
                        'mm_size', PD.dia_mm_size,
                        'mm_size_value', MS.value,
                        'count', PD.dia_count,
                        'weight', PD.dia_weight,
                        'side_dia_type', PD.side_dia_prod_type
                    )
                ) AS all_diamonds
            FROM config_pendant_diamonds PD
            LEFT JOIN diamond_shapes DS ON DS.id = PD.dia_shape
            LEFT JOIN mm_sizes MS ON MS.id = PD.dia_mm_size
            GROUP BY PD.pendant_id
        )
        SELECT
            CPP.id,
            CPP.bale_type,
            CPP.design_type,
            CPP.center_dia_shape,
            CPP.center_dia_wt,
            CPP.center_dia_mm_size,
            CPP.center_dia_count,
            CPP.style_no,
            CPP.sort_description,
            CPP.long_description,
            CPP.labour_charge,
            CPP.other_charge,
            CPP.is_active,
            CPP.name,
            CPP.sku,
            CPP.slug,
            CPP.company_info_id,
            PM.metal_id,
            PM.karat_id,
            PM.metal_wt,
            MM.metal_rate,
            MM.calculate_rate,
            GK.name AS karat_name,
            CS.value AS center_dia_wt_value,
            DS.name AS center_dia_shape_name,
            DT.name AS design_type_name,
            MS.value AS mm_size_value,
            COALESCE(PDS.total_dia_weight, 0::DOUBLE PRECISION) AS side_dia_weight,
            COALESCE(PDS.total_dia_count, 0::NUMERIC) AS side_dia_count,
            CS.value::DOUBLE PRECISION * CPP.center_dia_count::DOUBLE PRECISION + COALESCE(PDS.total_dia_weight, 0::DOUBLE PRECISION) AS total_weight,
            CPP.center_dia_count::DOUBLE PRECISION + COALESCE(PDS.total_dia_count::DOUBLE PRECISION, 0::DOUBLE PRECISION) AS total_count,
            PDS.all_diamonds,
            CASE
                WHEN PM.karat_id IS NULL THEN 
                    MM.metal_rate * PM.metal_wt + COALESCE(CPP.labour_charge, 0::DOUBLE PRECISION) + COALESCE(CPP.other_charge, 0::DOUBLE PRECISION)
                ELSE 
                    MM.metal_rate / MM.calculate_rate * GK.CALCULATE_RATE::DOUBLE PRECISION * PM.metal_wt + COALESCE(CPP.labour_charge, 0::DOUBLE PRECISION) + COALESCE(CPP.other_charge, 0::DOUBLE PRECISION)
            END AS metal_price
        FROM config_pendant_products CPP
        LEFT JOIN config_pendant_metals PM ON PM.pendant_id = CPP.id
        LEFT JOIN metal_masters MM ON MM.id = PM.metal_id
        LEFT JOIN gold_kts GK ON GK.id = PM.karat_id
        LEFT JOIN carat_sizes CS ON CS.id = CPP.center_dia_wt
        LEFT JOIN diamond_shapes DS ON DS.id = CPP.center_dia_shape
        LEFT JOIN heads DT ON DT.id = CPP.design_type
        LEFT JOIN mm_sizes MS ON MS.id = CPP.center_dia_mm_size
        LEFT JOIN pendant_diamond_summary PDS ON PDS.pendant_id = CPP.id
        WHERE CPP.is_deleted = '0'::"bit"
`

export const DeletePendantProduct = async (req: Request) => {
    try {
        const { pendant_id } = req.params;
        const { ConfigPendantProduct } = initModels(req)

        const pendant = await ConfigPendantProduct.findOne({
            where: {
                id: pendant_id,
                is_deleted: DeletedStatus.No,
                company_info_id: req?.body?.session_res?.client_id
            }
        })

        if (!(pendant && pendant.dataValues)) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Product"]]) });
        }

        await ConfigPendantProduct.update({
            is_deleted: DeletedStatus.yes,
            deleted_at: getLocalDate(),
            deleted_by: req.body.session_res.id_app_user
        }, {
            where: {
                id: pendant_id,
                company_info_id: req?.body?.session_res?.client_id
            }
        })

        await refreshMaterializedPendantConfiguratorPriceFindView(dbContext);
        return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
    } catch (error) {
        throw error;
    }
}

export const AdminPendantList = async (req: Request) => {
    try {
        let pagination = {
            ...getInitialPaginationFromQuery(req.query),
            search_text: req.query.search_text ?? "0",
        };
        let noPagination = req.query.no_pagination === "1";

        const sqlQuery = `
            ${pendantProductQuery} AND
                CPP.company_info_id = ${req?.body?.session_res?.client_id} AND
                CASE WHEN '${pagination.search_text}' = '0' THEN TRUE ELSE
                (CPP.name ILIKE '%${pagination.search_text}%' OR CPP.slug ILIKE '%${pagination.search_text}%' OR CPP.sku ILIKE '%${pagination.search_text}%')
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

export const AdminPendantDetail = async (req: Request) => {
    try {
        const { pendant_id } = req.params;

        const sqlQuery = `
            ${pendantProductQuery} AND
                CPP.company_info_id = ${req?.body?.session_res?.client_id} AND
                CPP.id = ${pendant_id}
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

export const PendantPriceFind = async (req: any) => {
    try {
        const { DiamondGroupMaster, ProductWish, WebConfigSetting } = initModels(req)
        const {
            bale_type,
            design_type,
            center_dia_wt,
            center_dia_shape,
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

        if (!Object.values(Bale_Type).includes(bale_type?.trim()?.toLowerCase())) {
            return resNotFound({
                message: prepareMessageFromParams(ERROR_INVALID_MASSAGE, [
                    ["field_name", "Bale Type"],
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
            ${pendantProductQuery} AND CPP.is_active = '${ActiveStatus.Active}' AND CPP.design_type = ${design_type} AND
                CPP.center_dia_wt = ${center_dia_wt} AND
                CPP.center_dia_shape = ${center_dia_shape} AND
                CPP.bale_type::TEXT ILIKE '%${bale_type}%' AND
                PM.METAL_ID = ${metal_id} AND
                ${webConfig?.dataValues?.metal_gold_id == metal_id ? `PM.KARAT_ID = ${karat_id} AND` : ""}
                CPP.COMPANY_INFO_ID = ${company_info_id?.data}
            `
            ,
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

        product[0].total_price = await req.formatPrice((product[0].metal_price ?? 0) + (sideDiamondPrice ?? 0) + (rate * Number(product[0].center_dia_wt_value) * Number(product[0].center_dia_count)), PRICE_CORRECTION_PRODUCT_TYPE.PendantConfigProduct);
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

export const SlugPriceFind = async (req: any) => {
    try {
        const { pendant_slug } = req.params;
        const { color = null, clarity = null, cut = null, diamond_type, id_stone, user_id = null } = req.body

        const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query, req.body.db_connection);
        if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return company_info_id;
        }

        const { DiamondGroupMaster, StoneData, ProductWish } = initModels(req)

        const sqlQuery = `
            ${pendantProductQuery} AND CPP.is_active = '${ActiveStatus.Active}' AND
                CPP.company_info_id = ${company_info_id?.data} AND
                CPP.slug = '${pendant_slug}'
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
        product[0].total_price = await req.formatPrice((product[0].metal_price ?? 0) + (sideDiamondPrice ?? 0) + (rate * Number(product[0].center_dia_wt_value) * Number(product[0].center_dia_count)), PRICE_CORRECTION_PRODUCT_TYPE.PendantConfigProduct);
        product[0].group_id = diamondGroup?.dataValues?.id
        product[0].metal_price = await req.formatPrice(product[0].metal_price,null);

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

        return resSuccess({ data: product[0] })
    } catch (error) {
        console.log(error)
        return resUnknownError({ data: error });
    }
}

export const PriceFindAdmin = async (req: any) => {
    try {
        const { pendant_id } = req.params;
        const { color = null, clarity = null, cut = null, diamond_type, id_stone, user_id = null } = req.body

        const company_info_id = req?.body?.session_res?.client_id

        const { DiamondGroupMaster, StoneData, ProductWish } = initModels(req)

        const sqlQuery = `
            ${pendantProductQuery} AND CPP.is_active = '${ActiveStatus.Active}' AND
                CPP.company_info_id = ${company_info_id} AND
                CPP.id = '${pendant_id}'
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
        product[0].side_dia_price = sideDiamondPrice;

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

        return resSuccess({ data: product[0] })
    } catch (error) {
        console.log(error)
        return resUnknownError({ data: error });
    }
}