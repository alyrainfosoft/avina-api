import { Request } from "express";
import DiamondGroupMaster from "../../../model/master/attributes/diamond-group-master.model";
import {
  ActiveStatus,
  DeletedStatus,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  IMAGE_TYPE,
} from "../../../../utils/app-enumeration";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  imageAddAndEditInDBAndS3,
  imageDeleteInDBAndS3,
  prepareMessageFromParams,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
  statusUpdateValue,
} from "../../../../utils/shared-functions";
import { Op, Sequelize } from "sequelize";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  ERROR_ALREADY_EXIST,
  FILE_NOT_FOUND,
  INVALID_HEADER,
  PRODUCT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
  REQUIRED_ERROR_MESSAGE,
} from "../../../../utils/app-messages";
import {
  moveFileToLocation,
  moveFileToS3ByType,
} from "../../../../helpers/file.helper";
import dbContext from "../../../../config/db-context";
import Image from "../../../model/image.model";
import {
  PRODUCT_BULK_UPLOAD_BATCH_SIZE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../../../config/env.var";
import ProductBulkUploadFile from "../../../model/product-bulk-upload-file.model";
import { TResponseReturn } from "../../../../data/interfaces/common/common.interface";
import fs = require("fs");
import DiamondShape from "../../../model/master/attributes/diamondShape.model";
import StoneData from "../../../model/master/attributes/gemstones.model";
import MMSizeData from "../../../model/master/attributes/mmSize.model";
import Colors from "../../../model/master/attributes/colors.model";
import ClarityData from "../../../model/master/attributes/clarity.model";
import CutsData from "../../../model/master/attributes/cuts.model";
import CaratSize from "../../../../model/master/attributes/caratSize.model";
import SieveSizeData from "../../../model/master/attributes/seiveSize.model";

const csv = require("csv-parser");
const readXlsxFile = require("read-excel-file/node");

export const addDiamondGroup = async (req: Request) => {
  const {
    name,
    id_carat,
    id_stone,
    id_shape,
    id_mm_size,
    id_color,
    id_clarity,
    id_cuts,
    rate,
    id_seive_size,
    synthetic_rate,
    max_carat_range,
    min_carat_range,
  } = req.body;
  try {
    const diamondGroupExit = await DiamondGroupMaster.findOne({
      where: {
        id_stone: id_stone,
        id_shape: id_shape == "null" ? null : id_shape,
        id_mm_size: id_mm_size == "null" ? null : id_mm_size,
        id_color: id_color == "null" ? null : id_color,
        id_clarity: id_clarity == "null" ? null : id_clarity,
        id_cuts: id_cuts == "null" ? null : id_cuts,
        id_carat: id_carat == "null" ? null : id_carat,
        id_seive_size:
          id_seive_size && id_seive_size != "null" ? id_seive_size : null,
        max_carat_range: max_carat_range != "null" ? max_carat_range : null,
        min_carat_range: min_carat_range != "null" ? min_carat_range : null,
        is_deleted: DeletedStatus.No,
      },
    });

    if (diamondGroupExit && diamondGroupExit.dataValues) {
      return resErrorDataExit();
    }
    const trn = await dbContext.transaction();

    try {
      let idImage = null;
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.DiamondGroup,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idImage = imageData.data;
      }
      const payload = {
        name: name,
        id_stone: id_stone,
        id_shape: id_shape,
        id_mm_size: id_mm_size && id_mm_size != "null" ? id_mm_size : null,
        id_color: id_color == "null" ? null : id_color,
        id_clarity: id_clarity == "null" ? null : id_clarity,
        id_cuts: id_cuts == "null" ? null : id_cuts,
        id_carat: id_carat && id_carat != "null" ? id_carat : null,
        id_seive_size:
          id_seive_size && id_seive_size != "null" ? id_seive_size : null,
        max_carat_range:
          max_carat_range && max_carat_range != "null" ? max_carat_range : null,
        min_carat_range:
          min_carat_range && min_carat_range != "null" ? min_carat_range : null,
        id_image: idImage,
        rate: rate && rate != "null" ? rate : null,
        synthetic_rate:
          synthetic_rate && synthetic_rate != "null" ? synthetic_rate : null,
        created_date: getLocalDate(),
        is_active: ActiveStatus.Active,
        is_deleted: DeletedStatus.No,
        created_by: req.body.session_res.id_app_user,
      };

      await DiamondGroupMaster.create(payload, { transaction: trn });

      await trn.commit();
      return resSuccess({ data: payload });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const getDiamondGroup = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      req.query.min_price && req.query.max_price
        ? {
            [Op.or]: [
              {
                rate: {
                  [Op.between]: [req.query.min_price, req.query.max_price],
                },
              },
              {
                synthetic_rate: {
                  [Op.between]: [req.query.min_price, req.query.max_price],
                },
              },
            ],
          }
        : {},

      req.query.stone && req.query.stone != ""
        ? {
            id_stone: req.query.stone,
          }
        : {},
      req.query.shape && req.query.shape != ""
        ? {
            id_shape: req.query.shape,
          }
        : {},
      req.query.color && req.query.color != ""
        ? {
            id_color: req.query.color,
          }
        : {},
      req.query.clarity && req.query.clarity != ""
        ? {
            id_clarity: req.query.clarity,
          }
        : {},
      req.query.carat && req.query.carat != ""
        ? {
            id_carat: req.query.carat,
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await DiamondGroupMaster.count({
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

    const result = await DiamondGroupMaster.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "id_stone",
        "id_color",
        "id_shape",
        "id_mm_size",
        "id_clarity",
        "id_cuts",
        "rate",
        "id_carat",
        "id_seive_size",
        "synthetic_rate",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal('"shapes"."name"'), "diamond_shape"],
        [Sequelize.literal('"stones"."name"'), "diamond"],
        [Sequelize.literal('"mm_size"."value"'), "diamond_mm_size"],
        [Sequelize.literal('"colors"."name"'), "diamond_color"],
        [Sequelize.literal('"clarity"."value"'), "diamond_clarity"],
        [Sequelize.literal('"cuts"."value"'), "diamond_cuts"],
        [Sequelize.literal('"carats"."value"'), "diamond_carat"],
        [Sequelize.literal('"seive_size"."value"'), "diamond_seive_size"],
        "is_active",
        "is_config",
        "is_diamond_type",
        "min_carat_range",
        "max_carat_range",
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: DiamondShape, as: "shapes", attributes: [] },
        { model: DiamondShape, as: "shapes", attributes: [] },
        { model: StoneData, as: "stones", attributes: [] },
        { model: MMSizeData, as: "mm_size", attributes: [] },
        { model: Colors, as: "colors", attributes: [] },
        { model: ClarityData, as: "clarity", attributes: [] },
        { model: CutsData, as: "cuts", attributes: [] },
        { model: CaratSize, as: "carats", attributes: [] },
        { model: SieveSizeData, as: "seive_size", attributes: [] },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const updateDiamondGroup = async (req: Request) => {
  const {
    name,
    id_stone,
    id_shape,
    id_mm_size,
    id_color,
    id_cuts,
    id_clarity,
    rate,
    id_carat,
    id_seive_size,
    synthetic_rate,
    max_carat_range,
    min_carat_range,
    image_delete = "0",
  } = req.body;
  const { id } = req.params;
  try {
    const diamondMasterId = await DiamondGroupMaster.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });

    if (!(diamondMasterId && diamondMasterId.dataValues)) {
      return resNotFound();
    }

    const findName = await DiamondGroupMaster.findOne({
      where: {
        id_stone: id_stone,
        id_shape: id_shape,
        id_mm_size: id_mm_size,
        id_color: id_color,
        id_clarity: id_clarity,
        id_cuts: id_cuts,
        id_carat: id_carat,
        id_seive_size: id_seive_size,
        id: { [Op.ne]: id },
        is_deleted: DeletedStatus.No,
      },
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    let findImage = null;
    if (diamondMasterId.dataValues.id_image) {
      findImage = await Image.findOne({
        where: { id: diamondMasterId.dataValues.id_image },
      });
    }
    const trn = await dbContext.transaction();
    try {
      let imageId = null;
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.DiamondGroup,
          req.body.session_res.id_app_user,
          findImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageId = imageData.data;
      }

      const updateData = await DiamondGroupMaster.update(
        {
          id_stone: id_stone,
          id_shape: id_shape,
          id_mm_size: id_mm_size,
          id_color: id_color,
          id_clarity: id_clarity,
          id_cuts: id_cuts,
          id_image:
            image_delete && image_delete === "1"
              ? null
              : imageId || diamondMasterId.dataValues.id_image,
          id_carat: id_carat,
          rate: rate ? rate : null,
          synthetic_rate: synthetic_rate ? synthetic_rate : null,
          id_seive_size: id_seive_size,
          max_carat_range:
            max_carat_range && max_carat_range != "null"
              ? max_carat_range
              : null,
          min_carat_range:
            min_carat_range && min_carat_range != "null"
              ? min_carat_range
              : null,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },

        {
          where: { id: id, is_deleted: DeletedStatus.No },
          transaction: trn,
        }
      );
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage, null);
      }
      if (updateData) {
        const shapesInformation = await DiamondGroupMaster.findOne({
          where: { id: id, is_deleted: DeletedStatus.No },
          transaction: trn,
        });
        await trn.commit();
        return resSuccess({ data: shapesInformation });
      }

      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();

      throw e;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteDiamondGroup = async (req: Request) => {
  try {
    const DiamondGroup = await DiamondGroupMaster.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(DiamondGroup && DiamondGroup.dataValues)) {
      return resNotFound();
    }
    await DiamondGroupMaster.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: DiamondGroup.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateDiamondGroup = async (req: Request) => {
  try {
    const findDiamondGroup = await DiamondGroupMaster.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findDiamondGroup && findDiamondGroup.dataValues)) {
      return resNotFound();
    }
    await DiamondGroupMaster.update(
      {
        is_active: statusUpdateValue(findDiamondGroup),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findDiamondGroup.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const configStatusUpdateDiamondGroupMasterData = async (
  req: Request
) => {
  try {
    const DiamondGroup = await DiamondGroupMaster.findOne({
      where: { id: req.body.id, is_deleted: DeletedStatus.No },
    });
    if (DiamondGroup) {
      const metalActionInfo = await DiamondGroupMaster.update(
        {
          is_config: req.body.is_config,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: DiamondGroup.dataValues.id } }
      );
      if (metalActionInfo) {
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};

export const diamondTypeUpdateDiamondGroupMasterData = async (req: Request) => {
  try {
    const DiamondGroup = await DiamondGroupMaster.findOne({
      where: { id: req.body.id, is_deleted: DeletedStatus.No },
    });
    if (DiamondGroup) {
      const metalActionInfo = await DiamondGroupMaster.update(
        {
          is_diamond_type: req.body.diamond_type,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: DiamondGroup.dataValues.id } }
      );
      if (metalActionInfo) {
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};

export const addDiamondGroupMasterFromCSVFile = async (req: Request) => {
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

    return resPDBUF;
  } catch (e) {
    return resUnknownError({ data: e });
  }
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

    if (resRows.data.batchSize > PRODUCT_BULK_UPLOAD_BATCH_SIZE) {
      return resUnprocessableEntity({
        message: PRODUCT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
      });
    }

    const resProducts = await getDiamondGroupFromRows(resRows.data.results);
    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addGroupToDB(resProducts.data);
    if (resAPTD.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resAPTD;
    }

    return resSuccess();
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
              stone: row[0],
              shape: row[1],
              seive_size: row[2],
              mm_size: row[3],
              carat: row[4],
              color: row[5],
              clarity: row[6],
              cuts: row[7],
              natural_rate: row[8],
              synthetic_rate: row[9],
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

      // const fileContent = fs.readFileSync(path, { encoding: 'utf-8' });
      // console.log("fileContent", fileContent);

      // fs.createReadStream(path)
      //   .pipe(csv())
      //   .on("data", (data: any) => {

      //       batchSize++;
      //     results.push(data);
      //   })
      //   .on("headers", (headers: any) => {
      //     headerList = headers;
      //   })
      //   .on("end", () => {
      //     return resolve(
      //       resSuccess({ data: { results, batchSize, headers: headerList } })
      //     );
      //   });
    } catch (e) {
      return reject(e);
    }
  });
};

const getIdFromName = (name: string, list: any, fieldName: string) => {
  if (name == "" && !name) {
    return 0;
  }

  let findItem = list.find(
    (item: any) =>
      item.dataValues[fieldName].trim().toLocaleLowerCase() ==
      name.toString().trim().toLocaleLowerCase()
  );

  return findItem ? parseInt(findItem.dataValues.id) : DeletedStatus.No;
};

const getPipedIdFromFieldValue = async (
  model: any,
  fieldValue: string,
  fieldName: string
) => {
  if (fieldValue === "") {
    return "";
  }
  let valueList = fieldValue.split("|");
  let findData = await model.findAll({
    where: {
      [fieldName]: { [Op.in]: valueList },
      is_deleted: DeletedStatus.No,
      is_active: "1",
    },
  });
  let idList = [];
  for (const tag of findData) {
    idList.push(tag.dataValues.id);
  }
  return idList.join("|");
};

const validateHeaders = async (headers: string[]) => {
  const DIAMOND_GROUP_BULK_UPLOAD_HEADERS = [
    "stone",
    "shape",
    "seive_size",
    "mm_size",
    "carat",
    "color",
    "clarity",
    "cuts",
    "natural_rate",
    "synthetic_rate",
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

const getDiamondGroupFromRows = async (rows: any) => {
  let currenGroupIndex = -1;
  let diamondGroupList = [];
  let where = [{ is_deleted: DeletedStatus.No }, { is_active: "1" }];

  const stoneList = await StoneData.findAll({
    where,
    attributes: ["id", "name", "slug", "gemstone_type"],
  });

  const stone_cut = await CutsData.findAll({
    where,
    attributes: ["id", "value", "slug"],
  });

  const stone_clarity = await ClarityData.findAll({
    where,
    attributes: ["id", "value", "name", "slug"],
  });

  const stone_color = await Colors.findAll({
    where,
    attributes: ["id", "value", "name", "slug"],
  });

  const stone_shape = await DiamondShape.findAll({
    where,
    attributes: ["id", "name", "slug"],
  });

  const MM_Size = await MMSizeData.findAll({
    where,
    attributes: ["id", "value", "slug"],
  });

  const carat_size = await CaratSize.findAll({
    where,
    attributes: ["id", "value", "slug"],
  });
  const seive_size = await SieveSizeData.findAll({
    where,
    attributes: ["id", "value", "slug"],
  });

  try {
    let errors: {
      row_id: number;
      error_message: string;
    }[] = [];

    for (const row of rows) {
      currenGroupIndex++;

      if (row.shape == null) {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Shape"],
          ]),
        });
      }

      if (row.stone == null) {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Stone"],
          ]),
        });
      }

      if (row.mm_size == null) {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "MM size"],
          ]),
        });
      }

      // if(row.color == null) {
      //   errors.push({
      //     row_id: currenGroupIndex + 1 + 1,
      //     error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", "Color"]]),
      //   });
      // }

      // if(row.clarity == null) {
      //   errors.push({
      //     row_id: currenGroupIndex + 1 + 1,
      //     error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", "Clarity"]]),
      //   });
      // }

      // if(row.cut == null) {
      //   errors.push({
      //     row_id: currenGroupIndex + 1 + 1,
      //     error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", "cut"]]),
      //   });
      // }

      // if(row.carat == null) {
      //   errors.push({
      //     row_id: currenGroupIndex + 1 + 1,
      //     error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", "carat"]]),
      //   });
      // }

      // if(row.seive_size == null) {
      //   errors.push({
      //     row_id: currenGroupIndex + 1 + 1,
      //     error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", "seive size"]]),
      //   });
      // }

      const diamondGroup = await DiamondGroupMaster.findOne({
        where: {
          is_deleted: DeletedStatus.No,

          id_stone: getIdFromName(row.stone, stoneList, "name"),
          id_shape: getIdFromName(row.shape, stone_shape, "name"),
          id_mm_size: getIdFromName(row.mm_size.toString(), MM_Size, "value"),
          id_color: row.color
            ? getIdFromName(row.color, stone_color, "value")
            : null,
          id_clarity: row.clarity
            ? getIdFromName(row.clarity, stone_clarity, "value")
            : null,
          id_cuts: row.cuts
            ? getIdFromName(row.cuts, stone_cut, "value")
            : null,
          id_carat: row.carat
            ? getIdFromName(row.carat, carat_size, "value")
            : null,
          id_seive_size: row.seive_size
            ? getIdFromName(
                row.seive_size.replaceAll("'", ""),
                seive_size,
                "value"
              )
            : null,
        },
      });

      diamondGroupList.push({
        group_id: diamondGroup != null ? diamondGroup.dataValues.id : 0,
        stone: getIdFromName(row.stone, stoneList, "name"),
        shape: getIdFromName(row.shape, stone_shape, "name"),
        mm_size: getIdFromName(row.mm_size, MM_Size, "value"),
        color: row.color
          ? getIdFromName(row.color, stone_color, "value")
          : null,
        clarity: row.clarity
          ? getIdFromName(row.clarity, stone_clarity, "value")
          : null,
        cut: row.cuts ? getIdFromName(row.cuts, stone_cut, "value") : null,
        carat: row.carat ? getIdFromName(row.carat, carat_size, "value") : null,
        seive_size: row.seive_size
          ? getIdFromName(
              row.seive_size.replaceAll("'", ""),
              seive_size,
              "value"
            )
          : null,
        rate: row.natural_rate,
        synthetic_rate: row.synthetic_rate,
      });
    }

    if (errors.length > 0) {
      return resUnprocessableEntity({ data: errors });
    }

    return resSuccess({ data: diamondGroupList });
  } catch (e) {
    console.log("e", e);
    throw e;
  }
};

