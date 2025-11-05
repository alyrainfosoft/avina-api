import { Router } from "express";
import {
  getBrandListFn,
  getCollectionListFn,
  getStoneListAPIFn,
  goldKaratRateListFn,
  getActivityLogsForMetalRateFn,
  getMetalActiveListFn,
  goldKaratActiveListFn,
  metalToneActiveListFn,
} from "../../controllers/masters/attributes.controller";

export default (app: Router) => {
  

  app.get("/attribute/metal-rate/logs", getActivityLogsForMetalRateFn);
  /////////////------metal dropDown data ----///////////////

  // app.get("/attribute/gold-karats/:metal_id", goldKaratActiveListFn);
  // app.get("/attribute/metal-tones/:metal_id", metalToneActiveListFn);
  app.get("/attribute/brand-list", getBrandListFn);

  //////////////------ collection --------///////////////
  app.get("/attribute/collection-list", getCollectionListFn);

};
