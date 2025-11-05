import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import CityData from "../../model/master/city.model";
import { ActiveStatus } from "../../utils/app-enumeration";
import { RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../utils/shared-functions";


export const addCity = async (req: Request) => {
    const { name, code, image, created_by, state_id } = req.body
    try {
        const payload = {
            city_name: name,
            city_code: code,
            id_state: state_id,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
            created_by: req.body.session_res.id_app_user,
        }

            const CityCodeExists = await CityData.findOne({ where: { city_code: code, is_deleted: "0" } });

        const cityNameExistes = await CityData.findOne({ where: { city_name: name, is_deleted: "0" } })
        if (CityCodeExists === null && cityNameExistes === null) {
            await CityData.create(payload)
            console.log(payload);
            return resSuccess({data: payload});
        } else {
            return resErrorDataExit();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllCity = async (req: Request) => {
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
            { city_name: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
            { city_code: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await CityData.count({
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

    const result = await CityData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "city_name",
        "city_code",
        "id_state",
        "created_date",
        "is_active",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
}

export const getByIdCity = async (req: Request) => {
try {
    console.log(req.params.id);
    const city = await CityData.findOne({ where: { id: req.params.id, is_deleted: "0" } });

    if (!(city && city.dataValues)) {
        return resNotFound();
      }
      return resSuccess({data: city})
} catch (error) {
    throw error
}
}

export const updateCity = async (req: Request) => {
    const {id, name, code, state_id, updated_by} = req.body

try {
    const cityId = await CityData.findOne({ where: { id: id, is_deleted: "0" } })

    if (cityId) {
      const CityCodeExists = await CityData.findOne({ where: { city_code: code, id: { [Op.ne]: id }, is_deleted: "0" } });
      if (CityCodeExists == null) {
        const CityInfo = await (CityData.update(
          {
            city_name: name,
            city_code: code,
            id_state: state_id,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: id, is_deleted: "0" } }
        ));
        if (CityInfo) {
          const CityInformation = await CityData.findOne({ where: { id: id, is_deleted: "0" } })
          return resSuccess({data: CityInformation})
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

export const deleteCity = async (req: Request) => {

    try {
        const CityExists = await CityData.findOne({ where: { id: req.body.id, is_deleted: "0" } });

        console.log(CityExists)

          if (!(CityExists && CityExists.dataValues)) {
            return resNotFound();
          }
          await CityData.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: CityExists.dataValues.id } }
          );
      
          return resSuccess();
    } catch (error) {
        throw error
    }
}

export const statusUpdateCity = async (req: Request) => {
try {
    const CityExists = await CityData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    if (CityExists) {
        const CityActionInfo = await (CityData.update(
            {
                is_active: req.body.is_active,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
            },
            { where: { id: CityExists.dataValues.id } }
        ));
        if (CityActionInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
} catch (error) {
    throw error
}
}