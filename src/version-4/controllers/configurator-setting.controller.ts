import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addAndEditConfiguratorFile, addCommonConfiguratorFile, addConfigurator, deleteConfigurator, deleteConfiguratorFile, getConfigurator, getConfiguratorCommonFiles, getConfiguratorFiles, getConfiguratorForAdmin, getConfiguratorForUser, statusUpdateForClientConfigurator, statusUpdateForConfigurator, updateConfigurator } from "../services/configurator-setting.service";

export const addConfiguratorFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addConfigurator(req), "addConfiguratorFn");
};

export const getConfiguratorFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getConfigurator(req), "getConfiguratorFn");
};

export const updateConfiguratorFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateConfigurator(req), "updateConfiguratorFn");
};

export const deleteConfiguratorFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteConfigurator(req), "deleteConfiguratorFn");
};

export const statusUpdateForConfiguratorFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateForConfigurator(req), "statusUpdateForConfiguratorFn");
};

export const addAndEditConfiguratorFileFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addAndEditConfiguratorFile(req), "addAndEditConfiguratorFileFn");
};

export const addCommonConfiguratorFileFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addCommonConfiguratorFile(req), "addCommonConfiguratorFileFn");
};

export const getConfiguratorCommonFilesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getConfiguratorCommonFiles(req), "getConfiguratorCommonFilesFn");
};

export const getConfiguratorFilesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getConfiguratorFiles(req), "getConfiguratorFilesFn");
};

export const deleteConfiguratorFileFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteConfiguratorFile(req), "deleteConfiguratorFileFn");
};

export const statusUpdateForClientConfiguratorFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, statusUpdateForClientConfigurator(req), "statusUpdateForClientConfiguratorFn");
};
  
export const getConfiguratorForUserFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getConfiguratorForUser(req), "getConfiguratorForUserFn");
};
  
export const getConfiguratorForAdminFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getConfiguratorForAdmin(req), "getConfiguratorForAdminFn");
  };