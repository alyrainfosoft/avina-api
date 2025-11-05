import { Router } from "express";
import {
  addCityFn,
  addCountryFn,
  addCurrencyFn,
  addProductDropdownFn,
  addStateFn,
  addTaxDataFn,
  configuratorDropDownDataFn,
  dashboardAPIFn,
  deleteCityFn,
  deleteCountryFn,
  deleteCurrencyFn,
  deleteStateFn,
  deleteStaticPageFn,
  deleteTaxFn,
  getAllCityFn,
  getAllCountryFn,
  getAllCurrencyFn,
  getAllStateFn,
  getAllTaxDataFn,
  getByIdCityFn,
  getByIdCountryFn,
  getByIdCurrencyFn,
  getByIdStateFn,
  getByIdTaxFn,
  defaultStatusUpdateForCurrencyFn,
  publicConfiguratorDropDownDataFn,
  statusUpdateForCityFn,
  statusUpdateCountryFn,
  statusUpdateForCurrencyFn,
  statusUpdateForStateFn,
  statusUpdateForTaxFn,
  updateBirthstoneProductTitleSlugFn,
  updateCityFn,
  updateCountryFn,
  updateCurrencyFn,
  updateStateFn,
  updateTaxDataFn,
  updateConfiguratorMasterDataFn,
  allMasterListDataFn,
  addPageFn,
  getPagesFn,
  getByIdPageFn,
  updatePageFn,
  deletePageFn,
  statusUpdateForPageFn,
  restrictStatusUpdateForPageFn,
  pageListForDropdownFn,
} from "../controllers/masters/master.controller";

import {
  addMasterCurrencyValidator,
  addMasterValidator,
  statusUpdateMasterValidator,
  updateMasterCurrencyValidator,
  updateMasterValidator,
} from "../../validators/master/master.validator";
import { authorization } from "../../middlewares/authenticate";
import { reqSingleImageParser } from "../../middlewares/multipart-file-parser";

export default (app: Router) => {
  ////////////---- country ----/////////////
  app.post("/country", [authorization, addMasterValidator], addCountryFn);
  app.get("/country", [authorization], getAllCountryFn);
  app.get("/country/:id", [authorization], getByIdCountryFn);
  app.put(
    "/country/:id",
    [authorization, updateMasterValidator],
    updateCountryFn
  );
  app.delete("/country/:id", [authorization], deleteCountryFn);
  app.patch("/country/:id", [authorization], statusUpdateCountryFn);

  ////////////---- state ----/////////////
  app.post("/state", [authorization, addMasterValidator], addStateFn);
  app.get("/state", [authorization], getAllStateFn);
  app.get("/state/:id", [authorization], getByIdStateFn);
  app.put("/state/:id", [authorization, updateMasterValidator], updateStateFn);
  app.delete("/state/:id", [authorization], deleteStateFn);
  app.patch("/state/:id", [authorization], statusUpdateForStateFn);

  ////////////---- city ----/////////////
  app.post("/city", [authorization, addMasterValidator], addCityFn);
  app.get("/city", [authorization], getAllCityFn);
  app.get("/city/:id", [authorization], getByIdCityFn);
  app.put("/city/:id", [authorization, updateMasterValidator], updateCityFn);
  app.delete("/city/:id", [authorization], deleteCityFn);
  app.patch("/city/:id", [authorization], statusUpdateForCityFn);

  ////////////---- currency ----/////////////
  app.post(
    "/currency",
    [authorization, addMasterCurrencyValidator],
    addCurrencyFn
  );
  app.get("/currency", [authorization], getAllCurrencyFn);
  app.get("/currency/:id", [authorization], getByIdCurrencyFn);
  app.put(
    "/currency/:id",
    [authorization, updateMasterCurrencyValidator],
    updateCurrencyFn
  );
  app.delete("/currency/:id", [authorization], deleteCurrencyFn);
  app.patch(
    "/currency/:id",
    [authorization, statusUpdateMasterValidator],
    statusUpdateForCurrencyFn
  );
  app.patch(
    "/currency/default/:id",
    [authorization],
    defaultStatusUpdateForCurrencyFn
  );

  ////////////---- tax ----/////////////
  app.post("/tax", [authorization, addMasterCurrencyValidator], addTaxDataFn);
  app.get("/tax", [authorization], getAllTaxDataFn);
  app.get("/tax/:id", [authorization], getByIdTaxFn);
  app.put(
    "/tax/:id",
    [authorization, updateMasterCurrencyValidator],
    updateTaxDataFn
  );
  app.delete("/tax/:id", [authorization], deleteTaxFn);
  app.patch("/tax/:id", [authorization], statusUpdateForTaxFn);

  ///////////------- Add Product DropDown -----//////////

  app.get("/add-product/dropDown/list", addProductDropdownFn);

  ///////----- Dashboard --------/////////////////

  app.get("/dashboard", [], dashboardAPIFn);

  ///////----- config select DropDown Data --------/////////////////

  app.get("/config-select/dropDown/list", configuratorDropDownDataFn);
  app.get(
    "/public/config-select/dropDown/list",
    publicConfiguratorDropDownDataFn
  );
  app.post("/birthstone/name-update", updateBirthstoneProductTitleSlugFn);
  app.put("/configurator-master/:config_type", updateConfiguratorMasterDataFn);
  app.get("/master-list", allMasterListDataFn);

  ////////////---- page master ----/////////////
  app.post("/page", [authorization], addPageFn);
  app.get("/page", [authorization], getPagesFn);
  app.get("/page/:id", [authorization], getByIdPageFn);
  app.put("/page/:id", [authorization], updatePageFn);
  app.delete("/page/:id", [authorization], deletePageFn);
  app.patch("/page/:id", [authorization], statusUpdateForPageFn);
  app.patch(
    "/restrict-page/:id",
    [authorization],
    restrictStatusUpdateForPageFn
  );
  app.get("/page-list", pageListForDropdownFn);
};
