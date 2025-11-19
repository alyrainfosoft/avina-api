import { Router } from "express";
import { addStoreAddressFn, deleteStoreAddressFn, getAllStoreAddressFn, getAllStoreAddressForUserFn, statusUpdateForStoreAddressFn, updateStoreAddressFn } from "../../controllers/store-address.controller";
import { authorization } from "../../../middlewares/authenticate";
import { addStoreAddressValidator } from "../../../validators/address/address.validator";

export default (app: Router) => {
    app.get("/store-address", [authorization], getAllStoreAddressFn);
    app.post("/store-address", [authorization,addStoreAddressValidator], addStoreAddressFn);
    app.put("/store-address/:id", [authorization,addStoreAddressValidator], updateStoreAddressFn);
    app.delete("/store-address/:id", [authorization], deleteStoreAddressFn);
    app.patch("/store-address/:id", [authorization], statusUpdateForStoreAddressFn);

}