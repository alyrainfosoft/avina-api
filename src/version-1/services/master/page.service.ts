import { Request } from "express";
import {
  getCompanyIdBasedOnTheCompanyKey,
  addActivityLogs,
  getInitialPaginationFromQuery,
  getLocalDate,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../utils/shared-functions";
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  Pagination,
} from "../../../utils/app-enumeration";
import { Op } from "sequelize";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import { initModels } from "../../model/index.model";

export const addPage = async (req: Request) => {
  const { name, description, url } = req.body;
  try {
    const {PageData} = initModels(req);
    const payload = {
      name,
      description,
      url,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_restrict: "0",
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
    };

    const pagedata =await PageData.create(payload);
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        page_id: pagedata?.dataValues?.id, data: {
          ...pagedata?.dataValues
        }
      }
    }], pagedata?.dataValues?.id, LogsActivityType.Add, LogsType.Page, req?.body?.session_res?.id_app_user)

    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getPages = async (req: Request) => {
  try {
    const {PageData} = initModels(req);

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
              {
                description: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
              { url: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await PageData.count({
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

    const result = await PageData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "description",
        "url",
        "created_date",
        "is_active",
        "is_restrict",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdPage = async (req: Request) => {
  try {
    const {PageData} = initModels(req);

    const findPage = await PageData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findPage && findPage.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findPage });
  } catch (error) {
    throw error;
  }
};

export const updatePage = async (req: Request) => {
  try {
    const {PageData} = initModels(req);

    const { name, description, url } = req.body;
    const id = req.params.id;
    const findPage = await PageData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findPage && findPage.dataValues)) {
      return resNotFound();
    }

    const updatePage = await PageData.update(
      {
        name,
        description,
        url,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );
    if (updatePage) {
      const findUpdatedPage = await PageData.findOne({
        where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
      });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { page_id: findPage?.dataValues?.id, data: {...findPage?.dataValues} },
        new_data: {
          page_id: findUpdatedPage?.dataValues?.id, data: { ...findUpdatedPage?.dataValues }
        }
      }], findPage?.dataValues?.id, LogsActivityType.Edit, LogsType.Page, req?.body?.session_res?.id_app_user)
      
      return resSuccess({ data: findUpdatedPage });
    }
  } catch (error) {
    throw error;
  }
};

export const deletePage = async (req: Request) => {
  try {
    const {PageData} = initModels(req);

    const findPage = await PageData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findPage && findPage.dataValues)) {
      return resNotFound();
    }
    await PageData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findPage.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { page_id: findPage?.dataValues?.id, data: {...findPage?.dataValues} },
      new_data: {
        page_id: findPage?.dataValues?.id, data: {
          ...findPage?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findPage?.dataValues?.id, LogsActivityType.Delete, LogsType.Page, req?.body?.session_res?.id_app_user)

    return resSuccess({ data: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForPage = async (req: Request) => {
  try {
    const {PageData} = initModels(req);

    const findPage = await PageData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findPage && findPage.dataValues)) {
      return resNotFound();
    }
    await PageData.update(
      {
        is_active: statusUpdateValue(findPage),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findPage.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { page_id: findPage?.dataValues?.id, data: {...findPage?.dataValues} },
      new_data: {
        page_id: findPage?.dataValues?.id, data: {
          ...findPage?.dataValues, is_active: statusUpdateValue(findPage),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findPage?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Page, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const restrictStatusUpdateForPage = async (req: Request) => {
  try {
    const {PageData} = initModels(req);

    const findPage = await PageData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findPage && findPage.dataValues)) {
      return resNotFound();
    }
    await PageData.update(
      {
        is_restrict: findPage.dataValues.is_restrict === "1" ? "0" : "1",
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findPage.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    const AfterUpdateFindPage = await PageData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { page_id: findPage?.dataValues?.id, data: {...findPage?.dataValues} },
      new_data: {
        page_id: AfterUpdateFindPage?.dataValues?.id, data: { ...AfterUpdateFindPage?.dataValues }
      }
    }], findPage?.dataValues?.id, LogsActivityType.Edit, LogsType.Page, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const pageListForDropdown = async (req: Request) => {
  try {
    const {PageData} = initModels(req);

    const result = await PageData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active ,company_info_id:req?.body?.session_res?.client_id},
      attributes: ["id", "name", "url"],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
