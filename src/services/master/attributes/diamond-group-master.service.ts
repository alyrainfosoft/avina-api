import { Request } from "express";
import DiamondGroupMaster from "../../../model/master/attributes/diamond-group-master.model";
import {
  ActiveStatus,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  IMAGE_TYPE,
} from "../../../utils/app-enumeration";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../../utils/shared-functions";
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
} from "../../../utils/app-messages";
import {
  moveFileToLocation,
  moveFileToS3ByType,
} from "../../../helpers/file.helper";
import dbContext from "../../../config/db-context";
import Image from "../../../model/image.model";
import {
  PRODUCT_BULK_UPLOAD_BATCH_SIZE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../../config/env.var";
import ProductBulkUploadFile from "../../../model/product-bulk-upload-file.model";
import { TResponseReturn } from "../../../data/interfaces/common/common.interface";
import fs = require("fs");
import DiamondShape from "../../../model/master/attributes/diamondShape.model";
import Gemstones from "../../../model/master/attributes/gemstones.model";
import MMSize from "../../../model/master/attributes/mmSize.model";
import Colors from "../../../model/master/attributes/colors.model";
import ClarityData from "../../../model/master/attributes/clarity.model";
import CutsData from "../../../model/master/attributes/cuts.model";

const csv = require("csv-parser");
const readXlsxFile = require("read-excel-file/node");

export const addDiamondGroupMasterData = async (req: Request) => {
  const {
    name,
    id_stone,
    id_shape,
    id_mm_size,
    id_color,
    id_clarity,
    id_cuts,
    rate,
    created_by,
  } = req.body;
  try {
    const { name, slug, sort_code, created_by } = req.body;

    let imagePath = null;
    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        req.file,
        IMAGE_TYPE.DiamondGroup,
        null
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }
    const diamondGroupExit = await DiamondGroupMaster.findOne({
      where: {
        id_stone: id_stone,
        id_shape: id_shape,
        id_mm_size: id_mm_size,
        id_color: id_color,
        id_clarity: id_clarity,
        id_cuts: id_cuts,
      },
    });

    if (diamondGroupExit && diamondGroupExit.dataValues) {
      return resErrorDataExit();
    }
    const trn = await dbContext.transaction();

    try {
      let idImage = null;
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.DiamondGroup,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        idImage = imageResult.dataValues.id;
      }
      const payload = {
        name: name,
        id_stone: id_stone,
        id_shape: id_shape,
        id_mm_size: id_mm_size,
        id_color: id_color,
        id_clarity: id_clarity,
        id_cuts: id_cuts,
        id_image: idImage,
        rate: rate,
        created_date: getLocalDate(),
        is_active: ActiveStatus.Active,
        is_deleted: "0",
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

export const getAllDiamondGroupMasterData = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: "0" },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              Sequelize.where(
                Sequelize.literal(
                  `(SELECT COUNT(*) FROM diamond_shapes WHERE id = diamond_group_masters.id_shape AND name ILIKE  '%${pagination.search_text}%')`
                ),
                ">",
                "0"
              ),

              { rate: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
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
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal('"shapes"."name"'), "diamond_shape"],
        [Sequelize.literal('"stones"."name"'), "diamond"],
        [Sequelize.literal('"mm_size"."value"'), "diamond_mm_size"],
        [Sequelize.literal('"colors"."name"'), "diamond_color"],
        [Sequelize.literal('"clarity"."value"'), "diamond_clarity"],
        [Sequelize.literal('"cuts"."value"'), "diamond_cuts"],

        "is_active",
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: DiamondShape, as: "shapes", attributes: [] },
        { model: DiamondShape, as: "shapes", attributes: [] },
        { model: Gemstones, as: "stones", attributes: [] },
        { model: MMSize, as: "mm_size", attributes: [] },
        { model: Colors, as: "colors", attributes: [] },
        { model: ClarityData, as: "clarity", attributes: [] },
        { model: CutsData, as: "cuts", attributes: [] },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const updateDiamondGroupMasterData = async (req: Request) => {
  const {
    id,
    name,
    id_stone,
    id_shape,
    id_mm_size,
    id_color,
    id_cuts,
    id_clarity,
    rate,
    updated_by,
  } = req.body;

  try {
    const diamondMasterId = await DiamondGroupMaster.findOne({
      where: { id: id, is_deleted: "0" },
    });

    if (diamondMasterId == null) {
      return resNotFound();
    }

    let id_image = null;
    let imagePath = null;

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        req.file,
        IMAGE_TYPE.diamondShape,
        null
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    const trn = await dbContext.transaction();
    try {
      if (imagePath) {
        const imageResult = await Image.create(
          {
            name: name,
            id_stone: id_stone,
            id_shape: id_shape,
            id_mm_size: id_mm_size,
            id_color: id_color,
            id_clarity: id_clarity,
            id_cuts: id_cuts,
            rate: rate,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
            image_path: imagePath,
          },
          { transaction: trn }
        );

        id_image = imageResult.dataValues.id;
        const nameExists = await DiamondGroupMaster.findOne({
          where: { name: name, id: { [Op.ne]: id }, is_deleted: "0" },
        });

        const shapesInfo = await DiamondGroupMaster.update(
          {
            id_image: id_image,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },

          { where: { id: id, is_deleted: "0" }, transaction: trn }
        );
        if (shapesInfo) {
          const shapesInformation = await DiamondGroupMaster.findOne({
            where: { id: id, is_deleted: "0" },
            transaction: trn,
          });
          await trn.commit();
          return resSuccess({ data: shapesInformation });
        }

        await trn.commit();
        return resSuccess();
      } else {
        const metalMasterInfo = await DiamondGroupMaster.update(
          {
            name: name,
            id_stone: id_stone,
            id_shape: id_shape,
            id_mm_size: id_mm_size,
            id_color: id_color,
            id_clarity: id_clarity,
            id_cuts: id_cuts,
            rate: rate,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
          { where: { id: diamondMasterId.dataValues.id, is_deleted: "0" } }
        );
        if (metalMasterInfo) {
          const information = await DiamondGroupMaster.findOne({
            where: { id: id, is_deleted: "0" },
            transaction: trn,
          });
          await trn.commit();
          return resSuccess({ data: information });
        }

        await trn.commit();
        return resSuccess();
      }
    } catch (e) {
      await trn.rollback();

      throw e;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteDiamondGroupMasterData = async (req: Request) => {
  try {
    const DiamondGroup = await DiamondGroupMaster.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });

    console.log(DiamondGroup);

    if (!(DiamondGroup && DiamondGroup.dataValues)) {
      return resNotFound();
    }
    await DiamondGroupMaster.update(
      {
        is_deleted: "1",
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

export const statusUpdateDiamondGroupMasterData = async (req: Request) => {
  try {
    const DiamondGroup = await DiamondGroupMaster.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });
    if (DiamondGroup) {
      const metalActionInfo = await DiamondGroupMaster.update(
        {
          is_active: req.body.is_active,
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
    console.log("resProducts", resProducts);
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
              group_id: row[0],
              stone: row[1],
              shape: row[2],
              mm_size: row[3],
              color: row[4],
              clarity: row[5],
              cut: row[6],
              rate: row[7],
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

  return findItem ? findItem.dataValues.id : "0";
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
      is_deleted: "0",
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
    "group_id",
    "stone",
    "shape",
    "mm_size",
    "color",
    "clarity",
    "cut",
    "rate",
  ];

  let errors: {
    row_id: number;
    column_id: number;
    column_name: string;
    error_message: string;
  }[] = [];
  let i;
  for (i = 0; i < headers.length; i++) {
    if (headers[i].trim() != DIAMOND_GROUP_BULK_UPLOAD_HEADERS[i].trim()) {
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
  let where = [{ is_deleted: "0" }, { is_active: "1" }];

  const stoneList = await Gemstones.findAll({
    where,
    attributes: ["id", "name", "slug"],
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

  const MM_Size = await MMSize.findAll({
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

      if (row.color == null) {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Color"],
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

      if (row.cut == null) {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "cut"],
          ]),
        });
      }

      if (row.group_id == 0) {
        const diamondGroup = await DiamondGroupMaster.findOne({
          where: {
            is_deleted: "0",

            id_stone: getIdFromName(row.stone, stoneList, "name"),
            id_shape: getIdFromName(row.shape, stone_shape, "name"),
            id_mm_size: getIdFromName(row.mm_size.toString(), MM_Size, "value"),
            id_color: getIdFromName(row.color, stone_color, "value"),
            id_clarity: getIdFromName(row.clarity, stone_clarity, "value"),
            id_cuts: getIdFromName(row.cut, stone_cut, "value"),
          },
        });
        if (diamondGroup != null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: ERROR_ALREADY_EXIST,
          });
        }
      } else {
        const diamondGroup = await DiamondGroupMaster.findOne({
          where: {
            id: { [Op.ne]: row.group_id },
            is_deleted: "0",
            id_stone: getIdFromName(row.stone, stoneList, "name"),
            id_shape: getIdFromName(row.shape, stone_shape, "name"),
            id_mm_size: getIdFromName(row.mm_size, MM_Size, "value"),
            id_color: getIdFromName(row.color, stone_color, "value"),
            id_clarity: getIdFromName(row.clarity, stone_clarity, "value"),
            id_cuts: getIdFromName(row.cut, stone_cut, "value"),
          },
        });
        console.log("diamondGroup", diamondGroup);
        if (diamondGroup != null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: ERROR_ALREADY_EXIST,
          });
        }
      }

      diamondGroupList.push({
        group_id: row.group_id,
        stone: getIdFromName(row.stone, stoneList, "name"),
        shape: getIdFromName(row.shape, stone_shape, "name"),
        mm_size: getIdFromName(row.mm_size, MM_Size, "value"),
        color: getIdFromName(row.color, stone_color, "value"),
        clarity: getIdFromName(row.clarity, stone_clarity, "value"),
        cut: getIdFromName(row.cut, stone_cut, "value"),
        rate: row.rate,
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
      if (
        group.group_id &&
        group.group_id != undefined &&
        group.group_id != null &&
        group.group_id != "0"
      ) {
        //Update
        await DiamondGroupMaster.update(
          {
            id_stone: group.stone,
            id_shape: group.shape,
            id_mm_size: group.mm_size,
            id_color: group.color,
            id_clarity: group.clarity,
            id_cuts: group.cut,
            rate: group.rate,
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
          id_cuts: group.cut,
          rate: group.rate,
          is_deleted: "0",
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
