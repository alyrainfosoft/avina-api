import { Request } from "express";
import { Op } from "sequelize";
import CurrencyData from "../../model/master/currency.model";
import {
  ActiveStatus,
  DeletedStatus,
  Pagination,
} from "../../../utils/app-enumeration";
import {
  CURRENCY_DEFAULT_EXITS,
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
  statusUpdateValue,
} from "../../../utils/shared-functions";

export const addCurrency = async (req: Request) => {
  try {
    const { name, rate } = req.body;

    const payload = {
      currency: name,
      rate: rate,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      is_default: "0",
      created_by: req.body.session_res.id_app_user,
    };
    const findName = await CurrencyData.findOne({
      where: [
        columnValueLowerCase("currency", name),
        { is_deleted: DeletedStatus.No },
      ],
    });
    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    await CurrencyData.create(payload);
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getAllCurrency = async (req: Request) => {
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
              { currency: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await CurrencyData.count({
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

    const result = await CurrencyData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "currency",
        "rate",
        "created_date",
        "is_active",
        "is_default",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdCurrency = async (req: Request) => {
  try {
    const findCurrency = await CurrencyData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findCurrency && findCurrency.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findCurrency });
  } catch (error) {
    throw error;
  }
};

export const updateCurrency = async (req: Request) => {
  try {
    const { name, rate } = req.body;
    const id = req.params.id;
    const findCurrency = await CurrencyData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });

    if (!(findCurrency && findCurrency.dataValues)) {
      return resNotFound();
    }
    const findName = await CurrencyData.findOne({
      where: [
        columnValueLowerCase("currency", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
      ],
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    await CurrencyData.update(
      {
        currency: name,
        rate: rate,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No } }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteCurrency = async (req: Request) => {
  try {
    const CurrencyExists = await CurrencyData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(CurrencyExists && CurrencyExists.dataValues)) {
      return resNotFound();
    }
    await CurrencyData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: CurrencyExists.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCurrency = async (req: Request) => {
  try {
    const findCurrency = await CurrencyData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findCurrency && findCurrency.dataValues)) {
      return resNotFound();
    }
    await CurrencyData.update(
      {
        is_active: statusUpdateValue(findCurrency),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findCurrency.dataValues.id } }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const defaultStatusUpdateForCurrency = async (req: Request) => {
  try {
    const findCurrency = await CurrencyData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findCurrency && findCurrency.dataValues)) {
      return resNotFound();
    }
    const findDefaultCurrency = await CurrencyData.findAll({
      where: { is_deleted: DeletedStatus.No, is_default: "1" },
    });
    if (req.body.is_default == 1) {
      if (findDefaultCurrency.length >= 0) {
        return resErrorDataExit({ message: CURRENCY_DEFAULT_EXITS });
      }
      await CurrencyData.update(
        {
          is_default: req.body.is_default,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: findCurrency.dataValues.id } }
      );

      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    }
  } catch (error) {
    throw error;
  }
};
