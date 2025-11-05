import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../../../data/interfaces/common/common.interface";
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  Pagination,
} from "../../../../utils/app-enumeration";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../utils/app-messages";
import {
  addActivityLogs,
  columnValueLowerCase,
  createSlug,
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../../utils/shared-functions";
import { initModels } from "../../../model/index.model";

export const addMMSize = async (req: Request) => {
  try {
    const { MMSizeData } = initModels(req);
    const { value } = req.body;
    const slug = createSlug(value);
    const payload = {
      value: value,
      slug: slug,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
    };

    const findValue = await MMSizeData.findOne({
      where: [
        columnValueLowerCase("slug", slug),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    if (findValue && findValue.dataValues) {
      return resErrorDataExit();
    }

    const mmSize = await MMSizeData.create(payload);
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        mm_size_id: mmSize?.dataValues?.id, data: {
          ...mmSize?.dataValues
        }
      }
    }], mmSize?.dataValues?.id, LogsActivityType.Add, LogsType.MMSize, req?.body?.session_res?.id_app_user)

    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getAllMMSize = async (req: Request) => {
  try {
    const { MMSizeData } = initModels(req);

    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      {
        [Op.or]: [
          { value: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
        is_deleted: DeletedStatus.No,
      },
    ];
    if (!noPagination) {
      const totalItems = await MMSizeData.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    }

    const result = await MMSizeData.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "value", "slug", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdMMSize = async (req: Request) => {
  try {
    const { MMSizeData } = initModels(req);

    const findSize = await MMSizeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findSize && findSize.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findSize });
  } catch (error) {
    throw error;
  }
};

export const updateMMSize = async (req: Request) => {
  try {
    const { MMSizeData } = initModels(req);

    const { value } = req.body;
    const id = req.params.id;
    const slug = createSlug(value);
    const findSize = await MMSizeData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findSize && findSize.dataValues)) {
      return resNotFound();
    }
    const valueExists = await MMSizeData.findOne({
      where: [
        columnValueLowerCase("value", value),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id}
      ],
    });
    if (valueExists && valueExists.dataValues) {
      return resErrorDataExit();
    }

    await MMSizeData.update(
      {
        value: value,
        slug: slug,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );
    const afterUpdatefindSize = await MMSizeData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { mm_size_id: findSize?.dataValues?.id, data: {...findSize?.dataValues} },
      new_data: {
        mm_size_id: afterUpdatefindSize?.dataValues?.id, data: { ...afterUpdatefindSize?.dataValues }
      }
    }], findSize?.dataValues?.id, LogsActivityType.Edit, LogsType.MMSize, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteMMSize = async (req: Request) => {
  try {
    const { MMSizeData } = initModels(req);

    const findSize = await MMSizeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    console.log(findSize);

    if (!(findSize && findSize.dataValues)) {
      return resNotFound();
    }
    await MMSizeData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findSize.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { mm_size_id: findSize?.dataValues?.id, data: {...findSize?.dataValues} },
      new_data: {
        mm_size_id: findSize?.dataValues?.id, data: {
          ...findSize?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findSize?.dataValues?.id, LogsActivityType.Delete, LogsType.MMSize, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForMMSize = async (req: Request) => {
  try {
    const { MMSizeData } = initModels(req);

    const findSize = await MMSizeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findSize && findSize.dataValues)) {
      return resNotFound();
    }
    await MMSizeData.update(
      {
        is_active: statusUpdateValue(findSize),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findSize.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { mm_size_id: findSize?.dataValues?.id, data: {...findSize?.dataValues} },
      new_data: {
        mm_size_id: findSize?.dataValues?.id, data: {
          ...findSize?.dataValues, is_active: statusUpdateValue(findSize),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findSize?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.MMSize, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