const addGroupToDB = async (list: any) => {
  const trn = await dbContext.transaction();
  let pcPayloadAdd: any = [];
  try {
    for (const group of list) {
      // const findDianmond_group = await DiamondGroupMaster.findOne({
      //   where: {
      //     id_stone: group.stone,
      //     id_shape: group.shape,
      //     id_mm_size: group.mm_size,
      //     id_color: group.color,
      //     id_clarity: group.clarity,
      //     id_cuts: group.cut,
      //     is_active: ActiveStatus.Active,

      //   }
      // })

      if (
        group.group_id &&
        group.group_id != undefined &&
        group.group_id != null &&
        group.group_id != 0
      ) {
        //Update
        await DiamondGroupMaster.update(
          {
            id_stone: group.stone,
            id_shape: group.shape,
            id_mm_size: group.mm_size,
            id_color: group.color,
            id_clarity: group.clarity,
            id_cuts: group.cut && group.cut,
            id_carat: group.carat,
            id_seive_size: group.seive_size,
            rate: group.rate,
            synthetic_rate: group.synthetic_rate,
            modified_date: getLocalDate(),
          },

          { where: { id: group.group_id } }
        );
      } else {
        pcPayloadAdd.push({
          id_stone: group.stone,
          id_shape: group.shape,
          id_mm_size: group.mm_size,
          id_color: group.color,
          id_clarity: group.clarity,
          id_cuts: group.cut && group.cut,
          id_carat: group.carat,
          id_seive_size: group.seive_size,
          rate: group.rate,
          synthetic_rate: group.synthetic_rate,
          is_deleted: DeletedStatus.No,
          is_active: "1",
          created_date: getLocalDate(),
        });
      }
    }
    await DiamondGroupMaster.bulkCreate(pcPayloadAdd, { transaction: trn });

    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};
