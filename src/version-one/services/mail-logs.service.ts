import { Request } from "express";
import { getInitialPaginationFromQuery, resNotFound, resSuccess } from "../../utils/shared-functions";
import { Pagination } from "../../utils/app-enumeration";
import { literal, Op, where as whereClause} from "sequelize";
import { initModels } from "../model/index.model";

export const getMailLog = async (req: Request) => {
  try {
    const { EamilLog } = initModels(req);
    let paginationProps = {};

    let pagination:any = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === Pagination.no;
      const startDateFilter: any =req?.query?.start_date != undefined ? req?.query?.start_date : new Date().getFullYear();

      const endDateFilter: any = req?.query?.end_date != undefined ? req?.query?.end_date : new Date();
      const endDate = new Date(endDateFilter);
      endDate.setDate(endDate.getDate() + 1);
    
    let where = [
      {company_info_id :req?.body?.session_res?.client_id},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
                whereClause(literal(`actual_subject::text`),  {[Op.iLike]: `%${pagination.search_text}%`}),
                whereClause(literal(`actual_body::text`), {[Op.iLike]: `%${pagination.search_text}%`}),
                whereClause(literal('mail_type::text'), { [Op.iLike]: `%${pagination.search_text}%` }),
                whereClause(literal('response_status::text'), { [Op.iLike]: `%${pagination.search_text}%` }),
                { to: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                { from: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                { cc: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                whereClause(literal(`success_response::text`), { [Op.iLike]: `%${pagination.search_text}%` }),
                whereClause(literal(`error_message->>'response'`),
                {
                  [Op.iLike]: `%${pagination.search_text}%`
                }),
            ],
        }
        : {},
        { created_at: { [Op.between]: [startDateFilter, endDate] }}
    ];

    if (!noPagination) {
      const totalItems = await EamilLog.count({
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

    const result = await EamilLog.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "actual_subject", 
        "actual_body",  
        "to", 
        "from" , 
        "cc", 
        "mail_type", 
        "response_status", 
        "attachment", 
        "success_response", 
        "error_message",
        "created_at",
        "updated_at"
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdMailLogs = async (req: Request) => {
  try {
    const { EamilLog } = initModels(req);

    const findMailLogs = await EamilLog.findOne({
        attributes: [
        "id",
        "actual_subject", 
        "actual_body",  
        "to", 
        "from" , 
        "cc", 
        "mail_type", 
        "response_status", 
        "attachment", 
        "success_response", 
        "error_message",
        "created_at",
        "updated_at"
      ],
      where: { id: req.params.id,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findMailLogs && findMailLogs.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findMailLogs });
  } catch (error) {
    throw error;
  }
};