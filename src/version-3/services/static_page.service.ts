import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import staticPageData from "../model/static_page.model";
import { ActiveStatus } from "../../utils/app-enumeration";
import { RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../utils/shared-functions";

export const addStaticPage = async (req: Request) => {
    const { name, slug, content, created_by } = req.body
    try {
        const payload = {
            page_title: name,
            slug: slug,
            content: content,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
            created_by: req.body.session_res.id_app_user
        }

        const StaticPageNameExistes = await staticPageData.findOne({ where: { page_title: name, is_deleted: "0" } })
        const StaticPageSlugExistes = await staticPageData.findOne({ where: { slug: slug, is_deleted: "0" } })

        if (StaticPageNameExistes === null && StaticPageSlugExistes == null) {
            await staticPageData.create(payload)
            console.log(payload);
            return resSuccess({data: payload});
        } else {
            return resErrorDataExit();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllStaticPages = async (req: Request) => {
    try {

        let pagination: IQueryPagination = {
            ...getInitialPaginationFromQuery(req.query),
          };
      
          let where = [
            { is_deleted: "0" },
            {
              [Op.or]: [
                  { page_title: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
                  { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },

              ],
              is_deleted : "0"
          }
          ];
      
          const totalItems = await staticPageData.count({
            where,
          });
      
          if (totalItems === 0) {
            return resSuccess({ data: { pagination, result: [] } });
          }
          pagination.total_items = totalItems;
          pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

          const result = await staticPageData.findAll({
            where,
            limit: pagination.per_page_rows,
            offset: (pagination.current_page - 1) * pagination.per_page_rows,
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

        return resSuccess({ data: { pagination, result } })

    } catch (error) {
        throw error
    }

}

export const getByIdStaticPage = async (req: Request) => {
try {
    console.log(req.params.id);
    const StaticPage = await staticPageData.findOne({ where: { id: req.params.id, is_deleted: "0" } });

    if (!(StaticPage && StaticPage.dataValues)) {
        return resNotFound();
      }
      return resSuccess({data: StaticPage})
} catch (error) {
    throw error
}
}

export const updateStaticPages = async (req: Request) => {
    const {id, name, slug, content, updated_by } = req.body


try {
    const staticPageId = await staticPageData.findOne({ where: { id: id, is_deleted: "0" } })

    if (staticPageId) {
      const staticPageExists = await staticPageData.findOne({ where: { page_title: name, id: { [Op.ne]: id }, is_deleted: "0" } });
      const staticPageSlugExists = await staticPageData.findOne({ where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" } });

      if (staticPageExists == null && staticPageSlugExists == null) {
        const StaticPageInfo = await (staticPageData.update(
          {
            page_title: name,
            slug: slug,
            content: content,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: id, is_deleted: "0" } }
        ));
        if (StaticPageInfo) {
          const StaticPageInformation = await staticPageData.findOne({ where: { id: id, is_deleted: "0" } })
          return resSuccess({data: StaticPageInformation})
        }
      } else {
        return resErrorDataExit()
      }
    } else {
        return resNotFound() 
    }

} catch (error) {
    throw(error);
}

}

export const deleteStaticPage = async (req: Request) => {

    try {
        const StaticPageExists = await staticPageData.findOne({ where: { id: req.body.id, is_deleted: "0" } });

        console.log(StaticPageExists)

          if (!(StaticPageExists && StaticPageExists.dataValues)) {
            return resNotFound();
          }
          await staticPageData.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: StaticPageExists.dataValues.id } }
          );
      
          return resSuccess();
    } catch (error) {
        throw error
    }
}

export const statusUpdateStaticPage = async (req: Request) => {
try {
    const StaticPageExists = await staticPageData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    if (StaticPageExists) {
        const StaticPageActionInfo = await (staticPageData.update(
            {
                is_active: req.body.is_active,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
            },
            { where: { id: StaticPageExists.dataValues.id } }
        ));
        if (StaticPageActionInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
} catch (error) {
    throw error
}
}

export const getByslugStaticPageUser  =async (req:Request) => {
  try {
    const {slug} = req.body

    const StaticPage = await staticPageData.findOne({ 
      where: { slug: slug, is_deleted: "0", is_active: ActiveStatus.Active },
      attributes: ["id", "page_title", "slug", "content", "created_date"]
     });

    if (!(StaticPage && StaticPage.dataValues)) {
        return resNotFound();
      }
      return resSuccess({data: StaticPage})

  } catch (error) {
    throw error
  }
}