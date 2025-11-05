import { Router } from "express";
import { addUserAddressFn, cityListCustomerSideFn, countryListCustomerSideFn, currencyListCustomerSideFn, deleteUserAddressFn, getUserAddressFn, mainCategoryListFn, stateListCustomerSideFn, updateUserAddressFn } from "../../../controllers/Frontend/master.controller";
import { addressValidator } from "../../../../validators/address/address.validator";
import { customerAuthorization } from "../../../../middlewares/authenticate";
import { addSubscriptionsValidator } from "../../../../validators/enquirie/enquirie.validator";

export default (app: Router) => {
    app.get("/country/list", countryListCustomerSideFn)
    app.post("/state/list", stateListCustomerSideFn)
    app.post("/city/list", cityListCustomerSideFn)
    // app.get("/category/list", mainCategoryListFn)
    // app.get("/currency/list", currencyListCustomerSideFn)


    app.post("/addres/add", [customerAuthorization, addressValidator], addUserAddressFn )
    app.post("/address/get", [customerAuthorization], getUserAddressFn)
    app.put("/address/edit", [customerAuthorization, addressValidator], updateUserAddressFn)
    app.post("/address/delete", [customerAuthorization], deleteUserAddressFn);

}
