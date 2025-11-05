import { Request } from "express";
import { Op } from "sequelize";
import {
  ActiveStatus,
  CURRENCY_RATE_EXCHANGE_TYPE,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  Pagination,
} from "../../../utils/app-enumeration";
import {
  CURRENCY_DEFAULT_EXITS,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import {
  addActivityLogs,
  columnValueLowerCase,
  getFreeAPICurrencyPrice,
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../utils/shared-functions";
import { initModels } from "../../model/index.model";

export const addCurrency = async (req: Request) => {
  try {
    const {
      currency,
      rate,
      symbol_placement,
      symbol,
      code,
      thousand_token,
      is_use_api = "0",
      api = null,
      api_key = null,
      exchange_rate_type,
    } = req.body;

    const { CurrencyData } = initModels(req);
    const findCurrency = await  CurrencyData.findOne({
      where: [
        columnValueLowerCase("currency", currency),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    const findCode = await  CurrencyData.findOne({
      where: [
        columnValueLowerCase("code", code),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (
      (findCurrency && findCurrency.dataValues) ||
      (findCode && findCode.dataValues)
    ) {
      return resErrorDataExit();
    }
    let rateValue = rate;
    if (exchange_rate_type === CURRENCY_RATE_EXCHANGE_TYPE.FreeApi) {
      rateValue = await getFreeAPICurrencyPrice(code, req);
    }
    const payload = {
      currency,
      rate: rateValue,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      is_default: "0",
      symbol_placement,
      symbol,
      code,
      is_use_api,
      api_url: api,
      api_key,
      exchange_rate_type,
      thousand_token,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
    };
    const currencydata = await  CurrencyData.create(payload);
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        currency_id: currencydata?.dataValues?.id, data: {
          ...currencydata?.dataValues
        }
      }
    }], currencydata?.dataValues?.id, LogsActivityType.Add, LogsType.Currency, req?.body?.session_res?.id_app_user)

    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getAllCurrency = async (req: Request) => {
  try {
    const { CurrencyData } = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
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
      const totalItems = await  CurrencyData.count({
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

    const result = await  CurrencyData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "currency",
        "rate",
        "symbol_placement",
        "symbol",
        "code",
        "thousand_token",
        "is_use_api",
        "api_url",
        "api_key",
        "exchange_rate_type",
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
    const { CurrencyData } = initModels(req);

    const findCurrency = await  CurrencyData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
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
    const {
      currency,
      rate,
      symbol,
      symbol_placement,
      code,
      thousand_token,
      is_use_api,
      api = null,
      api_key = null,
      exchange_rate_type,
    } = req.body;
    const id = req.params.id;
    const { CurrencyData } = initModels(req);

    const findCurrency = await  CurrencyData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCurrency && findCurrency.dataValues)) {
      return resNotFound();
    }
    const findCurrencyName = await  CurrencyData.findOne({
      where: [
        columnValueLowerCase("currency", currency),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    const findCode = await  CurrencyData.findOne({
      where: [
        columnValueLowerCase("code", code),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (
      (findCurrencyName && findCurrencyName.dataValues) ||
      (findCode && findCode.dataValues)
    ) {
      return resErrorDataExit();
    }
    let rateValue = rate;
    if (exchange_rate_type === CURRENCY_RATE_EXCHANGE_TYPE.FreeApi) {
      rateValue = await getFreeAPICurrencyPrice(code, req);
    }
    await  CurrencyData.update(
      {
        currency,
        rate: rateValue,
        symbol_placement,
        symbol,
        code,
        thousand_token,
        is_use_api,
        api_url: api,
        api_key: api_key,
        exchange_rate_type,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );

    const afterUpdateFindCurrency = await  CurrencyData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { currency_id: findCurrency?.dataValues?.id, data: {...findCurrency?.dataValues} },
      new_data: {
        currency_id: afterUpdateFindCurrency?.dataValues?.id, data: { ...afterUpdateFindCurrency?.dataValues }
      }
    }], findCurrency?.dataValues?.id, LogsActivityType.Edit, LogsType.Currency, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteCurrency = async (req: Request) => {
  try {
    const { CurrencyData } = initModels(req);

    const CurrencyExists = await  CurrencyData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(CurrencyExists && CurrencyExists.dataValues)) {
      return resNotFound();
    }
    await  CurrencyData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: CurrencyExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { currency_id: CurrencyExists?.dataValues?.id, data: {...CurrencyExists?.dataValues} },
      new_data: {
        currency_id: CurrencyExists?.dataValues?.id, data: {
          ...CurrencyExists?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], CurrencyExists?.dataValues?.id, LogsActivityType.Delete, LogsType.Currency, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCurrency = async (req: Request) => {
  try {
    const { CurrencyData } = initModels(req);

    const findCurrency = await  CurrencyData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findCurrency && findCurrency.dataValues)) {
      return resNotFound();
    }
    await  CurrencyData.update(
      {
        is_active: statusUpdateValue(findCurrency),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findCurrency.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { currency_id: findCurrency?.dataValues?.id, data: {...findCurrency?.dataValues} },
      new_data: {
        currency_id: findCurrency?.dataValues?.id, data: {
          ...findCurrency?.dataValues, is_active: statusUpdateValue(findCurrency),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findCurrency?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Currency, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const defaultStatusUpdateForCurrency = async (req: Request) => {
  try {
    const { CurrencyData } = initModels(req);

    const findCurrency = await  CurrencyData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findCurrency && findCurrency.dataValues)) {
      return resNotFound();
    }

    await  CurrencyData.update(
      {
        is_default: "0",
      },
      { where: { is_default: "1",company_info_id :req?.body?.session_res?.client_id } }
    );
    await  CurrencyData.update(
      {
        is_default: "1",
        rate: 1,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findCurrency.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    const changeRateBasedOnDefaultCurrency = await  CurrencyData.findAll({
      where: { is_default: "0", is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    for (const data of changeRateBasedOnDefaultCurrency) {
      const rate = await getFreeAPICurrencyPrice(data.dataValues.code, req);
      await  CurrencyData.update(
        {
          rate: rate,
        },
        { where: { id: data.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
      );
    }

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { currency_id: findCurrency?.dataValues?.id, data: {...findCurrency?.dataValues} },
      new_data: {
        currency_id: findCurrency?.dataValues?.id, data: {
          ...findCurrency?.dataValues, is_default: "1", rate: 1,
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findCurrency?.dataValues?.id, LogsActivityType.Edit, LogsType.Currency, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
