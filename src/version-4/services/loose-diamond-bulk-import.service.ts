import { Request } from "express";
import {
  getCompanyIdBasedOnTheCompanyKey,
  addActivityLogs,
  getInitialPaginationFromQuery,
  getListFromToValues,
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
  statusUpdateValue,
} from "../../utils/shared-functions";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  DUPLICATE_ERROR_CODE,
  DUPLICATE_VALUE_ERROR_MESSAGE,
  ERROR_NOT_FOUND,
  FILE_NOT_FOUND,
  INVALID_HEADER,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
  REQUIRED_ERROR_MESSAGE,
} from "../../utils/app-messages";
import {
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../config/env.var";
import {
  ActiveStatus,
  DeletedStatus,
  DIAMOND_INVENTROY_TYPE,
  DIAMOND_ORIGIN,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  FilterItemScope,
  FilterMasterKey,
  LogsActivityType,
  LogsType,
  Master_type,
  Pagination,
  STOCK_PRODUCT_TYPE,
  STOCK_TRANSACTION_TYPE,
} from "../../utils/app-enumeration";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import {
  moveFileToLocation,
  moveFileToS3ByTypeAndLocation,
} from "../../helpers/file.helper";
import {  Op, Sequelize } from "sequelize";
import { PRODUCT_FILE_LOCATION } from "../../utils/app-constants";
import {
  getRapnetDiamonds,
  getVDBDiamondByStockNumber,
  getVDBDiamonds,
} from "./tp-diamond.service";
import { IDiamondFilter } from "../../data/interfaces/diamond/diamond.interface";
import { initModels } from "../model/index.model";
const readXlsxFile = require("read-excel-file/node");

export const addLooseDiamondCSVFile = async (req: Request) => {
  try {
    const {ProductBulkUploadFile} = initModels(req);
    if (!req.file) {
      return resUnprocessableEntity({
        message: FILE_NOT_FOUND,
      });
    }

    if (req.file.mimetype !== PRODUCT_BULK_UPLOAD_FILE_MIMETYPE) {
      return resUnprocessableEntity({
        message: PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
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
      req.file.originalname,
      req
    );

    if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resMFTL;
    }

    const resPBUF = await ProductBulkUploadFile.create({
      file_path: resMFTL.data,
      status: FILE_STATUS.Uploaded,
      file_type: FILE_BULK_UPLOAD_TYPE.DiamondGroupUpload,
      created_by: req.body.session_res.id_app_user,
      company_info_id: req?.body?.session_res?.client_id,
      created_date: getLocalDate(),
    });

    const resPDBUF = await processDiamondGroupBulkUploadFile(
      resPBUF.dataValues.id,
      resMFTL.data,
      req.body.session_res.id_app_user,
      req?.body?.session_res?.client_id,
      req
    );

    return resPDBUF;
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

const processDiamondGroupBulkUploadFile = async (
  id: number,
  path: string,
  idAppUser: number,
  clientId: number,
  req: Request
) => {
  const {ProductBulkUploadFile} = initModels(req);

  try {
    const data = await processCSVFile(path, idAppUser, clientId, req);
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
    console.log("datas", e);

    try {
      await ProductBulkUploadFile.update(
        {
          status: FILE_STATUS.ProcessedError,
          error: JSON.stringify(parseError(e)),
          modified_date: getLocalDate(),
        },
        { where: { id } }
      );
    } catch (e) { }
  }
};

const processCSVFile = async (path: string, idAppUser: number, client_id: number, req: Request) => {
  try {
    const resRows = await getArrayOfRowsFromCSVFile(path);
    if (resRows.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resRows;
    }

    const resVH = await validateHeaders(resRows.data.headers);
    if (resVH.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resVH;
    }

    const resProducts = await getDiamondGroupFromRows(
      resRows.data.results,
      idAppUser,
      client_id,
      req
    );
    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addGroupToDB(resProducts.data, idAppUser, client_id, req);
    if (resAPTD.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resAPTD;
    }

    return resSuccess({ data: resAPTD.data });
  } catch (e) {
    throw e;
  }
};

const getArrayOfRowsFromCSVFile = async (path: string) => {
  return await new Promise<TResponseReturn>((resolve, reject) => {
    try {
      let results: any = [];
      let headerList: any = [];
      let batchSize = 0;

      readXlsxFile(path)
        .then((rows: any[]) => {
          const row = rows[0];
          const headers: string[] = [];
          row && row && row.forEach((header: any) => {
            headers.push(header);
          });
          headerList = headers;
          rows.shift();

          //Data
          rows.forEach((row: any) => {
            let data = {
              "stock #": row[0],
              "stone": row[1],
              "stone type": row[2],
              "Availability": row[3],
              "shape": row[4],
              "weight": row[5],
              "color": row[6],
              "clarity": row[7],
              "mm_size": row[8],
              "seive_size": row[9],
              "cut grade": row[10],
              "polish": row[11],
              "Symmetry": row[12],
              "Fluorescence Intensity": row[13],
              "Fluorescence color": row[14],
              "measurements": row[15],
              "lab": row[16],
              "Certificate": row[17],
              "Certificate url": row[18],
              "image link": row[19],
              "video link": row[20],
              "fancy color": row[21],
              "fancy color intensity": row[22],
              "fancy color overtone": row[23],
              "depth %": row[24],
              "Table %": row[25],
              "Girdle %": row[26],
              "culet size": row[27],
              "Sort Description": row[28],
              "Long Description": row[29],
              "Country": row[30],
              "State": row[31],
              "City": row[32],
              "In matched pair separable": row[33],
              "pair stock #": row[34],
              "Growth type": row[35],
              "total price": row[36],
              "price/ct": row[37],
              "quantity": row[38],
            };

            batchSize++;
            results.push(data);
          });
        })
        .then(() => {
          return resolve(
            resSuccess({ data: { results, batchSize, headers: headerList } })
          );
        });
    } catch (e) {
      return reject(e);
    }
  });
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
    (item: any) =>
      item.dataValues[fieldName].trim().toLocaleLowerCase() ==
      name.toString().trim().toLocaleLowerCase()
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

const validateHeaders = async (headers: string[]) => {
  const DIAMOND_GROUP_BULK_UPLOAD_HEADERS = [
    "stock #",
    "stone",
    "stone type",
    "Availability",
    "shape",
    "weight",
    "color",
    "clarity",
    "mm_size",
    "seive_size",
    "cut grade",
    "polish",
    "Symmetry",
    "Fluorescence Intensity",
    "Fluorescence color",
    "measurements",
    "lab",
    "Certificate",
    "Certificate url",
    "image link",
    "video link",
    "fancy color",
    "fancy color intensity",
    "fancy color overtone",
    "depth %",
    "Table %",
    "Girdle %",
    "culet size",
    "Sort Description",
    "Long Description",
    "Country",
    "State",
    "City",
    "In matched pair separable",
    "pair stock #",
    "Growth type",
    "total price",
    "price/ct",
    "quantity",
  ];

  let errors: {
    row_id: number;
    column_id: number;
    column_name: string;
    error_message: string;
  }[] = [];
  let i;

  for (i = 0; i < headers?.length; i++) {
    if (headers[i]?.trim() != DIAMOND_GROUP_BULK_UPLOAD_HEADERS[i]) {
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

const getDiamondGroupFromRows = async (rows: any, idAppUser: any, client_id: number, req: Request) => {
  let currentGroupIndex = -1;
  try {
    const {Master, StoneData, DiamondShape, Colors, ClarityData, CutsData, LooseDiamondGroupMasters} = initModels(req)

    let errors: {
      column_id?: number;
      column_name?: string;
      row_id: number;
      error_message: string;
    }[] = [];
    const availabilityList = await Master.findAll({
      where: {
        master_type: Master_type.Availability,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const stoneList = await StoneData.findAll({
      where: {
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const shapeList = await DiamondShape.findAll({
      where: {
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const colorList = await Colors.findAll({
      where: {
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const clarityList = await ClarityData.findAll({
      where: {
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const CutGradeList = await CutsData.findAll({
      where: {
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const polishList = await Master.findAll({
      where: {
        master_type: Master_type.Polish,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const SymmetryList = await Master.findAll({
      where: {
        master_type: Master_type.symmetry,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const fluorescenceIntensityList = await Master.findAll({
      where: {
        master_type: Master_type.fluorescenceIntensity,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const fluorescenceColorList = await Master.findAll({
      where: {
        master_type: Master_type.fluorescenceColor,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const labList = await Master.findAll({
      where: {
        master_type: Master_type.lab,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const fancyColorList = await Master.findAll({
      where: {
        master_type: Master_type.fancyColor,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const fancyColorOvertoneList = await Master.findAll({
      where: {
        master_type: Master_type.fancyColorOvertone,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const fancyColorIntensityList = await Master.findAll({
      where: {
        master_type: Master_type.fancyColorIntensity,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const countryList = await Master.findAll({
      where: {
        master_type: Master_type.country,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const stateList = await Master.findAll({
      where: {
        master_type: Master_type.state,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const cityList = await Master.findAll({
      where: {
        master_type: Master_type.city,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const growthTypeList = await Master.findAll({
      where: {
        master_type: Master_type.growthType,
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    const looseDiamondList = await LooseDiamondGroupMasters.findAll({
      where: {
        is_deleted: DeletedStatus.No,
        company_info_id: client_id,
      },
    });
    let updatedDiamondList = [];
    let createdDiamondList = [];

    const dbStockNumbers = looseDiamondList?.map((row) => row?.dataValues?.stock_id);
    const sheetStockNumbers = rows.map((row) => row["stock #"]);
    let stockNumberList: string[] = [];

    if (rows?.length === 0) {
      errors.push({
        row_id: 1,
        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
          ["field_name", "stock"],
        ]),
      });
    }

    for (const row of rows) {
      currentGroupIndex++;
      if (row["stock #"]) {
        if (stockNumberList?.includes(row["stock #"])) {
          errors.push({
            column_id: 1,
            column_name: "stock #",
            row_id: currentGroupIndex + 1,
            error_message: prepareMessageFromParams(
              DUPLICATE_VALUE_ERROR_MESSAGE,
              [["field_name", `stock # ${row["stock #"]}`]]
            ),
          })
        }
        if (row.stone == null) {
          errors.push({
            column_name: "stone",
            row_id: currentGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "stone"],
            ]),
          });
        }
        if (row["stone type"] == null) {
          errors.push({
            column_name: "Stone Type",
            row_id: currentGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "stone type"],
            ]),
          });
        }
        if (row.Availability == null) {
          errors.push({
            column_name: "Availability",
            row_id: currentGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Availability"],
            ]),
          });
        }
        if (row.shape == null) {
          errors.push({
            column_name: "Shape",
            row_id: currentGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "shape"],
            ]),
          });
        }
        if (row.weight == null) {
          errors.push({
            column_name: "Weight",
            row_id: currentGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Weight"],
            ]),
          });
        }
        if (row.color == null) {
          errors.push({
            column_name: "Color",
            row_id: currentGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "color"],
            ]),
          });
        }
        if (row.clarity == null) {
          errors.push({
            column_name: "Clarity",
            row_id: currentGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Clarity"],
            ]),
          });
        }
        if (row["cut grade"] == null) {
          errors.push({
            column_name: "Cut Grade",
            row_id: currentGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "cut grade"],
            ]),
          });
        }
        if (row.measurements == null) {
          errors.push({
            column_name: "Measurements",
            row_id: currentGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "measurements"],
            ]),
          });
        }
        if (row["image link"] == null) {
          errors.push({
            column_name: "Image Link",
            row_id: currentGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "image link"],
            ])
          })
        }
        if (row["price/ct"] == null) {
          errors.push({
            column_name: "Price/ct",
            row_id: currentGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "price/ct"],
            ]),
          });
        }
        if (row.quantity == null) {
          errors.push({
            column_name: "Quantity",
            row_id: currentGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "quantity"],
            ]),
          });
        }

        // check stone
        let stone: any = getIdFromName(row.stone, stoneList, "name", "stone");
        if (stone && stone.error != undefined) {
          errors.push({
            column_name: "stone",
            row_id: currentGroupIndex + 1 + 1,
            error_message: stone.error,
          });
        } else if (stone && stone.data) {
          stone = stone?.data;
        } else {
          stone = null;
        }

        // check stone type
        let stone_type: any = row["stone type"];
        if (!Object.values(DIAMOND_ORIGIN)?.includes(stone_type)) {
          errors.push({
            column_name: "Stone Type",
            row_id: currentGroupIndex + 2,
            error_message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Stone type"]])
          })
        }

        // check availability
        let availability: any = getIdFromName(
          row.Availability,
          availabilityList,
          "name",
          "Availability"
        );
        if (availability && availability.error != undefined) {
          errors.push({
            column_name: "Availability",
            row_id: currentGroupIndex + 1 + 1,
            error_message: availability.error,
          });
        } else if (availability && availability.data) {
          availability = availability?.data;
        } else {
          availability = null;
        }

        // check shape
        let shape: any = getIdFromName(row.shape, shapeList, "name", "shape");
        if (shape && shape.error != undefined) {
          errors.push({
            column_name: "Shape",
            row_id: currentGroupIndex + 1 + 1,
            error_message: shape.error,
          });
        } else if (shape && shape.data) {
          shape = shape?.data;
        } else {
          shape = null;
        }

        // check weight
        let weight: any = row["weight"];

        // check color
        let color: any = getIdFromName(row.color, colorList, "name", "color");
        if (color && color.error != undefined) {
          errors.push({
            column_name: "Color",
            row_id: currentGroupIndex + 1 + 1,
            error_message: color.error,
          });
        } else if (color && color.data) {
          color = color?.data;
        } else {
          color = null;
        }

        // check clarity
        let clarity: any = getIdFromName(
          row.clarity,
          clarityList,
          "name",
          "clarity"
        );
        if (clarity && clarity.error != undefined) {
          errors.push({
            column_name: "Clarity",
            row_id: currentGroupIndex + 1 + 1,
            error_message: clarity.error,
          });
        } else if (clarity && clarity.data) {
          clarity = clarity?.data;
        } else {
          clarity = null;
        }

        // check mm_size
        let mm_size: any = row.mm_size;

        // check seive_size
        let seive_size: any = row.seive_size;

        // check cut grade
        let cut_grade: any = getIdFromName(
          row["cut grade"],
          CutGradeList,
          "value",
          "cut grade"
        );
        if (cut_grade && cut_grade.error != undefined) {
          errors.push({
            column_name: "Cut Grade",
            row_id: currentGroupIndex + 1 + 1,
            error_message: cut_grade.error,
          });
        } else if (cut_grade && cut_grade.data) {
          cut_grade = cut_grade?.data;
        } else {
          cut_grade = null;
        }

        // check polish
        let polish: any = getIdFromName(
          row["polish"],
          polishList,
          "name",
          "polish"
        );
        if (polish && polish.error != undefined) {
          errors.push({
            column_name: "Polish",
            row_id: currentGroupIndex + 1 + 1,
            error_message: polish.error,
          });
        } else if (polish && polish.data) {
          polish = polish?.data;
        } else {
          polish = null;
        }

        // check symmetry
        let symmetry: any = getIdFromName(
          row["Symmetry"],
          SymmetryList,
          "name",
          "Symmetry"
        );
        if (symmetry && symmetry.error != undefined) {
          errors.push({
            column_name: "Symmetry",
            row_id: currentGroupIndex + 1 + 1,
            error_message: symmetry.error,
          });
        } else if (symmetry && symmetry.data) {
          symmetry = symmetry?.data;
        } else {
          symmetry = null;
        }

        // check fluorescence intensity
        let fluorescence_intensity: any = getIdFromName(
          row["Fluorescence Intensity"],
          fluorescenceIntensityList,
          "name",
          "Fluorescence Intensity"
        );
        if (
          fluorescence_intensity &&
          fluorescence_intensity.error != undefined
        ) {
          errors.push({
            column_name: "Fluorescence Intensity",
            row_id: currentGroupIndex + 1 + 1,
            error_message: fluorescence_intensity.error,
          });
        } else if (fluorescence_intensity && fluorescence_intensity.data) {
          fluorescence_intensity = fluorescence_intensity?.data;
        } else {
          fluorescence_intensity = null;
        }

        // check fluorescence color
        let fluorescence_color: any = getIdFromName(
          row["Fluorescence color"],
          fluorescenceColorList,
          "name",
          "Fluorescence color"
        );
        if (fluorescence_color && fluorescence_color.error != undefined) {
          errors.push({
            column_name: "Fluorescence color",
            row_id: currentGroupIndex + 1 + 1,
            error_message: fluorescence_color.error,
          });
        } else if (fluorescence_color && fluorescence_color.data) {
          fluorescence_color = fluorescence_color?.data;
        } else {
          fluorescence_color = null;
        }

        // check measurements
        let measurements: any = row["measurements"];

        // check lab
        let lab: any = getIdFromName(row["lab"], labList, "name", "lab");
        if (lab && lab.error != undefined) {
          errors.push({
            column_name: "lab",
            row_id: currentGroupIndex + 1 + 1,
            error_message: lab.error,
          });
        } else if (lab && lab.data) {
          lab = lab?.data;
        } else {
          lab = null;
        }

        // check certificate
        let certificate: any = row?.Certificate

        // check certificate url
        let certificate_url: any = row["Certificate url"];

        // check image link
        let image_link: any = row["image link"];

        // check video link
        let video_link: any = row["video link"];

        // check fancy color
        let fancy_color: any = getIdFromName(
          row["fancy color"],
          fancyColorList,
          "name",
          "fancy color"
        );
        if (fancy_color && fancy_color.error != undefined) {
          errors.push({
            column_name: "fancy color",
            row_id: currentGroupIndex + 1 + 1,
            error_message: fancy_color.error,
          });
        } else if (fancy_color && fancy_color.data) {
          fancy_color = fancy_color?.data;
        } else {
          fancy_color = null;
        }

        // check fancy color intensity
        let fancy_color_intensity: any = getIdFromName(
          row["fancy color intensity"],
          fancyColorIntensityList,
          "name",
          "fancy color intensity"
        );
        if (fancy_color_intensity && fancy_color_intensity.error != undefined) {
          errors.push({
            column_name: "fancy color intensity",
            row_id: currentGroupIndex + 1 + 1,
            error_message: fancy_color_intensity.error,
          });
        } else if (fancy_color_intensity && fancy_color_intensity.data) {
          fancy_color_intensity = fancy_color_intensity?.data;
        } else {
          fancy_color_intensity = null;
        }

        // check fancy color overtone
        let fancy_color_overtone: any = getIdFromName(
          row["fancy color overtone"],
          fancyColorOvertoneList,
          "name",
          "fancy color overtone"
        );
        if (fancy_color_overtone && fancy_color_overtone.error != undefined) {
          errors.push({
            column_name: "fancy color overtone",
            row_id: currentGroupIndex + 1 + 1,
            error_message: fancy_color_overtone.error,
          });
        } else if (fancy_color_overtone && fancy_color_overtone.data) {
          fancy_color_overtone = fancy_color_overtone?.data;
        } else {
          fancy_color_overtone = null;
        }

        // check depth
        let depth_per: any = row["depth %"];

        // check table
        let table_per: any = row["Table %"];

        // check girdle
        let girdle_per = row["Girdle %"];

        // check culet size
        let culet_size = row["culet size"];

        // check sort description
        let sort_description = row["Sort Description"];

        // check long description
        let long_description = row["Long Description"];

        // check country
        let country: any = getIdFromName(
          row["country"],
          countryList,
          "name",
          "country"
        );
        if (country && country.error != undefined) {
          errors.push({
            column_name: "country",
            row_id: currentGroupIndex + 1 + 1,
            error_message: country.error,
          });
        } else if (country && country.data) {
          country = country?.data;
        } else {
          country = null;
        }

        // check state
        let state: any = getIdFromName(
          row["State"],
          stateList,
          "name",
          "State"
        );
        if (state && state.error != undefined) {
          errors.push({
            column_name: "State",
            row_id: currentGroupIndex + 1 + 1,
            error_message: state.error,
          });
        } else if (state && state.data) {
          state = state?.data;
        } else {
          state = null;
        }

        // check city
        let city: any = getIdFromName(row["City"], cityList, "name", "City");
        if (city && city.error != undefined) {
          errors.push({
            column_name: "City",
            row_id: currentGroupIndex + 1 + 1,
            error_message: city.error,
          });
        } else if (city && city.data) {
          city = city?.data;
        } else {
          city = null;
        }

        // check in matched pair separable
        let in_matched_pair_separable: any = row["In matched pair separable"];

        // check pair stock
        let pair_stock = null;
        if (row["pair stock #"]) {
          if (!dbStockNumbers?.includes(row["pair stock #"])) {
            if (!sheetStockNumbers?.includes(row["pair stock #"])) {
              errors.push({
                column_name: "pair stock #",
                row_id: currentGroupIndex + 1 + 1,
                error_message: prepareMessageFromParams(
                  ERROR_NOT_FOUND,
                  [["field_name", `pair stock # ${row["pair stock #"]}`]]
                ),
              })
            } else {
              pair_stock = row["pair stock #"];
            }
          } else {
            pair_stock = row["pair stock #"];
          }
        }

        // check growth type
        let growth_type: any = getIdFromName(
          row["Growth type"],
          growthTypeList,
          "name",
          "Growth type"
        );
        if (growth_type && growth_type.error != undefined) {
          errors.push({
            column_name: "Growth type",
            row_id: currentGroupIndex + 1 + 1,
            error_message: growth_type.error,
          });
        } else if (growth_type && growth_type.data) {
          growth_type = growth_type?.data;
        } else {
          growth_type = null;
        }

        // check total price
        let total_price: any = row["total price"] === null ? Number(row["price/ct"]) * Number(row.weight) : row["total price"];

        // check price / ct
        let price_ct: any = row["price/ct"];

        const findDiamond = await looseDiamondList.find(
          (t: any) => t.dataValues.stock_id == row["stock #"]
        );
        if (findDiamond && findDiamond !== undefined && findDiamond != null) {
          updatedDiamondList.push({
            id: findDiamond.dataValues.id,
            stock_id: row["stock #"],
            availability,
            stone,
            stone_type,
            shape,
            weight,
            color,
            clarity,
            mm_size,
            seive_size,
            cut_grade,
            polish,
            symmetry,
            fluorescence_intensity,
            fluorescence_color,
            measurements,
            lab,
            certificate,
            certificate_url,
            fancy_color,
            fancy_color_intensity,
            fancy_color_overtone,
            depth_per,
            table_per,
            girdle_per,
            culet_size,
            sort_description,
            long_description,
            country,
            state,
            city,
            in_matched_pair_separable,
            pair_stock,
            image_link,
            video_link,
            growth_type,
            total_price,
            price_ct,
            quantity: findDiamond.dataValues.quantity
              ? findDiamond.dataValues.quantity +
              (Number(row["quantity"]) -
                (findDiamond.dataValues.remaining_quantity_count || 0))
              : row["quantity"],
            remaining_quantity_count: row["quantity"],
            prev_quantity: findDiamond.dataValues.remaining_quantity_count || 0,
            modified_by: idAppUser,
            modified_at: getLocalDate(),
          });
        } else {
          createdDiamondList.push({
            stock_id: row["stock #"],
            availability,
            stone,
            stone_type,
            shape,
            weight,
            color,
            clarity,
            mm_size,
            seive_size,
            cut_grade,
            polish,
            symmetry,
            fluorescence_intensity,
            fluorescence_color,
            measurements,
            lab,
            certificate,
            certificate_url,
            fancy_color,
            fancy_color_intensity,
            fancy_color_overtone,
            depth_per,
            table_per,
            girdle_per,
            culet_size,
            sort_description,
            long_description,
            country,
            state,
            city,
            in_matched_pair_separable,
            pair_stock,
            image_link,
            video_link,
            growth_type,
            total_price,
            price_ct,
            quantity: row["quantity"],
            remaining_quantity_count: row["quantity"],
            prev_quantity: 0,
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No,
            created_by: idAppUser,
            company_info_id: client_id,
            created_at: getLocalDate(),
          });
        }
      } else {
        errors.push({
          column_id: 1,
          column_name: "stock #",
          row_id: currentGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(
            ERROR_NOT_FOUND,
            [["field_name", `stock #`]]
          ),
        });
      }
      stockNumberList.push(row["stock #"]);
    }

    if (errors.length > 0) {
      return resUnprocessableEntity({ data: errors });
    }

    return resSuccess({
      data: { create: createdDiamondList, update: updatedDiamondList },
    });
  } catch (e) {
    console.log("e", e);
    throw e;
  }
};

const addGroupToDB = async (list: any, idAppUser: any, client_id: any, req: Request) => {
    const {LooseDiamondGroupMasters,StockChangeLog} = initModels(req);

  const trn = await req.body.db_connection.transaction();
  let activitylogs: any = {};
  let StockChangeLogData;
  try {
    const stockChangeLogPayload = [];
    if (list.create.length > 0) {
      const resLooseDiamond = await LooseDiamondGroupMasters.bulkCreate(
        list.create,
        {
          transaction: trn,
        }
      );
      activitylogs = { ...resLooseDiamond }
      for (const diamond of resLooseDiamond) {
        stockChangeLogPayload.push({
          product_id: diamond.dataValues.id,
          variant_id: null,
          product_type: STOCK_PRODUCT_TYPE.LooseDiamond,
          sku: diamond.dataValues.stock_id,
          prev_quantity: 0,
          new_quantity: diamond.dataValues.remaining_quantity_count,
          transaction_type: STOCK_TRANSACTION_TYPE.StockUpdate,
          changed_by: diamond.dataValues.created_by,
          company_info_id: client_id,
          email: null,
          change_date: getLocalDate(),
        });
      }
    }

    if (list.update.length > 0) {
      for (const diamond of list.update) {
        if (diamond.prev_quantity !== diamond.remaining_quantity_count) {
          stockChangeLogPayload.push({
            product_id: diamond.id,
            variant_id: null,
            product_type: STOCK_PRODUCT_TYPE.LooseDiamond,
            sku: diamond.stock_id,
            prev_quantity: diamond.prev_quantity,
            new_quantity: diamond.remaining_quantity_count,
            transaction_type: STOCK_TRANSACTION_TYPE.StockUpdate,
            changed_by: diamond.modified_by,
            email: null,
            change_date: getLocalDate(),
          });
        }
      }
      await LooseDiamondGroupMasters.bulkCreate(list.update, {
        transaction: trn,
        updateOnDuplicate: [
          "stock_id",
          "availability",
          "stone",
          "stone_type",
          "shape",
          "weight",
          "color",
          "clarity",
          "mm_size",
          "seive_size",
          "cut_grade",
          "polish",
          "symmetry",
          "fluorescence_intensity",
          "fluorescence_color",
          "measurements",
          "lab",
          "certificate",
          "certificate_url",
          "fancy_color",
          "fancy_color_intensity",
          "fancy_color_overtone",
          "depth_per",
          "table_per",
          "girdle_per",
          "culet_size",
          "sort_description",
          "long_description",
          "country",
          "state",
          "city",
          "in_matched_pair_separable",
          "pair_stock",
          "image_link",
          "video_link",
          "growth_type",
          "total_price",
          "price_ct",
          "modified_by",
          "modified_at",
          "quantity",
          "remaining_quantity_count",
        ],
      });
      activitylogs = { ...list?.update }
    }

    if (stockChangeLogPayload.length > 0) {
      StockChangeLogData = await StockChangeLog.bulkCreate(stockChangeLogPayload, {
        transaction: trn,
      });
    }

    if (list.update.length > 0) {
      //updated
      activitylogs = { ...activitylogs, StockChangeLog: StockChangeLogData && StockChangeLogData.map((t) => t.dataValues) }
      await addActivityLogs(req,client_id, [{ old_data: null, new_data: activitylogs }], null, LogsActivityType.Edit, LogsType.LooseDiamondBulkImport, idAppUser)
    } else if (list.create.length > 0) {
      //add
      activitylogs = { ...activitylogs, StockChangeLog: StockChangeLogData && StockChangeLogData.map((t) => t.dataValues) }
      await addActivityLogs(req,client_id, [{ old_data: null, new_data: activitylogs }], null, LogsActivityType.Add, LogsType.LooseDiamondBulkImport, idAppUser)
    }
    await trn.commit();
    return resSuccess({ data: list });
  } catch (e) {
    console.log("eeeeeeeeee", e);
    await trn.rollback();
    throw e;
  }
};

export const addLooseDiamondImages = async (req: Request) => {
  try {
    const {LooseDiamondGroupMasters} = initModels(req);
    let diamond;
    let afterUpdatediamond;
    const files = req.files as {
      [fieldName: string]: Express.Multer.File[];
    };
    const error: {
      message: string;
      image_name: string;
    }[] = [];

    const looseDiamondList = await LooseDiamondGroupMasters.findAll({
      where: {
        is_active: ActiveStatus.Active,
        is_deleted: DeletedStatus.No,
        company_info_id: req?.body?.session_res?.client_id,
      },
    });

    for (let image of files.images) {
      const resPRF = await moveFileToS3ByTypeAndLocation(req.body.db_connection,
        image,
        `${PRODUCT_FILE_LOCATION}/loose-diamond`,
        req?.body?.session_res?.client_id,
        req
      );
      if (resPRF.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return resPRF;
      }

      diamond = looseDiamondList.find((t) => {
        return (
          t.dataValues.stock_id ==
          image.originalname.slice(0, image.originalname.lastIndexOf("."))
        );
      });

      if (!(diamond && diamond.dataValues)) {
        error.push({
          message: prepareMessageFromParams(ERROR_NOT_FOUND, [
            ["field_name", `Product`],
          ]),
          image_name: image.originalname,
        });

        continue;
      }

      await LooseDiamondGroupMasters.update(
        {
          image_path: resPRF.data,
        },
        {
          where: {
            id: diamond.dataValues.id,
            company_info_id: req?.body?.session_res?.client_id,
          },
        }
      );

      const afterchangeslooseDiamondList = await LooseDiamondGroupMasters.findAll({
        where: {
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
        },
      });

      afterUpdatediamond = afterchangeslooseDiamondList.find((t) => {
        return (
          t.dataValues.stock_id ==
          image.originalname.slice(0, image.originalname.lastIndexOf("."))
        );
      });
    }

    if (error && error.length > 0) {
      return resBadRequest({ data: error });
    }

    await addActivityLogs(req,req?.body?.session_res?.client_id, [{
      old_data: { data: diamond.map((t) => t.dataValues) },
      new_data: { data: afterUpdatediamond.map((t) => t.dataValues) }
    }], null, LogsActivityType.Edit, LogsType.LooseDiamondBulkImportImage, req?.body?.session_res?.id_app_user)
    return resSuccess();
  } catch (error) {
    throw error;
  }
};

export const looseDiamondAdminList = async (req: Request) => {
  try {
    const {LooseDiamondGroupMasters,Master, StoneData, DiamondShape, Colors, ClarityData, CutsData} = initModels(req);

    const { query }: any = req;
    const { id } = req.params;
    let client_id: number;
    let paginationProps = {};
    if (req?.body?.session_res?.client_id) {
      client_id = req?.body?.session_res?.client_id
    } else {
      const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
      if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return company_info_id;
      }
      client_id = company_info_id?.data
    }
    const pagination = {
      ...getInitialPaginationFromQuery(query),
      search_text: query.search_text,
    };
    let noPagination = req.query.no_pagination === Pagination.no;
    const where = [
      { is_deleted: DeletedStatus.No },
      id ? { id: id } : {},
      { company_info_id: client_id },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
          [Op.or]: [
            Sequelize.where(
              Sequelize.cast(Sequelize.col("mm_size"), "VARCHAR"),
              {
                [Op.iLike]: `%${pagination.search_text}%`,
              }
            ),

            Sequelize.where(
              Sequelize.cast(Sequelize.col("weight"), "VARCHAR"),
              {
                [Op.iLike]: `%${pagination.search_text}%`,
              }
            ),
            Sequelize.where(
              Sequelize.literal('"shapes"."name"'),
              "iLike",
              `%${pagination.search_text}%`
            ),
          ],
        }
        : {},
      query.shape
        ? Sequelize.where(Sequelize.col(`shape`), {
          [Op.in]: query.shape.split(","),
        })
        : {},
      query.clarity
        ? Sequelize.where(Sequelize.col(`clarity`), {
          [Op.in]: query.clarity.split(","),
        })
        : {},
      query.min_total_price || query.max_total_price
        ? Sequelize.where(Sequelize.col('total_price'), {
          ...(query.min_total_price && { [Op.gte]: parseFloat(query.min_total_price) }),
          ...(query.max_total_price && { [Op.lte]: parseFloat(query.max_total_price) }),
        })
        : {},
      query.min_weight || query.max_weight
        ? Sequelize.where(Sequelize.col('weight'), {
          ...(query.min_weight && { [Op.gte]: parseFloat(query.min_weight) }),
          ...(query.max_weight && { [Op.lte]: parseFloat(query.max_weight) }),
        })
        : {},
      query.color
        ? Sequelize.where(Sequelize.col(`color`), {
          [Op.in]: query.color.split(","),
        })
        : {},
      query.cut_grade
        ? Sequelize.where(Sequelize.col(`cut_grade`), {
          [Op.in]: query.cut_grade.split(","),
        })
        : {},
    ];

    if (!noPagination) {
      const totalItems = await LooseDiamondGroupMasters.count({
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


    const list = await LooseDiamondGroupMasters.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "stock_id",
        "total_price",
        "price_ct",
        "weight",
        "mm_size",
        "stone_type",
        "seive_size",
        "measurements",
        "certificate",
        "certificate_url",
        "depth_per",
        "table_per",
        "girdle_per",
        "culet_size",
        "sort_description",
        "long_description",
        "in_matched_pair_separable",
        "image_link",
        "video_link",
        "image_path",
        "pair_stock",
        "is_active",
        [Sequelize.literal('"remaining_quantity_count"'), "quantity"],
        [Sequelize.literal('"availabilitys"."name"'), "availability"],
        [Sequelize.literal('"stones"."name"'), "stone"],
        [Sequelize.literal('"shapes"."name"'), "shape"],
        [Sequelize.literal('"colors"."name"'), "color"],
        [Sequelize.literal('"claritys"."name"'), "clarity"],
        [Sequelize.literal('"cut_grades"."value"'), "cut_grade"],
        [Sequelize.literal('"polishs"."name"'), "polish"],
        [Sequelize.literal('"symmetrys"."name"'), "symmetry"],
        [
          Sequelize.literal('"fluorescence_intensitys"."name"'),
          "fluorescence_intensity",
        ],
        [
          Sequelize.literal('"fluorescence_colors"."name"'),
          "fluorescence_color",
        ],
        [Sequelize.literal('"labs"."name"'), "lab"],
        [Sequelize.literal('"fancy_colors"."name"'), "fancy_color"],
        [
          Sequelize.literal('"fancy_color_intensitys"."name"'),
          "fancy_color_intensity",
        ],
        [
          Sequelize.literal('"fancy_color_overtones"."name"'),
          "fancy_color_overtone",
        ],
        [Sequelize.literal('"countrys"."name"'), "country"],
        [Sequelize.literal('"states"."name"'), "state"],
        [Sequelize.literal('"citys"."name"'), "city"],
        [Sequelize.literal('"growth_types"."name"'), "growth_type"],
      ],
      include: [
        {
          model: Master,
          required: false,
          as: "availabilitys",
          attributes: [],
          where: { company_info_id: client_id },
        },
        {
          model: StoneData,
          as: "stones",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: DiamondShape,
          as: "shapes",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Colors,
          as: "colors",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: ClarityData,
          as: "claritys",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: CutsData,
          as: "cut_grades",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "polishs",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "symmetrys",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "fluorescence_intensitys",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "fluorescence_colors",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "labs",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "fancy_colors",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "fancy_color_intensitys",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "fancy_color_overtones",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "countrys",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "states",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "citys",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "growth_types",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
      ],
    });
    return resSuccess({ data: noPagination ? list : { pagination, result: list } });
  } catch (error) {
    throw error;
  }
};

export const looseDiamondDetailsForAdmin = async (req: Request) => {
  try {
    const {LooseDiamondGroupMasters,Master, StoneData, DiamondShape, Colors, ClarityData, CutsData} = initModels(req);

    const { query } = req;
    let client_id: number;

    if (req?.body?.session_res?.client_id) {
      client_id = req?.body?.session_res?.client_id
    } else {
      const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
      if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return company_info_id;
      }
      client_id = company_info_id?.data
    }

    const { product_id } = req.params;
    const diamondDetail = await LooseDiamondGroupMasters.findOne({
      where: { is_deleted: DeletedStatus.No, id: product_id, company_info_id: client_id },
      attributes: [
        "id",
        "stock_id",
        "total_price",
        "price_ct",
        "weight",
        "mm_size",
        "stone_type",
        "seive_size",
        "measurements",
        "certificate",
        "certificate_url",
        "depth_per",
        "table_per",
        "girdle_per",
        "culet_size",
        "sort_description",
        "long_description",
        "in_matched_pair_separable",
        "image_link",
        "video_link",
        "image_path",
        "pair_stock",
        "is_active",
        ["remaining_quantity_count", "quantity"],
        [Sequelize.literal('"availabilitys"."name"'), "availability"],
        [Sequelize.literal('"availabilitys"."id"'), "availability_id"],
        [Sequelize.literal('"stones"."name"'), "stone"],
        [Sequelize.literal('"stones"."id"'), "stone_id"],
        [Sequelize.literal('"shapes"."name"'), "shape"],
        [Sequelize.literal('"shapes"."id"'), "shape_id"],
        [Sequelize.literal('"colors"."name"'), "color"],
        [Sequelize.literal('"colors"."id"'), "color_id"],
        [Sequelize.literal('"claritys"."name"'), "clarity"],
        [Sequelize.literal('"claritys"."id"'), "clarity_id"],
        [Sequelize.literal('"cut_grades"."value"'), "cut_grade"],
        [Sequelize.literal('"cut_grades"."id"'), "cut_grade_id"],
        [Sequelize.literal('"polishs"."name"'), "polish"],
        [Sequelize.literal('"polishs"."id"'), "polish_id"],
        [Sequelize.literal('"symmetrys"."name"'), "symmetry"],
        [Sequelize.literal('"symmetrys"."id"'), "symmetry_id"],
        [
          Sequelize.literal('"fluorescence_intensitys"."name"'),
          "fluorescence_intensity",
        ],
        [
          Sequelize.literal('"fluorescence_intensitys"."id"'),
          "fluorescence_intensity_id",
        ],
        [
          Sequelize.literal('"fluorescence_colors"."name"'),
          "fluorescence_color",
        ],
        [
          Sequelize.literal('"fluorescence_colors"."id"'),
          "fluorescence_color_id",
        ],
        [Sequelize.literal('"labs"."name"'), "lab"],
        [Sequelize.literal('"labs"."id"'), "lab_id"],
        [Sequelize.literal('"fancy_colors"."name"'), "fancy_color"],
        [Sequelize.literal('"fancy_colors"."id"'), "fancy_color_id"],
        [
          Sequelize.literal('"fancy_color_intensitys"."name"'),
          "fancy_color_intensity",
        ],
        [
          Sequelize.literal('"fancy_color_intensitys"."id"'),
          "fancy_color_intensity_id",
        ],
        [
          Sequelize.literal('"fancy_color_overtones"."name"'),
          "fancy_color_overtone",
        ],
        [
          Sequelize.literal('"fancy_color_overtones"."id"'),
          "fancy_color_overtone_id",
        ],
        [Sequelize.literal('"countrys"."name"'), "country"],
        [Sequelize.literal('"countrys"."id"'), "country_id"],
        [Sequelize.literal('"states"."name"'), "state"],
        [Sequelize.literal('"states"."id"'), "state_id"],
        [Sequelize.literal('"citys"."name"'), "city"],
        [Sequelize.literal('"citys"."id"'), "city_id"],
        [Sequelize.literal('"growth_types"."name"'), "growth_type"],
        [Sequelize.literal('"growth_types"."id"'), "growth_type_id"],
      ],
      include: [
        {
          model: Master,
          required: false,
          as: "availabilitys",
          attributes: [],
          where: { company_info_id: client_id },
        },
        {
          model: StoneData,
          as: "stones",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: DiamondShape,
          as: "shapes",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Colors,
          as: "colors",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: ClarityData,
          as: "claritys",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: CutsData,
          as: "cut_grades",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "polishs",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "symmetrys",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "fluorescence_intensitys",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "fluorescence_colors",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "labs",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "fancy_colors",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "fancy_color_intensitys",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "fancy_color_overtones",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "countrys",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "states",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "citys",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
        {
          model: Master,
          as: "growth_types",
          attributes: [],
          where: { company_info_id: client_id },
          required: false,
        },
      ],
    });

    if (!(diamondDetail && diamondDetail.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [
          ["field_name", "Product"],
        ]),
      });
    }
    return resSuccess({ data: diamondDetail });
  } catch (error) {
    throw error;
  }
};

export const looseDiamondUserList = async (req: Request) => {
  try {
    const {LooseDiamondGroupMasters,Master, StoneData, DiamondShape, Colors, ClarityData, CutsData} = initModels(req);

    const { query }: any = req;
    let client_id: any = {};

    if (req?.body?.session_res?.client_id) {
      client_id.data = req.body.session_res.client_id;
    } else {
      const decrypted = await getCompanyIdBasedOnTheCompanyKey(req.query, req.body.db_connection);

      if (decrypted.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return decrypted;
      }

      client_id = decrypted;
    }

    let paginationProps = {};
    let noPagination = req.query.no_pagination === Pagination.no;
    let pagination = {
      ...getInitialPaginationFromQuery(query),
      search_text: query.search_text,
    };
    const include = [
      {
        model: Master,
        required: false,
        as: "availabilitys",
        attributes: [],
        where: { company_info_id: client_id?.data },
      },
      {
        model: StoneData,
        as: "stones",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: DiamondShape,
        as: "shapes",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Colors,
        as: "colors",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: ClarityData,
        as: "claritys",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: CutsData,
        as: "cut_grades",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Master,
        as: "polishs",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Master,
        as: "symmetrys",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Master,
        as: "fluorescence_intensitys",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Master,
        as: "fluorescence_colors",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Master,
        as: "labs",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Master,
        as: "fancy_colors",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Master,
        as: "fancy_color_intensitys",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Master,
        as: "fancy_color_overtones",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Master,
        as: "countrys",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Master,
        as: "states",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Master,
        as: "citys",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
      {
        model: Master,
        as: "growth_types",
        attributes: [],
        where: { company_info_id: client_id?.data },
        required: false,
      },
    ]

    const where = [
      { is_deleted: DeletedStatus.No },
      { company_info_id: client_id?.data },
      { is_active: ActiveStatus.Active },
      pagination.search_text
        ? {
          [Op.or]: [
            Sequelize.where(
              Sequelize.cast(Sequelize.col("mm_size"), "VARCHAR"),
              {
                [Op.iLike]: `%${pagination.search_text}%`,
              }
            ),

            Sequelize.where(
              Sequelize.cast(Sequelize.col("weight"), "VARCHAR"),
              {
                [Op.iLike]: `%${pagination.search_text}%`,
              }
            ),
            Sequelize.where(
              Sequelize.literal('"shapes"."name"'),
              "iLike",
              `%${pagination.search_text}%`
            ),
          ],
        }
        : {},
      query.shape
        ? Sequelize.where(Sequelize.col(`shape`), {
          [Op.in]: query.shape.split(","),
        })
        : {},
      query.clarity
        ? Sequelize.where(Sequelize.col(`clarity`), {
          [Op.in]: query.clarity.split(","),
        })
        : {},
      query.min_total_price || query.max_total_price
        ? Sequelize.where(Sequelize.col('total_price'), {
          ...(query.min_total_price && { [Op.gte]: parseFloat(query.min_total_price) }),
          ...(query.max_total_price && { [Op.lte]: parseFloat(query.max_total_price) }),
        })
        : {},
      query.min_weight || query.max_weight
        ? Sequelize.where(Sequelize.col('weight'), {
          ...(query.min_weight && { [Op.gte]: parseFloat(query.min_weight) }),
          ...(query.max_weight && { [Op.lte]: parseFloat(query.max_weight) }),
        })
        : {},
      query.color
        ? Sequelize.where(Sequelize.col(`color`), {
          [Op.in]: query.color.split(","),
        })
        : {},
      query.cut_grade
        ? Sequelize.where(Sequelize.col(`cut_grade`), {
          [Op.in]: query.cut_grade.split(","),
        })
        : {},
    ];

    if (!noPagination) {
      const totalItems = await LooseDiamondGroupMasters.count({
        where,
        include,
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

    const list = await LooseDiamondGroupMasters.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "stock_id",
        "image_path",
        [Sequelize.literal('"availabilitys"."name"'), "availability"],
        [Sequelize.literal('"stones"."name"'), "stone"],
        "stone_type",
        [Sequelize.literal('"shapes"."name"'), "shape"],
        "weight",
        [Sequelize.literal('"colors"."name"'), "color"],
        [Sequelize.literal('"claritys"."name"'), "clarity"],
        "mm_size",
        "seive_size",
        [Sequelize.literal('"cut_grades"."value"'), "cut_grade"],
        [Sequelize.literal('"polishs"."name"'), "polish"],
        [Sequelize.literal('"symmetrys"."name"'), "symmetry"],
        [
          Sequelize.literal('"fluorescence_intensitys"."name"'),
          "fluorescence_intensity",
        ],
        [
          Sequelize.literal('"fluorescence_colors"."name"'),
          "fluorescence_color",
        ],
        "measurements",
        [Sequelize.literal('"labs"."name"'), "lab"],
        "certificate",
        "certificate_url",
        [Sequelize.literal('"fancy_colors"."name"'), "fancy_color"],
        [
          Sequelize.literal('"fancy_color_intensitys"."name"'),
          "fancy_color_intensity",
        ],
        [
          Sequelize.literal('"fancy_color_overtones"."name"'),
          "fancy_color_overtone",
        ],
        "depth_per",
        "table_per",
        "girdle_per",
        "culet_size",
        "sort_description",
        "long_description",
        [Sequelize.literal('"countrys"."name"'), "country"],
        [Sequelize.literal('"states"."name"'), "state"],
        [Sequelize.literal('"citys"."name"'), "city"],
        "in_matched_pair_separable",
        "pair_stock",
        "image_link",
        "video_link",
        [Sequelize.literal('"growth_types"."name"'), "growth_type"],
        [
          Sequelize.literal(
            `CASE WHEN total_price IS NULL THEN price_ct*weight ELSE total_price END`
          ),
          "total_price",
        ],
        "price_ct",
        [Sequelize.literal('"remaining_quantity_count"'), "quantity"],
      ],
      include,
    });
    return resSuccess({ data: { pagination, result: list } });
  } catch (error) {
    throw error;
  }
};

export const looseDiamondDetailsForUser = async (req: Request) => {
  try {
    const {LooseDiamondGroupMasters} = initModels(req);

    const client_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    const { product_id } = req.params;
    const diamondDetail = await LooseDiamondGroupMasters.findOne({
      where: { is_deleted: DeletedStatus.No, id: product_id, company_info_id: client_id?.data, is_active: ActiveStatus.Active },
      attributes: [
        "stock_id",
      ],
    });

    if (!(diamondDetail && diamondDetail.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [
          ["field_name", "Product"],
        ]),
      });
    }

    const data = await getLooseDiamondByStockNumber(diamondDetail?.dataValues?.stock_id, req)

    return resSuccess({ data: data?.data });
  } catch (error) {
    throw error;
  }
};

export const deleteDiamond = async (req: Request) => {
  try {
    const {LooseDiamondGroupMasters} = initModels(req);

    const { product_id } = req.params;

    const product = await LooseDiamondGroupMasters.findOne({
      where: { id: product_id, is_deleted: DeletedStatus.No },
    });

    if (!(product && product.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [
          ["field_name", "Product"],
        ]),
      });
    }

    await LooseDiamondGroupMasters.update(
      {
        is_deleted: DeletedStatus.yes,
        deleted_at: getLocalDate(),
        deleted_by: req.body.session_res.id_app_user,
      },
      {
        where: {
          id: product.dataValues.id,
        },
      }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id, [{
      old_data: { loos_diamon_group_id: product?.dataValues?.id, data: { ...product?.dataValues } },
      new_data: {
        loos_diamon_group_id: product?.dataValues?.id, data: {
          ...product?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], product?.dataValues?.id, LogsActivityType.Delete, LogsType.LooseDiamondBulkImport, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getAllDiamonds = async (req: Request) => {
  try {
    const {LooseDiamondGroupMasters} = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return company_info_id;
    }
    const { query }: any = req;
    if (query.inventory_type === DIAMOND_INVENTROY_TYPE.VDB) {
      const data = await getVDBDiamonds(req);
      return data;
    } else if (query.inventory_type === DIAMOND_INVENTROY_TYPE.Rapnet) {
      const data = await getRapnetDiamonds(req);
      return data;
    }

    const localData = await getLocalDiamonds(req);
    return localData;
  } catch (e) {
    throw e;
  }
};

const getLocalDiamonds = async (req: Request) => {
  try {
    const {FiltersData, Master, DiamondShape, Colors, ClarityData, CutsData,LooseDiamondGroupMasters} = initModels(req)
    const query = req.query as unknown as IDiamondFilter;
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return company_info_id;
    }
    const scope = FilterItemScope.Diamond;
    const data = await FiltersData.findAll({
      where: {
        is_active: ActiveStatus.Active,
        company_info_id: company_info_id?.data,
        [Op.or]: [
          { item_scope: scope },
          { item_scope: FilterItemScope.Both },
        ],
      },
      attributes: [
        "id",
        "name",
        "key",
        "filter_select_type",
        "item_scope",
        "selected_value",
      ],
    });

    const resultFilter = data.map((item) => {
      const selectedValue = item.dataValues.selected_value

      return {
        ...item.dataValues,
        selected_value: selectedValue
          ? selectedValue.filter(
            (value: any) =>
              value.item_scope === scope || value.item_scope === FilterItemScope.Both
          )
          : [],
      }
    });
    let diamondColorList = [];
    let DiamondClarityList = [];
    let stoneCutList = [];
    let polishList = [];
    let symmetryList = [];

    for (let index = 0; index < resultFilter.length; index++) {
      const element = resultFilter[index].selected_value?.map((x) => x.id);
      const where = { id: { [Op.in]: element }, is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active };
      switch (resultFilter[index].key) {
        case FilterMasterKey.DiamondColor:
          diamondColorList = await Colors.findAll({ where, attributes: [['value', 'name']] });
          break;
        case FilterMasterKey.DiamondClarity:
          DiamondClarityList = await ClarityData.findAll({ where, attributes: [['value', 'name']] });
          break;
        case FilterMasterKey.cut:
          stoneCutList = await CutsData.findAll({
            where,
            attributes: [
              ["value", "name"],
            ]
          })
          break;
        case FilterMasterKey.Polish:
          polishList = await Master.findAll({
            where,
            attributes: [
              "name",
            ],
          })
          break;
        case FilterMasterKey.Symmetry:
          symmetryList = await Master.findAll({
            where,
            attributes: [
              "name",
            ],
          })
          break;
      }
    }

    let paginationProps = {};
    let pagination = {
      ...getInitialPaginationFromQuery(query),
    };
    let noPagination = req.query.no_pagination === "1";
    const include = [
      {
        model: DiamondShape,
        as: "shapes",
        attributes: [],
      },
      {
        model: Colors,
        as: "colors",
        attributes: [],
      },
      {
        model: ClarityData,
        as: "claritys",
        attributes: [],
      },
      {
        model: CutsData,
        as: "cut_grades",
        attributes: [],
      },
      {
        model: Master,
        as: "polishs",
        attributes: [],
      },
      {
        model: Master,
        as: "symmetrys",
        attributes: [],
      },
      {
        model: Master,
        as: "fluorescence_intensitys",
        attributes: [],
      },
      {
        model: Master,
        as: "girdle_thicks",
        attributes: [],
      },
      {
        model: Master,
        as: "h_as",
        attributes: [],
      },
    ];

    const where = [
      { company_info_id: company_info_id?.data },
      { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
      query.shape
        ? Sequelize.where(Sequelize.col(`shapes.name`), {
          [Op.in]: query.shape.split(","),
        })
        : {},
      query.min_carat
        ? Sequelize.where(Sequelize.col(`loose_diamond_group_masters.weight`), {
          [Op.gte]: query.min_carat,
        })
        : {},
      query.max_carat
        ? Sequelize.where(Sequelize.col(`loose_diamond_group_masters.weight`), {
          [Op.lte]: query.max_carat,
        })
        : {},
      query.diamond_origin
        ? Sequelize.where(
          Sequelize.col(`loose_diamond_group_masters.stone_type`),
          {
            [Op.like]: query.diamond_origin,
          }
        )
        : {},
      query.min_price
        ? Sequelize.where(
          Sequelize.literal(
            `CASE WHEN loose_diamond_group_masters.total_price IS NULL THEN loose_diamond_group_masters.price_ct*loose_diamond_group_masters.weight ELSE total_price END`
          ),
          {
            [Op.gte]: query.min_price,
          }
        )
        : {},
      query.max_price
        ? Sequelize.where(
          Sequelize.literal(
            `CASE WHEN loose_diamond_group_masters.total_price IS NULL THEN loose_diamond_group_masters.price_ct*loose_diamond_group_masters.weight ELSE total_price END`
          ),
          {
            [Op.lte]: query.max_price,
          }
        )
        : {},
      query.color_from || query.color_to
        ? Sequelize.where(Sequelize.col(`colors.value`), {
          [Op.in]: getListFromToValues(
            diamondColorList?.map((x) => x.dataValues.name),
            query.color_from,
            query.color_to
          ),
        })
        : {},
      query.clarity_from || query.clarity_to
        ? Sequelize.where(Sequelize.col(`claritys.value`), {
          [Op.in]: getListFromToValues(
            DiamondClarityList?.map((x) => x.dataValues.name),
            query.clarity_from,
            query.clarity_to
          ),
        })
        : {},
      query.cut_from || query.cut_to
        ? Sequelize.where(Sequelize.col(`cut_grades.value`), {
          [Op.in]: getListFromToValues(
            stoneCutList?.map((x) => x.dataValues.name),
            query.cut_from,
            query.cut_to
          ),
        })
        : {},
      query.h_a
        ? Sequelize.where(Sequelize.col(`loose_diamond_group_masters.h_a`), {
          [Op.ne]: null,
        })
        : {},
      query.report ? {
        [Op.or]: [
          { certificate: { [Op.iLike]: "%" + query.report + "%" } },
        ],
      } : {},
      query.min_lw_ratio
        ? Sequelize.where(
          Sequelize.literal(
            `ROUND(
              (
                NULLIF(split_part("loose_diamond_group_masters"."measurements", '*', 1), '')::NUMERIC
                /
                NULLIF(split_part("loose_diamond_group_masters"."measurements", '*', 2), '')::NUMERIC
              ),
              2
            ) `
          ),
          {
            [Op.gte]: query.min_lw_ratio,
          }
        )
        : {},
      query.max_lw_ratio
        ? Sequelize.where(
          Sequelize.literal(
            `ROUND(
              (
                NULLIF(split_part("loose_diamond_group_masters"."measurements", '*', 1), '')::NUMERIC
                /
                NULLIF(split_part("loose_diamond_group_masters"."measurements", '*', 2), '')::NUMERIC
              ),
              2
            ) `
          ),
          {
            [Op.lte]: query.max_lw_ratio,
          }
        )
        : {},
      query.fluorescence_intensity
        ? Sequelize.where(Sequelize.col(`fluorescence_intensitys.name`), {
          [Op.in]: query.fluorescence_intensity.split(","),
        })
        : {},
      query.polish_from || query.polish_to
        ? Sequelize.where(Sequelize.col(`polishs.name`), {
          [Op.in]: getListFromToValues(
            polishList?.map((x) => x.dataValues.name),
            query.polish_from,
            query.polish_to
          ),
        })
        : {},
      query.symmetry_from || query.symmetry_to
        ? Sequelize.where(Sequelize.col(`symmetrys.name`), {
          [Op.in]: getListFromToValues(
            symmetryList?.map((x) => x.dataValues.name),
            query.symmetry_from,
            query.symmetry_to
          ),
        })
        : {},
      query.min_table
        ? Sequelize.where(
          Sequelize.col(`loose_diamond_group_masters.table_per`),
          {
            [Op.gte]: query.min_table,
          }
        )
        : {},
      query.max_table
        ? Sequelize.where(
          Sequelize.col(`loose_diamond_group_masters.table_per`),
          {
            [Op.lte]: query.max_table,
          }
        )
        : {},
      query.min_depth
        ? Sequelize.where(
          Sequelize.col(`loose_diamond_group_masters.depth_per`),
          {
            [Op.gte]: query.min_depth,
          }
        )
        : {},
      query.max_depth
        ? Sequelize.where(
          Sequelize.col(`loose_diamond_group_masters.depth_per`),
          {
            [Op.lte]: query.max_depth,
          }
        )
        : {},
    ];
    if (!noPagination) {
      const totalItems = await LooseDiamondGroupMasters.count({
        where,
        include,
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
    const result = await LooseDiamondGroupMasters.findAll({
      where,
      ...paginationProps,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        [Sequelize.literal('"shapes"."name"'), "shape"],
        [
          Sequelize.literal(
            `CASE WHEN total_price IS NULL THEN price_ct*weight ELSE total_price END`
          ),
          "price",
        ],
        [Sequelize.literal("weight"), "carat"],
        [Sequelize.literal('"cut_grades"."value"'), "cut"],
        [Sequelize.literal('"colors"."name"'), "color"],
        [Sequelize.literal('"claritys"."name"'), "clarity"],
        [Sequelize.literal("image_link"), "image_url"],
        [Sequelize.literal("video_link"), "video_url"],
        [Sequelize.literal("ARRAY[]::text[]"), "other_images_url"],
        [
          Sequelize.literal(
            `ROUND(
  CASE
    WHEN
      btrim(split_part(
        regexp_replace(
          regexp_replace(measurements, '[xX]', '*', 'g'),
          '[ ]*m{1,2}[ ]*',
          '',
          'gi'
        ), '*', 1
      )) ~ '^[0-9]+(\.[0-9]+)?$'
    AND
      btrim(split_part(
        regexp_replace(
          regexp_replace(measurements, '[xX]', '*', 'g'),
          '[ ]*m{1,2}[ ]*',
          '',
          'gi'
        ), '*', 2
      )) ~ '^[0-9]+(\.[0-9]+)?$'
    THEN
      btrim(split_part(
        regexp_replace(
          regexp_replace(measurements, '[xX]', '*', 'g'),
          '[ ]*m{1,2}[ ]*',
          '',
          'gi'
        ), '*', 1
      ))::NUMERIC
      /
      btrim(split_part(
        regexp_replace(
          regexp_replace(measurements, '[xX]', '*', 'g'),
          '[ ]*m{1,2}[ ]*',
          '',
          'gi'
        ), '*', 2
      ))::NUMERIC
    ELSE NULL
  END,
  2
)`
          ),
          "lw",
        ],
        [Sequelize.literal('"fluorescence_intensitys"."name"'), "fluor"],
        [Sequelize.literal('"symmetrys"."name"'), "symmetry"],
        [Sequelize.literal("table_per"), "table"],
        [
          Sequelize.literal(
            `ROUND(
              CASE
                WHEN btrim(split_part(
                  regexp_replace(
                    regexp_replace(measurements, '[xX]', '*', 'g'),
                    '[ ]*m{1,2}[ ]*',
                    '',
                    'gi'
                  ), '*', 1
                )) ~ '^[0-9]+(\.[0-9]+)?$'
                THEN btrim(split_part(
                  regexp_replace(
                    regexp_replace(measurements, '[xX]', '*', 'g'),
                    '[ ]*m{1,2}[ ]*',
                    '',
                    'gi'
                  ), '*', 1
                ))::NUMERIC
                ELSE NULL
              END
            )`
          ),
          "measurement_length",
        ],
        [
          Sequelize.literal(
            `ROUND(
  CASE
    WHEN btrim(split_part(
      regexp_replace(
        regexp_replace(measurements, '[xX]', '*', 'g'),
        '[ ]*m{1,2}[ ]*',
        '',
        'gi'
      ), '*', 2
    )) ~ '^[0-9]+(\.[0-9]+)?$'
    THEN btrim(split_part(
      regexp_replace(
        regexp_replace(measurements, '[xX]', '*', 'g'),
        '[ ]*m{1,2}[ ]*',
        '',
        'gi'
      ), '*', 2
    ))::NUMERIC
    ELSE NULL
  END
)
`         
          ),
          "measurement_width",
        ],
        [
          Sequelize.literal(
            `ROUND(
  CASE
    WHEN btrim(split_part(
      regexp_replace(
        regexp_replace(measurements, '[xX]', '*', 'g'),
        '[ ]*m{1,2}[ ]*',
        '',
        'gi'
      ), '*', 3
    )) ~ '^[0-9]+(\.[0-9]+)?$'
    THEN btrim(split_part(
      regexp_replace(
        regexp_replace(measurements, '[xX]', '*', 'g'),
        '[ ]*m{1,2}[ ]*',
        '',
        'gi'
      ), '*', 3
    ))::NUMERIC
    ELSE NULL
  END
) `
          ),
          "measurement_depth",
        ],
        [Sequelize.literal("culet_size"), "culet"],
        [Sequelize.literal('"polishs"."name"'), "polish"],
        [Sequelize.literal('"girdle_thicks"."name"'), "girdle"],
        [Sequelize.literal('"depth_per"'), "depth"],
        ["certificate", "report"],
        [Sequelize.literal('"stock_id"'), "stock_number"],
        [
          Sequelize.literal('"loose_diamond_group_masters"."stone_type"'),
          "diamond_origin",
        ],
        [Sequelize.literal('"certificate_url"'), "certificate_url"],
        [Sequelize.literal('"remaining_quantity_count"'), "quantity"],
        "remaining_quantity_count",
        [Sequelize.literal('"quantity"'), "total_quantity"],
      ],
      include,
    });
    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getDiamondByStockNumber = async ({
  stock_number,
  inventory_type,
  diamond_origin,
  
}: {
  stock_number: string;
  inventory_type: DIAMOND_INVENTROY_TYPE;
  diamond_origin: DIAMOND_ORIGIN;
},req: Request) => {
  try {
    if (inventory_type === DIAMOND_INVENTROY_TYPE.VDB) {
      const data = await getVDBDiamondByStockNumber(
        stock_number,
        diamond_origin
      );
      return data;
    }

    const localData = await getLooseDiamondByStockNumber(stock_number, req);
    return localData;
  } catch (e) {
    throw e;
  }
};

export const getLooseDiamondByStockNumber = async (stockNumber: string, req: Request) => {
  try {
    const { LooseDiamondGroupMasters, Master, DiamondShape, Colors, ClarityData, CutsData } = initModels(req);
    const include = [
      {
        model: DiamondShape,
        as: "shapes",
        attributes: [],
      },
      {
        model: Colors,
        as: "colors",
        attributes: [],
      },
      {
        model: ClarityData,
        as: "claritys",
        attributes: [],
      },
      {
        model: CutsData,
        as: "cut_grades",
        attributes: [],
      },
      {
        model: Master,
        as: "polishs",
        attributes: [],
      },
      {
        model: Master,
        as: "symmetrys",
        attributes: [],
      },
      {
        model: Master,
        as: "fluorescence_intensitys",
        attributes: [],
      },
      {
        model: Master,
        as: "girdle_thicks",
        attributes: [],
      },
      {
        model: Master,
        as: "h_as",
        attributes: [],
      },
    ];
    const where = [
      {
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
        stock_id: stockNumber,
      },
    ];

    const diamond = await LooseDiamondGroupMasters.findOne({
      where,
      attributes: [
        "id",
        [Sequelize.literal('"shapes"."name"'), "shape"],
        [
          Sequelize.literal(
            `CASE WHEN total_price IS NULL THEN price_ct*weight ELSE total_price END`
          ),
          "price",
        ],
        [Sequelize.literal("weight"), "carat"],
        [Sequelize.literal('"cut_grades"."value"'), "cut"],
        [Sequelize.literal('"colors"."name"'), "color"],
        [Sequelize.literal('"claritys"."name"'), "clarity"],
        [Sequelize.literal("image_link"), "image_url"],
        [Sequelize.literal("video_link"), "video_url"],
        [Sequelize.literal("ARRAY[]::text[]"), "other_images_url"],
        [
          Sequelize.literal(
            `"loose_diamond_group_masters"."measurements"`
          ),
          "lw",
        ],
        [Sequelize.literal('"fluorescence_intensitys"."name"'), "fluor"],
        [Sequelize.literal('"symmetrys"."name"'), "symmetry"],
        [Sequelize.literal("table_per"), "table"],
        [
          Sequelize.literal(
            `ROUND(
              CASE
                WHEN btrim(split_part(
                  regexp_replace(
                    regexp_replace(measurements, '[xX]', '*', 'g'),
                    '[ ]*m{1,2}[ ]*',
                    '',
                    'gi'
                  ), '*', 1
                )) ~ '^[0-9]+(\.[0-9]+)?$'
                THEN btrim(split_part(
                  regexp_replace(
                    regexp_replace(measurements, '[xX]', '*', 'g'),
                    '[ ]*m{1,2}[ ]*',
                    '',
                    'gi'
                  ), '*', 1
                ))::NUMERIC
                ELSE NULL
              END
            )`
          ),
          "measurement_length",
        ],
        [
          Sequelize.literal(
            `ROUND(
  CASE
    WHEN btrim(split_part(
      regexp_replace(
        regexp_replace(measurements, '[xX]', '*', 'g'),
        '[ ]*m{1,2}[ ]*',
        '',
        'gi'
      ), '*', 2
    )) ~ '^[0-9]+(\.[0-9]+)?$'
    THEN btrim(split_part(
      regexp_replace(
        regexp_replace(measurements, '[xX]', '*', 'g'),
        '[ ]*m{1,2}[ ]*',
        '',
        'gi'
      ), '*', 2
    ))::NUMERIC
    ELSE NULL
  END
)
`         
          ),
          "measurement_width",
        ],
        [
          Sequelize.literal(
            `ROUND(
  CASE
    WHEN btrim(split_part(
      regexp_replace(
        regexp_replace(measurements, '[xX]', '*', 'g'),
        '[ ]*m{1,2}[ ]*',
        '',
        'gi'
      ), '*', 3
    )) ~ '^[0-9]+(\.[0-9]+)?$'
    THEN btrim(split_part(
      regexp_replace(
        regexp_replace(measurements, '[xX]', '*', 'g'),
        '[ ]*m{1,2}[ ]*',
        '',
        'gi'
      ), '*', 3
    ))::NUMERIC
    ELSE NULL
  END
) `
          ),
          "measurement_depth",
        ],
        [Sequelize.literal("culet_size"), "culet"],
        [Sequelize.literal('"polishs"."name"'), "polish"],
        [Sequelize.literal('"girdle_thicks"."name"'), "girdle"],
        [Sequelize.literal('"depth_per"'), "depth"],
        ["certificate", "report"],
        [Sequelize.literal('"stock_id"'), "stock_number"],
        [
          Sequelize.literal('"loose_diamond_group_masters"."stone_type"'),
          "diamond_origin",
        ],
        [Sequelize.literal('"certificate_url"'), "certificate_url"],
        [Sequelize.literal('"quantity"'), "quantity"],
        [
          Sequelize.literal('"remaining_quantity_count"'),
          "remaining_quantity_count",
        ],
      ],
      include,
    });

    if (diamond && diamond.dataValues) {
      return resSuccess({ data: diamond.dataValues });
    }

    return resNotFound();
  } catch (error) {
    throw error;
  }
};

/* ------------------------------------------------------------------------ Start single loose diamind CRUD ---------------------------------------------------------*/

export const getAllMasterDataForLooseDiamond = async (req: Request) => {

  try {
    const { StoneData, DiamondCaratSize, DiamondShape, Colors, ClarityData, CutsData, Master } = initModels(req);
    let client_id = req?.body?.session_res?.client_id;
    const commanWhere = { company_info_id: client_id, is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active }
    const commanAttributes = ["id", "name", "slug"];
    const Stone = await StoneData.findAll({ attributes: [...commanAttributes], where: { ...commanWhere } });
    const Stone_carat = await DiamondCaratSize.findAll({ attributes: ['id', ['value', 'name'], 'slug'], where: { ...commanWhere } });
    const Stone_shape = await DiamondShape.findAll({ attributes: [...commanAttributes], where: { ...commanWhere } });
    const Diamond_color = await Colors.findAll({ attributes: ['id', ['value', 'name'], 'slug'], where: { ...commanWhere } });
    const Diamond_clarity = await ClarityData.findAll({ attributes: ['id', ['value', 'name'], 'slug'], where: { ...commanWhere } });
    const Diamond_cut = await CutsData.findAll({ attributes: ['id', ['value', 'name'], 'slug'], where: { ...commanWhere } });
    const Diamond_certificate = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.Diamond_certificate } });
    const Diamond_process = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.Diamond_process } });
    const Preference = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.Preference } });
    const Availability = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.Availability } });
    const CutGrade = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.CutGrade } });
    const Polish = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.Polish } });
    const symmetry = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.symmetry } });
    const fluorescenceIntensity = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.fluorescenceIntensity } });
    const fluorescenceColor = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.fluorescenceColor } });
    const lab = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.lab } });
    const fancyColor = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.fancyColor } });
    const fancyColorIntensity = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.fancyColorIntensity } });
    const fancyColorOvertone = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.fancyColorOvertone } });
    const GirdleThin = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.GirdleThin } });
    const GirdleThick = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.GirdleThick } });
    const GirdleCondition = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.GirdleCondition } });
    const culetCondition = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.culetCondition } });
    const LaserInscription = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.LaserInscription } });
    const certComment = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.certComment } });
    const country = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.country } });
    const state = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.state } });
    const city = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.city } });
    const TimeToLocation = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.TimeToLocation } });
    const pairSeparable = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.pairSeparable } });
    const pairStock = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.pairStock } });
    const parcelStones = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.parcelStones } });
    const tradeShow = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.tradeShow } });
    const shade = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.shade } });
    const centerInclusion = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.centerInclusion } });
    const blackInclusion = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.blackInclusion } });
    const ReportType = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.ReportType } });
    const labLocation = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.labLocation } });
    const milky = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.milky } });
    const BGM = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.BGM } });
    const pair = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.pair } });
    const HandA = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.HandA } });
    const growthType = await Master.findAll({ attributes: [...commanAttributes], where: { ...commanWhere, master_type: Master_type.growthType } });

    // Send all data
    return resSuccess({
      data: {
        Stone,
        Stone_carat,
        Stone_shape,
        Diamond_color,
        Diamond_clarity,
        Diamond_cut,
        Diamond_certificate,
        Diamond_process,
        Preference,
        Availability,
        CutGrade,
        Polish,
        symmetry,
        fluorescenceIntensity,
        fluorescenceColor,
        lab,
        fancyColor,
        fancyColorIntensity,
        fancyColorOvertone,
        GirdleThin,
        GirdleThick,
        GirdleCondition,
        culetCondition,
        LaserInscription,
        certComment,
        country,
        state,
        city,
        TimeToLocation,
        pairSeparable,
        pairStock,
        parcelStones,
        tradeShow,
        shade,
        centerInclusion,
        blackInclusion,
        ReportType,
        labLocation,
        milky,
        BGM,
        pair,
        HandA,
        growthType,
      }
    });

  } catch (error) {
    return resUnknownError(error);
  }
};

