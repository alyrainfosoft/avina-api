import { Request } from "express";
import {
  addActivityLogs,
  columnValueLowerCase,
  getInitialPaginationFromQuery,
  getLocalDate,
  getWebSettingData,
  prepareMessageFromParams,
  resBadRequest,
  resSuccess,
} from "../../../utils/shared-functions";
import {
  DATA_ALREADY_EXIST,
  DEFAULT_STATUS_CODE_SUCCESS,
  DUPLICATE_ERROR_CODE,
  ERROR_NOT_FOUND,
  RECORD_DELETE_SUCCESSFULLY,
  STATUS_UPDATED,
} from "../../../utils/app-messages";
import { Op, Sequelize } from "sequelize";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
} from "../../../utils/app-enumeration";
import { MasterError } from "../../../utils/app-constants";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import { initModels } from "../../model/index.model";


export const addMaster = async (req: Request) => {
  try {
    const {Master,Image} = initModels(req);
    const {
      name,
      sort_code,
      stone_type,
      id_parent,
      value,
      master_type,
      session_res,
      link,
      import_name,
    } = req.body;
    const { file } = req;
    let filePath = null;

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType((req.body.db_connection),
        req.file,
        IMAGE_TYPE.Master,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      filePath = moveFileResult.data;
    }
    const slug = name
      .toLowerCase()
      .replaceAll(" ", "-")
      .replaceAll(/['/|]/g, "-");

    const duplicateName = await Master.findOne({
      where: [
        { name: columnValueLowerCase("name", name) },
        id_parent && { id_parent: id_parent },
        { master_type: master_type },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    const duplicateSortCode = await Master.findOne({
      where: [
        sort_code && sort_code != undefined
          ? {
              sort_code: columnValueLowerCase("sort_code", sort_code),
            }
          : {},
        id_parent && { id_parent: id_parent },
        { master_type: master_type },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    if (duplicateName && duplicateName.dataValues) {
      return resBadRequest({
        code: DUPLICATE_ERROR_CODE,
        message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
          ["field_name", MasterError[master_type as keyof typeof MasterError]],
        ]),
      });
    }

    if (sort_code && duplicateSortCode && duplicateSortCode.dataValues) {
      return resBadRequest({
        code: DUPLICATE_ERROR_CODE,
        message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
          ["field_name", MasterError[master_type as keyof typeof MasterError]],
        ]),
      });
    }

    if (id_parent) {
      const parentIdCheck = await Master.findOne({
        where: { id: id_parent,company_info_id :req?.body?.session_res?.client_id },
      });
      if (!parentIdCheck) {
        return resBadRequest({
          code: DUPLICATE_ERROR_CODE,
          message: prepareMessageFromParams(ERROR_NOT_FOUND, [
            ["field_name", "parent data"],
          ]),
        });
      }
    }

    const trn = await (req.body.db_connection).transaction();

    let imageId;
    try {
      if (file) {
        if (filePath) {
          const imageResult = await Image.create(
            {
              image_path: filePath,
              created_at: getLocalDate(),
              created_by: session_res.user_id,
              company_info_id :req?.body?.session_res?.client_id,
              is_deleted: DeletedStatus.No,
              is_active: ActiveStatus.Active,
              image_type: IMAGE_TYPE.Master,
            },
            { transaction: trn }
          );
          imageId = imageResult.dataValues.id;
        }
      }
      const masterData = await Master.create(
        {
          name,
          slug,
          sort_code,
          id_image: imageId,
          id_parent,
          value,
          link,
          import_name,
          master_type,
          stone_type: stone_type,
          is_deleted: DeletedStatus.No,
          is_active: ActiveStatus.Active,
          created_at: getLocalDate(),
          created_by: session_res.user_id,
          company_info_id :req?.body?.session_res?.client_id
        },
        { transaction: trn }
      );

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          master_id: masterData?.dataValues?.id, data: {
            ...masterData?.dataValues
          }
        }
      }], masterData?.dataValues?.id, LogsActivityType.Add, LogsType.Master, req?.body?.session_res?.id_app_user,trn)

      await trn.commit();
      return resSuccess();
    } catch (e) {
      trn.rollback();
      throw e;
    }
  } catch (error) {
      throw error;
  }
};

