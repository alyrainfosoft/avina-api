import { Router } from "express"
import { authorization } from "../../../middlewares/authenticate"
import { addFiltersFn, editFiltersFn, filterMasterListFn, getAllFiltersFn, getFilterForUserFn, statusUpdateForFilterFn } from "../../controllers/filters.controller"
import { addFiltersValidator, updateFiltersValidator } from "../../../validators/theme/theme.validator"

export default (app: Router) => {
    app.get("/filter", [authorization], getAllFiltersFn)
    app.post("/filter", [authorization,addFiltersValidator], addFiltersFn)
    app.put("/filter/:id", [authorization, updateFiltersValidator], editFiltersFn)
    app.patch("/filter/:id", [authorization], statusUpdateForFilterFn)
    app.get("/filter-masters",[authorization], filterMasterListFn)

}