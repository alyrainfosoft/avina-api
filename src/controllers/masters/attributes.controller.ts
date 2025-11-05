import { RequestHandler } from "express";
import {
  addCaratSize,
  deleteCaratSize,
  getAllCaratSize,
  getByIdCaratSize,
  statusUpdateCaratSize,
  updateCaratSize,
} from "../../services/master/attributes/caratSize.service";
import {
  addClarity,
  deleteClarity,
  getAllClarity,
  getByIdClarity,
  statusUpdateClarity,
  updateClarity,
} from "../../services/master/attributes/clarity.service";
import {
  addColors,
  deleteColors,
  getAllColors,
  getByIdColors,
  statusUpdateColors,
  updateColors,
} from "../../services/master/attributes/color.service";
import {
  addCuts,
  deleteCuts,
  getAllCuts,
  getByIdCuts,
  statusUpdateCuts,
  updateCuts,
} from "../../services/master/attributes/cuts.service";
import {
  addDiamondShapes,
  deleteDiamondShapes,
  getAllDiamondShapes,
  getByIdDiamondShapes,
  statusUpdateDiamondShapes,
  updateDiamondShapes,
} from "../../services/master/attributes/diamondShapes.service";
import {
  addGemstones,
  deleteGemstones,
  getAllGemstones,
  getByIdGemstones,
  statusUpdateGemstones,
  updateGemstones,
} from "../../services/master/attributes/gemstones.service";
import {
  addGoldKarat,
  deleteGoldKts,
  getAllGoldKTs,
  getByIdGoldKTs,
  goldKtDropDownData,
  statusUpdateGoldKts,
  updateGoldKTs,
} from "../../services/master/attributes/metal/gold-karat.service";
import {
  addHeads,
  deleteHeads,
  getAllHeads,
  getByIdHeads,
  statusUpdateHeads,
  updateHeads,
} from "../../services/master/attributes/heads.service";
import {
  addMetalTones,
  deleteMetalTones,
  getAllMetalTones,
  getByIdMetalTones,
  metalToneDropDownData,
  statusUpdateMetalTones,
  updateMetalTones,
} from "../../services/master/attributes/metal/metalTone.service";
import {
  addSettingCaratWeight,
  deleteSettingCaratWeight,
  getAllSettingCaratWeight,
  getByIdSettingCaratWeight,
  statusUpdateSettingCaratWeight,
  updateSettingCaratWeight,
} from "../../services/master/attributes/settingCaratWeight";
import {
  addSettibgTypes,
  deleteSettingTypes,
  getAllSettingTypes,
  getByIdSettingTypes,
  statusUpdateSettingTypes,
  updateSettingTypes,
} from "../../services/master/attributes/settingType.service";
import {
  addShanks,
  deleteShanks,
  getAllShanks,
  getByIdShanks,
  statusUpdateShanks,
  updateShanks,
} from "../../services/master/attributes/shanks.service";
import {
  activeInactiveTag,
  addTag,
  deleteTag,
  getAllTags,
  getTagById,
  updateTag,
} from "../../services/master/attributes/tag.service";
import { callServiceMethod } from "../base.controller";
import {
  addMetalMasterData,
  deleteMetalMasterData,
  getAllMasterData,
  getByIdMetalMasterData,
  goldRateUpdate,
  metalMasterDropDown,
  platinumRateUpdate,
  silverRateUpdate,
  statusUpdateMetalMasterData,
  updateMetalMasterData,
} from "../../services/master/attributes/metal/metal-master.service";
import {
  addMetalGroupMasterData,
  deleteMetalGroupMasterData,
  getAllMetalGroupMasterData,
  getByIdMetalGroupMasterData,
  statusUpdateMetalGroupMasterData,
  updateMetalGroupMasterData,
} from "../../services/master/attributes/metal/metal-group-master.service";
import {
  addItemSize,
  deleteItemSize,
  getAllItemSize,
  statusUpdateItemSize,
  updateItemSize,
} from "../../services/master/attributes/item-size.service";
import {
  addItemLength,
  deleteItemLength,
  getAllItemLength,
  statusUpdateItemLength,
  updateItemLength,
} from "../../services/master/attributes/item-length.service";
import {
  addMMSize,
  deleteMMSize,
  getAllMMSize,
  getByIdMMSize,
  statusUpdateMMSize,
  updateMMSize,
} from "../../services/master/attributes/mmSize.service";
import {
  addDiamondGroupMasterData,
  addDiamondGroupMasterFromCSVFile,
  deleteDiamondGroupMasterData,
  getAllDiamondGroupMasterData,
  statusUpdateDiamondGroupMasterData,
  updateDiamondGroupMasterData,
} from "../../services/master/attributes/diamond-group-master.service";
import {
  addSideSettibgStyles,
  deleteSideSettingStyles,
  getAllSideSettingStyles,
  getByIdSideSettingStyles,
  statusUpdateSideSettingStyles,
  updateSideSettingStyles,
} from "../../services/master/attributes/side-setting-style.service";

