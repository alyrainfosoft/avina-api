import { Request } from "express";
import { Op } from "sequelize";
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

export const addCut = async (req: Request) => {
  try {
    const {CutsData} = initModels(req);
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

    const valueExists = await CutsData.findOne({
      where: { slug: slug, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (valueExists && valueExists.dataValues) {
      return resErrorDataExit();
    }
    const cut = await CutsData.create(payload);

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
            old_data: null,
            new_data: {
              cut_id: cut?.dataValues?.id, data: {
                ...cut?.dataValues
              }
            }
          }], cut?.dataValues?.id, LogsActivityType.Add, LogsType.Cut, req?.body?.session_res?.id_app_user)
          
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getCuts = async (req: Request) => {
  try {
    const {CutsData} = initModels(req);
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
              { value: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await CutsData.count({
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

    const result = await CutsData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "value",
        "slug",
        "created_date",
        "created_by",
        "is_active",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdCut = async (req: Request) => {
  try {
    const {CutsData} = initModels(req);
    const findCut = await CutsData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCut && findCut.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findCut });
  } catch (error) {
    throw error;
  }
};

export const updateCut = async (req: Request) => {
  try {
    const {CutsData} = initModels(req);
    const { value } = req.body;
    const id = req.params.id;
    const slug = createSlug(value);
    const findCut = await CutsData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCut && findCut.dataValues)) {
      return resNotFound();
    }
    const findName = await CutsData.findOne({
      where: {
        value: value,
        id: { [Op.ne]: id },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    await CutsData.update(
      {
        value: value,
        slug: slug,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );
    const AfterUpdatefindCut = await CutsData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { cut_id: findCut?.dataValues?.id, data: {...findCut?.dataValues} },
      new_data: {
        cut_id: AfterUpdatefindCut?.dataValues?.id, data: { ...AfterUpdatefindCut?.dataValues }
      }
    }], findCut?.dataValues?.id, LogsActivityType.Edit, LogsType.Cut, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteCut = async (req: Request) => {
  try {
    const {CutsData} = initModels(req);
    const findCut = await CutsData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCut && findCut.dataValues)) {
      return resNotFound();
    }
    await CutsData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findCut.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { cut_id: findCut?.dataValues?.id, data: {...findCut?.dataValues} },
      new_data: {
        cut_id: findCut?.dataValues?.id, data: {
          ...findCut?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findCut?.dataValues?.id, LogsActivityType.Delete, LogsType.Cut, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCut = async (req: Request) => {
  try {
    const {CutsData} = initModels(req);
    const findCut = await CutsData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findCut && findCut.dataValues)) {
      return resNotFound();
    }
    await CutsData.update(
      {
        is_active: statusUpdateValue(findCut),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findCut.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { cut_id: findCut?.dataValues?.id, data: {...findCut?.dataValues} },
      new_data: {
        cut_id: findCut?.dataValues?.id, data: {
          ...findCut?.dataValues, is_active: statusUpdateValue(findCut),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findCut?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Cut, req?.body?.session_res?.id_app_user)


    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
