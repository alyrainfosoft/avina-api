import { RequestHandler } from "express";
import {
  addCaratSize,
  deleteCaratSize,
  getCaratSizes,
  getByIdCaratSize,
  statusUpdateForCaratSize,
  updateCaratSize,
} from "../../services/master/attributes/caratSize.service";
import {
  addDiamondClarity,
  deleteClarity,
  getDiamondClarity,
  getByIdClarity,
  statusUpdateForClarity,
  updateClarity,
} from "../../services/master/attributes/clarity.service";
import {
  addColor,
  deleteColor,
  getColors,
  getByIdColor,
  statusUpdateForColor,
  updateColor,
} from "../../services/master/attributes/color.service";
import {
  addCut,
  deleteCut,
  getCuts,
  getByIdCut,
  statusUpdateForCut,
  updateCut,
} from "../../services/master/attributes/cuts.service";
import {
  addDiamondShape,
  deleteDiamondShape,
  getDiamondShapes,
  getByIdDiamondShape,
  statusUpdateForDiamondShape,
  updateDiamondShape,
} from "../../services/master/attributes/diamondShapes.service";
import {
  addStone,
  deleteStone,
  getStoneListAPI,
  getStones,
  getByIdStone,
  statusUpdateForStone,
  updateStone,
} from "../../services/master/attributes/gemstones.service";
import {
  addGoldKarat,
  deleteGoldKarat,
  getGoldKarat,
  getByIdGoldKarat,
  goldKaratActiveList,
  statusUpdateForGoldKarat,
  updateGoldKarat,
} from "../../services/master/attributes/metal/gold-karat.service";
import {
  addHead,
  deleteHead,
  getHeads,
  getByIdHead,
  statusUpdateForHead,
  updateHead,
} from "../../services/master/attributes/heads.service";
import {
  addMetalTone,
  deleteMetalTone,
  getMetalTones,
  getByIdMetalTone,
  metalToneActiveList,
  statusUpdateForMetalTone,
  updateMetalTone,
} from "../../services/master/attributes/metal/metalTone.service";
import {
  addSettingCaratWeight,
  deleteSettingCaratWeight,
  getSettingCaratWeight,
  getByIdSettingCaratWeight,
  statusUpdateForSettingCaratWeight,
  updateSettingCaratWeight,
} from "../../services/master/attributes/setting-carat-weight.service";
import {
  addSettingType,
  deleteSettingType,
  getSettingTypes,
  getByIdSettingType,
  statusUpdateForSettingType,
  updateSettingType,
} from "../../services/master/attributes/settingType.service";
import {
  addShank,
  deleteShank,
  getShanks,
  getByIdShank,
  statusUpdateForShank,
  updateShank,
} from "../../services/master/attributes/shanks.service";
import {
  statusUpdateForTag,
  addTag,
  deleteTag,
  getTags,
  getByIdTag,
  updateTag,
} from "../../services/master/attributes/tag.service";
import { callServiceMethod } from "../base.controller";
import {
  addMetal,
  deleteMetal,
  getMetals,
  getByIdMetal,
  updateMetalRate,
  getMetalActiveList,
  statusUpdateForMetal,
  updateMetal,
  goldKaratRateList,
  getActivityLogsForMetalRate,
} from "../../services/master/attributes/metal/metal-master.service";