export const updateMaster = async (req: Request) => {
  try {
    const {Master,Image} = initModels(req);

    const { id } = req.params;
    const {
      name,
      sort_code,
      stone_type,
      id_parent,
      value,
      master_type,
      session_res,
      link,
      import_name,
    } = req.body;
    const slug = name
      .toLowerCase()
      .replaceAll(" ", "-")
      .replaceAll(/['/|]/g, "-");
    let filePath = null;

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType((req.body.db_connection),
        req.file,
        IMAGE_TYPE.Master,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      filePath = moveFileResult.data;
    }

    const duplicateName = await Master.findOne({
      where: {
        id: { [Op.ne]: id },
        name: columnValueLowerCase("name", name),
        master_type: master_type,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    const duplicateSortCode = await Master.findOne({
      where: [
        { id: { [Op.ne]: id } },
        sort_code && sort_code != undefined
          ? {
              sort_code: columnValueLowerCase("sort_code", sort_code),
            }
          : {},
        id_parent && { id_parent: id_parent },
        { master_type: master_type },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    if (duplicateName && duplicateName.dataValues) {
      return resBadRequest({
        code: DUPLICATE_ERROR_CODE,
        message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
          ["field_name", MasterError[master_type as keyof typeof MasterError]],
        ]),
      });
    }

    if (sort_code && duplicateSortCode && duplicateSortCode.dataValues) {
      return resBadRequest({
        code: DUPLICATE_ERROR_CODE,
        message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
          ["field_name", MasterError[master_type as keyof typeof MasterError]],
        ]),
      });
    }

    const MasterData = await Master.findOne({
      where: {
        id: id,
        is_deleted: DeletedStatus.No,
        master_type: master_type,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (id_parent) {
      const parentIdCheck = await Master.findOne({
        where: { id: id_parent,company_info_id :req?.body?.session_res?.client_id },
      });
      if (!parentIdCheck) {
        return resBadRequest({
          code: DUPLICATE_ERROR_CODE,
          message: prepareMessageFromParams(ERROR_NOT_FOUND, [
            ["field_name", "parent data"],
          ]),
        });
      }
    }

    const trn = await (req.body.db_connection).transaction();

    if (MasterData) {
      const imageUpdate = await Image.findOne({
        where: {
          id: MasterData.dataValues.id_image,
          is_deleted: DeletedStatus.No,
          company_info_id :req?.body?.session_res?.client_id
        },
      });
      if (imageUpdate) {
        const { file } = req;
        if (file) {
          await Image.update(
            {
              image_path: filePath,
              modified_at: getLocalDate(),
              modified_by: session_res.user_id,
              is_deleted: DeletedStatus.No,
              image_type: IMAGE_TYPE.Master,
            },
            {
              where: { id: imageUpdate.dataValues.id,company_info_id :req?.body?.session_res?.client_id },
              transaction: trn,
            }
          );
        }
      }
      await Master.update(
        {
          name: name,
          slug: slug,
          sort_code: sort_code,
          stone_type: stone_type,
          id_image: imageUpdate?.dataValues.id,
          id_parent,
          value,
          link: link,
          import_name,
          is_deleted: DeletedStatus.No,
          modified_at: getLocalDate(),
          modified_by: session_res.user_id,
        },
        {
          where: {
            id: MasterData.dataValues.id,
            is_deleted: DeletedStatus.No,
            company_info_id :req?.body?.session_res?.client_id
          },
        }
      );

      const AfterUpdateMasterData = await Master.findOne({
        where: {
          id: id,
          is_deleted: DeletedStatus.No,
          master_type: master_type,
        },
      });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { master_id: MasterData?.dataValues?.id, data: {...MasterData?.dataValues} },
        new_data: {
          master_id: AfterUpdateMasterData?.dataValues?.id, data: { ...AfterUpdateMasterData?.dataValues }
        }
      }], MasterData?.dataValues?.id, LogsActivityType.Edit, LogsType.Master, req?.body?.session_res?.id_app_user,trn)
      
      trn.commit();
      return resSuccess();
    } else {
      return resBadRequest({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [
          ["field_name", MasterError[master_type as keyof typeof MasterError]],
        ]),
      });
    }
  } catch (error) {
    throw error;
  }
};

export const masterList = async (req: Request) => {
  try {
    const { Master,Image } = initModels(req);
    const { master_type } = req.params;
    const { query } = req;
    let pagination = {
      ...getInitialPaginationFromQuery(query),
      search_text: query.search_text,
    };

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { master_type: master_type },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: {
              name: { [Op.iLike]: `%${pagination.search_text}%` },
              slug: { [Op.iLike]: `%${pagination.search_text}%` },
            },
          }
        : {},
    ];

    const totalItems = await Master.count({
      where,
    });

    if (totalItems === 0) {
      return resSuccess({ data: { pagination, result: [] } });
    }

    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    const configData:any = getWebSettingData(req.body.db_connection,req?.body?.session_res?.client_id)
    const Masters = await Master.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "sort_code",
        "is_active",
        "stone_type",
        "id_image",
        "id_parent",
        "link",
        "import_name",
        [
          Sequelize.fn(
            "CONCAT",
            configData.image_base_url,
            Sequelize.literal(`"image"."image_path"`)
          ),
          "image_path",
        ],
      ],
      include: [
        {
          required: false,
          model: Image,
          attributes: [],
          as: "image",
          where:{company_info_id :req?.body?.session_res?.client_id},
        },
      ],
    });
    return resSuccess({ data: { pagination, result: Masters } });
  } catch (error) {
    throw error;
  }
};

