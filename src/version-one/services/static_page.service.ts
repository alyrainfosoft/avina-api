import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import { ActiveStatus, DeletedStatus, LogsActivityType, LogsType, Pagination } from "../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { addActivityLogs, getCompanyIdBasedOnTheCompanyKey, getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../utils/shared-functions";
import { initModels } from "../model/index.model";

export const addStaticPage = async (req: Request) => {
  const { name, slug, content, created_by } = req.body
  try {
    const { StaticPageData } = initModels(req);
    const payload = {
      page_title: name,
      slug: slug,
      content: content,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id: req.body.session_res.client_id
    }
    const StaticPageNameExistes = await StaticPageData.findOne({ where: { page_title: name, is_deleted: DeletedStatus.No, company_info_id: req.body.session_res.client_id } })
    const StaticPageSlugExistes = await StaticPageData.findOne({ where: { slug: slug, is_deleted: DeletedStatus.No, company_info_id: req.body.session_res.client_id } })

    if (StaticPageNameExistes === null && StaticPageSlugExistes == null) {
      const result = await StaticPageData.create(payload)
      await addActivityLogs(req, req?.body?.session_res?.client_id, [{
        old_data: null,
        new_data: {
          static_page_id: result?.dataValues?.id, data: {
            ...result?.dataValues
          }
        }
      }], result?.dataValues?.id, LogsActivityType.Add, LogsType.StaticPage, req?.body?.session_res?.id_app_user)

      return resSuccess({ data: payload });
    } else {
      return resErrorDataExit();
    }
  } catch (error) {
    throw (error)
  }
}

export const getAllStaticPages = async (req: Request) => {
  try {
    const { StaticPageData } = initModels(req);
    let paginationProps = {};
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      { is_deleted: DeletedStatus.No },
      { company_info_id: req.body.session_res.client_id },
      {
        [Op.or]: [
          { page_title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },

        ],
        is_deleted: "0"
      }
    ];

    if (!noPagination) {
      const totalItems = await StaticPageData.count({
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

    const result = await StaticPageData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "page_title",
        "slug",
        "content",
        "created_date",
        "created_by",
        "is_active"
      ],

    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });

  } catch (error) {
    throw error
  }

}

export const getByIdStaticPage = async (req: Request) => {
  try {
    const { StaticPageData } = initModels(req);

    const StaticPage = await StaticPageData.findOne({ where: { id: req.params.id, is_deleted: DeletedStatus.No } });

    if (!(StaticPage && StaticPage.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: StaticPage })
  } catch (error) {
    throw error
  }
}

export const updateStaticPages = async (req: Request) => {
  const { id, name, slug, content, updated_by } = req.body
  const { StaticPageData } = initModels(req);
  try {
    const staticPageId = await StaticPageData.findOne({ where: { id: id, is_deleted: DeletedStatus.No, company_info_id: req.body.session_res.client_id } })

    if (staticPageId) {
      const staticPageExists = await StaticPageData.findOne({ where: { page_title: name, id: { [Op.ne]: id }, is_deleted: DeletedStatus.No, company_info_id: req.body.session_res.client_id } });
      const staticPageSlugExists = await StaticPageData.findOne({ where: { slug: slug, id: { [Op.ne]: id }, is_deleted: DeletedStatus.No, company_info_id: req.body.session_res.client_id } });

      if (staticPageExists == null && staticPageSlugExists == null) {
        const StaticPageInfo = await (StaticPageData.update(
          {
            page_title: name,
            slug: slug,
            content: content,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: id, is_deleted: DeletedStatus.No } }
        ));
        if (StaticPageInfo) {
          const StaticPageInformation = await StaticPageData.findOne({ where: { id: id, is_deleted: DeletedStatus.No, company_info_id: req.body.session_res.client_id } })


          await addActivityLogs(req, req?.body?.session_res?.client_id, [{
            old_data: { static_page_id: staticPageId?.dataValues?.id, data: staticPageId?.dataValues },
            new_data: {
              static_page_id: StaticPageInformation?.dataValues?.id, data: { ...StaticPageInformation?.dataValues }
            }
          }], staticPageId?.dataValues?.id, LogsActivityType.Edit, LogsType.StaticPage, req?.body?.session_res?.id_app_user)

          return resSuccess({ data: StaticPageInformation })
        }
      } else {
        return resErrorDataExit()
      }
    } else {
      return resNotFound()
    }

  } catch (error) {
    throw (error);
  }

}

export const deleteStaticPage = async (req: Request) => {

  try {
    const { StaticPageData } = initModels(req);

    const StaticPageExists = await StaticPageData.findOne({ where: { id: req.body.id, is_deleted: DeletedStatus.No } });

    if (!(StaticPageExists && StaticPageExists.dataValues)) {
      return resNotFound();
    }
    await StaticPageData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: StaticPageExists.dataValues.id } }
    );
    await addActivityLogs(req, req?.body?.session_res?.client_id, [{
      old_data: { static_page_id: StaticPageExists?.dataValues?.id, data: { ...StaticPageExists?.dataValues } },
      new_data: {
        static_page_id: StaticPageExists?.dataValues?.id, data: {
          ...StaticPageExists?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], StaticPageExists?.dataValues?.id, LogsActivityType.Delete, LogsType.StaticPage, req?.body?.session_res?.id_app_user)

    return resSuccess();
  } catch (error) {
    throw error
  }
}

export const statusUpdateStaticPage = async (req: Request) => {
  try {
    const { StaticPageData } = initModels(req);

    const StaticPageExists = await StaticPageData.findOne({ where: { id: req.body.id, is_deleted: DeletedStatus.No } });
    if (StaticPageExists) {
      const StaticPageActionInfo = await (StaticPageData.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        },
        { where: { id: StaticPageExists.dataValues.id } }
      ));
      if (StaticPageActionInfo) {

        await addActivityLogs(req, req?.body?.session_res?.client_id, [{
          old_data: { static_page_id: StaticPageExists?.dataValues?.id, data: { ...StaticPageExists?.dataValues } },
          new_data: {
            static_page_id: StaticPageExists?.dataValues?.id, data: {
              ...StaticPageExists?.dataValues, is_active: req.body.is_active,
              modified_date: getLocalDate(),
              modified_by: req?.body?.session_res?.id_app_user,
            }
          }
        }], StaticPageExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.StaticPage, req?.body?.session_res?.id_app_user)

        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error
  }
}

export const getByslugStaticPageUser = async (req: Request) => {
  try {
    const { StaticPageData } = initModels(req);

    const { slug } = req.body
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query, req.body.db_connection);
    if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return company_info_id;
    }
    const StaticPage = await StaticPageData.findOne({
      where: { slug: slug, is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active, company_info_id: company_info_id?.data },
      attributes: ["id", "page_title", "slug", "content", "created_date"]
    });

    if (!(StaticPage && StaticPage.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: StaticPage })

  } catch (error) {
    throw error
  }
}