import {
  addSize,
  deleteSize,
  getSizes,
  statusUpdateForSize,
  updateSize,
} from "../../services/master/attributes/item-size.service";
import {
  addLength,
  deleteLength,
  getLengths,
  statusUpdateForLength,
  updateLength,
} from "../../services/master/attributes/item-length.service";
import {
  addMMSize,
  deleteMMSize,
  getAllMMSize,
  getByIdMMSize,
  statusUpdateForMMSize,
  updateMMSize,
} from "../../services/master/attributes/mmSize.service";
import {
  addDiamondGroup,
  addDiamondGroupMasterFromCSVFile,
  configStatusUpdateDiamondGroupMasterData,
  deleteDiamondGroup,
  diamondTypeUpdateDiamondGroupMasterData,
  getDiamondGroup,
  statusUpdateDiamondGroup,
  updateDiamondGroup,
} from "../../services/master/attributes/diamond-group-master.service";
import {
  addSideSetting,
  deleteSideSetting,
  getSideSetting,
  getByIdSideSetting,
  statusUpdateForSideSetting,
  updateSideSetting,
} from "../../services/master/attributes/side-setting-style.service";
import {
  addSieveSize,
  deleteSieveSize,
  getSieveSizes,
  getByIdSieveSize,
  statusUpdateForSieveSize,
  updateSieveSize,
} from "../../services/master/attributes/seive-size.service";
import { addDiamondGroupMasterWithRangeFromCSVFile } from "../../services/master/attributes/diamond-group-master-bulk-uplod-rang.service";
import {
  addBrand,
  getBrandList,
  deleteBrand,
  getBrands,
  statusUpdateForBrand,
  updateBrand,
} from "../../services/master/attributes/brands.service";
import {
  addCollection,
  getCollectionList,
  deleteCollection,
  getCollections,
  statusUpdateForCollection,
  updateCollection,
} from "../../services/master/attributes/collection.service";
import {
  addHookType,
  deleteHookType,
  getByIdHookType,
  getHookTypes,
  statusUpdateForHookType,
  updateHookType,
} from "../../services/master/attributes/hook-type.service";

//////////////------ DiamondShapes --------///////////////

export const addDiamondShapeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addDiamondShape(req), "addDiamondShapeFn");
};

export const getDiamondShapesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getDiamondShapes(req), "getDiamondShapesFn");
};

export const getByIdDiamondShapeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getByIdDiamondShape(req),
    "getByIdDiamondShapeFn"
  );
};

export const updateDiamondShapeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateDiamondShape(req), "updateDiamondShapeFn");
};

export const deleteDiamondShapeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteDiamondShape(req), "deleteDiamondShapeFn");
};

export const statusUpdateForDiamondShapeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForDiamondShape(req),
    "statusUpdateForDiamondShapeFn"
  );
};

//////////////------ stone (gemstone) --------///////////////

export const addStoneFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addStone(req), "addStoneFn");
};

export const getStonesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getStones(req), "getStonesFn");
};

export const getByIdStoneFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdStone(req), "getByIdStoneFn");
};

export const updateStoneFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateStone(req), "updateStoneFn");
};

export const deleteStoneFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteStone(req), "deleteStoneFn");
};

export const statusUpdateForStoneFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForStone(req),
    "statusUpdateForStoneFn"
  );
};

export const getStoneListAPIFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getStoneListAPI(req), "getStoneListAPIFn");
};

//////////////------ heads --------///////////////

export const addHeadFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addHead(req), "addHeadFn");
};

export const getHeadsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getHeads(req), "getHeadsFn");
};

export const getByIdHeadFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdHead(req), "getByIdHeadFn");
};

export const updateHeadFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateHead(req), "updateHeadFn");
};

export const deleteHeadFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteHead(req), "deleteHeadFn");
};

export const statusUpdateForHeadFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForHead(req),
    "statusUpdateForHeadFn"
  );
};

//////////////------ Shanks --------///////////////

export const addShankFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addShank(req), "addShankFn");
};

export const getShanksFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getShanks(req), "getShanksFn");
};

export const getByIdShankFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdShank(req), "getByIdShankFn");
};

export const updateShankFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateShank(req), "updateShankFn");
};

export const deleteShankFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteShank(req), "deleteShankFn");
};

export const statusUpdateForShankFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForShank(req),
    "statusUpdateForShankFn"
  );
};

//////////////------ SettingTypes --------///////////////

export const addSettingTypeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addSettingType(req), "addSettingTypeFn");
};

export const getSettingTypesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getSettingTypes(req), "getSettingTypesFn");
};

export const getByIdSettingTypeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdSettingType(req), "getByIdSettingTypeFn");
};

export const updateSettingTypeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateSettingType(req), "updateSettingTypeFn");
};

