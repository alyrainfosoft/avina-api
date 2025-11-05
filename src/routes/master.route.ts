import { Router } from "express";
import { addCityFn, addCountryFn, addCurrencyFn, addProductDropdownFn, addStateFn, addTaxDataFn, dashboardAPIFn, deleteCityFn, deleteCountryFn, deleteCurrencyFn, deleteStateFn, deleteStaticPageFn, deleteTaxsFn, getAllCityFn, getAllCountryFn, getAllCurrencyFn, getAllStateFn, getAllTaxDataFn, getByIdCityFn, getByIdCountryFn, getByIdCurrencyFn, getByIdStateFn, getByIdTaxFn, isDefaultCurrencyFn, statusUpdateCityFn, statusUpdateCountryFn, statusUpdateCurrencyFn, statusUpdateStateFn, statusUpdatetaxFn, updateCityFn, updateCountryFn, updateCurrencyFn, updateStateFn, updateTaxDataFn } from "../controllers/masters/master.controller";

import { addMasterCurrencyValidator, addMasterValidator, statusUpdateMasterValidator, updateMasterCurrencyValidator, updateMasterValidator } from "../validators/master/master.validator";
import { authorization } from "../middlewares/authenticate";

export default (app: Router) => {

  ////////////---- country ----/////////////
  app.post("/country/add", [authorization, addMasterValidator], addCountryFn);
  app.get("/country", [authorization], getAllCountryFn);
  app.get("/country/:id", [authorization], getByIdCountryFn);
  app.put("/country/edit", [authorization, updateMasterValidator], updateCountryFn);
  app.post("/country/delete", [authorization], deleteCountryFn);
  app.put("/country/status", [authorization, statusUpdateMasterValidator], statusUpdateCountryFn);

  ////////////---- state ----/////////////
  app.post("/state/add", [authorization, addMasterValidator], addStateFn);
  app.get("/state", [authorization], getAllStateFn);
  app.get("/state/:id", [authorization], getByIdStateFn);
  app.put("/state/edit", [authorization, updateMasterValidator], updateStateFn);
  app.post("/state/delete", [authorization], deleteStateFn);
  app.put("/state/status", [authorization, statusUpdateMasterValidator], statusUpdateStateFn);

  ////////////---- city ----/////////////
  app.post("/city/add", [authorization, addMasterValidator], addCityFn);
  app.get("/city", [authorization], getAllCityFn);
  app.get("/city/:id", [authorization], getByIdCityFn);
  app.put("/city/edit", [authorization, updateMasterValidator], updateCityFn);
  app.post("/city/delete", [authorization], deleteCityFn);
  app.put("/city/status", [authorization, statusUpdateMasterValidator], statusUpdateCityFn);

    ////////////---- currency ----/////////////
    app.post("/currency/add", [authorization, addMasterCurrencyValidator], addCurrencyFn);
    app.get("/currency", [authorization], getAllCurrencyFn);
    app.get("/currency/:id", [authorization], getByIdCurrencyFn);
    app.put("/currency/edit", [authorization, updateMasterCurrencyValidator], updateCurrencyFn);
    app.post("/currency/delete", [authorization], deleteCurrencyFn);
    app.put("/currency/status", [authorization, statusUpdateMasterValidator], statusUpdateCurrencyFn);
    app.put("/currency/default", [authorization], isDefaultCurrencyFn);

  ////////////---- tax ----/////////////
    app.post("/tax/add", [authorization, addMasterCurrencyValidator], addTaxDataFn);
    app.get("/tax", [authorization], getAllTaxDataFn);
    app.get("/tax/:id", [authorization], getByIdTaxFn);
    app.put("/tax/edit", [authorization, updateMasterCurrencyValidator], updateTaxDataFn);
    app.post("/tax/delete", [authorization], deleteTaxsFn);
    app.put("/tax/status", [authorization, statusUpdateMasterValidator], statusUpdatetaxFn);

  ///////////------- Add Product DropDown -----//////////

  app.get("/add-product/dropDown/list", addProductDropdownFn)

  ///////----- Dashboard --------/////////////////

  app.get("/dashboard", [authorization], dashboardAPIFn)

};