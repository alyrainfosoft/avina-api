import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import { addAndEditConfiguratorFileFn, addCommonConfiguratorFileFn, addConfiguratorFn, deleteConfiguratorFileFn, deleteConfiguratorFn, getConfiguratorCommonFilesFn, getConfiguratorFilesFn, getConfiguratorFn, getConfiguratorForAdminFn, getConfiguratorForUserFn, statusUpdateForClientConfiguratorFn, statusUpdateForConfiguratorFn, updateConfiguratorFn } from "../../controllers/configurator-setting.controller";
import { reqAnyTypeImageAnyFormat, reqSingleImageParser } from "../../../middlewares/multipart-file-parser";

export default (app: Router) => {
    app.post("/configurator-setting", [reqSingleImageParser("image"),authorization], addConfiguratorFn)
    app.get("/configurator-setting", [authorization], getConfiguratorFn)
    app.put("/configurator-setting/:id", [reqSingleImageParser("image"),authorization], updateConfiguratorFn)
    app.patch("/configurator-setting/:id", [authorization], statusUpdateForClientConfiguratorFn)
    app.delete("/configurator-setting/:id", [authorization], deleteConfiguratorFn)

    app.post("/configurator-setting-file", [authorization, reqAnyTypeImageAnyFormat()], addAndEditConfiguratorFileFn)
    app.post("/configurator-setting-common-file", [authorization, reqAnyTypeImageAnyFormat()], addCommonConfiguratorFileFn)
    app.get("/configurator-setting-common-file", [authorization], getConfiguratorCommonFilesFn)
    app.get("/configurator-setting-file/:config_id", [authorization], getConfiguratorFilesFn)
    app.delete("/configurator-setting-file/:id", [authorization], deleteConfiguratorFileFn)

    app.patch("/configurator-setting/:ids", [authorization], statusUpdateForClientConfiguratorFn)

    app.post("/common-config/configurator-setting-common-file", [authorization, reqAnyTypeImageAnyFormat()], addCommonConfiguratorFileFn)
    app.get("/common-config/configurator-setting-common-file", [authorization], getConfiguratorCommonFilesFn)

    app.post("/common-config/configurator-setting-file", [authorization, reqAnyTypeImageAnyFormat()], addAndEditConfiguratorFileFn)
    app.get("/common-config/configurator-setting-file/:config_id", [authorization], getConfiguratorFilesFn)
    app.delete("/common-config/configurator-setting-file/:id", [authorization], deleteConfiguratorFileFn)

    app.get("/eternity-band/detail/configurator-setting", [authorization], getConfiguratorForAdminFn)
    app.get("/detail/configurator-setting", [authorization], getConfiguratorForAdminFn)

}