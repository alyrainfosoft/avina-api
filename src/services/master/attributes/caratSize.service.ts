import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../../data/interfaces/common/common.interface";
import CaratSize from "../../../model/master/attributes/caratSize.model";
import { ActiveStatus } from "../../../utils/app-enumeration";
import { RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../utils/shared-functions";

export const addCaratSize = async (req: Request) => {
    const { slug, value, sort_code, created_by } = req.body

    const sort_code_value = parseFloat(value) * 100

    try {
        const payload = {
            value: value,
            slug: slug,
            sort_code: sort_code_value,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
            created_by: req.body.session_res.id_app_user,
        }

            const valueExists = await CaratSize.findOne({ where: { slug: slug, is_deleted: "0" } });

        const slugExistes = await CaratSize.findOne({ where: { value: value, is_deleted: "0" } })

        if (valueExists === null && slugExistes === null) {
            await CaratSize.create(payload)
            console.log(payload);
            return resSuccess({data: payload});
        } else {
            return resErrorDataExit();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllCaratSize = async (req: Request) => {
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
          const totalItems = await CaratSize.count({
            where,
          });
      
          if (totalItems === 0) {
            return resSuccess({ data: { pagination, result: [] } });
          }
          pagination.total_items = totalItems;
          pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

        }

          const result = await CaratSize.findAll({
            where,
            limit: pagination.per_page_rows,
            offset: (pagination.current_page - 1) * pagination.per_page_rows,
            order: [[pagination.sort_by, pagination.order_by]],
            attributes: [
              "id",
              "value",
              "sort_code",
              "slug",
              "is_active",
            ],
            
          });

        return resSuccess({ data: noPagination ? result : { pagination, result  } })

    } catch (error) {
        throw error
    }

}

export const getByIdCaratSize = async (req: Request) => {
try {
    console.log(req.params.id);
    const caratSize = await CaratSize.findOne({ where: { id: req.params.id, is_deleted: "0" } });

    if (!(caratSize && caratSize.dataValues)) {
        return resNotFound();
      }
      return resSuccess({data: caratSize})
} catch (error) {
    throw error
}
}

export const updateCaratSize = async (req: Request) => {
    const {id, slug, value, sort_code, updated_by} = req.body

    const sort_code_value = parseFloat(value) * 100

try {
    const CaratSizeId = await CaratSize.findOne({ where: { id: id, is_deleted: "0" } })

    if (CaratSizeId) {
      const valueExists = await CaratSize.findOne({ where: { value: value, id: { [Op.ne]: id }, is_deleted: "0" } });
      const slugExists = await CaratSize.findOne({ where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" } });

      if (valueExists == null && slugExists == null) {
        const CaratSizeInfo = await (CaratSize.update(
          {
            value: value,
            slug: slug,
            sort_code: sort_code_value,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: id, is_deleted: "0" } }
        ));
        if (CaratSizeInfo) {
          const CaratSizeInformation = await CaratSize.findOne({ where: { id: id, is_deleted: "0" } })
          return resSuccess({data: CaratSizeInformation})
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

export const deleteCaratSize = async (req: Request) => {

    try {
        const caratSizeExists = await CaratSize.findOne({ where: { id: req.body.id, is_deleted: "0" } });

        console.log(caratSizeExists)

          if (!(caratSizeExists && caratSizeExists.dataValues)) {
            return resNotFound();
          }
          await CaratSize.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: caratSizeExists.dataValues.id } }
          );
      
          return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
    } catch (error) {
        throw error
    }
}

export const statusUpdateCaratSize = async (req: Request) => {
try {
    const CaratSizeExists = await CaratSize.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    if (CaratSizeExists) {
        const CaratSizeActionInfo = await (CaratSize.update(
            {
                is_active: req.body.is_active,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
            },
            { where: { id: CaratSizeExists.dataValues.id } }
        ));
        if (CaratSizeActionInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
} catch (error) {
    throw error
}
}