export const masterDetail = async (req: Request) => {
  try {
    const { Master,Image } = initModels(req);

    const { id, master_type } = req.params;
    const configData:any = getWebSettingData(req.body.db_connection,req?.body?.session_res?.client_id)
    const MasterData = await Master.findOne({
      where: {
        id: id,
        is_deleted: DeletedStatus.No,
        master_type: master_type,
        company_info_id :req?.body?.session_res?.client_id,
      },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "sort_code",
        "is_active",
        "stone_type",
        "id_image",
        "id_parent",
        "link",
        "import_name",
        [
          Sequelize.fn(
            "CONCAT",
            configData.image_base_url,
            Sequelize.literal(`"image"."image_path"`)
          ),
          "image_path",
        ],
      ],
      include: [
        {
          required: false,
          model: Image,
          attributes: [],
          as: "image",
          where:{company_info_id :req?.body?.session_res?.client_id},
        },
      ],
    });

    if (!(MasterData && MasterData.dataValues)) {
      return resBadRequest({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [
          ["field_name", MasterError[master_type as keyof typeof MasterError]],
        ]),
      });
    }

    return resSuccess({ data: MasterData });
  } catch (error) {
    throw error;
  }
};

export const masterStatusUpdate = async (req: Request) => {
  try {
    const { Master,Image } = initModels(req);

    const { id, master_type } = req.params;
    const { session_res } = req.body;

    const MasterData = await Master.findOne({
      where: {
        id: id,
        is_deleted: DeletedStatus.No,
        master_type: master_type,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(MasterData && MasterData.dataValues)) {
      return resBadRequest({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [
          ["field_name", MasterError[master_type as keyof typeof MasterError]],
        ]),
      });
    }

    switch (MasterData?.dataValues.is_active) {
      case ActiveStatus.Active:
        await Master.update(
          {
            is_active: ActiveStatus.InActive,
            modified_at: getLocalDate(),
            modified_by: session_res.user_id,
          },
          { where: { id: MasterData.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
        );
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: { master_id: MasterData?.dataValues?.id, data: {...MasterData?.dataValues} },
          new_data: {
            master_id: MasterData?.dataValues?.id, data: {
              ...MasterData?.dataValues, is_active: ActiveStatus.Active,
              modified_date: getLocalDate(),
              modified_by: req?.body?.session_res?.id_app_user,
            }
          }
        }], MasterData?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Master, req?.body?.session_res?.id_app_user)
          
        return resSuccess({ message: STATUS_UPDATED });

      case ActiveStatus.InActive:
        await Master.update(
          {
            is_active: ActiveStatus.Active,
            modified_at: getLocalDate(),
            modified_by: session_res.user_id,
          },
          { where: { id: MasterData.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
        );

        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: { master_id: MasterData?.dataValues?.id, data: {...MasterData?.dataValues} },
          new_data: {
            master_id: MasterData?.dataValues?.id, data: {
              ...MasterData?.dataValues, is_active: ActiveStatus.Active,
              modified_date: getLocalDate(),
              modified_by: req?.body?.session_res?.id_app_user,
            }
          }
        }], MasterData?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Master, req?.body?.session_res?.id_app_user)
          
    
        return resSuccess({ message: STATUS_UPDATED });

      default:
        break;
    }
  } catch (error) {
    throw error;
  }
};

export const masterDelete = async (req: Request) => {
  try {
    const { Master,Image } = initModels(req);

    const { id, master_type } = req.params;
    const { session_res } = req.body;

    const MasterData = await Master.findOne({
      where: {
        id: id,
        is_deleted: DeletedStatus.No,
        master_type: master_type,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    const ParentData = await Master.findAll({
      where: {
        id_parent: id,
        master_type: master_type,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    if (!(MasterData && MasterData.dataValues)) {
      return resBadRequest({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [
          ["field_name", MasterError[master_type as keyof typeof MasterError]],
        ]),
      });
    }

    if (ParentData.length > 0) {
      await Master.update(
        {
          id_deleted: DeletedStatus.yes,
          deleted_at: getLocalDate(),
          deleted_by: session_res.user_id,
        },
        {
          where: { id: ParentData.map((t) => t.dataValues.id) ,company_info_id :req?.body?.session_res?.client_id},
        }
      );
    }

    await Master.update(
      {
        is_deleted: DeletedStatus.yes,
        deleted_at: getLocalDate(),
        deleted_by: session_res.user_id,
      },
      {
        where: { id: MasterData.dataValues.id,company_info_id :req?.body?.session_res?.client_id },
      }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { master_id: MasterData?.dataValues?.id, data:{...MasterData?.dataValues} },
      new_data: {
        master_id: MasterData?.dataValues?.id, data: {
          ...MasterData?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], MasterData?.dataValues?.id, LogsActivityType.Delete, LogsType.Master, req?.body?.session_res?.id_app_user)


    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
