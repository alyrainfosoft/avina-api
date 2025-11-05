import { RequestHandler } from "express";
import {
  addProductDropdown,
  dashboardAPI,
} from "../../services/master/attributes/product-Add.service";
import {
  addCity,
  deleteCity,
  getAllCity,
  getByIdCity,
  statusUpdateCity,
  updateCity,
} from "../../services/master/city.service";
import {
  addCountry,
  deleteCountry,
  getAllCountry,
  getByIdCountry,
  statusUpdateCountry,
  updateCountry,
} from "../../services/master/contry.service";
import {
  addCurrency,
  deleteCurrency,
  getAllCurrency,
  getByIdCurrency,
  isDefaultCurrency,
  statusUpdateCurrency,
  updateCurrency,
} from "../../services/master/currency.service";
import {
  addState,
  deleteState,
  getAllState,
  getByIdState,
  statusUpdateState,
  updateState,
} from "../../services/master/state.service";
import {
  addStaticPage,
  deleteStaticPage,
  getAllStaticPages,
  getByIdStaticPage,
  statusUpdateStaticPage,
  updateStaticPages,
} from "../../services/static_page.service";
import { callServiceMethod } from "../base.controller";
import {
  addTaxData,
  deleteTaxs,
  getAllTaxData,
  getByIdTax,
  statusUpdatetax,
  updateTaxData,
} from "../../services/master/text.service";
import { configuratorDropDownData } from "../../version-2/services/master/attributes/product-Add.service";

//////////////----Country ------///////////////////////
export const addCountryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addCountry(req), "addCountryFn");
};

export const getAllCountryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllCountry(req), "getAllCountryFn");
};

export const getByIdCountryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdCountry(req), "getByIdCountryFn");
};

export const updateCountryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateCountry(req), "updateCountryFn");
};

export const deleteCountryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteCountry(req), "deleteCountryFn");
};

export const statusUpdateCountryFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateCountry(req),
    "statusUpdateCountryFn"
  );
};

//////////////---- State ------///////////////////////

export const addStateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addState(req), "addStateFn");
};

export const getAllStateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllState(req), "getAllStateFn");
};

export const getByIdStateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdState(req), "getByIdStateFn");
};

export const updateStateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateState(req), "updateStateFn");
};

export const deleteStateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteState(req), "deleteStateFn");
};

export const statusUpdateStateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateState(req), "statusUpdateStateFn");
};

//////////////---- city ------///////////////////////

export const addCityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addCity(req), "addCityFn");
};

export const getAllCityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllCity(req), "getAllCityFn");
};

export const getByIdCityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdCity(req), "getByIdCityFn");
};

export const updateCityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateCity(req), "updateCityFn");
};

export const deleteCityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteCity(req), "deleteCityFn");
};

export const statusUpdateCityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateCity(req), "statusUpdateCityFn");
};

//////////////---- currency ------///////////////////////

export const addCurrencyFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addCurrency(req), "addCurrencyFn");
};

export const getAllCurrencyFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllCurrency(req), "getAllCurrencyFn");
};

export const getByIdCurrencyFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdCurrency(req), "getByIdCurrencyFn");
};

export const updateCurrencyFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateCurrency(req), "updateCurrencyFn");
};

export const deleteCurrencyFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteCurrency(req), "deleteCurrencyFn");
};

export const statusUpdateCurrencyFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateCurrency(req),
    "statusUpdateCurrencyFn"
  );
};

export const isDefaultCurrencyFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, isDefaultCurrency(req), "isDefaultCurrencyFn");
};
//////////////---- static page ------///////////////////////

export const addStaticPageFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addStaticPage(req), "addStaticPageFn");
};

export const getAllStaticPageFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllStaticPages(req), "getAllStaticPageFn");
};

export const getByIdStaticPageFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdStaticPage(req), "getByIdStaticPageFn");
};

export const updateStaticPageFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateStaticPages(req), "updateStaticPageFn");
};

export const deleteStaticPageFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteStaticPage(req), "deleteStaticPageFn");
};

export const statusUpdateStaticPageFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateStaticPage(req),
    "statusUpdateStaticPageFn"
  );
};

//////////////---- tax  ------///////////////////////

export const addTaxDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addTaxData(req), "addTaxDataFn");
};

export const getAllTaxDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllTaxData(req), "getAllTaxDataFn");
};

export const getByIdTaxFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdTax(req), "getByIdTaxFn");
};

export const updateTaxDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateTaxData(req), "updateTaxDataFn");
};

export const deleteTaxsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteTaxs(req), "deleteTaxsFn");
};

export const statusUpdatetaxFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdatetax(req), "statusUpdatetaxFn");
};

/////////----- Add product DropDown Data -----//////////////////

export const addProductDropdownFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addProductDropdown(req), "addProductDropdownFn");
};

////////------ Dashboard -----////////////////////
export const dashboardAPIFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, dashboardAPI(req), "dashboardAPIFn");
};