//////////////------ DiamondShapes --------///////////////

export const addDiamondShapesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addDiamondShapes(req), "addDiamondShapesFn");
};

export const getAllDiamondShapesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getAllDiamondShapes(req),
    "getAllDiamondShapesFn"
  );
};

export const getByIdDiamondShapesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getByIdDiamondShapes(req),
    "getByIdDiamondShapesFn"
  );
};

export const updateDiamondShapesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateDiamondShapes(req),
    "updateDiamondShapesFn"
  );
};

export const deleteDiamondShapesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteDiamondShapes(req),
    "deleteDiamondShapesFn"
  );
};

export const statusUpdateDiamondShapesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateDiamondShapes(req),
    "statusUpdateDiamondShapesFn"
  );
};

//////////////------ gemstones --------///////////////

export const addGemstonesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addGemstones(req), "addGemstonesFn");
};

export const getAllGemstonesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllGemstones(req), "getAllGemstonesFn");
};

export const getByIdGemstonesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdGemstones(req), "getByIdGemstonesFn");
};

export const updateGemstonesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateGemstones(req), "updateGemstonesFn");
};

export const deleteGemstonesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteGemstones(req), "deleteGemstonesFn");
};

export const statusUpdateGemstonesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateGemstones(req),
    "statusUpdateGemstonesFn"
  );
};

//////////////------ heads --------///////////////

export const addHeadsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addHeads(req), "addHeadsFn");
};

export const getAllHeadsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllHeads(req), "getAllHeadsFn");
};

export const getByIdHeadsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdHeads(req), "getByIdHeadsFn");
};

export const updateHeadsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateHeads(req), "updateHeadsFn");
};

export const deleteHeadsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteHeads(req), "deleteHeadsFn");
};

export const statusUpdateHeadsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateHeads(req), "statusUpdateHeadsFn");
};

//////////////------ Shanks --------///////////////

export const addShanksFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addShanks(req), "addShanksFn");
};

export const getAllShanksFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllShanks(req), "getAllShanksFn");
};

export const getByIdShanksFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdShanks(req), "getByIdShanksFn");
};

export const updateShanksFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateShanks(req), "updateShanksFn");
};

export const deleteShanksFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteShanks(req), "deleteShanksFn");
};

export const statusUpdateShanksFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateShanks(req), "statusUpdateShanksFn");
};

//////////////------ SettingTypes --------///////////////

export const addSettingTypesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addSettibgTypes(req), "addSettingTypesFn");
};

export const getAllSettingTypesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllSettingTypes(req), "getAllSettingTypesFn");
};

export const getByIdSettingTypesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getByIdSettingTypes(req),
    "getByIdSettingTypesFn"
  );
};

export const updateSettingTypesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateSettingTypes(req), "updateSettingTypesFn");
};

export const deleteSettingTypesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteSettingTypes(req), "deleteSettingTypesFn");
};

export const statusUpdateSettingTypesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateSettingTypes(req),
    "statusUpdateSettingTypesFn"
  );
};

//////////////------ side Setting Types --------///////////////

export const addSideSettibgStylesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addSideSettibgStyles(req),
    "addSideSettibgStylesFn"
  );
};

