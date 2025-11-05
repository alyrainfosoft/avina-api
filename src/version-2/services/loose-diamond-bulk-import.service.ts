import { Request } from "express";
import {
  getInitialPaginationFromQuery,
  getListFromToValues,
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../utils/shared-functions";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  ERROR_NOT_FOUND,
  FILE_NOT_FOUND,
  INVALID_HEADER,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  REQUIRED_ERROR_MESSAGE,
} from "../../utils/app-messages";
import {
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../config/env.var";
import ProductBulkUploadFile from "../../model/product-bulk-upload-file.model";
import {
  ActiveStatus,
  DeletedStatus,
  DIAMOND_INVENTROY_TYPE,
  DIAMOND_ORIGIN,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  Master_type,
  STOCK_PRODUCT_TYPE,
  STOCK_TRANSACTION_TYPE,
} from "../../utils/app-enumeration";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import LooseDiamondGroupMasters from "../model/loose-diamond-group-master.model";
import dbContext from "../../config/db-context";
import {
  moveFileToLocation,
  moveFileToS3ByTypeAndLocation,
} from "../../helpers/file.helper";
import Master from "../model/master/master.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import Colors from "../model/master/attributes/colors.model";
import ClarityData from "../model/master/attributes/clarity.model";
import CutsData from "../model/master/attributes/cuts.model";
import Gemstones from "../model/master/attributes/gemstones.model";
import BrandData from "../model/master/attributes/brands.model";
import { col, Op, Sequelize } from "sequelize";
import { PRODUCT_FILE_LOCATION } from "../../utils/app-constants";
import {
  DIAMOND_CLARITY,
  DIAMOND_COLORS,
  DIAMOND_CUT,
  DIAMOND_POLISH,
  DIAMOND_SYMMETRY,
  getRapnetDiamonds,
  getVDBDiamondByStockNumber,
  getVDBDiamonds,
} from "./tp-diamond.service";
import { IDiamondFilter } from "../../data/interfaces/diamond/diamond.interface";
import StockChangeLog from "../model/stock-change-log.model";

const readXlsxFile = require("read-excel-file/node");

export const addLooseDiamondCSVFile = async (req: Request) => {
  try {
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
      req.file.originalname
    );

    if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resMFTL;
    }

    const resPBUF = await ProductBulkUploadFile.create({
      file_path: resMFTL.data,
      status: FILE_STATUS.Uploaded,
      file_type: FILE_BULK_UPLOAD_TYPE.DiamondGroupUpload,
      created_by: req.body.session_res.id_app_user,
      created_date: getLocalDate(),
    });

    const resPDBUF = await processDiamondGroupBulkUploadFile(
      resPBUF.dataValues.id,
      resMFTL.data,
      req.body.session_res.id_app_user
    );

    return resSuccess({ data: resPDBUF });
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
  } catch (e) {}
  return errorDetail;
};

const processDiamondGroupBulkUploadFile = async (
  id: number,
  path: string,
  idAppUser: number
) => {
  try {
    const data = await processCSVFile(path, idAppUser);
    console.log("datas", data);
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
    } catch (e) {}
  }
};

