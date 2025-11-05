import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import {
  activeInactiveTagFn,
  addTagFn,
  deleteTagFn,
  getAllTagsFn,
  getTagByIdFn,
  updateTagFn,
  addCaratSizeFn,
  addDiamondShapeFn,
  addStoneFn,
  addGoldKaratFn,
  addHeadFn,
  addMetalFn,
  addMetalToneFn,
  addSettingCaratWeightFn,
  addSettingTypeFn,
  addShankFn,
  deleteCaratSizeFn,
  deleteClarityFn,
  deleteColorFn,
  deleteDiamondShapeFn,
  deleteStoneFn,
  deleteGoldKaratFn,
  deleteHeadFn,
  deleteMetalFn,
  deleteMetalToneFn,
  deleteSettingCaratWeightFn,
  deleteSettingTypesFn,
  deleteShankFn,
  getCaratSizesFn,
  getDiamondClarityFn,
  getDiamondShapesFn,
  getStonesFn,
  getGoldKaratFn,
  getHeadsFn,
  getMetalsFn,
  getMetalTonesFn,
  getSettingCaratWeightFn,
  getSettingTypesFn,
  getShanksFn,
  getByIdCaratSizeFn,
  getByIdClarityFn,
  getByIdColorFn,
  getByIdDiamondShapeFn,
  getByIdStoneFn,
  getByIdGoldKaratFn,
  getByIdHeadFn,
  getByIdMetalFn,
  getByIdMetalToneFn,
  getByIdSettingCaratWeightFn,
  getByIdSettingTypeFn,
  getByIdShankFn,
  goldKaratActiveListFn,
  getMetalActiveListFn,
  metalToneActiveListFn,
  statusUpdateForCaratSizeFn,
  statusUpdateForClarityFn,
  statusUpdateForColorFn,
  statusUpdateForDiamondShapeFn,
  statusUpdateForStoneFn,
  statusUpdateForGoldKaratFn,
  statusUpdateForHeadFn,
  statusUpdateForMetalFn,
  statusUpdateForMetalToneFn,
  statusUpdateForSettingCaratWeightFn,
  statusUpdateForSettingTypeFn,
  statusUpdateForShankFn,
  updateCaratSizeFn,
  updateColorFn,
  updateDiamondShapeFn,
  updateStoneFn,
  updateGoldKaratFn,
  updateHeadFn,
  updateMetalFn,
  updateMetalToneFn,
  updateSettingCaratWeightFn,
  updateSettingTypeFn,
  updateShankFn,
  addLengthFn,
  addItemSizeFn,
  deleteLengthFn,
  deleteItemSizeFn,
  getLengthsFn,
  getAllItemSizeFn,
  goldRateUpdateDataFn,
  statusUpdateForLengthFn,
  statusUpdateItemSizeFn,
  updateLengthFn,
  updateItemSizeFn,
  addMMSizeFn,
  getAllMMSizeFn,
  getByIdMMSizeFn,
  updateMMSizeFn,
  deleteMMSizeFn,
  statusUpdateForMMSizeFn,
  addDiamondGroupMasterDataFn,
  getAllDiamondGroupMasterDataFn,
  updateDiamondGroupMasterFn,
  deleteDiamondGroupMasterDataFn,
  statusUpdateDiamondGroupMasterDataFn,
  addDiamondGroupMasterFromCSVFileFn,
  addSideSettingFn,
  getSideSettingFn,
  getByIdSideSettingFn,
  updateSideSettingFn,
  deleteSideSettingFn,
  statusUpdateForSideSettingFn,
  addDiamondSeiveSizeFn,
  getAllDiamondSeiveSizeFn,
  getByIdDiamondSeiveSizeFn,
  updateDiamondSeiveSizeFn,
  deleteDiamondSeiveSizeFn,
  statusUpdateDiamondSeiveSizeFn,
  addDiamondGroupMasterWithRangeFromCSVFileFn,
  configStatusUpdateDiamondGroupMasterDataFn,
  diamondTypeUpdateDiamondGroupMasterDataFn,
  addBrandFn,
  getBrandsFn,
  updateBrandFn,
  deleteBrandFn,
  statusUpdateForBrandFn,
  getBrandListFn,
  addCollectionFn,
  getCollectionsFn,
  updateCollectionFn,
  deleteCollectionFn,
  statusUpdateForCollectionFn,
  getCollectionListFn,
  getStoneListAPIFn,
  deleteCutFn,
  statusUpdateForCutFn,
  addDiamondClarityFn,
  updateClarityFn,
  addColorFn,
  addCutFn,
  getCutsFn,
  getByIdCutFn,
  updateCutFn,
  getColorsFn,
  goldKaratRateListFn,
  getHookTypesFn,
  addHookTypeFn,
  getByIdHookTypeFn,
  updateHookTypeFn,
  deleteHookTypeFn,
  statusUpdateForHookTypeFn,
} from "../../controllers/masters/attributes.controller";
import {
  reqProductBulkUploadFileParser,
  reqSingleImageParser,
} from "../../../middlewares/multipart-file-parser";
import {
  addMasterNameSlugValidator,
  addMasterValueSlugValidator,
  addMasterValueSortCodeRuleValidator,
  addTagValidator,
  diamondGroupMasterValidator,
  masterValidator,
  updateMasterNameSlugValidator,
  updateMasterValueSlugValidator,
  updateMasterValueSortCodeRuleValidator,
  updateTagValidator,
} from "../../../validators/master/master.validator";
import { getColors } from "../../services/master/attributes/color.service";
import {
  addMasterFn,
  addProductDropdownFn,
  masterDeleteFn,
  masterDetailFn,
  masterListFn,
  masterStatusUpdateFn,
  updateMasterFn,
} from "../../controllers/masters/master.controller";