export const getAllSideSettingStylesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getAllSideSettingStyles(req),
    "getAllSideSettingStylesFn"
  );
};

export const getByIdSideSettingStylesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getByIdSideSettingStyles(req),
    "getByIdSideSettingStylesFn"
  );
};

export const updateSideSettingStylesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateSideSettingStyles(req),
    "updateSideSettingStylesFn"
  );
};

export const deleteSideSettingStylesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteSideSettingStyles(req),
    "deleteSideSettingStylesFn"
  );
};

export const statusUpdateSideSettingStylesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateSideSettingStyles(req),
    "statusUpdateSideSettingStylesFn"
  );
};

////////////----- Metal master ------//////////////

export const addMetalMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addMetalMasterData(req), "addMetalMasterDataFn");
};

export const getAllMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllMasterData(req), "getAllMasterDataFn");
};

export const getByIdMetalMasterDatasFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getByIdMetalMasterData(req),
    "getByIdMetalMasterDatasFn"
  );
};

export const updateMetalMasterFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateMetalMasterData(req),
    "updateMetalMasterFn"
  );
};

export const deleteMetalMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteMetalMasterData(req),
    "deleteMetalMasterDataFn"
  );
};

export const statusUpdateMetalMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateMetalMasterData(req),
    "statusUpdateMetalMasterDataFn"
  );
};

export const goldRateUpdateDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, goldRateUpdate(req), "goldRateUpdateDataFn");
};

export const silverRateUpdateDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, silverRateUpdate(req), "silverRateUpdateDataFn");
};

export const platinumRateUpdateDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    platinumRateUpdate(req),
    "platinumRateUpdateDataFn"
  );
};
////////////----- Metal Group master ------//////////////

export const addMetalGroupMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addMetalGroupMasterData(req),
    "addMetalGroupMasterDataFn"
  );
};

export const getAllMetalGroupMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getAllMetalGroupMasterData(req),
    "getAllMetalGroupMasterDataFn"
  );
};

export const getByIdMetalGroupMasterDatasFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getByIdMetalGroupMasterData(req),
    "getByIdMetalGroupMasterDatasFn"
  );
};

export const updateMetalGroupMasterFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateMetalGroupMasterData(req),
    "updateMetalGroupMasterFn"
  );
};

export const deleteMetalGroupMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteMetalGroupMasterData(req),
    "deleteMetalGroupMasterDataFn"
  );
};

export const statusUpdateMetalGroupMasterDataFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    statusUpdateMetalGroupMasterData(req),
    "statusUpdateMetalGroupMasterDataFn"
  );
};
/////////////------metal dropDown data ----///////////////

export const metalMasterDropDownFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    metalMasterDropDown(req),
    "metalMasterDropDownFn"
  );
};

export const goldKtDropDownDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, goldKtDropDownData(req), "goldKtDropDownDataFn");
};

export const metalToneDropDownDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    metalToneDropDownData(req),
    "metalToneDropDownDataFn"
  );
};
//////////////------ Gold KT --------///////////////

export const addGoldKTsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addGoldKarat(req), "addGoldKTsFn");
};

export const getAllGoldKTsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllGoldKTs(req), "getAllGoldKTsFn");
};

export const getByIdGoldKTsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdGoldKTs(req), "getByIdGoldKTsFn");
};

export const updateGoldKTsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateGoldKTs(req), "updateGoldKTsFn");
};

export const deleteGoldKTsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteGoldKts(req), "deleteGoldKTsFn");
};

export const statusUpdateGoldKTsFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateGoldKts(req),
    "statusUpdateGoldKTsFn"
  );
};

//////////////------ Metal Tone --------///////////////

export const addMetalTonesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addMetalTones(req), "addMetalTonesFn");
};

export const getAllMetalTonesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllMetalTones(req), "getAllMetalTonesFn");
};

export const getByIdMetalTonesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdMetalTones(req), "getByIdMetalTonesFn");
};

export const updateMetalTonesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateMetalTones(req), "updateMetalTonesFn");
};

