import { Router } from "express";
import { authorization } from "../middlewares/authenticate";
import {
  activeInactiveTagFn,
  addTagFn,
  deleteTagFn,
  getAllTagsFn,
  getTagByIdFn,
  updateTagFn,
  addCaratSizeFn,
  addClarityFn,
  addColorsFn,
  addCutsFn,
  addDiamondShapesFn,
  addGemstonesFn,
  addGoldKTsFn,
  addHeadsFn,
  addMetalGroupMasterDataFn,
  addMetalMasterDataFn,
  addMetalTonesFn,
  addSettingCaratWeightFn,
  addSettingTypesFn,
  addShanksFn,
  deleteCaratSizeFn,
  deleteClarityFn,
  deleteColorsFn,
  deleteCutsFn,
  deleteDiamondShapesFn,
  deleteGemstonesFn,
  deleteGoldKTsFn,
  deleteHeadsFn,
  deleteMetalGroupMasterDataFn,
  deleteMetalMasterDataFn,
  deleteMetalTonesFn,
  deleteSettingCaratWeightFn,
  deleteSettingTypesFn,
  deleteShanksFn,
  getAllCaratSizeFn,
  getAllClarityFn,
  getAllColorsFn,
  getAllCutsFn,
  getAllDiamondShapesFn,
  getAllGemstonesFn,
  getAllGoldKTsFn,
  getAllHeadsFn,
  getAllMasterDataFn,
  getAllMetalGroupMasterDataFn,
  getAllMetalTonesFn,
  getAllSettingCaratWeightFn,
  getAllSettingTypesFn,
  getAllShanksFn,
  getByIdCaratSizeFn,
  getByIdClarityFn,
  getByIdColorsFn,
  getByIdCutsFn,
  getByIdDiamondShapesFn,
  getByIdGemstonesFn,
  getByIdGoldKTsFn,
  getByIdHeadsFn,
  getByIdMetalGroupMasterDatasFn,
  getByIdMetalMasterDatasFn,
  getByIdMetalTonesFn,
  getByIdSettingCaratWeightFn,
  getByIdSettingTypesFn,
  getByIdShanksFn,
  goldKtDropDownDataFn,
  metalMasterDropDownFn,
  metalToneDropDownDataFn,
  statusUpdateCaratSizeFn,
  statusUpdateClarityFn,
  statusUpdateColorsFn,
  statusUpdateCutsFn,
  statusUpdateDiamondShapesFn,
  statusUpdateGemstonesFn,
  statusUpdateGoldKTsFn,
  statusUpdateHeadsFn,
  statusUpdateMetalGroupMasterDataFn,
  statusUpdateMetalMasterDataFn,
  statusUpdateMetalTonesFn,
  statusUpdateSettingCaratWeightFn,
  statusUpdateSettingTypesFn,
  statusUpdateShanksFn,
  updateCaratSizeFn,
  updateClarityFn,
  updateColorsFn,
  updateCutsFn,
  updateDiamondShapesFn,
  updateGemstonesFn,
  updateGoldKTsFn,
  updateHeadsFn,
  updateMetalGroupMasterFn,
  updateMetalMasterFn,
  updateMetalTonesFn,
  updateSettingCaratWeightFn,
  updateSettingTypesFn,
  updateShanksFn,
  addItemLengthFn,
  addItemSizeFn,
  deleteItemLengthFn,
  deleteItemSizeFn,
  getAllItemLengthFn,
  getAllItemSizeFn,
  goldRateUpdateDataFn,
  platinumRateUpdateDataFn,
  silverRateUpdateDataFn,
  statusUpdateItemLengthFn,
  statusUpdateItemSizeFn,
  updateItemLengthFn,
  updateItemSizeFn,
  addMMSizeFn,
  getAllMMSizeFn,
  getByIdMMSizeFn,
  updateMMSizeFn,
  deleteMMSizeFn,
  statusUpdateMMSizeFn,
  addDiamondGroupMasterDataFn,
  getAllDiamondGroupMasterDataFn,
  updateDiamondGroupMasterFn,
  deleteDiamondGroupMasterDataFn,
  statusUpdateDiamondGroupMasterDataFn,
  addDiamondGroupMasterFromCSVFileFn,
  addSideSettibgStylesFn,
  getAllSideSettingStylesFn,
  getByIdSideSettingStylesFn,
  updateSideSettingStylesFn,
  deleteSideSettingStylesFn,
  statusUpdateSideSettingStylesFn,
} from "../controllers/masters/attributes.controller";
import {
  reqProductBulkUploadFileParser,
  reqSingleImageParser,
} from "../middlewares/multipart-file-parser";
import {
  addMasterNameSlugValidator,
  addMasterValueSlugValidator,
  addTagValidator,
  deleteMasterIdValidator,
  statusTagValidator,
  statusUpdateMasterValidator,
  updateMasterNameSlugValidator,
  updateMasterValueSlugValidator,
  updateTagValidator,
} from "../validators/master/master.validator";

