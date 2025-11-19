import { Request } from "express";
import { Op } from "sequelize";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
  TAG_NOT_FOUND,
  TAG_WITH_SAME_NAME,
} from "../../../../utils/app-messages";
import {
  addActivityLogs,
  columnValueLowerCase,
  getInitialPaginationFromQuery,
  getLocalDate,
  resNotFound,
  resSuccess,
  resUnprocessableEntity,
  statusUpdateValue,
} from "../../../../utils/shared-functions";
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  Pagination,
} from "../../../../utils/app-enumeration";
import { initModels } from "../../../model/index.model";

export const getTags = async (req: Request) => {
  try {
    const { Tag } = initModels(req);
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await Tag.count({
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

    const result = await Tag.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "name", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdTag = async (req: Request) => {
  try {
    const { Tag } = initModels(req);

    const findTag = await Tag.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
      attributes: ["id", "name", "is_active"],
    });

    if (!(findTag && findTag.dataValues)) {
      return resNotFound();
    }

    return resSuccess({ data: findTag });
  } catch (error) {
    throw error;
  }
};

export const addTag = async (req: Request) => {
  try {
    const { name } = req.body;
    const { Tag } = initModels(req);

    const findTag = await Tag.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    if (findTag && findTag.dataValues) {
      return resUnprocessableEntity({ message: TAG_WITH_SAME_NAME });
    }
    const tagDate = await Tag.create({
      name,
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
      created_date: getLocalDate(),
    });

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        tag_id: tagDate?.dataValues?.id, data: {
          ...tagDate?.dataValues
        }
      }
    }], tagDate?.dataValues?.id, LogsActivityType.Add, LogsType.Tag, req?.body?.session_res?.id_app_user)

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const updateTag = async (req: Request) => {
  try {
    const { name } = req.body;
    const id = req.params.id;
    const { Tag } = initModels(req);

    const findTag = await Tag.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findTag && findTag.dataValues)) {
      return resNotFound({ message: TAG_NOT_FOUND });
    }

    const findName = await Tag.findOne({
      where: [
        columnValueLowerCase("name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        { company_info_id :req?.body?.session_res?.client_id },
      ],
    });

    if (findName && findName.dataValues) {
      return resUnprocessableEntity({ message: TAG_WITH_SAME_NAME });
    }

    await Tag.update(
      {
        name: name,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },

      {
        where: {
          id: findTag.dataValues.id,
          is_deleted: DeletedStatus.No,
          company_info_id :req?.body?.session_res?.client_id,
        },
      }
    );
    const afterUpdatefindTag = await Tag.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { tag_id: findTag?.dataValues?.id, data: {...findTag?.dataValues} },
      new_data: {
        tag_id: afterUpdatefindTag?.dataValues?.id, data: { ...afterUpdatefindTag?.dataValues }
      }
    }], findTag?.dataValues?.id, LogsActivityType.Edit, LogsType.Tag, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteTag = async (req: Request) => {
  try {
    const { Tag } = initModels(req);

    const tagToBeDelete = await Tag.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(tagToBeDelete && tagToBeDelete.dataValues)) {
      return resNotFound({ message: TAG_NOT_FOUND });
    }

    await Tag.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: tagToBeDelete.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { tag_id: tagToBeDelete?.dataValues?.id, data: {...tagToBeDelete?.dataValues }},
      new_data: {
        tag_id: tagToBeDelete?.dataValues?.id, data: {
          ...tagToBeDelete?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], tagToBeDelete?.dataValues?.id, LogsActivityType.Delete, LogsType.Tag, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForTag = async (req: Request) => {
  try {
    const { Tag } = initModels(req);

    const id = req.params.id;
    const findTag = await Tag.findOne({
      where: { id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findTag && findTag.dataValues)) {
      return resNotFound({ message: TAG_NOT_FOUND });
    }

    await Tag.update(
      {
        is_active: statusUpdateValue(findTag),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findTag.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { tag_id: findTag?.dataValues?.id, data: {...findTag?.dataValues} },
      new_data: {
        tag_id: findTag?.dataValues?.id, data: {
          ...findTag?.dataValues, is_active: statusUpdateValue(findTag),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findTag?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Tag, req?.body?.session_res?.id_app_user)
      

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
