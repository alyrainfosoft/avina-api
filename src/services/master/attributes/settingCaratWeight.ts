import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../../data/interfaces/common/common.interface";
import SettingCaratWeight from "../../../model/master/attributes/settingCaratWeight.model";
import { ActiveStatus } from "../../../utils/app-enumeration";
import { RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../utils/shared-functions";

export const addSettingCaratWeight = async (req: Request) => {
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

            const valueExists = await SettingCaratWeight.findOne({ where: { slug: slug, is_deleted: "0" } });

        const slugExistes = await SettingCaratWeight.findOne({ where: { value: value, is_deleted: "0" } })

        if (valueExists === null && slugExistes === null) {
            await SettingCaratWeight.create(payload)
            console.log(payload);
            return resSuccess({data: payload});
        } else {
            return resErrorDataExit();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllSettingCaratWeight = async (req: Request) => {
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
            { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await SettingCaratWeight.count({
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

    const result = await SettingCaratWeight.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "value",
        "slug",
        "is_active",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }

}

export const getByIdSettingCaratWeight = async (req: Request) => {
try {
    console.log(req.params.id);
    const settingCaratWeight = await SettingCaratWeight.findOne({ where: { id: req.params.id, is_deleted: "0" } });

    if (!(settingCaratWeight && settingCaratWeight.dataValues)) {
        return resNotFound();
      }
      return resSuccess({data: settingCaratWeight})
} catch (error) {
    throw error
}
}

export const updateSettingCaratWeight = async (req: Request) => {
    const {id, slug, value, updated_by} = req.body

try {
    const SettingCaratWeightId = await SettingCaratWeight.findOne({ where: { id: id, is_deleted: "0" } })

    if (SettingCaratWeightId) {
      const valueExists = await SettingCaratWeight.findOne({ where: { value: value, id: { [Op.ne]: id }, is_deleted: "0" } });
      const slugExists = await SettingCaratWeight.findOne({ where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" } });

      if (valueExists == null && slugExists == null) {
        const SettingCaratWeightInfo = await (SettingCaratWeight.update(
          {
            value: value,
            slug: slug,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: id, is_deleted: "0" } }
        ));
        if (SettingCaratWeightInfo) {
          const SettingCaratWeightInformation = await SettingCaratWeight.findOne({ where: { id: id, is_deleted: "0" } })
          return resSuccess({data: SettingCaratWeightInformation})
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

export const deleteSettingCaratWeight = async (req: Request) => {

    try {
        const SettingCaratWeightExists = await SettingCaratWeight.findOne({ where: { id: req.body.id, is_deleted: "0" } });

        console.log(SettingCaratWeightExists)

          if (!(SettingCaratWeightExists && SettingCaratWeightExists.dataValues)) {
            return resNotFound();
          }
          await SettingCaratWeight.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: SettingCaratWeightExists.dataValues.id } }
          );
      
          return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
    } catch (error) {
        throw error
    }
}

export const statusUpdateSettingCaratWeight = async (req: Request) => {
try {
    const SettingCaratWeightExists = await SettingCaratWeight.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    if (SettingCaratWeightExists) {
        const SettingCaratWeightActionInfo = await (SettingCaratWeight.update(
            {
                is_active: req.body.is_active,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
            },
            { where: { id: SettingCaratWeightExists.dataValues.id } }
        ));
        if (SettingCaratWeightActionInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
} catch (error) {
    throw error
}
}