const processCSVFile = async (path: string, idAppUser: number) => {
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
      idAppUser
    );
    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addGroupToDB(resProducts.data);
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
          row && row.forEach((header: any) => {
            headers.push(header);
          });
          headerList = headers;
          rows.shift();

          //Data
          rows.forEach((row: any) => {
            let data = {
              "stock #": row[0],
              Availability: row[1],
              stone: row[2],
              "stone type": row[3],
              shape: row[4],
              weight: row[5],
              color: row[6],
              clarity: row[7],
              mm_size: row[8],
              seive_size: row[9],
              "cut grade": row[10],
              "%off RAP": row[11],
              polish: row[12],
              Symmetry: row[13],
              "Fluorescence Intensity": row[14],
              "Fluorescence color": row[15],
              measurements: row[16],
              lab: row[17],
              Certificate: row[18],
              "Certificate url": row[19],
              treatment: row[20],
              "fancy color": row[21],
              "fancy color intensity": row[22],
              "fancy color overtone": row[23],
              "depth %": row[24],
              "Table %": row[25],
              "Girdle thin": row[26],
              "Girdle thick": row[27],
              "Girdle %": row[28],
              "Girdle condition": row[29],
              "culet size": row[30],
              "culet condition": row[31],
              "crown height": row[32],
              "crown angle": row[33],
              "pavilion depth": row[34],
              "pavilion angle": row[35],
              "laser inscription": row[36],
              "cert comment": row[37],
              "Sort Description": row[38],
              "Long Description": row[39],
              Country: row[40],
              State: row[41],
              City: row[42],
              "time to location": row[43],
              "In matched pair separable": row[44],
              "pair stock #": row[45],
              "parcel stone": row[46],
              "image link": row[47],
              "video link": row[48],
              "Sari Loupe": row[49],
              "trade show": row[50],
              "key of symbols": row[51],
              shade: row[52],
              "star length": row[53],
              "center inclusion": row[54],
              "black inclusion": row[55],
              "member comment": row[56],
              "report issue date": row[57],
              "report type": row[58],
              "lab location": row[59],
              brand: row[60],
              milky: row[61],
              "eye clean": row[62],
              "H&A": row[63],
              BGM: row[64],
              "Growth type": row[65],
              "total price": row[66],
              "price/ct": row[67],
              quantity: row[68],
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
  console.log(name, fieldName, field_name);
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
    "Availability",
    "stone",
    "stone type",
    "shape",
    "weight",
    "color",
    "clarity",
    "mm_size",
    "seive_size",
    "cut grade",
    "%off RAP",
    "polish",
    "Symmetry",
    "Fluorescence Intensity",
    "Fluorescence color",
    "measurements",
    "lab",
    "Certificate",
    "Certificate url",
    "treatment",
    "fancy color",
    "fancy color intensity",
    "fancy color overtone",
    "depth %",
    "Table %",
    "Girdle thin",
    "Girdle thick",
    "Girdle %",
    "Girdle condition",
    "culet size",
    "culet condition",
    "crown height",
    "crown angle",
    "pavilion depth",
    "pavilion angle",
    "laser inscription",
    "cert comment",
    "Sort Description",
    "Long Description",
    "Country",
    "State",
    "City",
    "time to location",
    "In matched pair separable",
    "pair stock #",
    "parcel stone",
    "image link",
    "video link",
    "Sari Loupe",
    "trade show",
    "key of symbols",
    "shade",
    "star length",
    "center inclusion",
    "black inclusion",
    "member comment",
    "report issue date",
    "report type",
    "lab location",
    "brand",
    "milky",
    "eye clean",
    "H&A",
    "BGM",
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
  for (i = 0; i < headers.length; i++) {
    if (headers[i].trim() != DIAMOND_GROUP_BULK_UPLOAD_HEADERS[i]) {
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

const getDiamondGroupFromRows = async (rows: any, idAppUser: any) => {
  let currenGroupIndex = -1;
  try {
    let errors: {
      row_id: number;
      error_message: string;
    }[] = [];
    const availabilityList = await Master.findAll({
      where: {
        master_type: Master_type.Availability,
        is_deleted: DeletedStatus.No,
      },
    });
    const stoneList = await Gemstones.findAll({
      where: {
        is_deleted: DeletedStatus.No,
      },
    });
    const shapeList = await DiamondShape.findAll({
      where: {
        is_deleted: DeletedStatus.No,
      },
    });
    const colorList = await Colors.findAll({
      where: {
        is_deleted: DeletedStatus.No,
      },
    });
    const clarityList = await ClarityData.findAll({
      where: {
        is_deleted: DeletedStatus.No,
      },
    });

    const CutGradeList = await CutsData.findAll({
      where: {
        is_deleted: DeletedStatus.No,
      },
    });
    const polishList = await Master.findAll({
      where: {
        master_type: Master_type.Polish,
        is_deleted: DeletedStatus.No,
      },
    });
    const SymmetryList = await Master.findAll({
      where: {
        master_type: Master_type.symmetry,
        is_deleted: DeletedStatus.No,
      },
    });
    const fluorescenceIntensityList = await Master.findAll({
      where: {
        master_type: Master_type.fluorescenceIntensity,
        is_deleted: DeletedStatus.No,
      },
    });
    const fluorescenceColorList = await Master.findAll({
      where: {
        master_type: Master_type.fluorescenceColor,
        is_deleted: DeletedStatus.No,
      },
    });
    const labList = await Master.findAll({
      where: {
        master_type: Master_type.lab,
        is_deleted: DeletedStatus.No,
      },
    });
    const certificateList = await Master.findAll({
      where: {
        master_type: Master_type.Diamond_certificate,
        is_deleted: DeletedStatus.No,
      },
    });
    const fancyColorList = await Master.findAll({
      where: {
        master_type: Master_type.fancyColor,
        is_deleted: DeletedStatus.No,
      },
    });
    const fancyColorOvertoneList = await Master.findAll({
      where: {
        master_type: Master_type.fancyColorOvertone,
        is_deleted: DeletedStatus.No,
      },
    });
    const fancyColorIntensityList = await Master.findAll({
      where: {
        master_type: Master_type.fancyColorIntensity,
        is_deleted: DeletedStatus.No,
      },
    });
    const girdleThinList = await Master.findAll({
      where: {
        master_type: Master_type.GirdleThin,
        is_deleted: DeletedStatus.No,
      },
    });
    const girdleConditionList = await Master.findAll({
      where: {
        master_type: Master_type.GirdleCondition,
        is_deleted: DeletedStatus.No,
      },
    });
    const culetConditionList = await Master.findAll({
      where: {
        master_type: Master_type.culetCondition,
        is_deleted: DeletedStatus.No,
      },
    });
    const laserInscriptionList = await Master.findAll({
      where: {
        master_type: Master_type.LaserInscription,
        is_deleted: DeletedStatus.No,
      },
    });
    const certCommentList = await Master.findAll({
      where: {
        master_type: Master_type.certComment,
        is_deleted: DeletedStatus.No,
      },
    });
    const countryList = await Master.findAll({
      where: {
        master_type: Master_type.country,
        is_deleted: DeletedStatus.No,
      },
    });
    const stateList = await Master.findAll({
      where: {
        master_type: Master_type.state,
        is_deleted: DeletedStatus.No,
      },
    });

    const cityList = await Master.findAll({
      where: {
        master_type: Master_type.city,
        is_deleted: DeletedStatus.No,
      },
    });
    const timeToLocationList = await Master.findAll({
      where: {
        master_type: Master_type.TimeToLocation,
        is_deleted: DeletedStatus.No,
      },
    });
    const pairStockList = await Master.findAll({
      where: {
        master_type: Master_type.pairStock,
        is_deleted: DeletedStatus.No,
      },
    });
    const tradeShowList = await Master.findAll({
      where: {
        master_type: Master_type.tradeShow,
        is_deleted: DeletedStatus.No,
      },
    });
    const parcelStonesList = await Master.findAll({
      where: {
        master_type: Master_type.parcelStones,
        is_deleted: DeletedStatus.No,
      },
    });
    const shadeList = await Master.findAll({
      where: {
        master_type: Master_type.shade,
        is_deleted: DeletedStatus.No,
      },
    });
    const centerInclusionList = await Master.findAll({
      where: {
        master_type: Master_type.centerInclusion,
        is_deleted: DeletedStatus.No,
      },
    });
    const blackInclusionList = await Master.findAll({
      where: {
        master_type: Master_type.blackInclusion,
        is_deleted: DeletedStatus.No,
      },
    });
    const brandList = await BrandData.findAll({
      where: {
        is_deleted: DeletedStatus.No,
      },
    });
    const milkyList = await Master.findAll({
      where: {
        master_type: Master_type.milky,
        is_deleted: DeletedStatus.No,
      },
    });
    const bgmList = await Master.findAll({
      where: {
        master_type: Master_type.BGM,
        is_deleted: DeletedStatus.No,
      },
    });
    const pairList = await Master.findAll({
      where: {
        master_type: Master_type.pair,
        is_deleted: DeletedStatus.No,
      },
    });
    const hAndAList = await Master.findAll({
      where: {
        master_type: Master_type.HandA,
        is_deleted: DeletedStatus.No,
      },
    });
    const growthTypeList = await Master.findAll({
      where: {
        master_type: Master_type.growthType,
        is_deleted: DeletedStatus.No,
      },
    });
    const diamondGroupMasterList = await LooseDiamondGroupMasters.findAll({
      where: {
        is_deleted: DeletedStatus.No,
      },
    });
    let updatedDiamondList = [];
    let createdDiamondList = [];
    console.log(rows);
    for (const row of rows) {
      currenGroupIndex++;
      if (row["stock #"]) {
        if (row.Availability == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Availability"],
            ]),
          });
        }
        if (row.stone == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "stone"],
            ]),
          });
        }
        if (row["stone type"] == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "stone type"],
            ]),
          });
        }
        if (row.shape == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "shape"],
            ]),
          });
        }
        if (row.weight == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Weight"],
            ]),
          });
        }
        if (row.color == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "color"],
            ]),
          });
        }
        if (row.clarity == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Clarity"],
            ]),
          });
        }
        if (row["cut grade"] == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "cut grade"],
            ]),
          });
        }
        if (row.measurements == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "measurements"],
            ]),
          });
        }
        if (row.shade == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "shade"],
            ]),
          });
        }
        if (row["total price"] == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Total price"],
            ]),
          });
        }
        if (row["price/ct"] == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "price/ct"],
            ]),
          });
        }
        if (row.quantity == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "quantity"],
            ]),
          });
        }

        let availability: any = getIdFromName(
          row.Availability,
          availabilityList,
          "name",
          "Availability"
        );
        if (availability && availability.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: availability.error,
          });
        } else if (availability && availability.data) {
          availability = availability?.data;
        } else {
          availability = null;
        }

        let stone: any = getIdFromName(row.stone, stoneList, "name", "stone");
        if (stone && stone.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: stone.error,
          });
        } else if (stone && stone.data) {
          stone = stone?.data;
        } else {
          stone = null;
        }

        let stone_type: any = row["stone type"];

        let shape: any = getIdFromName(row.shape, shapeList, "name", "shape");
        if (shape && shape.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: shape.error,
          });
        } else if (shape && shape.data) {
          shape = shape?.data;
        } else {
          shape = null;
        }
        let weight: any = row["weight"];

        let color: any = getIdFromName(row.color, colorList, "name", "color");
        if (color && color.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: color.error,
          });
        } else if (color && color.data) {
          color = color?.data;
        } else {
          color = null;
        }

        let clarity: any = getIdFromName(
          row.clarity,
          clarityList,
          "name",
          "clarity"
        );
        if (clarity && clarity.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: clarity.error,
          });
        } else if (clarity && clarity.data) {
          clarity = clarity?.data;
        } else {
          clarity = null;
        }

        let mm_size: any = row.mm_size;
        let seive_size: any = row.seive_size;

        let cut_grade: any = getIdFromName(
          row["cut grade"],
          CutGradeList,
          "value",
          "cut grade"
        );
        if (cut_grade && cut_grade.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: cut_grade.error,
          });
        } else if (cut_grade && cut_grade.data) {
          cut_grade = cut_grade?.data;
        } else {
          cut_grade = null;
        }

        let off_RAP: any = row["%off RAP"];
        let polish: any = getIdFromName(
          row["polish"],
          polishList,
          "name",
          "polish"
        );
        if (polish && polish.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: polish.error,
          });
        } else if (polish && polish.data) {
          polish = polish?.data;
        } else {
          polish = null;
        }

        let symmetry: any = getIdFromName(
          row["Symmetry"],
          SymmetryList,
          "name",
          "Symmetry"
        );
        if (symmetry && symmetry.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: symmetry.error,
          });
        } else if (symmetry && symmetry.data) {
          symmetry = symmetry?.data;
        } else {
          symmetry = null;
        }

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
            row_id: currenGroupIndex + 1 + 1,
            error_message: fluorescence_intensity.error,
          });
        } else if (fluorescence_intensity && fluorescence_intensity.data) {
          fluorescence_intensity = fluorescence_intensity?.data;
        } else {
          fluorescence_intensity = null;
        }

        let fluorescence_color: any = getIdFromName(
          row["Fluorescence color"],
          fluorescenceColorList,
          "name",
          "Fluorescence color"
        );
        if (fluorescence_color && fluorescence_color.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: fluorescence_color.error,
          });
        } else if (fluorescence_color && fluorescence_color.data) {
          fluorescence_color = fluorescence_color?.data;
        } else {
          fluorescence_color = null;
        }

        let measurements: any = row["measurements"];
        let lab: any = getIdFromName(row["lab"], labList, "name", "lab");
        if (lab && lab.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: lab.error,
          });
        } else if (lab && lab.data) {
          lab = lab?.data;
        } else {
          lab = null;
        }

        let certificate: any = getIdFromName(
          row["Certificate"],
          certificateList,
          "name",
          "Certificate"
        );
        if (certificate && certificate.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: certificate.error,
          });
        } else if (certificate && certificate.data) {
          certificate = certificate?.data;
        } else {
          certificate = null;
        }

        let certificate_url: any = row["Certificate url"];
        let treatment: any = row["treatment"];

        let fancy_color: any = getIdFromName(
          row["fancy color"],
          fancyColorList,
          "name",
          "fancy color"
        );
        if (fancy_color && fancy_color.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: fancy_color.error,
          });
        } else if (fancy_color && fancy_color.data) {
          fancy_color = fancy_color?.data;
        } else {
          fancy_color = null;
        }

        let fancy_color_intensity: any = getIdFromName(
          row["fancy color intensity"],
          fancyColorIntensityList,
          "name",
          "fancy color intensity"
        );
        if (fancy_color_intensity && fancy_color_intensity.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: fancy_color_intensity.error,
          });
        } else if (fancy_color_intensity && fancy_color_intensity.data) {
          fancy_color_intensity = fancy_color_intensity?.data;
        } else {
          fancy_color_intensity = null;
        }

        let fancy_color_overtone: any = getIdFromName(
          row["fancy color overtone"],
          fancyColorOvertoneList,
          "name",
          "fancy color overtone"
        );
        if (fancy_color_overtone && fancy_color_overtone.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: fancy_color_overtone.error,
          });
        } else if (fancy_color_overtone && fancy_color_overtone.data) {
          fancy_color_overtone = fancy_color_overtone?.data;
        } else {
          fancy_color_overtone = null;
        }

        let depth_per: any = row["depth %"];
        let table_per: any = row["Table %"];
        let girdle_thin: any = getIdFromName(
          row["Girdle thin"],
          girdleThinList,
          "name",
          "Girdle thin"
        );
        if (girdle_thin && girdle_thin.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: girdle_thin.error,
          });
        } else if (girdle_thin && girdle_thin.data) {
          girdle_thin = girdle_thin?.data;
        } else {
          girdle_thin = null;
        }

        let girdle_thick: any = getIdFromName(
          row["Girdle thick"],
          girdleThinList,
          "name",
          "Girdle thick"
        );
        if (girdle_thick && girdle_thick.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: girdle_thick.error,
          });
        } else if (girdle_thick && girdle_thick.data) {
          girdle_thick = girdle_thick?.data;
        } else {
          girdle_thick = null;
        }

        let girdle_per = row["Girdle %"];

        let girdle_condition: any = getIdFromName(
          row["Girdle condition"],
          girdleConditionList,
          "name",
          "Girdle condition"
        );
        if (girdle_condition && girdle_condition.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: girdle_condition.error,
          });
        } else if (girdle_condition && girdle_condition.data) {
          girdle_condition = girdle_condition?.data;
        } else {
          girdle_condition = null;
        }

        let culet_size = row["culet size"];

        let culet_condition: any = getIdFromName(
          row["culet condition"],
          culetConditionList,
          "name",
          "culet condition"
        );
        if (culet_condition && culet_condition.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: culet_condition.error,
          });
        } else if (culet_condition && culet_condition.data) {
          culet_condition = culet_condition?.data;
        } else {
          culet_condition = null;
        }

        let crown_height = row["crown height"];
        let crown_angle = row["crown angle"];
        let pavilion_depth = row["pavilion depth"];
        let pavilion_angle = row["pavilion angle"];
        let laser_inscription: any = getIdFromName(
          row["laser inscription"],
          laserInscriptionList,
          "name",
          "laser inscription"
        );
        if (laser_inscription && laser_inscription.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: laser_inscription.error,
          });
        } else if (laser_inscription && laser_inscription.data) {
          laser_inscription = laser_inscription?.data;
        } else {
          laser_inscription = null;
        }

        let cert_comment: any = getIdFromName(
          row["cert comment"],
          certCommentList,
          "name",
          "cert comment"
        );
        if (cert_comment && cert_comment.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: cert_comment.error,
          });
        } else if (cert_comment && cert_comment.data) {
          cert_comment = cert_comment?.data;
        } else {
          cert_comment = null;
        }

        let sort_description = row["Sort Description"];
        let long_description = row["Long Description"];
        let country: any = getIdFromName(
          row["country"],
          countryList,
          "name",
          "country"
        );
        if (country && country.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: country.error,
          });
        } else if (country && country.data) {
          country = country?.data;
        } else {
          country = null;
        }

        let state: any = getIdFromName(
          row["State"],
          stateList,
          "name",
          "State"
        );
        if (state && state.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: state.error,
          });
        } else if (state && state.data) {
          state = state?.data;
        } else {
          state = null;
        }

        let city: any = getIdFromName(row["City"], cityList, "name", "City");
        if (city && city.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: city.error,
          });
        } else if (city && city.data) {
          city = city?.data;
        } else {
          city = null;
        }

        let time_to_location: any = getIdFromName(
          row["time to location"],
          timeToLocationList,
          "name",
          "time to location"
        );
        if (time_to_location && time_to_location.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: time_to_location.error,
          });
        } else if (time_to_location && time_to_location.data) {
          time_to_location = time_to_location?.data;
        } else {
          time_to_location = null;
        }

        let in_matched_pair_separable: any = row["In matched pair separable"];

        let pair_stock: any = getIdFromName(
          row["pair stock #"],
          pairStockList,
          "name",
          "pair stock #"
        );
        if (pair_stock && pair_stock.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: pair_stock.error,
          });
        } else if (pair_stock && pair_stock.data) {
          pair_stock = pair_stock?.data;
        } else {
          pair_stock = null;
        }

        let parcel_stone: any = getIdFromName(
          row["parcel stone"],
          parcelStonesList,
          "name",
          "parcel stone"
        );
        if (parcel_stone && parcel_stone.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: parcel_stone.error,
          });
        } else if (parcel_stone && parcel_stone.data) {
          parcel_stone = parcel_stone?.data;
        } else {
          parcel_stone = null;
        }

        let image_link: any = row["image link"];
        let video_link: any = row["video link"];
        let sari_loupe: any = row["Sari Loupe"];

        let trade_show: any = getIdFromName(
          row["trade show"],
          tradeShowList,
          "name",
          "trade show"
        );
        if (trade_show && trade_show.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: trade_show.error,
          });
        } else if (trade_show && trade_show.data) {
          trade_show = trade_show?.data;
        } else {
          trade_show = null;
        }

        let key_of_symbols = row["key of symbols"];

        let shade: any = getIdFromName(
          row["shade"],
          shadeList,
          "name",
          "shade"
        );
        if (shade && shade.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: shade.error,
          });
        } else if (shade && shade.data) {
          shade = shade?.data;
        } else {
          shade = null;
        }

        let star_length = row["star length"];

        let center_inclusion: any = getIdFromName(
          row["center inclusion"],
          centerInclusionList,
          "name",
          "center_inclusion"
        );
        if (center_inclusion && center_inclusion.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: center_inclusion.error,
          });
        } else if (center_inclusion && center_inclusion.data) {
          center_inclusion = center_inclusion?.data;
        } else {
          center_inclusion = null;
        }

        let black_inclusion: any = getIdFromName(
          row["black inclusion"],
          blackInclusionList,
          "name",
          "black inclusion"
        );
        if (black_inclusion && black_inclusion.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: black_inclusion.error,
          });
        } else if (black_inclusion && black_inclusion.data) {
          black_inclusion = black_inclusion?.data;
        } else {
          black_inclusion = null;
        }

        let member_comment: any = row["member comment"];
        let report_issue_date: any = row["report issue date"];
        let report_type: any = row["report type"];
        let lab_location: any = row["lab location"];

        let brand: any = getIdFromName(
          row["brand"],
          brandList,
          "name",
          "brand"
        );
        if (brand && brand.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: brand.error,
          });
        } else if (brand && brand.data) {
          brand = brand?.data;
        } else {
          brand = null;
        }

        let milky: any = getIdFromName(
          row["milky"],
          milkyList,
          "name",
          "milky"
        );
        if (milky && milky.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: milky.error,
          });
        } else if (milky && milky.data) {
          milky = milky?.data;
        } else {
          milky = null;
        }

        let eye_clean: any = row["eye clean"];

        let h_a: any = getIdFromName(row["H&A"], hAndAList, "name", "H&A");
        if (h_a && h_a.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: h_a.error,
          });
        } else if (h_a && h_a.data) {
          h_a = h_a?.data;
        } else {
          h_a = null;
        }

        let bgm: any = getIdFromName(row["BGM"], bgmList, "name", "BGM");
        if (bgm && bgm.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: bgm.error,
          });
        } else if (bgm && bgm.data) {
          bgm = bgm?.data;
        } else {
          bgm = null;
        }

        let total_price: any = row["total price"];
        let price_ct: any = row["price/ct"];

        let growth_type: any = getIdFromName(
          row["Growth type"],
          growthTypeList,
          "name",
          "Growth type"
        );
        if (growth_type && growth_type.error != undefined) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: growth_type.error,
          });
        } else if (growth_type && growth_type.data) {
          growth_type = growth_type?.data;
        } else {
          growth_type = null;
        }
        const findDiamond = await diamondGroupMasterList.find(
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
            off_RAP,
            polish,
            symmetry,
            fluorescence_intensity,
            fluorescence_color,
            measurements,
            lab,
            certificate,
            certificate_url,
            treatment,
            fancy_color,
            fancy_color_intensity,
            fancy_color_overtone,
            depth_per,
            table_per,
            girdle_thin,
            girdle_thick,
            girdle_per,
            girdle_condition,
            culet_size,
            culet_condition,
            crown_height,
            crown_angle,
            pavilion_depth,
            pavilion_angle,
            laser_inscription,
            cert_comment,
            sort_description,
            long_description,
            country,
            state,
            city,
            time_to_location,
            in_matched_pair_separable,
            pair_stock,
            parcel_stone,
            image_link,
            video_link,
            sari_loupe,
            trade_show,
            key_of_symbols,
            shade,
            star_length,
            center_inclusion,
            black_inclusion,
            member_comment,
            report_issue_date,
            report_type,
            lab_location,
            brand,
            milky,
            eye_clean,
            h_a,
            bgm,
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
            off_RAP,
            polish,
            symmetry,
            fluorescence_intensity,
            fluorescence_color,
            measurements,
            lab,
            certificate,
            certificate_url,
            treatment,
            fancy_color,
            fancy_color_intensity,
            fancy_color_overtone,
            depth_per,
            table_per,
            girdle_thin,
            girdle_thick,
            girdle_per,
            girdle_condition,
            culet_size,
            culet_condition,
            crown_height,
            crown_angle,
            pavilion_depth,
            pavilion_angle,
            laser_inscription,
            cert_comment,
            sort_description,
            long_description,
            country,
            state,
            city,
            time_to_location,
            in_matched_pair_separable,
            pair_stock,
            parcel_stone,
            image_link,
            video_link,
            sari_loupe,
            trade_show,
            key_of_symbols,
            shade,
            star_length,
            center_inclusion,
            black_inclusion,
            member_comment,
            report_issue_date,
            report_type,
            lab_location,
            brand,
            milky,
            eye_clean,
            h_a,
            bgm,
            growth_type,
            total_price,
            price_ct,
            quantity: row["quantity"],
            remaining_quantity_count: row["quantity"],
            prev_quantity: 0,
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No,
            created_by: idAppUser,
            created_at: getLocalDate(),
          });
        }
      }
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

