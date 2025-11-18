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

export const addSettingCaratWeight = async (req: Request) => {
  try {
    const {SettingCaratWeight} = initModels(req);
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

    const findValue = await SettingCaratWeight.findOne({
      where: [
        columnValueLowerCase("value", value),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (findValue && findValue.dataValues) {
      return resErrorDataExit();
    }

    const settionCaratWeight = await SettingCaratWeight.create(payload);
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        setting_carat_weight_id: settionCaratWeight?.dataValues?.id, data: {
          ...settionCaratWeight?.dataValues
        }
      }
    }], settionCaratWeight?.dataValues?.id, LogsActivityType.Add, LogsType.SettingCaratWeight, req?.body?.session_res?.id_app_user)

    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getSettingCaratWeight = async (req: Request) => {
  try {
    const {SettingCaratWeight} = initModels(req);

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
      const totalItems = await SettingCaratWeight.count({
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

    const result = await SettingCaratWeight.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "value", "slug", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdSettingCaratWeight = async (req: Request) => {
  try {
    const {SettingCaratWeight} = initModels(req);

    const findSettingCaratWeight = await SettingCaratWeight.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findSettingCaratWeight && findSettingCaratWeight.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findSettingCaratWeight });
  } catch (error) {
    throw error;
  }
};

export const updateSettingCaratWeight = async (req: Request) => {
  try {
    const {SettingCaratWeight} = initModels(req);

    const { value } = req.body;
    const id = req.params.id;
    const slug = createSlug(value);
    const findSetting = await SettingCaratWeight.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findSetting && findSetting.dataValues)) {
      return resNotFound();
    }

    const findValue = await SettingCaratWeight.findOne({
      where: [
        columnValueLowerCase("value", value),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        { company_info_id :req?.body?.session_res?.client_id },
      ],
    });
    if (findValue && findValue.dataValues) {
      return resErrorDataExit();
    }

    await SettingCaratWeight.update(
      {
        value: value,
        slug: slug,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No, company_info_id :req?.body?.session_res?.client_id } }
    );
    const afterUpdatefindSetting = await SettingCaratWeight.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { setting_carat_weight_id: findSetting?.dataValues?.id, data: {...findSetting?.dataValues }},
      new_data: {
        setting_carat_weight_id: afterUpdatefindSetting?.dataValues?.id, data: {...afterUpdatefindSetting?.dataValues }
      }
    }], findSetting?.dataValues?.id, LogsActivityType.Edit, LogsType.SettingCaratWeight, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteSettingCaratWeight = async (req: Request) => {
  try {
    const {SettingCaratWeight} = initModels(req);

    const findSetting = await SettingCaratWeight.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findSetting && findSetting.dataValues)) {
      return resNotFound();
    }
    await SettingCaratWeight.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findSetting.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { setting_carat_weight_id: findSetting?.dataValues?.id, data: {...findSetting?.dataValues} },
      new_data: {
        setting_carat_weight_id: findSetting?.dataValues?.id, data: {
          ...findSetting?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findSetting?.dataValues?.id, LogsActivityType.Delete, LogsType.SettingCaratWeight, req?.body?.session_res?.id_app_user)


    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForSettingCaratWeight = async (req: Request) => {
  try {
    const {SettingCaratWeight} = initModels(req);

    const findSetting = await SettingCaratWeight.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findSetting && findSetting.dataValues)) {
      return resNotFound();
    }

    await SettingCaratWeight.update(
      {
        is_active: statusUpdateValue(findSetting),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findSetting.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { setting_carat_weight_id: findSetting?.dataValues?.id, data: {...findSetting?.dataValues} },
      new_data: {
        setting_carat_weight_id: findSetting?.dataValues?.id, data: {
          ...findSetting?.dataValues, is_active: statusUpdateValue(findSetting),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findSetting?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.SettingCaratWeight, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
