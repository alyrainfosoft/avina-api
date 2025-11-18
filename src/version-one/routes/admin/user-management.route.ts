import { Router } from "express";

import { authorization } from "../../../middlewares/authenticate";
import { reqSingleImageParser } from "../../../middlewares/multipart-file-parser";
import {
  addBusinessUserValidator,
  updateBusinessUserValidator,
} from "../../../validators/user-management/user-management.validator";
import { addBusinessUserFn, deleteBusinessUserFn, getAllBusinessUsersFn, getBusinessUserByIdFn, updateBusinessUserFn } from "../../controllers/user-management.controller";
import { getAllRolesFn } from "../../controllers/role.controller";

export default (app: Router) => {
  app.get("/business-user", [authorization], getAllBusinessUsersFn);
  app.get("/business-user/:id", [authorization], getBusinessUserByIdFn);

  app.post(
    "/business-user",
    [authorization, reqSingleImageParser("image"), addBusinessUserValidator],
    addBusinessUserFn
  );
  app.put(
    "/business-user/:id",
    [authorization, reqSingleImageParser("image"), updateBusinessUserValidator],
    updateBusinessUserFn
  );
  app.delete("/business-user/:id", [authorization], deleteBusinessUserFn);

    app.get("/user-management/roles", [authorization], getAllRolesFn);

};
