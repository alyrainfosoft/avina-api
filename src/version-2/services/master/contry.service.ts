import { Request } from "express";
import { Op } from "sequelize";
import CountryData from "../../model/master/country.model";
import {
  ActiveStatus,
  DeletedStatus,
  Pagination,
} from "../../../utils/app-enumeration";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import {
  columnValueLowerCase,
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
} from "../../../utils/shared-functions";
import { statusUpdateValue } from "../../../utils/shared-functions";

export const addCountry = async (req: Request) => {
  try {
    const { name, code } = req.body;

    const payload = {
      country_name: name,
      country_code: code,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
    };

    const findSortCode = await CountryData.findOne({
      where: [
        columnValueLowerCase("country_code", code),
        { is_deleted: DeletedStatus.No },
      ],
    });

    const findName = await CountryData.findOne({
      where: [
        columnValueLowerCase("country_name", name),
        { is_deleted: DeletedStatus.No },
      ],
    });
    if (
      findSortCode &&
      findSortCode.dataValues &&
      findName &&
      findName.dataValues
    ) {
      return resErrorDataExit();
    }
    await CountryData.create(payload);
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getAllCountry = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      { is_deleted: DeletedStatus.No },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              {
                country_name: {
                  [Op.iLike]: "%" + pagination.search_text + "%",
                },
              },
              {
                country_code: {
                  [Op.iLike]: "%" + pagination.search_text + "%",
                },
              },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await CountryData.count({
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

    const result = await CountryData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "country_name", "country_code", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdCountry = async (req: Request) => {
  try {
    const findCountry = await CountryData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findCountry && findCountry.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findCountry });
  } catch (error) {
    throw error;
  }
};

export const updateCountry = async (req: Request) => {
  try {
    const { name, code } = req.body;
    const id = req.params.id;
    const findCountry = await CountryData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });

    if (!(findCountry && findCountry.dataValues)) {
      return resNotFound();
    }
    const findName = await CountryData.findOne({
      where: [
        columnValueLowerCase("country_name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
      ],
    });
    const findSortCode = await CountryData.findOne({
      where: [
        columnValueLowerCase("country_code", code),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
      ],
    });
    if (
      findSortCode &&
      findSortCode.dataValues &&
      findName &&
      findName.dataValues
    ) {
      return resErrorDataExit();
    }
    await CountryData.update(
      {
        country_name: name,
        country_code: code,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No } }
    );

    return resSuccess({ data: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteCountry = async (req: Request) => {
  try {
    const findCountry = await CountryData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findCountry && findCountry.dataValues)) {
      return resNotFound();
    }
    await CountryData.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findCountry.dataValues.id } }
    );
    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCountry = async (req: Request) => {
  try {
    const findCountry = await CountryData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findCountry && findCountry.dataValues)) {
      return resNotFound();
    }

    await CountryData.update(
      {
        is_active: statusUpdateValue(findCountry),
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findCountry.dataValues.id } }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