export const deleteMetalTonesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteMetalTones(req), "deleteMetalTonesFn");
};

export const statusUpdateMetalTonesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateMetalTones(req),
    "statusUpdateMetalTonesFn"
  );
};
//////////////------ carat size --------///////////////

export const addCaratSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addCaratSize(req), "addCaratSizeFn");
};

export const getAllCaratSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllCaratSize(req), "getAllCaratSizeFn");
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

export const statusUpdateCaratSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateCaratSize(req),
    "statusUpdateCaratSizeFn"
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

export const statusUpdateMMSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateMMSize(req), "statusUpdateMMSizeFn");
};

//////////////------ Diamond Group Master --------///////////////

export const addDiamondGroupMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addDiamondGroupMasterData(req),
    "addDiamondGroupMasterDataFn"
  );
};

export const getAllDiamondGroupMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getAllDiamondGroupMasterData(req),
    "getAllDiamondGroupMasterDataFn"
  );
};

export const updateDiamondGroupMasterFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateDiamondGroupMasterData(req),
    "updateDiamondGroupMasterFn"
  );
};

export const deleteDiamondGroupMasterDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteDiamondGroupMasterData(req),
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
    statusUpdateDiamondGroupMasterData(req),
    "statusUpdateDiamondGroupMasterDataFn"
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
//////////////------ color --------///////////////

export const addColorsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addColors(req), "addColorsFn");
};

export const getAllColorsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllColors(req), "getAllColorsFn");
};

export const getByIdColorsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdColors(req), "getByIdColorsFn");
};

export const updateColorsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateColors(req), "updateColorsFn");
};

export const deleteColorsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteColors(req), "deleteColorsFn");
};

export const statusUpdateColorsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateColors(req), "statusUpdateColorsFn");
};

//////////////------ clarity --------///////////////

export const addClarityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addClarity(req), "addClarityFn");
};

export const getAllClarityFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllClarity(req), "getAllClarityFn");
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

export const statusUpdateClarityFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateClarity(req),
    "statusUpdateClarityFn"
  );
};

//////////////------ cuts --------///////////////

export const addCutsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addCuts(req), "addCutsFn");
};

export const getAllCutsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllCuts(req), "getAllCutsFn");
};

export const getByIdCutsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdCuts(req), "getByIdCutsFn");
};

export const updateCutsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateCuts(req), "updateCutsFn");
};

export const deleteCutsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteCuts(req), "deleteCutsFn");
};

export const statusUpdateCutsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateCuts(req), "statusUpdateCutsFn");
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

export const getAllSettingCaratWeightFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getAllSettingCaratWeight(req),
    "getAllSettingCaratWeightFn"
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

export const statusUpdateSettingCaratWeightFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateSettingCaratWeight(req),
    "statusUpdateSettingCaratWeightFn"
  );
};

//////////////------ Tag --------///////////////

export const getAllTagsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllTags(req), "getAllTagsFn");
};

export const getTagByIdFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getTagById(req), "getTagByIDFn");
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
  callServiceMethod(req, res, activeInactiveTag(req), "activeInactiveTagFn");
};

//////////////------ Item Size --------///////////////

export const addItemSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addItemSize(req), "addItemSizeFn");
};

export const getAllItemSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllItemSize(req), "getAllItemSizeFn");
};

export const updateItemSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateItemSize(req), "updateItemSizeFn");
};

export const deleteItemSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteItemSize(req), "deleteItemSizeFn");
};

export const statusUpdateItemSizeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateItemSize(req),
    "statusUpdateItemSizeFn"
  );
};

//////////////------ Item Length --------///////////////

export const addItemLengthFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addItemLength(req), "addItemLengthFn");
};

export const getAllItemLengthFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllItemLength(req), "getAllItemLengthFn");
};

export const updateItemLengthFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateItemLength(req), "updateItemLengthFn");
};

export const deleteItemLengthFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteItemLength(req), "deleteItemLengthFn");
};

export const statusUpdateItemLengthFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateItemLength(req),
    "statusUpdateItemLengthFn"
  );
};
