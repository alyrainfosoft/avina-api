import { Request } from "express";
import categoryData from "../../model/category.model";
import CityData from "../../model/master/city.model";
import ContryData from "../../model/master/country.model";
import StateData from "../../model/master/state.model";
import {
  getLocalDate,
  resError,
  resErrorDataExit,
  resSuccess,
} from "../../utils/shared-functions";
import CurrencyData from "../../model/master/currency.model";
import Orders from "../../model/order.model";
import { OrderStatus } from "../../utils/app-enumeration";
import {
  EMAIL_IS_ALREADY_IN_SUBSCRIPTION_LIST,
  EMAIL_IS_REQUIRED,
} from "../../utils/app-messages";
import SubscriptionData from "../../model/subscription.model";

export const countryListCustomerSide = async (req: Request) => {
  try {
    const countryData = await ContryData.findAll({
      where: { is_deleted: "0", is_active: "1" },
      attributes: ["id", "country_name", "country_code", "created_date"],
    });

    return resSuccess({ data: countryData });
  } catch (error) {
    throw error;
  }
};

export const stateListCustomerSide = async (req: Request) => {
  try {
    const stateData = await StateData.findAll({
      where: {
        id_country: req.body.country_id,
        is_deleted: "0",
        is_active: "1",
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
    const stateData = await CityData.findAll({
      where: { id_state: req.body.state_id, is_deleted: "0", is_active: "1" },
      attributes: ["id", "city_name", "city_code", "created_date"],
    });

    return resSuccess({ data: stateData });
  } catch (error) {
    throw error;
  }
};

export const mainCategoryList = async (req: Request) => {
  try {
    const stateData = await categoryData.findAll({
      where: { parent_id: null, is_deleted: "0", is_active: "1" },
      attributes: ["id", "slug", "category_name", "created_date"],
    });

    return resSuccess({ data: stateData });
  } catch (error) {
    throw error;
  }
};

export const currencyListCustomerSide = async (req: Request) => {
  try {
    const currency = await CurrencyData.findAll({
      where: { is_deleted: "0", is_active: "1" },
      attributes: ["id", "currency", "rate", "is_default"],
    });

    return resSuccess({ data: currency });
  } catch (error) {
    throw error;
  }
};
