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
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../../utils/shared-functions";
import { initModels } from "../../../model/index.model";

export const addSieveSize = async (req: Request) => {
  try {
    const {SieveSizeData} = initModels(req);
    const { sort_code, value } = req.body;
    const slug = value.replaceAll(" ", "-").replaceAll(/['/|]/g, "-");
    const payload = {
      value: value,
      slug: slug,
      sort_code: sort_code,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
    };

    const findValue = await SieveSizeData.findOne({
      where: { value: value, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    const findSortCode = await SieveSizeData.findOne({
      where: { sort_code: sort_code, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (
      (findValue && findValue.dataValues) ||
      (findSortCode && findSortCode.dataValues)
    ) {
      return resErrorDataExit();
    }
    const SieveSize = await SieveSizeData.create(payload);
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        sieve_size_id: SieveSize?.dataValues?.id, data: {
          ...SieveSize?.dataValues
        }
      }
    }], SieveSize?.dataValues?.id, LogsActivityType.Add, LogsType.SieveSize, req?.body?.session_res?.id_app_user)

    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getSieveSizes = async (req: Request) => {
  try {
    const {SieveSizeData} = initModels(req);

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
      const totalItems = await SieveSizeData.count({
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

    const result = await SieveSizeData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "value", "sort_code", "slug", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdSieveSize = async (req: Request) => {
  try {
    const {SieveSizeData} = initModels(req);

    const findSieveSize = await SieveSizeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findSieveSize && findSieveSize.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findSieveSize });
  } catch (error) {
    throw error;
  }
};

export const updateSieveSize = async (req: Request) => {
  try {
    const { sort_code, value } = req.body;
    const id = req.body.id;
    const {SieveSizeData} = initModels(req);

    const slug = value.replaceAll(" ", "-").replaceAll(/['/|]/g, "-");
    const findSieveSize = await SieveSizeData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findSieveSize && findSieveSize.dataValues)) {
      return resNotFound();
    }
    const findValue = await SieveSizeData.findOne({
      where: {
        value: value,
        id: { [Op.ne]: id },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    const findSortCode = await SieveSizeData.findOne({
      where: {
        sort_code: sort_code,
        id: { [Op.ne]: id },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });
    if (
      (findValue && findValue.dataValues) ||
      (findSortCode && findSortCode.dataValues)
    ) {
      return resErrorDataExit();
    }

    await SieveSizeData.update(
      {
        value: value,
        slug: slug,
        sort_code: sort_code,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );
    const AfterUpdatefindSieveSize = await SieveSizeData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { sieve_size_id: findSieveSize?.dataValues?.id, data: {...findSieveSize?.dataValues} },
      new_data: {
        sieve_size_id: AfterUpdatefindSieveSize?.dataValues?.id, data: { ...AfterUpdatefindSieveSize?.dataValues }
      }
    }], findSieveSize?.dataValues?.id, LogsActivityType.Edit, LogsType.SieveSize, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteSieveSize = async (req: Request) => {
  try {
    const {SieveSizeData} = initModels(req);

    const findSieveSize = await SieveSizeData.findOne({
      where: { id: req.body.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findSieveSize && findSieveSize.dataValues)) {
      return resNotFound();
    }
    await SieveSizeData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findSieveSize.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { sieve_size_id: findSieveSize?.dataValues?.id, data: {...findSieveSize?.dataValues} },
      new_data: {
        sieve_size_id: findSieveSize?.dataValues?.id, data: {
          ...findSieveSize?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findSieveSize?.dataValues?.id, LogsActivityType.Delete, LogsType.SieveSize, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForSieveSize = async (req: Request) => {
  try {
    const {SieveSizeData} = initModels(req);

    const findSieveSize = await SieveSizeData.findOne({
      where: { id: req.body.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findSieveSize && findSieveSize.dataValues)) {
      return resNotFound();
    }
    await SieveSizeData.update(
      {
        is_active: statusUpdateValue(findSieveSize),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findSieveSize.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { sieve_size_id: findSieveSize?.dataValues?.id, data: {...findSieveSize?.dataValues} },
      new_data: {
        sieve_size_id: findSieveSize?.dataValues?.id, data: {
          ...findSieveSize?.dataValues, is_active: statusUpdateValue(findSieveSize),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findSieveSize?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.SieveSize, req?.body?.session_res?.id_app_user)
      


    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
