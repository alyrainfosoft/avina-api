import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addTheme, deleteAllFontStyleFile, deleteFontStyleFile, getGeneralSetting, getThemeDataForUser, getThemes, getWebConfigSetting, updateAttributeValue, updateFontStyle, updateGeneralCompanyInfo, updateLogos, updateScripts, updateSystemColor, updateTheme, updateWebConfigSetting } from "../services/themes.service";

export const addThemeFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addTheme(req), "addThemeFn");
}

export const getThemesFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getThemes(req), "getThemesFn");
}

export const updateThemeFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateTheme(req), "updateThemeFn");
}

export const updateAttributeValueFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateAttributeValue(req), "updateAttributeValueFn");
}

export const getThemeDataForUserFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getThemeDataForUser(req), "getThemeDataForUserFn");
}

export const updateGeneralCompanyInfoFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateGeneralCompanyInfo(req), "updateGeneralCompanyInfoFn");
}

export const updateLogosFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateLogos(req), "updateLogosFn");
}

export const updateScriptsFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateScripts(req), "updateScriptsFn");
}

export const updateFontStyleFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateFontStyle(req), "updateFontStyleFn");
}

export const deleteFontStyleFileFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, deleteFontStyleFile(req), "deleteFontStyleFileFn");
}

export const deleteAllFontStyleFileFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, deleteAllFontStyleFile(req), "deleteAllFontStyleFileFn");
}

export const updateSystemColorFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateSystemColor(req), "updateSystemColorFn");
}

export const getGeneralSettingFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getGeneralSetting(req), "getGeneralSettingFn");
}

export const getWebConfigSettingFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getWebConfigSetting(req), "getWebConfigSettingFn");
}

export const updateWebConfigSettingFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateWebConfigSetting(req,0), "updateWebConfigSettingFn");
}