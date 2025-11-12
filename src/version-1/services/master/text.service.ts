import { Request } from "express";
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
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  Pagination,
} from "../../../utils/app-enumeration";
import { Op } from "sequelize";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import { initModels } from "../../model/index.model";

export const addTaxData = async (req: Request) => {
  try {
    const { TaxMaster} = initModels(req);
    const { name, rate } = req.body;
    const slug = name.replaceAll(" ", "-").replaceAll(/['/|]/g, "-");
    const payload = {
      name: name,
      slug: slug,
      rate: rate,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
    };

    const findName = await TaxMaster.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    const tax = await TaxMaster.create(payload);

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        tax_id: tax?.dataValues?.id, data: {
          ...tax?.dataValues
        }
      }
    }], tax?.dataValues?.id, LogsActivityType.Add, LogsType.Tax, req?.body?.session_res?.id_app_user)

    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getAllTaxData = async (req: Request) => {
  try {
    let paginationProps = {};
    const { TaxMaster} = initModels(req);

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
      const totalItems = await TaxMaster.count({
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

    const result = await TaxMaster.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "name", "rate", "slug", "created_date", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdTax = async (req: Request) => {
  try {
    const { TaxMaster} = initModels(req);

    const findTaxData = await TaxMaster.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findTaxData && findTaxData.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findTaxData });
  } catch (error) {
    throw error;
  }
};

export const updateTaxData = async (req: Request) => {
  try {
    const { TaxMaster} = initModels(req);

    const { name, rate } = req.body;
    const id = req.params.id;
    const slug = name.replaceAll(" ", "-").replaceAll(/['/|]/g, "-");

    const findTax = await TaxMaster.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findTax && findTax.dataValues)) {
      return resNotFound();
    }
    const findName = await TaxMaster.findOne({
      where: [
        columnValueLowerCase("name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    await TaxMaster.update(
      {
        name,
        rate,
        slug,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );

    const afterUpdateFindTax = await TaxMaster.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { tax_id: findTax?.dataValues?.id, data:{ ...findTax?.dataValues } },
      new_data: {
        tax_id: afterUpdateFindTax?.dataValues?.id, data: { ...afterUpdateFindTax?.dataValues }
      }
    }], findTax?.dataValues?.id, LogsActivityType.Edit, LogsType.Tax, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteTax = async (req: Request) => {
  try {
    const { TaxMaster} = initModels(req);

    const findTax = await TaxMaster.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findTax && findTax.dataValues)) {
      return resNotFound();
    }
    await TaxMaster.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findTax.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { tax_id: findTax?.dataValues?.id, data: {...findTax?.dataValues} },
      new_data: {
        tax_id: findTax?.dataValues?.id, data: {
          ...findTax?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findTax?.dataValues?.id, LogsActivityType.Delete, LogsType.Tax, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForTax = async (req: Request) => {
  try {
    const { TaxMaster} = initModels(req);

    const findTax = await TaxMaster.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findTax && findTax.dataValues)) {
      return resNotFound();
    }
    await TaxMaster.update(
      {
        is_active: statusUpdateValue(findTax),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findTax.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { tax_id: findTax?.dataValues?.id, data: {...findTax?.dataValues} },
      new_data: {
        tax_id: findTax?.dataValues?.id, data: {
          ...findTax?.dataValues, is_active: statusUpdateValue(findTax),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findTax?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Tax, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
