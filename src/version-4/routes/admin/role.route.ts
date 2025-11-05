import { Router } from "express";
import {
  addRoleConfigurationFn,
  addRoleFn,
  deleteRoleFn,
  fetchRoleConfigurationFn,
  getUserAccessMenuItemsFn,
  getAllActionsFn,
  getAllMenuItemsFn,
  getAllRolesFn,
  updateRoleConfigurationFn,
  updateRoleFn,
  addMenuItemsFn,
  addRoleAPIPermissionCSVFileFn,
  changeStatusRoleConfigurationFn,
} from "../../controllers/role.controller";
import { authorization } from "../../../middlewares/authenticate";
import {
  addUpdateRoleConfigurationValidator,
  addRoleValidator,
  updateRoleValidator,
} from "../../../validators/role/role.validator";
import { reqProductBulkUploadFileParser } from "../../../middlewares/multipart-file-parser";

export default (app: Router) => {
  app.get("/roles", [authorization], getAllRolesFn);
  app.post("/roles", [authorization, addRoleValidator], addRoleFn);
  app.put("/roles/:id", [authorization, updateRoleValidator], updateRoleFn);
  app.delete("/roles/:id", [authorization], deleteRoleFn);
  app.get("/actions", [authorization], getAllActionsFn);
  app.get("/menu-items", [authorization], getAllMenuItemsFn);
  app.get("/role-configuration/:id", [authorization], fetchRoleConfigurationFn);
  app.post(
    "/role-configuration",
    [authorization, addUpdateRoleConfigurationValidator],
    addRoleConfigurationFn
  );
  app.put(
    "/role-configuration/:id",
    [authorization, addUpdateRoleConfigurationValidator],
    updateRoleConfigurationFn
  );
  app.patch(
    "/role-configuration/:id",
    [authorization],
    changeStatusRoleConfigurationFn
  );
  app.post("/menu-items",[authorization], addMenuItemsFn);
  app.post(
    "/role-api-permissions-bulk",
    [reqProductBulkUploadFileParser("role_csv"),authorization],
    addRoleAPIPermissionCSVFileFn
  );
};
