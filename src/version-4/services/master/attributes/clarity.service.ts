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

export const addDiamondClarity = async (req: Request) => {
  try {
    const {ClarityData} = initModels(req);
    const { name } = req.body;
    const slug = createSlug(name);
    const nameExists = await ClarityData.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (nameExists && nameExists.dataValues) {
      return resErrorDataExit();
    }
    const payload = {
      value: name,
      slug: slug,
      name: name,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
    };
    const clarity = await ClarityData.create(payload);

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        clarity_id: clarity?.dataValues?.id, data: {
          ...clarity?.dataValues
        }
      }
    }], clarity?.dataValues?.id, LogsActivityType.Add, LogsType.Clarity, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getDiamondClarity = async (req: Request) => {
  try {
    const {ClarityData} = initModels(req);

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
              { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await ClarityData.count({
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

    const result = await ClarityData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "value", "name", "slug", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdClarity = async (req: Request) => {
  try {
    const {ClarityData} = initModels(req);

    const findClarity = await ClarityData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findClarity && findClarity.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findClarity });
  } catch (error) {
    throw error;
  }
};

export const updateClarity = async (req: Request) => {
  try {
    const {ClarityData} = initModels(req);

    const { name } = req.body;
    const slug = createSlug(name);
    const id = req.params.id;
    const ClarityId = await ClarityData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(ClarityId && ClarityId.dataValues)) {
      return resNotFound();
    }

    const findName = await ClarityData.findOne({
      where: [
        columnValueLowerCase("name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id}
      ],
    });
    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    await ClarityData.update(
      {
        value: name,
        slug: slug,
        name: name,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );

    const AfterUpdateClarityId = await ClarityData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { clarity_id: ClarityId?.dataValues?.id, data: {...ClarityId?.dataValues} },
        new_data: {
          clarity_id: AfterUpdateClarityId?.dataValues?.id, data: { ...AfterUpdateClarityId?.dataValues }
        }
      }], ClarityId?.dataValues?.id, LogsActivityType.Edit, LogsType.Clarity, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteClarity = async (req: Request) => {
  try {
    const {ClarityData} = initModels(req);

    const findClarity = await ClarityData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findClarity && findClarity.dataValues)) {
      return resNotFound();
    }
    await ClarityData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findClarity.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { clarity_id: findClarity?.dataValues?.id, data: {...findClarity?.dataValues} },
      new_data: {
        clarity_id: findClarity?.dataValues?.id, data: {
          ...findClarity?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findClarity?.dataValues?.id, LogsActivityType.Delete, LogsType.Clarity, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForClarity = async (req: Request) => {
  try {
    const {ClarityData} = initModels(req);

    const findClarity = await ClarityData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findClarity && findClarity.dataValues)) {
      return resNotFound();
    }
    await ClarityData.update(
      {
        is_active: statusUpdateValue(findClarity),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findClarity.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { clarity_id: findClarity?.dataValues?.id, data: {...findClarity?.dataValues} },
        new_data: {
          clarity_id: findClarity?.dataValues?.id, data: {
            ...findClarity?.dataValues, is_active: statusUpdateValue(findClarity),
            modified_date: getLocalDate(),
            modified_by: req?.body?.session_res?.id_app_user,
          }
        }
      }], findClarity?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Clarity, req?.body?.session_res?.id_app_user)
            
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