const addGroupToDB = async (list: any) => {
  const trn = await dbContext.transaction();
  try {
    const stockChangeLogPayload = [];
    if (list.create.length > 0) {
      const resLooseDiamond = await LooseDiamondGroupMasters.bulkCreate(
        list.create,
        {
          transaction: trn,
        }
      );
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
          "off_RAP",
          "polish",
          "symmetry",
          "fluorescence_intensity",
          "fluorescence_color",
          "measurements",
          "lab",
          "certificate",
          "certificate_url",
          "treatment",
          "fancy_color",
          "fancy_color_intensity",
          "fancy_color_overtone",
          "depth_per",
          "table_per",
          "girdle_thin",
          "girdle_thick",
          "girdle_per",
          "girdle_condition",
          "culet_size",
          "culet_condition",
          "crown_height",
          "crown_angle",
          "pavilion_depth",
          "pavilion_angle",
          "laser_inscription",
          "cert_comment",
          "sort_description",
          "long_description",
          "country",
          "state",
          "city",
          "time_to_location",
          "in_matched_pair_separable",
          "pair_stock",
          "parcel_stone",
          "image_link",
          "video_link",
          "sari_loupe",
          "trade_show",
          "key_of_symbols",
          "shade",
          "star_length",
          "center_inclusion",
          "black_inclusion",
          "member_comment",
          "report_issue_date",
          "report_type",
          "lab_location",
          "brand",
          "milky",
          "eye_clean",
          "h_a",
          "bgm",
          "growth_type",
          "total_price",
          "price_ct",
          "modified_by",
          "modified_at",
          "quantity",
          "remaining_quantity_count",
        ],
      });
    }

    if (stockChangeLogPayload.length > 0) {
      await StockChangeLog.bulkCreate(stockChangeLogPayload, {
        transaction: trn,
      });
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
      },
    });

    for (let image of files.images) {
      const resPRF = await moveFileToS3ByTypeAndLocation(dbContext,
        image,
        `${PRODUCT_FILE_LOCATION}/loose-diamond`,
        null
      );
      if (resPRF.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return resPRF;
      }

      const diamond = looseDiamondList.find((t) => {
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
          },
        }
      );
    }

    if (error && error.length > 0) {
      return resBadRequest({ data: error });
    }

    return resSuccess();
  } catch (error) {
    throw error;
  }
};