export const deleteSettingTypesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteSettingType(req), "deleteSettingTypesFn");
};

export const statusUpdateForSettingTypeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForSettingType(req),
    "statusUpdateForSettingTypeFn"
  );
};

//////////////------ side Setting Types --------///////////////

export const addSideSettingFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addSideSetting(req), "addSideSettingFn");
};

export const getSideSettingFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getSideSetting(req), "getSideSettingFn");
};

export const getByIdSideSettingFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdSideSetting(req), "getByIdSideSettingFn");
};

export const updateSideSettingFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateSideSetting(req), "updateSideSettingFn");
};

export const deleteSideSettingFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteSideSetting(req), "deleteSideSettingFn");
};

export const statusUpdateForSideSettingFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForSideSetting(req),
    "statusUpdateForSideSettingFn"
  );
};

////////////----- Metal master ------//////////////

export const addMetalFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addMetal(req), "addMetalFn");
};

export const getMetalsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getMetals(req), "getMetalsFn");
};

export const getByIdMetalFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdMetal(req), "getByIdMetalFn");
};

export const updateMetalFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateMetal(req), "updateMetalFn");
};

export const deleteMetalFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteMetal(req), "deleteMetalFn");
};

export const statusUpdateForMetalFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForMetal(req),
    "statusUpdateForMetalFn"
  );
};

export const goldRateUpdateDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateMetalRate(req), "goldRateUpdateDataFn");
};

export const goldKaratRateListFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, goldKaratRateList(req), "goldKaratRateListFn");
};

export const getActivityLogsForMetalRateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getActivityLogsForMetalRate(req), "getActivityLogsForMetalRateFn");
};
/////////////------metal dropDown data ----///////////////

export const getMetalActiveListFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getMetalActiveList(req), "getMetalActiveListFn");
};

export const goldKaratActiveListFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, goldKaratActiveList(req), "goldKtDropDownDataFn");
};

export const metalToneActiveListFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    metalToneActiveList(req),
    "metalToneDropDownDataFn"
  );
};
//////////////------ Gold KT --------///////////////

export const addGoldKaratFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addGoldKarat(req), "addGoldKaratFn");
};

export const getGoldKaratFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getGoldKarat(req), "getGoldKaratFn");
};

export const getByIdGoldKaratFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdGoldKarat(req), "getByIdGoldKaratFn");
};

export const updateGoldKaratFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateGoldKarat(req), "updateGoldKaratFn");
};

export const deleteGoldKaratFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteGoldKarat(req), "deleteGoldKaratFn");
};

export const statusUpdateForGoldKaratFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForGoldKarat(req),
    "statusUpdateForGoldKaratFn"
  );
};

//////////////------ Metal Tone --------///////////////

export const addMetalToneFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addMetalTone(req), "addMetalTonesFn");
};

export const getMetalTonesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getMetalTones(req), "getAllMetalTonesFn");
};

export const getByIdMetalToneFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdMetalTone(req), "getByIdMetalTonesFn");
};

export const updateMetalToneFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateMetalTone(req), "updateMetalTonesFn");
};

export const deleteMetalToneFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteMetalTone(req), "deleteMetalTonesFn");
};

export const statusUpdateForMetalToneFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForMetalTone(req),
    "statusUpdateMetalTonesFn"
  );
};
//////////////------ carat size --------///////////////

export const addCaratSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addCaratSize(req), "addCaratSizeFn");
};

export const getCaratSizesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getCaratSizes(req), "getCaratSizesFn");
};

export const getByIdCaratSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdCaratSize(req), "getByIdCaratSizeFn");
};

export const updateCaratSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateCaratSize(req), "updateCaratSizeFn");
};

export const deleteCaratSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteCaratSize(req), "deleteCaratSizeFn");
};

export const statusUpdateForCaratSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForCaratSize(req),
    "statusUpdateForCaratSizeFn"
  );
};

//////////////------ MM size --------///////////////

export const addMMSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addMMSize(req), "addMMSizeFn");
};

