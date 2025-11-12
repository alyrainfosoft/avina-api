import { RequestHandler } from "express";
import {
  addRole,
  addRoleConfiguration,
  deleteRole,
  fetchRoleConfiguration,
  getUserAccessMenuItems,
  getAllActions,
  getAllMenuItems,
  getAllRoles,
  updateRole,
  updateRoleConfiguration,
  addMenuItems,
  changeStatusRoleConfiguration,
} from "../services/role.service";
import { callServiceMethod } from "./base.controller";
import { addRoleAPIPermissionCSVFile } from "../services/role-api-permission-bulk-upload.service";

export const getAllRolesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllRoles(req), "getAllRolesFn");
};

export const addRoleFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addRole(req), "addRoleFn");
};

export const updateRoleFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateRole(req), "updateRoleFn");
};

export const deleteRoleFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteRole(req), "deleteRoleFn");
};

export const getAllActionsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllActions(req), "getAllActionsFn");
};

export const getAllMenuItemsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllMenuItems(req), "getAllMenuItemsFn");
};

export const fetchRoleConfigurationFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    fetchRoleConfiguration(req),
    "fetchRoleConfigurationFn"
  );
};

export const addRoleConfigurationFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addRoleConfiguration(req),
    "addRoleConfigurationFn"
  );
};

export const updateRoleConfigurationFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateRoleConfiguration(req),
    "updateRoleConfigurationFn"
  );
};

export const changeStatusRoleConfigurationFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    changeStatusRoleConfiguration(req),
    "changeStatusRoleConfiguration"
  );
};

export const getUserAccessMenuItemsFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getUserAccessMenuItems(req),
    "getUserAccessMenuItemsFn"
  );
};
export const addMenuItemsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addMenuItems(req), "addMenuItemsFn");
};

export const addRoleAPIPermissionCSVFileFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addRoleAPIPermissionCSVFile(req),
    "addRoleAPIPermissionCSVFileFn"
  );
};
