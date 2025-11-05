import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../../data/interfaces/common/common.interface";
import MMSize from "../../../model/master/attributes/mmSize.model";
import { ActiveStatus } from "../../../utils/app-enumeration";
import { RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../utils/shared-functions";

export const addMMSize = async (req: Request) => {
    const { slug, value, created_by } = req.body
    try {
        const payload = {
            value: value,
            slug: slug,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
            created_by: req.body.session_res.id_app_user,
        }

            const valueExists = await MMSize.findOne({ where: { slug: slug, is_deleted: "0" } });

        const slugExistes = await MMSize.findOne({ where: { value: value, is_deleted: "0" } })

        if (valueExists === null && slugExistes === null) {
            await MMSize.create(payload)
            console.log(payload);
            return resSuccess({data: payload});
        } else {
            return resErrorDataExit();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllMMSize = async (req: Request) => {
    try {

        let pagination: IQueryPagination = {
            ...getInitialPaginationFromQuery(req.query),
          };
    let noPagination = req.query.no_pagination === "1";
      
          let where = [
            { is_deleted: "0" },
            pagination.is_active ? { is_active: pagination.is_active } : {},
            {
              [Op.or]: [
                  { value: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
                  { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },

              ],
              is_deleted : "0"
          }
          ];
          if (!noPagination) {
          const totalItems = await MMSize.count({
            where,
          });
      
          if (totalItems === 0) {
            return resSuccess({ data: { pagination, result: [] } });
          }
          pagination.total_items = totalItems;
          pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

        }

          const result = await MMSize.findAll({
            where,
            limit: pagination.per_page_rows,
            offset: (pagination.current_page - 1) * pagination.per_page_rows,
            order: [[pagination.sort_by, pagination.order_by]],
            attributes: [
              "id",
              "value",
              "slug",
              "is_active",
            ],
            
          });

        return resSuccess({ data: noPagination ? result : { pagination, result  } })

    } catch (error) {
        throw error
    }

}

export const getByIdMMSize = async (req: Request) => {
try {
    console.log(req.params.id);
    const MMSizes = await MMSize.findOne({ where: { id: req.params.id, is_deleted: "0" } });

    if (!(MMSizes && MMSizes.dataValues)) {
        return resNotFound();
      }
      return resSuccess({data: MMSizes})
} catch (error) {
    throw error
}
}

export const updateMMSize = async (req: Request) => {
    const {id, slug, value, updated_by} = req.body

try {
    const MMSizeId = await MMSize.findOne({ where: { id: id, is_deleted: "0" } })

    if (MMSizeId) {
      const valueExists = await MMSize.findOne({ where: { value: value, id: { [Op.ne]: id }, is_deleted: "0" } });
      const slugExists = await MMSize.findOne({ where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" } });

      if (valueExists == null && slugExists == null) {
        const MMSizeInfo = await (MMSize.update(
          {
            value: value,
            slug: slug,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: id, is_deleted: "0" } }
        ));
        if (MMSizeInfo) {
          const MMSizeInformation = await MMSize.findOne({ where: { id: id, is_deleted: "0" } })
          return resSuccess({data: MMSizeInformation})
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

export const deleteMMSize = async (req: Request) => {

    try {
        const MMSizeExists = await MMSize.findOne({ where: { id: req.body.id, is_deleted: "0" } });

        console.log(MMSizeExists)

          if (!(MMSizeExists && MMSizeExists.dataValues)) {
            return resNotFound();
          }
          await MMSize.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: MMSizeExists.dataValues.id } }
          );
      
          return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
    } catch (error) {
        throw error
    }
}

export const statusUpdateMMSize = async (req: Request) => {
try {
    const MMSizeExists = await MMSize.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    if (MMSizeExists) {
        const MMSizeActionInfo = await (MMSize.update(
            {
                is_active: req.body.is_active,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
            },
            { where: { id: MMSizeExists.dataValues.id } }
        ));
        if (MMSizeActionInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
} catch (error) {
    throw error
}
}