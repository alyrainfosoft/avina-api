import { Request } from "express";
import {
  ActiveStatus,
  DeletedStatus,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
} from "../../../../utils/app-enumeration";
import {
  addActivityLogs,
  getInitialPaginationFromQuery,
  getLocalDate,
  imageAddAndEditInDBAndS3,
  imageDeleteInDBAndS3,
  prepareMessageFromParams,
  refreshAllMaterializedView,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
  statusUpdateValue,
} from "../../../../utils/shared-functions";
import { Op, Sequelize, where } from "sequelize";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  DIAMOND_GROUP_MASTER_RANGE_VALIDATION,
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
import {Image} from "../../../model/image.model";
import {
  PRODUCT_BULK_UPLOAD_BATCH_SIZE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../../../config/env.var";
import { initModels } from "../../../model/index.model";
import { TResponseReturn } from "../../../../data/interfaces/common/common.interface";

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
    average_carat
  } = req.body;
  try {
    const {DiamondGroupMaster} = initModels(req);
    const diamondGroupExit = await DiamondGroupMaster.findOne({
      where: {
        id_stone: id_stone,
        id_shape: id_shape == "null" ? null : id_shape,
        id_color: (id_color == "null" || id_color == undefined || id_color == '') ? null : id_color,
        id_clarity: (id_clarity == "null" || id_clarity == undefined || id_clarity == '') ? null : id_clarity,
        id_cuts: (id_cuts == "null" || id_cuts == undefined || id_cuts == '') ? null : id_cuts,
        id_carat: id_carat == "null" ? null : id_carat,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    if (diamondGroupExit && diamondGroupExit.dataValues) {
      return resErrorDataExit();
    }

    // const sameRangeDiamondGroup = await DiamondGroupMaster.findOne({
    //   where: {
    //     id_stone: id_stone,
    //     id_shape: id_shape,
    //     id_color: (id_color == "null" || id_color == undefined || id_color == '') ? null : id_color,
    //     id_clarity: (id_clarity == "null" || id_clarity == undefined || id_clarity == '') ? null : id_clarity,
    //     id_cuts: (id_cuts == "null" || id_cuts == undefined || id_cuts == '') ? null : id_cuts,
    //     is_deleted: DeletedStatus.No,
    //     company_info_id: req?.body?.session_res?.client_id,
    //     [Op.and]: [
    //       {
    //         min_carat_range: { [Op.lt]: max_carat_range }
    //       },
    //       {
    //         max_carat_range: { [Op.gt]: min_carat_range }
    //       }
    //     ]
    //   }
    // })

    // if(sameRangeDiamondGroup && sameRangeDiamondGroup.dataValues) {
    //   return resErrorDataExit({message: DIAMOND_GROUP_MASTER_RANGE_VALIDATION});
    // }
    const trn = await (req.body.db_connection).transaction();

    try {
      let idImage = null;
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.DiamondGroup,
          req.body.session_res.id_app_user,
          "",
          req?.body?.session_res?.client_id
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
        average_carat: average_carat && average_carat != "null" ? average_carat : null,
        created_by: req.body.session_res.id_app_user,
        company_info_id :req?.body?.session_res?.client_id,
      };

      const data = await DiamondGroupMaster.create(payload, { transaction: trn });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{ old_data: null, new_data: {...data?.dataValues} }], data.dataValues.id, LogsActivityType.Add, LogsType.DiamondGroupMater, req.body.session_res.id_app_user,trn)
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
    const {DiamondGroupMaster,Image, StoneData, DiamondShape, MMSizeData, DiamondCaratSize,Colors, ClarityData, CutsData, SieveSizeData} = initModels(req)
    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      { company_info_id :req?.body?.session_res?.client_id },
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
      req.query.mm_size && req.query.mm_size != ""
        ? {
          id_mm_size: req.query.mm_size,
        }
        : {},
      req.query.cut && req.query.cut != ""
        ? {
          id_cuts: req.query.cut,
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
        "average_carat",
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
        { model: Image, as: "image", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: DiamondShape, as: "shapes", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: DiamondShape, as: "shapes", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: StoneData, as: "stones", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: MMSizeData, as: "mm_size", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: Colors, as: "colors", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: ClarityData, as: "clarity", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: CutsData, as: "cuts", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: DiamondCaratSize, as: "carats", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: SieveSizeData, as: "seive_size", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
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
    average_carat
  } = req.body;
  const {DiamondGroupMaster,Image} = initModels(req);
  const { id } = req.params;
  try {
    const diamondMasterId = await DiamondGroupMaster.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(diamondMasterId && diamondMasterId.dataValues)) {
      return resNotFound();
    }

    const diamondGroupExit = await DiamondGroupMaster.findOne({
      where: {
        id: { [Op.ne]: id },
        id_stone: id_stone,
        id_shape: id_shape == "null" ? null : id_shape,
        id_color: (id_color == "null" || id_color == undefined || id_color == '') ? null : id_color,
        id_clarity: (id_clarity == "null" || id_clarity == undefined || id_clarity == '') ? null : id_clarity,
        id_cuts: (id_cuts == "null" || id_cuts == undefined || id_cuts == '') ? null : id_cuts,
        id_carat: id_carat == "null" ? null : id_carat,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    if (diamondGroupExit && diamondGroupExit.dataValues) {
      return resErrorDataExit();
    }

    // const sameRangeDiamondGroup = await DiamondGroupMaster.findOne({
    //   where: {
    //     id: { [Op.ne]: id },
    //     id_stone: id_stone,
    //     id_shape: id_shape,
    //     id_color: (id_color == "null" || id_color == undefined || id_color == '') ? null : id_color,
    //     id_clarity: (id_clarity == "null" || id_clarity == undefined || id_clarity == '') ? null : id_clarity,
    //     id_cuts: (id_cuts == "null" || id_cuts == undefined || id_cuts == '') ? null : id_cuts,
    //     is_deleted: DeletedStatus.No,
    //     company_info_id: req?.body?.session_res?.client_id,
    //     [Op.and]: [
    //       {
    //         min_carat_range: { [Op.lt]: max_carat_range }
    //       },
    //       {
    //         max_carat_range: { [Op.gt]: min_carat_range }
    //       }
    //     ]
    //   }
    // })

    // if(sameRangeDiamondGroup && sameRangeDiamondGroup.dataValues) {
    //   return resErrorDataExit({message: DIAMOND_GROUP_MASTER_RANGE_VALIDATION});
    // }
    const trn = await (req.body.db_connection).transaction();
    try {
      let imageId = null;
      let findImage = null;
      if (diamondMasterId.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: diamondMasterId.dataValues.id_image ,company_info_id :req?.body?.session_res?.client_id},
          transaction: trn,
        });
      }
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.DiamondGroup,
          req.body.session_res.id_app_user,
          findImage,
          req?.body?.session_res?.client_id
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageId = imageData.data;
      }
      const payload = {
        id_stone: id_stone,
        id_shape: id_shape,
        id_mm_size: id_mm_size,
        id_color: id_color,
        id_clarity: id_clarity,
        id_cuts: id_cuts,
        average_carat: average_carat && average_carat != "null" ? average_carat : null,
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
      }
      const updateData = await DiamondGroupMaster.update(
        payload,
        {
          where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        }
      );
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
      }

      const afterUpdatediamondMasterId = await DiamondGroupMaster.findOne({
        where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
        transaction: trn,
      });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{ 
        old_data:{ diamond_group_master_id:diamondMasterId.dataValues.id ,data:{...diamondMasterId.dataValues}},
        new_data: { diamond_group_master_id:afterUpdatediamondMasterId.dataValues.id, data:{...afterUpdatediamondMasterId?.dataValues} } }],
        diamondMasterId.dataValues.id, LogsActivityType.Edit, LogsType.DiamondGroupMater, req.body.session_res.id_app_user,trn);

      await trn.commit();

      await refreshAllMaterializedView(req.body.db_connection);
      return resSuccess({ data: afterUpdatediamondMasterId });
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
    const { DiamondGroupMaster } = initModels(req);
    const DiamondGroup = await DiamondGroupMaster.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
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
      { where: { id: DiamondGroup.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: DiamondGroup.dataValues, new_data: {
        ...DiamondGroup.dataValues, is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      }
    }], DiamondGroup.dataValues.id, LogsActivityType.Delete, LogsType.DiamondGroupMater, req.body.session_res.id_app_user)

    await refreshAllMaterializedView(req.body.db_connection);
    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateDiamondGroup = async (req: Request) => {
  try {
    const { DiamondGroupMaster } = initModels(req);
    const findDiamondGroup = await DiamondGroupMaster.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
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
      { where: { id: findDiamondGroup.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: findDiamondGroup.dataValues, new_data: {
        ...findDiamondGroup.dataValues, is_active: statusUpdateValue(findDiamondGroup),
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      }
    }], findDiamondGroup.dataValues.id, LogsActivityType.StatusUpdate, LogsType.DiamondGroupMater, req.body.session_res.id_app_user)
    await refreshAllMaterializedView(req.body.db_connection);
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const configStatusUpdateDiamondGroupMasterData = async (
  req: Request
) => {
  try {
    const { DiamondGroupMaster } = initModels(req);
    const DiamondGroup = await DiamondGroupMaster.findOne({
      where: { id: req.body.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (DiamondGroup) {
      const metalActionInfo = await DiamondGroupMaster.update(
        {
          is_config: req.body.is_config,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: DiamondGroup.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
      );
      if (metalActionInfo) {
        await refreshAllMaterializedView(req.body.db_connection);
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: DiamondGroup.dataValues, new_data: {
            ...DiamondGroup.dataValues, is_config: req.body.is_config,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          }
        }], DiamondGroup.dataValues.id, LogsActivityType.Edit, LogsType.DiamondGroupMater, req.body.session_res.id_app_user)
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
    const { DiamondGroupMaster } = initModels(req);
    const DiamondGroup = await DiamondGroupMaster.findOne({
      where: { id: req.body.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (DiamondGroup) {
      const metalActionInfo = await DiamondGroupMaster.update(
        {
          is_diamond_type: req.body.diamond_type,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: DiamondGroup.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
      );
      if (metalActionInfo) {
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: DiamondGroup.dataValues, new_data: {
            ...DiamondGroup.dataValues, is_diamond_type: req.body.diamond_type,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          }
        }], DiamondGroup.dataValues.id, LogsActivityType.Edit, LogsType.DiamondGroupMater, req.body.session_res.id_app_user)
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
      }
    } else {
      return resNotFound();
    }
    await refreshAllMaterializedView(req.body.db_connection);
  } catch (error) {
    throw error;
  }
};

export const addDiamondGroupMasterFromCSVFile = async (req: Request) => {
  try {
    const { ProductBulkUploadFile } = initModels(req);
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
      company_info_id :req?.body?.session_res?.client_id,
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

const processDiamondGroupBulkUploadFile = async (
  id: number,
  path: string,
  idAppUser: number,
  clientId: number,
  req: Request
) => {
  const { ProductBulkUploadFile } = initModels(req);

  try {
    const data = await processCSVFile(path, idAppUser,clientId, req);
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

const processCSVFile = async (path: string, idAppUser: number,clientId:Number, req) => {
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

    const resProducts = await getDiamondGroupFromRows(resRows.data.results,clientId, req);
    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addGroupToDB(resProducts.data,idAppUser,clientId, req);
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
          row && row && row.forEach((header: any) => {
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
      is_active: ActiveStatus.Active,
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
    if (
      !headers[i] ||
      (headers[i] &&
        headers[i].toString().trim() != DIAMOND_GROUP_BULK_UPLOAD_HEADERS[i])
    ) {
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

const getDiamondGroupFromRows = async (rows: any,client_id:any, req: Request) => {
  let currenGroupIndex = -1;
  let diamondGroupList = [];
  const { StoneData, CutsData, ClarityData, Colors, DiamondShape, MMSizeData, DiamondCaratSize, SieveSizeData, DiamondGroupMaster } = initModels(req);

  let where = [{ is_deleted: DeletedStatus.No }, { is_active: ActiveStatus.Active } ,{company_info_id:client_id}];

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

  const carat_size = await DiamondCaratSize.findAll({
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
          company_info_id :client_id,
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
        old_data: diamondGroup?.dataValues
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

const addGroupToDB = async (list: any, id_app_user: any, client_id: any, req: Request) => {
  const { DiamondGroupMaster } = initModels(req);
  const trn = await (req.body.db_connection).transaction();
  let pcPayloadAdd: any = [];
  try {
    let editActivityLogs:any = [];
    let newAddActivityLogs:any = [];
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
        let data:any={
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
        }
        //Update
        await DiamondGroupMaster.update(
          data,
          { where: { id: group.group_id,company_info_id : client_id} }
        );
        data.id = group.group_id;
        editActivityLogs.push({ old_data: { diamond_group_master_id:group.group_id, data:{...group.old_data}}, new_data: { diamond_group_master_id:data.id, data: {...data} } })

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
          is_active: ActiveStatus.Active,
          company_info_id :client_id,
          created_date: getLocalDate(),
        });
      }
    }
    await addActivityLogs(req,client_id,editActivityLogs, null, LogsActivityType.Edit, LogsType.DiamondGroupMater, id_app_user,trn);
    const data = await DiamondGroupMaster.bulkCreate(pcPayloadAdd, { transaction: trn });
    for (let index = 0; index < data.length; index++) {
      const element = data[index].dataValues;
      newAddActivityLogs.push({ old_data: null, new_data: {...element} })
    }
    await addActivityLogs(req,client_id,newAddActivityLogs, null, LogsActivityType.Add, LogsType.DiamondGroupMater, id_app_user,trn);
    
    await trn.commit();
    await refreshAllMaterializedView(req.body.db_connection);
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};