export const looseDiamondAdminList = async (req: Request) => {
  try {
    const { query } = req;

    const pagination = {
      ...getInitialPaginationFromQuery(query),
      search_text: query.search_text,
    };

    const where = [
      { is_deleted: DeletedStatus.No },
      pagination.is_active ? { is_active: pagination.is_active } : {},
    ];

    const totalItems = await LooseDiamondGroupMasters.count({
      where,
    });

    if (totalItems === 0) {
      return resSuccess({ data: { pagination, result: [] } });
    }

    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

    const list = await LooseDiamondGroupMasters.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "stock_id",
        "total_price",
        "price_ct",
        "created_at",
        "modified_at",
        "weight",
        "mm_size",
        "stone_type",
        "seive_size",
        "off_RAP",
        "measurements",
        "certificate_url",
        "treatment",
        "depth_per",
        "table_per",
        "girdle_per",
        "culet_size",
        "crown_height",
        "crown_angle",
        "pavilion_depth",
        "pavilion_angle",
        "sort_description",
        "long_description",
        "in_matched_pair_separable",
        "image_link",
        "video_link",
        "sari_loupe",
        "key_of_symbols",
        "star_length",
        "member_comment",
        "report_issue_date",
        "report_type",
        "lab_location",
        "eye_clean",
        "image_path",
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
        [Sequelize.literal('"certificates"."name"'), "certificate"],
        [Sequelize.literal('"fancy_colors"."name"'), "fancy_color"],
        [
          Sequelize.literal('"fancy_color_intensitys"."name"'),
          "fancy_color_intensity",
        ],
        [
          Sequelize.literal('"fancy_color_overtones"."name"'),
          "fancy_color_overtone",
        ],
        [Sequelize.literal('"girdle_thins"."name"'), "girdle_thin"],
        [Sequelize.literal('"girdle_thicks"."name"'), "girdle_thick"],
        [Sequelize.literal('"girdle_conditions"."name"'), "girdle_condition"],
        [Sequelize.literal('"culet_conditions"."name"'), "culet_condition"],
        [Sequelize.literal('"laser_inscriptions"."name"'), "laser_inscription"],
        [Sequelize.literal('"cert_comments"."name"'), "cert_comment"],
        [Sequelize.literal('"countrys"."name"'), "country"],
        [Sequelize.literal('"states"."name"'), "state"],
        [Sequelize.literal('"citys"."name"'), "city"],
        [Sequelize.literal('"time_to_locations"."name"'), "time_to_location"],
        [Sequelize.literal('"pair_stocks"."name"'), "pair_stock"],
        [Sequelize.literal('"parcel_stones"."name"'), "parcel_stone"],
        [Sequelize.literal('"trade_shows"."name"'), "trade_show"],
        [Sequelize.literal('"shades"."name"'), "shade"],
        [Sequelize.literal('"center_inclusions"."name"'), "center_inclusion"],
        [Sequelize.literal('"black_inclusions"."name"'), "black_inclusion"],
        [Sequelize.literal('"brands"."name"'), "brand"],
        [Sequelize.literal('"milkys"."name"'), "milky"],
        [Sequelize.literal('"h_as"."name"'), "h_a"],
        [Sequelize.literal('"bgms"."name"'), "bgm"],
        [Sequelize.literal('"growth_types"."name"'), "growth_type"],
      ],
      include: [
        {
          model: Master,
          as: "availabilitys",
          attributes: [],
        },
        {
          model: Gemstones,
          as: "stones",
          attributes: [],
        },
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
          as: "fluorescence_colors",
          attributes: [],
        },
        {
          model: Master,
          as: "labs",
          attributes: [],
        },
        {
          model: Master,
          as: "certificates",
          attributes: [],
        },
        {
          model: Master,
          as: "fancy_colors",
          attributes: [],
        },
        {
          model: Master,
          as: "fancy_color_intensitys",
          attributes: [],
        },
        {
          model: Master,
          as: "fancy_color_overtones",
          attributes: [],
        },
        {
          model: Master,
          as: "girdle_thins",
          attributes: [],
        },
        {
          model: Master,
          as: "girdle_thicks",
          attributes: [],
        },
        {
          model: Master,
          as: "girdle_conditions",
          attributes: [],
        },
        {
          model: Master,
          as: "culet_conditions",
          attributes: [],
        },
        {
          model: Master,
          as: "laser_inscriptions",
          attributes: [],
        },
        {
          model: Master,
          as: "cert_comments",
          attributes: [],
        },
        {
          model: Master,
          as: "countrys",
          attributes: [],
        },
        {
          model: Master,
          as: "states",
          attributes: [],
        },
        {
          model: Master,
          as: "citys",
          attributes: [],
        },
        {
          model: Master,
          as: "time_to_locations",
          attributes: [],
        },
        {
          model: Master,
          as: "pair_stocks",
          attributes: [],
        },
        {
          model: Master,
          as: "parcel_stones",
          attributes: [],
        },
        {
          model: Master,
          as: "trade_shows",
          attributes: [],
        },
        {
          model: Master,
          as: "shades",
          attributes: [],
        },
        {
          model: BrandData,
          as: "brands",
          attributes: [],
        },
        {
          model: Master,
          as: "center_inclusions",
          attributes: [],
        },
        {
          model: Master,
          as: "black_inclusions",
          attributes: [],
        },
        {
          model: Master,
          as: "milkys",
          attributes: [],
        },
        {
          model: Master,
          as: "h_as",
          attributes: [],
        },
        {
          model: Master,
          as: "bgms",
          attributes: [],
        },
        {
          model: Master,
          as: "growth_types",
          attributes: [],
        },
      ],
    });
    return resSuccess({ data: { pagination, result: list } });
  } catch (error) {
    throw error;
  }
};

