import { Router } from "express";
import { getConfiguratorForUserFn } from "../../controllers/configurator-setting.controller";


export default (app: Router) => {
    
    app.get("/configurator-setting", getConfiguratorForUserFn)

}