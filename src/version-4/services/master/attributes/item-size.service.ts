import { Request } from "express";
import { Op } from "sequelize";
import {SizeData} from "../../../model/master/attributes/item-size.model";
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

export const addSize = async (req: Request) => {
  try {
    const {SizeData} = initModels(req);
    const { value } = req.body;
    const slug = createSlug(value);
    const payload = {
      size: value,
      slug: slug,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
    };

    const findName = await SizeData.findOne({
      where: [
        columnValueLowerCase("size", value),
        { is_deleted: DeletedStatus.No },
        { company_info_id :req?.body?.session_res?.client_id }
      ],
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    const itemSize = await SizeData.create(payload);
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        item_size_id: itemSize?.dataValues?.id, data: {
          ...itemSize?.dataValues
        }
      }
    }], itemSize?.dataValues?.id, LogsActivityType.Add, LogsType.ItemSize, req?.body?.session_res?.id_app_user)

    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getSizes = async (req: Request) => {
  try {
    const {SizeData} = initModels(req);

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
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await SizeData.count({
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

    const result = await SizeData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "size", "slug", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const updateSize = async (req: Request) => {
  try {
    const {SizeData} = initModels(req);

    const { value } = req.body;
    const id = req.params.id;
    const slug = createSlug(value);
    const findSize = await SizeData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findSize && findSize.dataValues)) {
      return resNotFound();
    }
    const findValue = await SizeData.findOne({
      where: [
        columnValueLowerCase("size", value),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (findValue && findValue.dataValues) {
      return resErrorDataExit();
    }
    await SizeData.update(
      {
        size: value,
        slug: slug,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );

    const afterUpdatefindSize = await SizeData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { item_size_id: findSize?.dataValues?.id, data: {...findSize?.dataValues} },
      new_data: {
        item_size_id: afterUpdatefindSize?.dataValues?.id, data: { ...afterUpdatefindSize?.dataValues }
      }
    }], findSize?.dataValues?.id, LogsActivityType.Edit, LogsType.ItemSize, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteSize = async (req: Request) => {
  try {
    const {SizeData} = initModels(req);

    const findSize = await SizeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id},
    });

    if (!(findSize && findSize.dataValues)) {
      return resNotFound();
    }
    await SizeData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findSize.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { item_size_id: findSize?.dataValues?.id, data: {...findSize?.dataValues} },
      new_data: {
        item_size_id: findSize?.dataValues?.id, data: {
          ...findSize?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findSize?.dataValues?.id, LogsActivityType.Delete, LogsType.ItemSize, req?.body?.session_res?.id_app_user)


    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForSize = async (req: Request) => {
  try {
    const {SizeData} = initModels(req);

    const findSize = await SizeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findSize && findSize.dataValues)) {
      return resNotFound();
    }
    await SizeData.update(
      {
        is_active: statusUpdateValue(findSize),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findSize.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { item_size_id: findSize?.dataValues?.id, data: {...findSize?.dataValues} },
      new_data: {
        item_size_id: findSize?.dataValues?.id, data: {
          ...findSize?.dataValues, is_active: statusUpdateValue(findSize),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findSize?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.ItemSize, req?.body?.session_res?.id_app_user)


      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