export const addLooseDiamond = async (req: Request) => {
  let trn: any
  try {
    const {
      stock_id,
      availability,
      stone,
      stone_type,
      shape,
      weight,
      color,
      clarity,
      mm_size,
      seive_size,
      cut_grade,
      polish,
      symmetry,
      fluorescence_intensity,
      fluorescence_color,
      measurements,
      lab,
      certificate,
      certificate_url,
      fancy_color,
      fancy_color_intensity,
      fancy_color_overtone,
      depth_per,
      table_per,
      girdle_per,
      culet_size,
      sort_description,
      long_description,
      country,
      state,
      city,
      in_matched_pair_separable,
      pair_stock,
      image_link,
      video_link,
      growth_type,
      total_price,
      price_ct,
      quantity,
      session_res
    } = req.body;
    const { LooseDiamondGroupMasters,StockChangeLog } = initModels(req);
    trn = await req.body.db_connection.transaction();

    if (!Object.values(DIAMOND_ORIGIN)?.includes(stone_type)) {
      return resNotFound({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Stone type"]])
      })
    }

    const findStock = await LooseDiamondGroupMasters.findOne({ where: { stock_id: stock_id, is_deleted: DeletedStatus.No, company_info_id: session_res?.client_id }, transaction: trn });

    if (findStock && findStock.dataValues) {
      await trn.rollback();
      return resBadRequest({
        code: DUPLICATE_ERROR_CODE,
        message: prepareMessageFromParams(DUPLICATE_VALUE_ERROR_MESSAGE, [["field_name", "stock"]]),
      });
    }

    const looseDiamondGroupMasters = await LooseDiamondGroupMasters.create({
      stock_id,
      availability,
      stone,
      stone_type,
      shape,
      weight,
      color,
      clarity,
      mm_size,
      seive_size,
      cut_grade,
      polish,
      symmetry,
      fluorescence_intensity,
      fluorescence_color,
      measurements,
      lab,
      certificate,
      certificate_url,
      fancy_color,
      fancy_color_intensity,
      fancy_color_overtone,
      depth_per,
      table_per,
      girdle_per,
      culet_size,
      sort_description,
      long_description,
      country,
      state,
      city,
      in_matched_pair_separable,
      pair_stock,
      image_link,
      video_link,
      growth_type,
      total_price,
      price_ct,
      quantity,
      remaining_quantity_count: quantity,
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: session_res?.id_app_user,
      company_info_id: session_res?.client_id,
      created_at: getLocalDate()
    }, { transaction: trn });

    const stockChangeLogPayload = {
      product_id: looseDiamondGroupMasters.dataValues.id,
      variant_id: null,
      product_type: STOCK_PRODUCT_TYPE.LooseDiamond,
      sku: looseDiamondGroupMasters.dataValues.stock_id,
      prev_quantity: 0,
      new_quantity: looseDiamondGroupMasters.dataValues.remaining_quantity_count || 0,
      transaction_type: STOCK_TRANSACTION_TYPE.StockUpdate,
      changed_by: looseDiamondGroupMasters.dataValues.created_by,
      company_info_id: session_res?.client_id,
      email: null,
      change_date: getLocalDate(),
    };
    const stockLog = await StockChangeLog.create(stockChangeLogPayload, { transaction: trn });
    addActivityLogs(session_res?.client_id, [{
      old_data: null,
      new_data: { loose_diamond_id: looseDiamondGroupMasters?.dataValues?.id, data: { ...looseDiamondGroupMasters?.dataValues }, stock_log_id: stockLog?.dataValues?.id, stock_log_data: { ...stockLog?.dataValues } }
    }], looseDiamondGroupMasters?.dataValues?.id, LogsActivityType.Add, LogsType.LooseDiamondSingle, session_res?.id_app_user, trn)
    await trn.commit();
    return resSuccess({ data: looseDiamondGroupMasters });
  } catch (e) {
    if (trn) {
      await trn.rollback();
    }
    return resUnknownError(e);
  }
}

