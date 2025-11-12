import { Request } from "express";
import { Op } from "sequelize";
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  Pagination,
} from "../../../utils/app-enumeration";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import {
  addActivityLogs,
  columnValueLowerCase,
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../utils/shared-functions";
import { init } from "wtfnode";
import { initModels } from "../../model/index.model";

export const addState = async (req: Request) => {
  try {
    const {StateData} = initModels(req);
    const { name, code, country_id } = req.body;

    const payload = {
      state_name: name,
      state_code: code,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      id_country: country_id,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
    };

    const findSortCode = await StateData.findOne({
      where: [
        columnValueLowerCase("state_code", code),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    const findName = await StateData.findOne({
      where: [
        columnValueLowerCase("state_name", name),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (
      findSortCode &&
      findName &&
      findSortCode.dataValues &&
      findName.dataValues
    ) {
      return resErrorDataExit();
    }
    const state = await StateData.create(payload);
    
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        state_id: state?.dataValues?.id, data: {
          ...state?.dataValues
        }
      }
    }], state?.dataValues?.id, LogsActivityType.Add, LogsType.State, req?.body?.session_res?.id_app_user)

    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getAllState = async (req: Request) => {
  try {
    const {StateData} = initModels(req);

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
              {
                state_name: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
              {
                state_code: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await StateData.count({
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

    const result = await StateData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "state_name",
        "state_code",
        "created_date",
        "id_country",
        "is_active",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdState = async (req: Request) => {
  try {
    const {StateData} = initModels(req);

    const findState = await StateData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findState && findState.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findState });
  } catch (error) {
    throw error;
  }
};

export const updateState = async (req: Request) => {
  try {
    const {StateData} = initModels(req);

    const { name, code, country_id } = req.body;
    const id = req.params.id;
    const findState = await StateData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findState && findState.dataValues)) {
      return resNotFound();
    }
    const findName = await StateData.findOne({
      where: [
        columnValueLowerCase("state_name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    const findSortCode = await StateData.findOne({
      where: [
        columnValueLowerCase("state_code", code),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (
      findSortCode &&
      findSortCode.dataValues &&
      findName &&
      findName.dataValues
    ) {
      return resErrorDataExit();
    }
    await StateData.update(
      {
        state_name: name,
        state_code: code,
        id_country: country_id,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );

    const afterUpdateFindState = await StateData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { state_id: findState?.dataValues?.id, data: {...findState?.dataValues} },
      new_data: {
        state_id: afterUpdateFindState?.dataValues?.id, data: {  ...afterUpdateFindState?.dataValues }
      }
    }], findState?.dataValues?.id, LogsActivityType.Edit, LogsType.State, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteState = async (req: Request) => {
  try {
    const {StateData} = initModels(req);

    const findState = await StateData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findState && findState.dataValues)) {
      return resNotFound();
    }
    await StateData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findState.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { state_id: findState?.dataValues?.id, data: {...findState?.dataValues} },
      new_data: {
        state_id: findState?.dataValues?.id, data: {
          ...findState?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findState?.dataValues?.id, LogsActivityType.Delete, LogsType.State, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForState = async (req: Request) => {
  try {
    const {StateData} = initModels(req);

    const findState = await StateData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findState && findState.dataValues)) {
      return resNotFound();
    }
    await StateData.update(
      {
        is_active:statusUpdateValue(findState),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findState.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { state_id: findState?.dataValues?.id, data: {...findState?.dataValues} },
      new_data: {
        state_id: findState?.dataValues?.id, data: {
          ...findState?.dataValues, is_active: statusUpdateValue(findState),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findState?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.State, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
