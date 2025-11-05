import { Router } from "express";
import { addUserAddressFn, cityListCustomerSideFn, countryListCustomerSideFn, currencyListCustomerSideFn, deleteUserAddressFn, getUserAddressFn, mainCategoryListFn, stateListCustomerSideFn, updateUserAddressFn } from "../../controllers/Frontend/master.controller";
import { addressValidator } from "../../validators/address/address.validator";
import { customerAuthorization } from "../../middlewares/authenticate";
import { addSubscriptionsValidator } from "../../validators/enquirie/enquirie.validator";

export default (app: Router) => {
    app.get("/user/country/list", countryListCustomerSideFn)
    app.post("/user/state/list", stateListCustomerSideFn)
    app.post("/user/city/list", cityListCustomerSideFn)
    app.get("/user/category/list", mainCategoryListFn)
    app.get("/user/currency/list", currencyListCustomerSideFn)


    app.post("/user/addres/add", [customerAuthorization, addressValidator], addUserAddressFn )
    app.post("/user/address/get", [customerAuthorization], getUserAddressFn)
    app.put("/user/address/edit", [customerAuthorization, addressValidator], updateUserAddressFn)
    app.post("/user/address/delete", [customerAuthorization], deleteUserAddressFn);

}