export const updateLooseDiamond = async (req: Request) => {
  let trn: any;
  try {
    const { id } = req.params
    const {
      stock_id,
      availability,
      stone,
      stone_type,
      shape,
      weight,
      color,
      clarity,
      mm_size,
      seive_size,
      cut_grade,
      polish,
      symmetry,
      fluorescence_intensity,
      fluorescence_color,
      measurements,
      lab,
      certificate,
      certificate_url,
      fancy_color,
      fancy_color_intensity,
      fancy_color_overtone,
      depth_per,
      table_per,
      girdle_per,
      culet_size,
      sort_description,
      long_description,
      country,
      state,
      city,
      in_matched_pair_separable,
      pair_stock,
      image_link,
      video_link,
      growth_type,
      total_price,
      price_ct,
      quantity,
      session_res
    } = req.body;
    const {LooseDiamondGroupMasters,StockChangeLog} = initModels(req);
    if (!Object.values(DIAMOND_ORIGIN)?.includes(stone_type)) {
      return resNotFound({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Stone type"]])
      })
    }

    trn = await req.body.db_connection.transaction();

    const besforUpdatedLooseDiamond = await LooseDiamondGroupMasters.findOne({ where: { id: id, is_deleted: DeletedStatus.No, company_info_id: session_res?.client_id }, transaction: trn });
    if (!(besforUpdatedLooseDiamond && besforUpdatedLooseDiamond.dataValues)) {
      await trn.rollback();
      return resNotFound({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Stock"]]),
      });
    }

    const findSameStock = await LooseDiamondGroupMasters.findOne({
      where: {
        stock_id: stock_id,
        is_deleted: DeletedStatus.No,
        id: { [Op.ne]: besforUpdatedLooseDiamond?.dataValues?.id },
        company_info_id: session_res?.client_id
      }
    })

    if (findSameStock && findSameStock.dataValues) {
      await trn.rollback()
      return resBadRequest({
        code: DUPLICATE_ERROR_CODE,
        message: prepareMessageFromParams(DUPLICATE_VALUE_ERROR_MESSAGE, [["field_name", "Stock"]]),
      });
    }

    const looseDiamondGroupMasters = await LooseDiamondGroupMasters.update({
      stock_id,
      availability,
      stone,
      stone_type,
      shape,
      weight,
      color,
      clarity,
      mm_size,
      seive_size,
      cut_grade,
      polish,
      symmetry,
      fluorescence_intensity,
      fluorescence_color,
      measurements,
      lab,
      certificate,
      certificate_url,
      fancy_color,
      fancy_color_intensity,
      fancy_color_overtone,
      depth_per,
      table_per,
      girdle_per,
      culet_size,
      sort_description,
      long_description,
      country,
      state,
      city,
      in_matched_pair_separable,
      pair_stock,
      image_link,
      video_link,
      growth_type,
      total_price,
      price_ct,
      quantity: besforUpdatedLooseDiamond.dataValues.quantity
        ? besforUpdatedLooseDiamond.dataValues.quantity +
        (Number(quantity) -
          (besforUpdatedLooseDiamond.dataValues.remaining_quantity_count || 0))
        : quantity,
      remaining_quantity_count: quantity,
      modified_by: session_res?.id_app_user,
      modified_at: getLocalDate(),
      company_info_id: session_res?.client_id,
    }, { where: { id: id }, transaction: trn });

    const stockChangeLogPayload = {
      product_id: id,
      variant_id: null,
      product_type: STOCK_PRODUCT_TYPE.LooseDiamond,
      sku: stock_id,
      prev_quantity: 0,
      new_quantity: quantity,
      transaction_type: STOCK_TRANSACTION_TYPE.StockUpdate,
      changed_by: session_res?.id_app_user,
      company_info_id: session_res?.client_id,
      email: null,
      change_date: getLocalDate(),
    };
    const afterStockLog = await StockChangeLog.create(stockChangeLogPayload, { transaction: trn });

    const afterUpdatedLooseDiamond = await LooseDiamondGroupMasters.findOne({ where: { id: id, is_deleted: DeletedStatus.No, company_info_id: session_res?.client_id }, transaction: trn });

    addActivityLogs(session_res?.client_id, [{
      old_data: { loose_diamond_id: besforUpdatedLooseDiamond?.dataValues?.id, data: { ...besforUpdatedLooseDiamond?.dataValues }, stock_log_id: null, stock_log_data: null },
      new_data: { loose_diamond_id: afterUpdatedLooseDiamond?.dataValues?.id, data: { ...afterUpdatedLooseDiamond?.dataValues }, stock_log_id: afterStockLog?.dataValues?.id, stock_log_data: { ...afterStockLog?.dataValues } }

    }], besforUpdatedLooseDiamond?.dataValues?.id, LogsActivityType.Add, LogsType.LooseDiamondSingle, session_res?.id_app_user, trn)
    await trn.commit();
    return resSuccess({ data: looseDiamondGroupMasters });
  } catch (e) {
    if (trn) {
      await trn.rollback();
    }
    return resUnknownError(e)
  }
}