export const getAllMMSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllMMSize(req), "getAllMMSizeFn");
};

export const getByIdMMSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdMMSize(req), "getByIdMMSizeFn");
};

export const updateMMSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateMMSize(req), "updateMMSizeFn");
};

export const deleteMMSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteMMSize(req), "deleteMMSizeFn");
};

export const statusUpdateForMMSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForMMSize(req),
    "statusUpdateForMMSizeFn"
  );
};

//////////////------ Diamond Group Master --------///////////////

export const addDiamondGroupMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addDiamondGroup(req),
    "addDiamondGroupMasterDataFn"
  );
};

export const getAllDiamondGroupMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getDiamondGroup(req),
    "getAllDiamondGroupMasterDataFn"
  );
};

export const updateDiamondGroupMasterFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateDiamondGroup(req),
    "updateDiamondGroupMasterFn"
  );
};

export const deleteDiamondGroupMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteDiamondGroup(req),
    "deleteDiamondGroupMasterDataFn"
  );
};

export const statusUpdateDiamondGroupMasterDataFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    statusUpdateDiamondGroup(req),
    "statusUpdateDiamondGroupMasterDataFn"
  );
};

export const configStatusUpdateDiamondGroupMasterDataFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    configStatusUpdateDiamondGroupMasterData(req),
    "configStatusUpdateDiamondGroupMasterDataFn"
  );
};

export const diamondTypeUpdateDiamondGroupMasterDataFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    diamondTypeUpdateDiamondGroupMasterData(req),
    "diamondTypeUpdateDiamondGroupMasterDataFn"
  );
};

export const addDiamondGroupMasterFromCSVFileFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    addDiamondGroupMasterFromCSVFile(req),
    "addDiamondGroupMasterFromCSVFileFn"
  );
};

export const addDiamondGroupMasterWithRangeFromCSVFileFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    addDiamondGroupMasterWithRangeFromCSVFile(req),
    "addDiamondGroupMasterWithRangeFromCSVFileFn"
  );
};
//////////////------ color --------///////////////

export const addColorFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addColor(req), "addColorFn");
};

export const getColorsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getColors(req), "getColorsFn");
};

export const getByIdColorFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdColor(req), "getByIdColorFn");
};

export const updateColorFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateColor(req), "updateColorFn");
};

export const deleteColorFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteColor(req), "deleteColorFn");
};

export const statusUpdateForColorFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForColor(req),
    "statusUpdateForColorFn"
  );
};

//////////////------ clarity --------///////////////

export const addDiamondClarityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addDiamondClarity(req), "addDiamondClarityFn");
};

export const getDiamondClarityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getDiamondClarity(req), "getDiamondClarityFn");
};

export const getByIdClarityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdClarity(req), "getByIdClarityFn");
};

export const updateClarityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateClarity(req), "updateClarityFn");
};

export const deleteClarityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteClarity(req), "deleteClarityFn");
};

export const statusUpdateForClarityFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForClarity(req),
    "statusUpdateForClarityFn"
  );
};

//////////////------ cuts --------///////////////

export const addCutFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addCut(req), "addCutFn");
};

export const getCutsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getCuts(req), "getCutsFn");
};

export const getByIdCutFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdCut(req), "getByIdCutFn");
};

export const updateCutFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateCut(req), "updateCutFn");
};

export const deleteCutFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteCut(req), "deleteCutFn");
};

export const statusUpdateForCutFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateForCut(req), "statusUpdateForCutFn");
};

//////////////------ SettingCaratWeight --------///////////////

export const addSettingCaratWeightFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addSettingCaratWeight(req),
    "addSettingCaratWeightFn"
  );
};

export const getSettingCaratWeightFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getSettingCaratWeight(req),
    "getSettingCaratWeightFn"
  );
};

export const getByIdSettingCaratWeightFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getByIdSettingCaratWeight(req),
    "getByIdSettingCaratWeightFn"
  );
};

export const updateSettingCaratWeightFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateSettingCaratWeight(req),
    "updateSettingCaratWeightFn"
  );
};

export const deleteSettingCaratWeightFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteSettingCaratWeight(req),
    "deleteSettingCaratWeightFn"
  );
};

export const statusUpdateForSettingCaratWeightFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForSettingCaratWeight(req),
    "statusUpdateForSettingCaratWeightFn"
  );
};

//////////////------ Tag --------///////////////

export const getAllTagsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getTags(req), "getAllTagsFn");
};

export const getTagByIdFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdTag(req), "getTagByIDFn");
};

export const addTagFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addTag(req), "addTagFn");
};

export const updateTagFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateTag(req), "updateTagFn");
};

export const deleteTagFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteTag(req), "deleteTagFn");
};

export const activeInactiveTagFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateForTag(req), "activeInactiveTagFn");
};

//////////////------ Item Size --------///////////////

export const addItemSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addSize(req), "addItemSizeFn");
};

export const getAllItemSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getSizes(req), "getAllItemSizeFn");
};

export const updateItemSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateSize(req), "updateItemSizeFn");
};

export const deleteItemSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteSize(req), "deleteItemSizeFn");
};

export const statusUpdateItemSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForSize(req),
    "statusUpdateItemSizeFn"
  );
};

//////////////------ Item Length --------///////////////

export const addLengthFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addLength(req), "addLengthFn");
};

export const getLengthsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getLengths(req), "getLengthsFn");
};

export const updateLengthFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateLength(req), "updateLengthFn");
};

export const deleteLengthFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteLength(req), "deleteLengthFn");
};

export const statusUpdateForLengthFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForLength(req),
    "statusUpdateForLengthFn"
  );
};

//////////////------ Diamond seive Size --------///////////////

export const addDiamondSeiveSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addSieveSize(req), "addDiamondSeiveSizeFn");
};

export const getAllDiamondSeiveSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getSieveSizes(req), "getAllDiamondSeiveSizeFn");
};

export const getByIdDiamondSeiveSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getByIdSieveSize(req),
    "getByIdDiamondSeiveSizeFn"
  );
};

export const updateDiamondSeiveSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateSieveSize(req), "updateDiamondSeiveSizeFn");
};

export const deleteDiamondSeiveSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteSieveSize(req), "deleteDiamondSeiveSizeFn");
};

export const statusUpdateDiamondSeiveSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForSieveSize(req),
    "statusUpdateDiamondSeiveSizeFn"
  );
};

//////////////------ Brands--------///////////////

export const addBrandFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addBrand(req), "addBrandFn");
};

export const getBrandsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getBrands(req), "getBrandsFn");
};

export const updateBrandFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateBrand(req), "updateBrandFn");
};

export const deleteBrandFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteBrand(req), "deleteBrandFn");
};

export const statusUpdateForBrandFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForBrand(req),
    "statusUpdateForBrandFn"
  );
};

export const getBrandListFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getBrandList(req), "getBrandListFn");
};

//////////////------ collection --------///////////////

export const addCollectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addCollection(req), "addCollectionFn");
};

export const getCollectionsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getCollections(req), "getCollectionsFn");
};

export const updateCollectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateCollection(req), "updateCollectionFn");
};

export const deleteCollectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteCollection(req), "deleteCollectionFn");
};

export const statusUpdateForCollectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForCollection(req),
    "statusUpdateCollectionFn"
  );
};

export const getCollectionListFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getCollectionList(req),
    "CollectionDropDownListFn"
  );
};

//////////////------ hook type --------///////////////

export const addHookTypeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addHookType(req), "addHookTypeFn");
};

export const getHookTypesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getHookTypes(req), "getHookTypesFn");
};

export const getByIdHookTypeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdHookType(req), "getByIdHookTypeFn");
};

export const updateHookTypeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateHookType(req), "updateHookTypeFn");
};

export const deleteHookTypeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteHookType(req), "deleteHookTypeFn");
};

export const statusUpdateForHookTypeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForHookType(req),
    "statusUpdateForHookTypeFn"
  );
};
