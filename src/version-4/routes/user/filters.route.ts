import { Router } from "express"
import { filterMasterListFn, getFilterForUserFn } from "../../controllers/filters.controller"


export default (app: Router) => {
    app.get("/filter", getFilterForUserFn)
}