export const statusUpdateLooseDiamond = async (req: Request) => {
  try {
    const {LooseDiamondGroupMasters} = initModels(req);
    const LooseDiamondExists = await LooseDiamondGroupMasters.findOne({ where: { id: req.params.id, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id } });
    if (LooseDiamondExists) {
      const LooseDiamondActionInfo = await (LooseDiamondGroupMasters.update(
        {
          is_active: statusUpdateValue(LooseDiamondExists),
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        },
        { where: { id: LooseDiamondExists.dataValues.id, company_info_id: req?.body?.session_res?.client_id } }
      ));
      if (LooseDiamondActionInfo) {
        await addActivityLogs(req,req?.body?.session_res?.client_id, [{
          old_data: { loose_diamond_id: LooseDiamondExists?.dataValues?.id, data: { ...LooseDiamondExists?.dataValues } },
          new_data: {
            loose_diamond_id: LooseDiamondExists?.dataValues?.id, data: {
              ...LooseDiamondExists?.dataValues, is_active: statusUpdateValue(LooseDiamondExists),
              modified_date: getLocalDate(),
              modified_by: req?.body?.session_res?.id_app_user,
            }
          }
        }], LooseDiamondExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.LooseDiamondSingle, req?.body?.session_res?.id_app_user)

        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
      }
    } else {
      return resNotFound({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [
          ["field_name", "Stock"],
        ])
      });
    }
  } catch (error) {
    throw error
  }
}