export default (app: Router) => {
  //////////////------ diamond Shapes --------///////////////

  app.post(
    "/attribute/diamondShapes/add",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addDiamondShapesFn
  );
  app.get("/attribute/diamondShapes", [authorization], getAllDiamondShapesFn);
  app.get(
    "/attribute/diamondShapes/:id",
    [authorization],
    getByIdDiamondShapesFn
  );
  app.put(
    "/attribute/diamondShapes/edit",
    [
      authorization,
      reqSingleImageParser("image"),
      updateMasterNameSlugValidator,
    ],
    updateDiamondShapesFn
  );
  app.post(
    "/attribute/diamondShapes/delete",
    [authorization],
    deleteDiamondShapesFn
  );
  app.put(
    "/attribute/diamondShapes/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateDiamondShapesFn
  );

  //////////////------ gemstones --------///////////////

  app.post(
    "/attribute/gemstones/add",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addGemstonesFn
  );
  app.get("/attribute/gemstones", [authorization], getAllGemstonesFn);
  app.get("/attribute/gemstones/:id", [authorization], getByIdGemstonesFn);
  app.put(
    "/attribute/gemstones/edit",
    [
      reqSingleImageParser("image"),
      authorization,
      updateMasterNameSlugValidator,
    ],
    updateGemstonesFn
  );
  app.post("/attribute/gemstones/delete", [authorization], deleteGemstonesFn);
  app.put(
    "/attribute/gemstones/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateGemstonesFn
  );

  //////////////------ heads --------///////////////

  app.post(
    "/attribute/heads/add",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addHeadsFn
  );
  app.get("/attribute/heads", [authorization], getAllHeadsFn);
  app.get("/attribute/heads/:id", [authorization], getByIdHeadsFn);
  app.put(
    "/attribute/heads/edit",
    [
      authorization,
      reqSingleImageParser("image"),
      updateMasterNameSlugValidator,
    ],
    updateHeadsFn
  );
  app.post("/attribute/heads/delete", [authorization], deleteHeadsFn);
  app.put(
    "/attribute/heads/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateHeadsFn
  );

  //////////////------ Shanks --------///////////////

  app.post(
    "/attribute/shanks/add",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addShanksFn
  );
  app.get("/attribute/shanks", [authorization], getAllShanksFn);
  app.get("/attribute/shanks/:id", [authorization], getByIdShanksFn);
  app.put(
    "/attribute/shanks/edit",
    [
      reqSingleImageParser("image"),
      authorization,
      updateMasterNameSlugValidator,
    ],
    updateShanksFn
  );
  app.post("/attribute/shanks/delete", [authorization], deleteShanksFn);
  app.put(
    "/attribute/shanks/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateShanksFn
  );

  //////////////------ SettingTypes --------///////////////

  app.post(
    "/attribute/settingType/add",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addSettingTypesFn
  );
  app.get("/attribute/settingType", [authorization], getAllSettingTypesFn);
  app.get("/attribute/settingType/:id", [authorization], getByIdSettingTypesFn);
  app.put(
    "/attribute/settingType/edit",
    [
      authorization,
      reqSingleImageParser("image"),
      updateMasterNameSlugValidator,
    ],
    updateSettingTypesFn
  );
  app.post(
    "/attribute/settingType/delete",
    [authorization],
    deleteSettingTypesFn
  );
  app.put(
    "/attribute/settingType/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateSettingTypesFn
  );

  //////////////------ side setting type --------///////////////

  app.post(
    "/attribute/sideSetting/add",
    [authorization, reqSingleImageParser("image"), addTagValidator],
    addSideSettibgStylesFn
  );
  app.get("/attribute/sideSetting", [authorization], getAllSideSettingStylesFn);
  app.get(
    "/attribute/sideSetting/:id",
    [authorization],
    getByIdSideSettingStylesFn
  );
  app.put(
    "/attribute/sideSetting/edit",
    [authorization, reqSingleImageParser("image"), updateTagValidator],
    updateSideSettingStylesFn
  );
  app.post(
    "/attribute/sideSetting/delete",
    [authorization],
    deleteSideSettingStylesFn
  );
  app.put(
    "/attribute/sideSetting/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateSideSettingStylesFn
  );

  //////////////------ metal master --------///////////////

  app.post(
    "/attribute/metalMaster/add",
    [authorization, addMasterNameSlugValidator],
    addMetalMasterDataFn
  );
  app.get("/attribute/metalMaster", [authorization], getAllMasterDataFn);
  app.get(
    "/attribute/metalMaster/id",
    [authorization],
    getByIdMetalMasterDatasFn
  );
  app.put(
    "/attribute/metalMaster/edit",
    [authorization, updateMasterNameSlugValidator],
    updateMetalMasterFn
  );
  app.post(
    "/attribute/metalMaster/delete",
    [authorization],
    deleteMetalMasterDataFn
  );
  app.put(
    "/attribute/metalMaster/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateMetalMasterDataFn
  );

  app.put("/rate/gold/edit", [authorization], goldRateUpdateDataFn);
  app.put("/rate/silver/edit", [authorization], silverRateUpdateDataFn);
  app.put("/rate/platinum/edit", [authorization], platinumRateUpdateDataFn);

  //////////////------ metal group master --------///////////////

  app.post(
    "/attribute/metalGroupMaster/add",
    [authorization],
    addMetalGroupMasterDataFn
  );
  app.get(
    "/attribute/metalGroupMaster",
    [authorization],
    getAllMetalGroupMasterDataFn
  );
  app.get(
    "/attribute/metalGroupMaster/id",
    [authorization],
    getByIdMetalGroupMasterDatasFn
  );
  app.put(
    "/attribute/metalGroupMaster/edit",
    [authorization],
    updateMetalGroupMasterFn
  );
  app.post(
    "/attribute/metalGroupMaster/delete",
    [authorization],
    deleteMetalGroupMasterDataFn
  );
  app.put(
    "/attribute/metalGroupMaster/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateMetalGroupMasterDataFn
  );

  /////////////------metal dropDown data ----///////////////

  app.get("/attribute/metalMaster/list", metalMasterDropDownFn);
  app.post("/attribute/goldKT/list", goldKtDropDownDataFn);
  app.post("/attribute/metalTone/list", metalToneDropDownDataFn);

  //////////////------ Gold KT --------///////////////

  app.post(
    "/attribute/goldKT/add",
    [authorization, reqSingleImageParser("image")],
    addGoldKTsFn
  );
  app.get("/attribute/goldKT", [authorization], getAllGoldKTsFn);
  app.get("/attribute/goldKT/:id", [authorization], getByIdGoldKTsFn);
  app.put(
    "/attribute/goldKT/edit",
    [authorization, reqSingleImageParser("image")],
    updateGoldKTsFn
  );
  app.post("/attribute/goldKT/delete", [authorization], deleteGoldKTsFn);
  app.put(
    "/attribute/goldKT/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateGoldKTsFn
  );

  //////////////------ metal Tone --------///////////////

  app.post(
    "/attribute/metalTone/add",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addMetalTonesFn
  );
  app.get("/attribute/metalTone", [authorization], getAllMetalTonesFn);
  app.get("/attribute/metalTone/:id", [authorization], getByIdMetalTonesFn);
  app.put(
    "/attribute/metalTone/edit",
    [
      authorization,
      reqSingleImageParser("image"),
      updateMasterNameSlugValidator,
    ],
    updateMetalTonesFn
  );
  app.post("/attribute/metalTone/delete", [authorization], deleteMetalTonesFn);
  app.put(
    "/attribute/metalTone/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateMetalTonesFn
  );

  //////////////------ carat Size --------///////////////

  app.post(
    "/attribute/caratSize/add",
    [authorization, addMasterValueSlugValidator],
    addCaratSizeFn
  );
  app.get("/attribute/caratSize", [authorization], getAllCaratSizeFn);
  app.get("/attribute/caratSize/:id", [authorization], getByIdCaratSizeFn);
  app.put(
    "/attribute/caratSize/edit",
    [authorization, updateMasterValueSlugValidator],
    updateCaratSizeFn
  );
  app.post("/attribute/caratSize/delete", [authorization], deleteCaratSizeFn);
  app.put(
    "/attribute/caratSize/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateCaratSizeFn
  );

  //////////////------ MM Size --------///////////////

  app.post(
    "/attribute/mmSize/add",
    [authorization, addMasterValueSlugValidator],
    addMMSizeFn
  );
  app.get("/attribute/mmSize", [authorization], getAllMMSizeFn);
  app.get("/attribute/mmSize/:id", [authorization], getByIdMMSizeFn);
  app.put(
    "/attribute/mmSize/edit",
    [authorization, updateMasterValueSlugValidator],
    updateMMSizeFn
  );
  app.post("/attribute/mmSize/delete", [authorization], deleteMMSizeFn);
  app.put(
    "/attribute/mmSize/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateMMSizeFn
  );

  //////////////------ colors --------///////////////

  app.post(
    "/attribute/colors/add",
    [authorization, addMasterValueSlugValidator, addMasterNameSlugValidator],
    addColorsFn
  );
  app.get("/attribute/colors", [authorization], getAllColorsFn);
  app.get("/attribute/colors/:id", [authorization], getByIdColorsFn);
  app.put(
    "/attribute/colors/edit",
    [
      authorization,
      updateMasterValueSlugValidator,
      updateMasterNameSlugValidator,
    ],
    updateColorsFn
  );
  app.post("/attribute/colors/delete", [authorization], deleteColorsFn);
  app.put(
    "/attribute/colors/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateColorsFn
  );

  //////////////------ clarity --------///////////////

  app.post(
    "/attribute/clarity/add",
    [authorization, addMasterValueSlugValidator, addMasterNameSlugValidator],
    addClarityFn
  );
  app.get("/attribute/clarity", [authorization], getAllClarityFn);
  app.get("/attribute/clarity/:id", [authorization], getByIdClarityFn);
  app.put(
    "/attribute/clarity/edit",
    [
      authorization,
      updateMasterValueSlugValidator,
      updateMasterNameSlugValidator,
    ],
    updateClarityFn
  );
  app.post("/attribute/clarity/delete", [authorization], deleteClarityFn);
  app.put(
    "/attribute/clarity/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateClarityFn
  );

  //////////////------ cuts --------///////////////

  app.post(
    "/attribute/cuts/add",
    [authorization, addMasterValueSlugValidator],
    addCutsFn
  );
  app.get("/attribute/cuts", [authorization], getAllCutsFn);
  app.get("/attribute/cuts/:id", [authorization], getByIdCutsFn);
  app.put(
    "/attribute/cuts/edit",
    [authorization, updateMasterValueSlugValidator],
    updateCutsFn
  );
  app.post("/attribute/cuts/delete", [authorization], deleteCutsFn);
  app.put(
    "/attribute/cuts/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateCutsFn
  );

  //////////////------ Diamond Group Master --------///////////////

  app.post(
    "/attribute/diamondGroupMaster/add",
    [authorization, reqSingleImageParser("image")],
    addDiamondGroupMasterDataFn
  );
  app.get(
    "/attribute/diamondGroupMaster",
    [authorization],
    getAllDiamondGroupMasterDataFn
  );
  app.put(
    "/attribute/diamondGroupMaster/edit",
    [authorization, reqSingleImageParser("image")],
    updateDiamondGroupMasterFn
  );
  app.post(
    "/attribute/diamondGroupMaster/delete",
    [authorization],
    deleteDiamondGroupMasterDataFn
  );
  app.put(
    "/attribute/diamondGroupMaster/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateDiamondGroupMasterDataFn
  );

  app.post(
    "/diamond/group/master/csv",
    [authorization, reqProductBulkUploadFileParser("diamond_csv")],
    addDiamondGroupMasterFromCSVFileFn
  );
  //////////////------ setting carat weight --------///////////////

  app.post(
    "/attribute/settingWeight/add",
    [authorization, addMasterValueSlugValidator],
    addSettingCaratWeightFn
  );
  app.get(
    "/attribute/settingWeight",
    [authorization],
    getAllSettingCaratWeightFn
  );
  app.get(
    "/attribute/settingWeight/:id",
    [authorization],
    getByIdSettingCaratWeightFn
  );
  app.put(
    "/attribute/settingWeight/edit",
    [authorization, updateMasterValueSlugValidator],
    updateSettingCaratWeightFn
  );
  app.post(
    "/attribute/settingWeight/delete",
    [authorization],
    deleteSettingCaratWeightFn
  );
  app.put(
    "/attribute/settingWeight/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateSettingCaratWeightFn
  );

  //////////////------ Tag --------///////////////

  app.get("/attribute/tag", [authorization], getAllTagsFn);
  app.get("/attribute/tag/:id", [authorization], getTagByIdFn);
  app.post("/attribute/tag", [authorization, addTagValidator], addTagFn);
  app.put("/attribute/tag", [authorization, updateTagValidator], updateTagFn);
  app.post(
    "/attribute/tag/delete",
    [authorization, deleteMasterIdValidator],
    deleteTagFn
  );
  app.put(
    "/attribute/tag/active-inactive",
    [authorization, statusTagValidator],
    activeInactiveTagFn
  );

  //////////////------ Size --------///////////////

  app.post(
    "/attribute/itemSize/add",
    [authorization, addMasterValueSlugValidator],
    addItemSizeFn
  );
  app.get("/attribute/itemSize", [authorization], getAllItemSizeFn);
  app.put(
    "/attribute/itemSize/edit",
    [authorization, updateMasterValueSlugValidator],
    updateItemSizeFn
  );
  app.post("/attribute/itemSize/delete", [authorization], deleteItemSizeFn);
  app.put(
    "/attribute/itemSize/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateItemSizeFn
  );

  //////////////------ Length --------///////////////

  app.post(
    "/attribute/itemlength/add",
    [authorization, addMasterValueSlugValidator],
    addItemLengthFn
  );
  app.get("/attribute/itemlength", [authorization], getAllItemLengthFn);
  app.put(
    "/attribute/itemlength/edit",
    [authorization, updateMasterValueSlugValidator],
    updateItemLengthFn
  );
  app.post("/attribute/itemlength/delete", [authorization], deleteItemLengthFn);
  app.put(
    "/attribute/itemlength/status",
    [authorization, statusUpdateMasterValidator],
    statusUpdateItemLengthFn
  );
};
