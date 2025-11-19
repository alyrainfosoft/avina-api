import { Request } from "express";
import {
  getCompanyIdBasedOnTheCompanyKey,
  resSuccess,
} from "../../../utils/shared-functions";
import { ActiveStatus, DeletedStatus } from "../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
} from "../../../utils/app-messages";
import { initModels } from "../../model/index.model";

export const countryListCustomerSide = async (req: Request) => {
  try {
    const { CountryData } = initModels(req);
    let company_info_id: any = {};

    if (req?.body?.session_res?.client_id) {
      company_info_id.data = req.body.session_res.client_id;
    } else {
      const decrypted = await getCompanyIdBasedOnTheCompanyKey(req.query, req.body.db_connection);

      if (decrypted.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return decrypted;
      }

      company_info_id = decrypted;
    }

    const countryData = await CountryData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active ,company_info_id:company_info_id?.data},
      attributes: ["id", "country_name", "country_code", "created_date"],
    });

    return resSuccess({ data: countryData });
  } catch (error) {
    throw error;
  }
};

export const stateListCustomerSide = async (req: Request) => {
  try {
    const { StateData } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const stateData = await StateData.findAll({
      where: {
        id_country: req.body.country_id,
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
        company_info_id:company_info_id?.data
      },
      attributes: ["id", "state_name", "state_code", "created_date"],
    });

    return resSuccess({ data: stateData });
  } catch (error) {
    throw error;
  }
};

export const cityListCustomerSide = async (req: Request) => {
  try {
    const { CityData } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const stateData = await CityData.findAll({
      where: { id_state: req.body.state_id, is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active, company_info_id:company_info_id?.data },
      attributes: ["id", "city_name", "city_code", "created_date"],
    });

    return resSuccess({ data: stateData });
  } catch (error) {
    throw error;
  }
};

export const mainCategoryList = async (req: Request) => {
  try {
    const { CategoryData } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const stateData = await CategoryData.findAll({
      where: { parent_id: null, is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active, company_info_id:company_info_id?.data },
      attributes: ["id", "slug", "category_name", "created_date"],
    });

    return resSuccess({ data: stateData });
  } catch (error) {
    throw error;
  }
};

export const currencyListCustomerSide = async (req: Request) => {
  try {
    const { CurrencyData } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const currency = await CurrencyData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:company_info_id?.data },
      attributes: ["id", "currency", "rate", "is_default"],
    });

    return resSuccess({ data: currency });
  } catch (error) {
    throw error;
  }
};
