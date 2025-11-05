import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../../data/interfaces/common/common.interface";
import ClarityData from "../../../model/master/attributes/clarity.model";
import { ActiveStatus } from "../../../utils/app-enumeration";
import { RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../utils/shared-functions";

export const addClarity = async (req: Request) => {
    const { slug, name, value, created_by } = req.body
    try {
        const payload = {
            value: value,
            slug: slug,
            name: name,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
            created_by: req.body.session_res.id_app_user,
        }

            const nameExists = await ClarityData.findOne({ where: { name: name, is_deleted: "0" } });

        const slugExistes = await ClarityData.findOne({ where: { slug: slug, is_deleted: "0" } })

        if (nameExists === null && slugExistes === null) {
            await ClarityData.create(payload)
            console.log(payload);
            return resSuccess({data: payload});
        } else {
            return resErrorDataExit();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllClarity = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: "0" },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
          [Op.or]: [
            { value: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
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
      attributes: [
        "id",
        "value",
        "name",
        "slug",
        "is_active",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }

}

export const getByIdClarity = async (req: Request) => {
try {
    console.log(req.params.id);
    const Clarity = await ClarityData.findOne({ where: { id: req.params.id, is_deleted: "0" } });

    if (!(Clarity && Clarity.dataValues)) {
        return resNotFound();
      }
      return resSuccess({data: Clarity})
} catch (error) {
    throw error
}
}

export const updateClarity = async (req: Request) => {
    const {id, slug, name, value, updated_by} = req.body

try {
    const ClarityId = await ClarityData.findOne({ where: { id: id, is_deleted: "0" } })

    if (ClarityId) {
      const nameExists = await ClarityData.findOne({ where: { name: name, id: { [Op.ne]: id }, is_deleted: "0" } });
      const slugExists = await ClarityData.findOne({ where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" } });

      if (nameExists == null && slugExists == null) {
        const ClarityInfo = await (ClarityData.update(
          {
            value: value,
            slug: slug,
            name: name,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: id, is_deleted: "0" } }
        ));
        if (ClarityInfo) {
          const ClarityInformation = await ClarityData.findOne({ where: { id: id, is_deleted: "0" } })
          return resSuccess({data: ClarityInformation})
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

export const deleteClarity = async (req: Request) => {

    try {
        const ClarityExists = await ClarityData.findOne({ where: { id: req.body.id, is_deleted: "0" } });

        console.log(ClarityExists)

          if (!(ClarityExists && ClarityExists.dataValues)) {
            return resNotFound();
          }
          await ClarityData.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: ClarityExists.dataValues.id } }
          );
      
          return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
    } catch (error) {
        throw error
    }
}

export const statusUpdateClarity = async (req: Request) => {
try {
    const ClarityExists = await ClarityData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    if (ClarityExists) {
        const ClarityActionInfo = await (ClarityData.update(
            {
                is_active: req.body.is_active,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
            },
            { where: { id: ClarityExists.dataValues.id } }
        ));
        if (ClarityActionInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
} catch (error) {
    throw error
}
}