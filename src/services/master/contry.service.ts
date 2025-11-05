import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import ContryData from "../../model/master/country.model";
import { ActiveStatus } from "../../utils/app-enumeration";
import { ERROR_ALREADY_EXIST, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resBadRequest, resErrorDataExit, resNotFound, resSuccess } from "../../utils/shared-functions";

export const addCountry = async (req: Request) => {
    const { name, code, image, created_by, updated_by } = req.body
    try {
        const payload = {
            country_name: name,
            country_code: code,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
            created_by: req.body.session_res.id_app_user,
        }

        const countryCodeExists = await ContryData.findOne({ where: { country_code: code, is_deleted: "0", } });

        const contryNameExistes = await ContryData.findOne({ where: { country_name: name, is_deleted: "0", } })
        if (countryCodeExists === null && contryNameExistes === null) {
            await ContryData.create(payload)
            console.log(payload);
            return resSuccess({data: payload});
        } else {
            return resErrorDataExit();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllCountry = async (req: Request) => {
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
            { country_name: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
            { country_code: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await ContryData.count({
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

    const result = await ContryData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "country_name",
        "country_code",
        "is_active",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
}

export const getByIdCountry = async (req: Request) => {
try {
    console.log(req.params.id);
    const Contry = await ContryData.findOne({ where: { id: req.params.id, is_deleted: "0", } });

    if (!(Contry && Contry.dataValues)) {
        return resNotFound();
      }
      return resSuccess({data: Contry})
} catch (error) {
    throw error
}
}

export const updateCountry = async (req: Request) => {
    const {id, name, code, image, updated_by} = req.body

try {
    const ContryId = await ContryData.findOne({ where: { id: id, is_deleted: "0" } })

    if (ContryId) {
      const countryCodeExists = await ContryData.findOne({ where: { country_code: code, id: { [Op.ne]: id }, is_deleted: "0" } });
      if (countryCodeExists == null) {
        const countryInfo = await (ContryData.update(
          {
            country_name: name,
            country_code: code,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: id, is_deleted: "0", } }
        ));
        if (countryInfo) {
          const countryInformation = await ContryData.findOne({ where: { id: id, is_deleted: "0", } })
          return resSuccess({data: countryInformation})
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

export const deleteCountry = async (req: Request) => {

    try {
        const countryExists = await ContryData.findOne({ where: { id: req.body.id, is_deleted: "0" } });

        console.log(countryExists)

          if (!(countryExists && countryExists.dataValues)) {
            return resNotFound();
          }
          await ContryData.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: countryExists.dataValues.id } }
          );
      
          return resSuccess();
    } catch (error) {
        throw error
    }
}

export const statusUpdateCountry = async (req: Request) => {
try {
    const countryExists = await ContryData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    if (countryExists) {
        const countryActionInfo = await (ContryData.update(
            {
                is_active: req.body.is_active,
                modified_by: req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
            },
            { where: { id: countryExists.dataValues.id } }
        ));
        if (countryActionInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
} catch (error) {
    throw error
}
}