export const looseDiamondDetailsForAdmin = async (req: Request) => {
  try {
    const { product_id } = req.params;
    const diamondDetail = await LooseDiamondGroupMasters.findOne({
      where: { is_deleted: DeletedStatus.No, id: product_id },
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
        "off_RAP",
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
        [Sequelize.literal('"certificates"."name"'), "certificate"],
        "certificate_url",
        "treatment",
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
        [Sequelize.literal('"girdle_thins"."name"'), "girdle_thin"],
        [Sequelize.literal('"girdle_thicks"."name"'), "girdle_thick"],
        "girdle_per",
        [Sequelize.literal('"girdle_conditions"."name"'), "girdle_condition"],
        "culet_size",
        [Sequelize.literal('"culet_conditions"."name"'), "culet_condition"],
        "crown_height",
        "crown_angle",
        "pavilion_depth",
        "pavilion_angle",
        [Sequelize.literal('"laser_inscriptions"."name"'), "laser_inscription"],
        [Sequelize.literal('"cert_comments"."name"'), "cert_comment"],
        "sort_description",
        "long_description",
        [Sequelize.literal('"countrys"."name"'), "country"],
        [Sequelize.literal('"states"."name"'), "state"],
        [Sequelize.literal('"citys"."name"'), "city"],
        [Sequelize.literal('"time_to_locations"."name"'), "time_to_location"],
        "in_matched_pair_separable",
        [Sequelize.literal('"pair_stocks"."name"'), "pair_stock"],
        [Sequelize.literal('"parcel_stones"."name"'), "parcel_stone"],
        "image_link",
        "video_link",
        "sari_loupe",
        [Sequelize.literal('"trade_shows"."name"'), "trade_show"],
        "key_of_symbols",
        [Sequelize.literal('"shades"."name"'), "shade"],
        "star_length",
        [Sequelize.literal('"center_inclusions"."name"'), "center_inclusion"],
        [Sequelize.literal('"black_inclusions"."name"'), "black_inclusion"],
        "member_comment",
        "report_issue_date",
        "report_type",
        "lab_location",
        [Sequelize.literal('"brands"."name"'), "brand"],
        [Sequelize.literal('"milkys"."name"'), "milky"],
        "eye_clean",
        [Sequelize.literal('"h_as"."name"'), "h_a"],
        [Sequelize.literal('"bgms"."name"'), "bgm"],
        [Sequelize.literal('"growth_types"."name"'), "growth_type"],
        [Sequelize.literal('"remaining_quantity_count"'), "quantity"],
        "total_price",
        "price_ct",
        "created_at",
        "modified_at",
      ],
      include: [
        {
          model: Master,
          as: "availabilitys",
          attributes: [],
        },
        {
          model: Gemstones,
          as: "stones",
          attributes: [],
        },
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
          as: "fluorescence_colors",
          attributes: [],
        },
        {
          model: Master,
          as: "labs",
          attributes: [],
        },
        {
          model: Master,
          as: "certificates",
          attributes: [],
        },
        {
          model: Master,
          as: "fancy_colors",
          attributes: [],
        },
        {
          model: Master,
          as: "fancy_color_intensitys",
          attributes: [],
        },
        {
          model: Master,
          as: "fancy_color_overtones",
          attributes: [],
        },
        {
          model: Master,
          as: "girdle_thins",
          attributes: [],
        },
        {
          model: Master,
          as: "girdle_thicks",
          attributes: [],
        },
        {
          model: Master,
          as: "girdle_conditions",
          attributes: [],
        },
        {
          model: Master,
          as: "culet_conditions",
          attributes: [],
        },
        {
          model: Master,
          as: "laser_inscriptions",
          attributes: [],
        },
        {
          model: Master,
          as: "cert_comments",
          attributes: [],
        },
        {
          model: Master,
          as: "countrys",
          attributes: [],
        },
        {
          model: Master,
          as: "states",
          attributes: [],
        },
        {
          model: Master,
          as: "citys",
          attributes: [],
        },
        {
          model: Master,
          as: "time_to_locations",
          attributes: [],
        },
        {
          model: Master,
          as: "pair_stocks",
          attributes: [],
        },
        {
          model: Master,
          as: "parcel_stones",
          attributes: [],
        },
        {
          model: Master,
          as: "trade_shows",
          attributes: [],
        },
        {
          model: Master,
          as: "shades",
          attributes: [],
        },
        {
          model: BrandData,
          as: "brands",
          attributes: [],
        },
        {
          model: Master,
          as: "center_inclusions",
          attributes: [],
        },
        {
          model: Master,
          as: "black_inclusions",
          attributes: [],
        },
        {
          model: Master,
          as: "milkys",
          attributes: [],
        },
        {
          model: Master,
          as: "h_as",
          attributes: [],
        },
        {
          model: Master,
          as: "bgms",
          attributes: [],
        },
        {
          model: Master,
          as: "growth_types",
          attributes: [],
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
    const { query }: any = req;

    let pagination = {
      ...getInitialPaginationFromQuery(query),
      search_text: query.search_text,
    };
    const include = [
      {
        model: Master,
        as: "availabilitys",
        attributes: [],
      },
      {
        model: Gemstones,
        as: "stones",
        attributes: [],
      },
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
        as: "fluorescence_colors",
        attributes: [],
      },
      {
        model: Master,
        as: "labs",
        attributes: [],
      },
      {
        model: Master,
        as: "certificates",
        attributes: [],
      },
      {
        model: Master,
        as: "fancy_colors",
        attributes: [],
      },
      {
        model: Master,
        as: "fancy_color_intensitys",
        attributes: [],
      },
      {
        model: Master,
        as: "fancy_color_overtones",
        attributes: [],
      },
      {
        model: Master,
        as: "girdle_thins",
        attributes: [],
      },
      {
        model: Master,
        as: "girdle_thicks",
        attributes: [],
      },
      {
        model: Master,
        as: "girdle_conditions",
        attributes: [],
      },
      {
        model: Master,
        as: "culet_conditions",
        attributes: [],
      },
      {
        model: Master,
        as: "laser_inscriptions",
        attributes: [],
      },
      {
        model: Master,
        as: "cert_comments",
        attributes: [],
      },
      {
        model: Master,
        as: "countrys",
        attributes: [],
      },
      {
        model: Master,
        as: "states",
        attributes: [],
      },
      {
        model: Master,
        as: "citys",
        attributes: [],
      },
      {
        model: Master,
        as: "time_to_locations",
        attributes: [],
      },
      {
        model: Master,
        as: "pair_stocks",
        attributes: [],
      },
      {
        model: Master,
        as: "parcel_stones",
        attributes: [],
      },
      {
        model: Master,
        as: "trade_shows",
        attributes: [],
      },
      {
        model: Master,
        as: "shades",
        attributes: [],
      },
      {
        model: BrandData,
        as: "brands",
        attributes: [],
      },
      {
        model: Master,
        as: "center_inclusions",
        attributes: [],
      },
      {
        model: Master,
        as: "black_inclusions",
        attributes: [],
      },
      {
        model: Master,
        as: "milkys",
        attributes: [],
      },
      {
        model: Master,
        as: "h_as",
        attributes: [],
      },
      {
        model: Master,
        as: "bgms",
        attributes: [],
      },
      {
        model: Master,
        as: "growth_types",
        attributes: [],
      },
    ];
    const where = [
      { is_deleted: DeletedStatus.No },
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
    ];

    const totalItems = await LooseDiamondGroupMasters.count({
      where,
      include,
    });

    if (totalItems === 0) {
      return resSuccess({ data: { pagination, result: [] } });
    }

    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

    const list = await LooseDiamondGroupMasters.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
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
        [Sequelize.literal('"cut_grades"."name"'), "cut_grade"],
        "off_RAP",
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
        [Sequelize.literal('"certificates"."name"'), "certificate"],
        "certificate_url",
        "treatment",
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
        [Sequelize.literal('"girdle_thins"."name"'), "girdle_thin"],
        [Sequelize.literal('"girdle_thicks"."name"'), "girdle_thick"],
        "girdle_per",
        [Sequelize.literal('"girdle_conditions"."name"'), "girdle_condition"],
        "culet_size",
        [Sequelize.literal('"culet_conditions"."name"'), "culet_condition"],
        "crown_height",
        "crown_angle",
        "pavilion_depth",
        "pavilion_angle",
        [Sequelize.literal('"laser_inscriptions"."name"'), "laser_inscription"],
        [Sequelize.literal('"cert_comments"."name"'), "cert_comment"],
        "sort_description",
        "long_description",
        [Sequelize.literal('"countrys"."name"'), "country"],
        [Sequelize.literal('"states"."name"'), "state"],
        [Sequelize.literal('"citys"."name"'), "city"],
        [Sequelize.literal('"time_to_locations"."name"'), "time_to_location"],
        "in_matched_pair_separable",
        [Sequelize.literal('"pair_stocks"."name"'), "pair_stock"],
        [Sequelize.literal('"parcel_stones"."name"'), "parcel_stone"],
        "image_link",
        "video_link",
        "sari_loupe",
        [Sequelize.literal('"trade_shows"."name"'), "trade_show"],
        "key_of_symbols",
        [Sequelize.literal('"shades"."name"'), "shade"],
        "star_length",
        [Sequelize.literal('"center_inclusions"."name"'), "center_inclusion"],
        [Sequelize.literal('"black_inclusions"."name"'), "black_inclusion"],
        "member_comment",
        "report_issue_date",
        "report_type",
        "lab_location",
        [Sequelize.literal('"brands"."name"'), "brand"],
        [Sequelize.literal('"milkys"."name"'), "milky"],
        "eye_clean",
        [Sequelize.literal('"h_as"."name"'), "h_a"],
        [Sequelize.literal('"bgms"."name"'), "bgm"],
        [Sequelize.literal('"growth_types"."name"'), "growth_type"],
        [
          Sequelize.literal(
            `CASE WHEN total_price IS NULL THEN price_ct*weight ELSE total_price END`
          ),
          "total_price",
        ],
        "price_ct",
        "created_at",
        "modified_at",
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
    const { product_id } = req.params;
    const diamondDetail = await LooseDiamondGroupMasters.findOne({
      where: { is_deleted: DeletedStatus.No, id: product_id },
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
        [Sequelize.literal('"cut_grades"."name"'), "cut_grade"],
        "off_RAP",
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
        [Sequelize.literal('"certificates"."name"'), "certificate"],
        "certificate_url",
        "treatment",
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
        [Sequelize.literal('"girdle_thins"."name"'), "girdle_thin"],
        [Sequelize.literal('"girdle_thicks"."name"'), "girdle_thick"],
        "girdle_per",
        [Sequelize.literal('"girdle_conditions"."name"'), "girdle_condition"],
        "culet_size",
        [Sequelize.literal('"culet_conditions"."name"'), "culet_condition"],
        "crown_height",
        "crown_angle",
        "pavilion_depth",
        "pavilion_angle",
        [Sequelize.literal('"laser_inscriptions"."name"'), "laser_inscription"],
        [Sequelize.literal('"cert_comments"."name"'), "cert_comment"],
        "sort_description",
        "long_description",
        [Sequelize.literal('"countrys"."name"'), "country"],
        [Sequelize.literal('"states"."name"'), "state"],
        [Sequelize.literal('"citys"."name"'), "city"],
        [Sequelize.literal('"time_to_locations"."name"'), "time_to_location"],
        "in_matched_pair_separable",
        [Sequelize.literal('"pair_stocks"."name"'), "pair_stock"],
        [Sequelize.literal('"parcel_stones"."name"'), "parcel_stone"],
        "image_link",
        "video_link",
        "sari_loupe",
        [Sequelize.literal('"trade_shows"."name"'), "trade_show"],
        "key_of_symbols",
        [Sequelize.literal('"shades"."name"'), "shade"],
        "star_length",
        [Sequelize.literal('"center_inclusions"."name"'), "center_inclusion"],
        [Sequelize.literal('"black_inclusions"."name"'), "black_inclusion"],
        "member_comment",
        "report_issue_date",
        "report_type",
        "lab_location",
        [Sequelize.literal('"brands"."name"'), "brand"],
        [Sequelize.literal('"milkys"."name"'), "milky"],
        "eye_clean",
        [Sequelize.literal('"h_as"."name"'), "h_a"],
        [Sequelize.literal('"bgms"."name"'), "bgm"],
        [Sequelize.literal('"growth_types"."name"'), "growth_type"],
        "total_price",
        "price_ct",
        "created_at",
        "modified_at",
      ],
      include: [
        {
          model: Master,
          as: "availabilitys",
          attributes: [],
        },
        {
          model: Gemstones,
          as: "stones",
          attributes: [],
        },
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
          as: "fluorescence_colors",
          attributes: [],
        },
        {
          model: Master,
          as: "labs",
          attributes: [],
        },
        {
          model: Master,
          as: "certificates",
          attributes: [],
        },
        {
          model: Master,
          as: "fancy_colors",
          attributes: [],
        },
        {
          model: Master,
          as: "fancy_color_intensitys",
          attributes: [],
        },
        {
          model: Master,
          as: "fancy_color_overtones",
          attributes: [],
        },
        {
          model: Master,
          as: "girdle_thins",
          attributes: [],
        },
        {
          model: Master,
          as: "girdle_thicks",
          attributes: [],
        },
        {
          model: Master,
          as: "girdle_conditions",
          attributes: [],
        },
        {
          model: Master,
          as: "culet_conditions",
          attributes: [],
        },
        {
          model: Master,
          as: "laser_inscriptions",
          attributes: [],
        },
        {
          model: Master,
          as: "cert_comments",
          attributes: [],
        },
        {
          model: Master,
          as: "countrys",
          attributes: [],
        },
        {
          model: Master,
          as: "states",
          attributes: [],
        },
        {
          model: Master,
          as: "citys",
          attributes: [],
        },
        {
          model: Master,
          as: "time_to_locations",
          attributes: [],
        },
        {
          model: Master,
          as: "pair_stocks",
          attributes: [],
        },
        {
          model: Master,
          as: "parcel_stones",
          attributes: [],
        },
        {
          model: Master,
          as: "trade_shows",
          attributes: [],
        },
        {
          model: Master,
          as: "shades",
          attributes: [],
        },
        {
          model: BrandData,
          as: "brands",
          attributes: [],
        },
        {
          model: Master,
          as: "center_inclusions",
          attributes: [],
        },
        {
          model: Master,
          as: "black_inclusions",
          attributes: [],
        },
        {
          model: Master,
          as: "milkys",
          attributes: [],
        },
        {
          model: Master,
          as: "h_as",
          attributes: [],
        },
        {
          model: Master,
          as: "bgms",
          attributes: [],
        },
        {
          model: Master,
          as: "growth_types",
          attributes: [],
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

export const deleteDiamond = async (req: Request) => {
  try {
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

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getAllDiamonds = async (req: Request) => {
  try {
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
    const query = req.query as unknown as IDiamondFilter;

    let pagination = {
      ...getInitialPaginationFromQuery(query),
    };

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
        as: "certificates",
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
              DIAMOND_COLORS,
              query.color_from,
              query.color_to
            ),
          })
        : {},
      query.clarity_from || query.clarity_to
        ? Sequelize.where(Sequelize.col(`claritys.value`), {
            [Op.in]: getListFromToValues(
              DIAMOND_CLARITY,
              query.clarity_from,
              query.clarity_to
            ),
          })
        : {},
      query.cut_from || query.cut_to
        ? Sequelize.where(Sequelize.col(`cut_grades.value`), {
            [Op.in]: getListFromToValues(
              DIAMOND_CUT,
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
      query.report
        ? Sequelize.where(Sequelize.col(`certificates.name`), {
            [Op.in]: query.report.split(","),
          })
        : {},
      query.min_lw_ratio
        ? Sequelize.where(
            Sequelize.literal(
              `round(split_part("loose_diamond_group_masters"."measurements", '*', 1)::NUMERIC/split_part("loose_diamond_group_masters"."measurements", '*', 2)::NUMERIC, 2)`
            ),
            {
              [Op.gte]: query.min_lw_ratio,
            }
          )
        : {},
      query.max_lw_ratio
        ? Sequelize.where(
            Sequelize.literal(
              `round(split_part("loose_diamond_group_masters"."measurements", '*', 1)::NUMERIC/split_part("loose_diamond_group_masters"."measurements", '*', 2)::NUMERIC, 2)`
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
              DIAMOND_POLISH,
              query.polish_from,
              query.polish_to
            ),
          })
        : {},
      query.symmetry_from || query.symmetry_to
        ? Sequelize.where(Sequelize.col(`symmetrys.name`), {
            [Op.in]: getListFromToValues(
              DIAMOND_SYMMETRY,
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

    const totalItems = await LooseDiamondGroupMasters.count({
      where,
      include,
    });

    if (totalItems === 0) {
      return resSuccess({ data: { pagination, result: [] } });
    }

    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

    const list = await LooseDiamondGroupMasters.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
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
            `round(split_part("loose_diamond_group_masters"."measurements", '*', 1)::NUMERIC/split_part("loose_diamond_group_masters"."measurements", '*', 2)::NUMERIC, 2)`
          ),
          "lw",
        ],
        [Sequelize.literal('"fluorescence_intensitys"."name"'), "fluor"],
        [Sequelize.literal('"symmetrys"."name"'), "symmetry"],
        [Sequelize.literal("table_per"), "table"],
        [
          Sequelize.literal(
            `round(split_part("loose_diamond_group_masters"."measurements", '*', 1)::NUMERIC)`
          ),
          "measurement_length",
        ],
        [
          Sequelize.literal(
            `round(split_part("loose_diamond_group_masters"."measurements", '*', 2)::NUMERIC)`
          ),
          "measurement_width",
        ],
        [
          Sequelize.literal(
            `round(split_part("loose_diamond_group_masters"."measurements", '*', 3)::NUMERIC)`
          ),
          "measurement_depth",
        ],
        [Sequelize.literal("culet_size"), "culet"],
        [Sequelize.literal('"polishs"."name"'), "polish"],
        [Sequelize.literal('"girdle_thicks"."name"'), "girdle"],
        [Sequelize.literal('"depth_per"'), "depth"],
        [Sequelize.literal('"certificates"."name"'), "report"],
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
    return resSuccess({ data: { pagination, result: list } });
  } catch (error) {
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
}) => {
  try {
    if (inventory_type === DIAMOND_INVENTROY_TYPE.VDB) {
      const data = await getVDBDiamondByStockNumber(
        stock_number,
        diamond_origin
      );
      return data;
    }

    const localData = await getLooseDiamondByStockNumber(stock_number);
    return localData;
  } catch (e) {
    throw e;
  }
};

export const getLooseDiamondByStockNumber = async (stockNumber: string) => {
  try {
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
        as: "certificates",
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
            `round(split_part("loose_diamond_group_masters"."measurements", '*', 1)::NUMERIC/split_part("loose_diamond_group_masters"."measurements", '*', 2)::NUMERIC, 2)`
          ),
          "lw",
        ],
        [Sequelize.literal('"fluorescence_intensitys"."name"'), "fluor"],
        [Sequelize.literal('"symmetrys"."name"'), "symmetry"],
        [Sequelize.literal("table_per"), "table"],
        [
          Sequelize.literal(
            `round(split_part("loose_diamond_group_masters"."measurements", '*', 1)::NUMERIC)`
          ),
          "measurement_length",
        ],
        [
          Sequelize.literal(
            `round(split_part("loose_diamond_group_masters"."measurements", '*', 2)::NUMERIC)`
          ),
          "measurement_width",
        ],
        [
          Sequelize.literal(
            `round(split_part("loose_diamond_group_masters"."measurements", '*', 3)::NUMERIC)`
          ),
          "measurement_depth",
        ],
        [Sequelize.literal("culet_size"), "culet"],
        [Sequelize.literal('"polishs"."name"'), "polish"],
        [Sequelize.literal('"girdle_thicks"."name"'), "girdle"],
        [Sequelize.literal('"depth_per"'), "depth"],
        [Sequelize.literal('"certificates"."name"'), "report"],
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