export default (app: Router) => {
  // //////////////------ metal stone --------///////////////

  app.get("/attribute/stone-list", [authorization],getStoneListAPIFn);

  // //////////////------ metal master --------///////////////

  app.get("/karat/rate-list",[authorization], goldKaratRateListFn);

  /////////////------metal dropDown data ----///////////////

  app.get("/attribute/metal-master-list",[authorization], getMetalActiveListFn);

  //////////////------ diamond Shapes --------///////////////

  app.post(
    "/attribute/diamond-shape",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addDiamondShapeFn
  );
  app.get("/attribute/diamond-shape", [authorization], getDiamondShapesFn);
  app.get(
    "/attribute/diamond-shape/:id",
    [authorization],
    getByIdDiamondShapeFn
  );
  app.put(
    "/attribute/diamond-shape/:id",
    [
      authorization,
      reqSingleImageParser("image"),
      updateMasterNameSlugValidator,
    ],
    updateDiamondShapeFn
  );
  app.delete(
    "/attribute/diamond-shape/:id",
    [authorization],
    deleteDiamondShapeFn
  );
  app.patch(
    "/attribute/diamond-shape/:id",
    [authorization],
    statusUpdateForDiamondShapeFn
  );

  //////////////------ gemstones --------///////////////

  app.post(
    "/attribute/stone",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addStoneFn
  );
  app.get("/attribute/stone", [authorization], getStonesFn);
  app.get("/attribute/stone/:id", [authorization], getByIdStoneFn);
  app.put(
    "/attribute/stone/:id",
    [
      reqSingleImageParser("image"),
      authorization,
      updateMasterNameSlugValidator,
    ],
    updateStoneFn
  );
  app.delete("/attribute/stone/:id", [authorization], deleteStoneFn);
  app.patch("/attribute/stone/:id", [authorization], statusUpdateForStoneFn);


  //////////////------ heads --------///////////////

  app.post(
    "/attribute/head",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addHeadFn
  );
  app.get("/attribute/head", [authorization], getHeadsFn);
  app.get("/attribute/head/:id", [authorization], getByIdHeadFn);
  app.put(
    "/attribute/head/:id",
    [
      authorization,
      reqSingleImageParser("image"),
      updateMasterNameSlugValidator,
    ],
    updateHeadFn
  );
  app.delete("/attribute/head/:id", [authorization], deleteHeadFn);
  app.patch("/attribute/head/:id", [authorization], statusUpdateForHeadFn);

  //////////////------ Shanks --------///////////////

  app.post(
    "/attribute/shank",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addShankFn
  );
  app.get("/attribute/shank", [authorization], getShanksFn);
  app.get("/attribute/shank/:id", [authorization], getByIdShankFn);
  app.put(
    "/attribute/shank/:id",
    [
      reqSingleImageParser("image"),
      authorization,
      updateMasterNameSlugValidator,
    ],
    updateShankFn
  );
  app.delete("/attribute/shank/:id", [authorization], deleteShankFn);
  app.patch("/attribute/shank/:id", [authorization], statusUpdateForShankFn);

  //////////////------ SettingTypes --------///////////////

  app.post(
    "/attribute/setting-type",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addSettingTypeFn
  );
  app.get("/attribute/setting-type", [authorization], getSettingTypesFn);
  app.get("/attribute/setting-type/:id", [authorization], getByIdSettingTypeFn);
  app.put(
    "/attribute/setting-type/:id",
    [
      authorization,
      reqSingleImageParser("image"),
      updateMasterNameSlugValidator,
    ],
    updateSettingTypeFn
  );
  app.delete(
    "/attribute/setting-type/:id",
    [authorization],
    deleteSettingTypesFn
  );
  app.patch(
    "/attribute/setting-type/:id",
    [authorization],
    statusUpdateForSettingTypeFn
  );

  //////////////------ side setting type --------///////////////

  app.post(
    "/attribute/side-setting",
    [authorization, reqSingleImageParser("image"), addTagValidator],
    addSideSettingFn
  );
  app.get("/attribute/side-setting", [authorization], getSideSettingFn);
  app.get("/attribute/side-setting/:id", [authorization], getByIdSideSettingFn);
  app.put(
    "/attribute/side-setting/:id",
    [authorization, reqSingleImageParser("image"), updateTagValidator],
    updateSideSettingFn
  );
  app.delete(
    "/attribute/side-setting/:id",
    [authorization],
    deleteSideSettingFn
  );
  app.patch(
    "/attribute/side-setting/:id",
    [authorization],
    statusUpdateForSideSettingFn
  );

  //////////////------ metal master --------///////////////

  app.post(
    "/attribute/metal",
    [authorization, addMasterNameSlugValidator],
    addMetalFn
  );
  app.get("/attribute/metal", [authorization], getMetalsFn);
  app.get("/attribute/metal/:id", [authorization], getByIdMetalFn);
  app.put(
    "/attribute/metal/:id",
    [authorization, updateMasterNameSlugValidator],
    updateMetalFn
  );
  app.delete("/attribute/metal/:id", [authorization], deleteMetalFn);
  app.patch("/attribute/metal/:id", [authorization], statusUpdateForMetalFn);

  app.put(
    "/attribute/metal-rate/:metal_id",
    [authorization],
    goldRateUpdateDataFn
  );

  //////////////------ Gold KT --------///////////////

  app.post(
    "/attribute/gold-karat",
    [authorization, reqSingleImageParser("image")],
    addGoldKaratFn
  );
  app.get("/attribute/gold-karat", [authorization], getGoldKaratFn);
  app.get("/attribute/gold-karat/:id", [authorization], getByIdGoldKaratFn);
  app.put(
    "/attribute/gold-karat/:id",
    [authorization, reqSingleImageParser("image")],
    updateGoldKaratFn
  );
  app.delete("/attribute/gold-karat/:id", [authorization], deleteGoldKaratFn);
  app.patch(
    "/attribute/gold-karat/:id",
    [authorization],
    statusUpdateForGoldKaratFn
  );

  //////////////------ metal Tone --------///////////////

  app.post(
    "/attribute/metal-tone",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addMetalToneFn
  );
  app.get("/attribute/metal-tone", [authorization], getMetalTonesFn);
  app.get("/attribute/metal-tone/:id", [authorization], getByIdMetalToneFn);
  app.put(
    "/attribute/metal-tone/:id",
    [
      authorization,
      reqSingleImageParser("image"),
      updateMasterNameSlugValidator,
    ],
    updateMetalToneFn
  );
  app.delete("/attribute/metal-tone/:id", [authorization], deleteMetalToneFn);
  app.patch(
    "/attribute/metal-tone/:id",
    [authorization],
    statusUpdateForMetalToneFn
  );

  //////////////------ carat Size --------///////////////

  app.post(
    "/attribute/carat-size",
    [authorization, reqSingleImageParser("image"), addMasterValueSlugValidator],
    addCaratSizeFn
  );
  app.get("/attribute/carat-size", [authorization], getCaratSizesFn);
  app.get("/attribute/carat-size/:id", [authorization], getByIdCaratSizeFn);
  app.put(
    "/attribute/carat-size/:id",
    [
      authorization,
      reqSingleImageParser("image"),
      updateMasterValueSlugValidator,
    ],
    updateCaratSizeFn
  );
  app.delete("/attribute/carat-size/:id", [authorization], deleteCaratSizeFn);
  app.patch(
    "/attribute/carat-size/:id",
    [authorization],
    statusUpdateForCaratSizeFn
  );

  //////////////------ MM Size --------///////////////

  app.post(
    "/attribute/mm-size",
    [authorization, addMasterValueSlugValidator],
    addMMSizeFn
  );
  app.get("/attribute/mm-size", [authorization], getAllMMSizeFn);
  app.get("/attribute/mm-size/:id", [authorization], getByIdMMSizeFn);
  app.put(
    "/attribute/mm-size/:id",
    [authorization, updateMasterValueSlugValidator],
    updateMMSizeFn
  );
  app.delete("/attribute/mm-size/:id", [authorization], deleteMMSizeFn);
  app.patch("/attribute/mm-size/:id", [authorization], statusUpdateForMMSizeFn);

  //////////////------ colors --------///////////////

  app.post(
    "/attribute/color",
    [authorization, addMasterNameSlugValidator],
    addColorFn
  );
  app.get("/attribute/color", [authorization], getColorsFn);
  app.get("/attribute/color/:id", [authorization], getByIdColorFn);
  app.put(
    "/attribute/color/:id",
    [authorization, updateMasterNameSlugValidator],
    updateColorFn
  );
  app.delete("/attribute/color/:id", [authorization], deleteColorFn);
  app.patch("/attribute/color/:id", [authorization], statusUpdateForColorFn);

  //////////////------ clarity --------///////////////

  app.post(
    "/attribute/clarity",
    [authorization, addMasterNameSlugValidator],
    addDiamondClarityFn
  );
  app.get("/attribute/clarity", [authorization], getDiamondClarityFn);
  app.get("/attribute/clarity/:id", [authorization], getByIdClarityFn);
  app.put("/attribute/clarity/:id", [authorization], updateClarityFn);
  app.delete("/attribute/clarity/:id", [authorization], deleteClarityFn);
  app.patch(
    "/attribute/clarity/:id",
    [authorization],
    statusUpdateForClarityFn
  );

  //////////////------ cuts --------///////////////

  app.post("/attribute/cut", [authorization], addCutFn);
  app.get("/attribute/cut", [authorization], getCutsFn);
  app.get("/attribute/cut/:id", [authorization], getByIdCutFn);
  app.put("/attribute/cut/:id", [authorization], updateCutFn);
  app.delete("/attribute/cut/:id", [authorization], deleteCutFn);
  app.patch("/attribute/cut/:id", [authorization], statusUpdateForCutFn);

  //////////////------ Diamond Group Master --------///////////////

  app.post(
    "/attribute/diamond-group",
    
    [authorization, reqSingleImageParser("image")],
    [diamondGroupMasterValidator],
    addDiamondGroupMasterDataFn
  );
  app.get(
    "/attribute/diamond-group",
    [authorization],
    getAllDiamondGroupMasterDataFn
  );
  app.put(
    "/attribute/diamond-group/:id",
    [authorization, reqSingleImageParser("image")],
    [diamondGroupMasterValidator],
    updateDiamondGroupMasterFn
  );
  app.delete(
    "/attribute/diamond-group/:id",
    [authorization],
    deleteDiamondGroupMasterDataFn
  );
  app.patch(
    "/attribute/diamond-group/:id",
    [authorization],
    statusUpdateDiamondGroupMasterDataFn
  );

  app.put(
    "/attribute/diamond-group/config-status",
    [authorization],
    configStatusUpdateDiamondGroupMasterDataFn
  );

  app.put(
    "/attribute/diamond-group/update/diamond-type",
    [authorization],
    diamondTypeUpdateDiamondGroupMasterDataFn
  );

  app.post(
    "/diamond/group/master/csv",
    [authorization, reqProductBulkUploadFileParser("diamond_csv")],
    addDiamondGroupMasterFromCSVFileFn
  );

  app.post(
    "/diamond/group/master/range/csv",
    [authorization, reqProductBulkUploadFileParser("diamond_csv")],
    addDiamondGroupMasterWithRangeFromCSVFileFn
  );

  //////////////------ setting carat weight --------///////////////

  app.post(
    "/attribute/setting-weight",
    [authorization, addMasterValueSlugValidator],
    addSettingCaratWeightFn
  );
  app.get(
    "/attribute/setting-weight",
    [authorization],
    getSettingCaratWeightFn
  );
  app.get(
    "/attribute/setting-weight/:id",
    [authorization],
    getByIdSettingCaratWeightFn
  );
  app.put(
    "/attribute/setting-weight/:id",
    [authorization, updateMasterValueSlugValidator],
    updateSettingCaratWeightFn
  );
  app.delete(
    "/attribute/setting-weight/:id",
    [authorization],
    deleteSettingCaratWeightFn
  );
  app.patch(
    "/attribute/setting-weight/:id",
    [authorization],
    statusUpdateForSettingCaratWeightFn
  );

  //////////////------ Tag --------///////////////

  app.get("/attribute/tag", [authorization], getAllTagsFn);
  app.get("/attribute/tag/:id", [authorization], getTagByIdFn);
  app.post("/attribute/tag", [authorization], addTagFn);
  app.put("/attribute/tag/:id", [authorization], updateTagFn);
  app.delete("/attribute/tag/:id", [authorization], deleteTagFn);
  app.patch("/attribute/tag/:id", [authorization], activeInactiveTagFn);

  //////////////------ Size --------///////////////

  app.post(
    "/attribute/size",
    [authorization, addMasterValueSlugValidator],
    addItemSizeFn
  );
  app.get("/attribute/size", [authorization], getAllItemSizeFn);
  app.put(
    "/attribute/size/:id",
    [authorization, updateMasterValueSlugValidator],
    updateItemSizeFn
  );
  app.delete("/attribute/size/:id", [authorization], deleteItemSizeFn);
  app.patch("/attribute/size/:id", [authorization], statusUpdateItemSizeFn);

  //////////////------ Length --------///////////////

  app.post(
    "/attribute/length",
    [authorization, addMasterValueSlugValidator],
    addLengthFn
  );
  app.get("/attribute/length", [authorization], getLengthsFn);
  app.put(
    "/attribute/length/:id",
    [authorization, updateMasterValueSlugValidator],
    updateLengthFn
  );
  app.delete("/attribute/length/:id", [authorization], deleteLengthFn);
  app.patch("/attribute/length/:id", [authorization], statusUpdateForLengthFn);

  //////////////------ Diamond seive size --------///////////////

  app.post(
    "/attribute/seiveSize/add",
    [authorization, addMasterValueSortCodeRuleValidator],
    addDiamondSeiveSizeFn
  );
  app.get("/attribute/seiveSize", [authorization], getAllDiamondSeiveSizeFn);
  app.get(
    "/attribute/seiveSize/:id",
    [authorization],
    getByIdDiamondSeiveSizeFn
  );
  app.put(
    "/attribute/seiveSize/edit",
    [authorization, updateMasterValueSortCodeRuleValidator],
    updateDiamondSeiveSizeFn
  );
  app.post(
    "/attribute/seiveSize/delete",
    [authorization],
    deleteDiamondSeiveSizeFn
  );
  app.put(
    "/attribute/seiveSize/status",
    [authorization],
    statusUpdateDiamondSeiveSizeFn
  );

  //////////////------ brand --------///////////////

  app.post(
    "/attribute/brand",
    [authorization, addMasterNameSlugValidator],
    addBrandFn
  );
  app.get("/attribute/brand", [authorization], getBrandsFn);
  app.put(
    "/attribute/brand/:id",
    [authorization, updateMasterNameSlugValidator],
    updateBrandFn
  );
  app.delete("/attribute/brand/:id", [authorization], deleteBrandFn);
  app.patch("/attribute/brand/:id", [authorization], statusUpdateForBrandFn);

  //////////////------ collection --------///////////////

  app.post(
    "/attribute/collection",
    [authorization, addMasterNameSlugValidator],
    addCollectionFn
  );
  app.get("/attribute/collection", [authorization], getCollectionsFn);
  app.put(
    "/attribute/collection/:id",
    [authorization, updateMasterNameSlugValidator],
    updateCollectionFn
  );
  app.delete("/attribute/collection/:id", [authorization], deleteCollectionFn);
  app.patch(
    "/attribute/collection/:id",
    [authorization],
    statusUpdateForCollectionFn
  );

  // ::::::::::---------:::::=== Metal Master Route ===:::::---------:::::::::: //
  app.post(
    "/master",
    [authorization, reqSingleImageParser("image"), masterValidator],
    addMasterFn
  );
  app.put(
    "/master/:id",
    [authorization, reqSingleImageParser("image"), masterValidator],
    updateMasterFn
  );
  app.get("/masters/:master_type", [authorization], masterListFn);
  app.get("/master/:id/:master_type", [authorization], masterDetailFn);
  app.patch("/master/:id/:master_type", [authorization], masterStatusUpdateFn);
  app.delete("/master/:id/:master_type", [authorization], masterDeleteFn);

  //////////////------ hookType --------///////////////

  app.post(
    "/attribute/hook-type",
    [authorization, reqSingleImageParser("image"), addMasterNameSlugValidator],
    addHookTypeFn
  );
  app.get("/attribute/hook-type", [authorization], getHookTypesFn);
  app.get("/attribute/hook-type/:id", [authorization], getByIdHookTypeFn);
  app.put(
    "/attribute/hook-type/:id",
    [
      authorization,
      reqSingleImageParser("image"),
      updateMasterNameSlugValidator,
    ],
    updateHookTypeFn
  );
  app.delete("/attribute/hook-type/:id", [authorization], deleteHookTypeFn);
  app.patch(
    "/attribute/hook-type/:id",
    [authorization],
    statusUpdateForHookTypeFn
  );

  app.get("/frontend-setting/attribute/metal-master-list",[authorization], getMetalActiveListFn);
  
  app.get("/add-product/karat/rate-list",[authorization], goldKaratRateListFn);
  app.get("/collection/add-product/dropDown/list",[authorization], addProductDropdownFn);
  app.get("/metal-tone/attribute/metal-master-list",[authorization], getMetalActiveListFn);
  app.get("/wishlist/attribute/stone-list", [authorization],getStoneListAPIFn);
  app.get("/metal-karat/attribute/metal-master-list",[authorization], getMetalActiveListFn);
  app.get("/metal-rate/attribute/metal-master-list",[authorization], getMetalActiveListFn);

};
