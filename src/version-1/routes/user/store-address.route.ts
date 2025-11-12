import { Router } from "express";
import { getAllStoreAddressForUserFn } from "../../controllers/store-address.controller";

export default (app: Router) => {
  
    app.get("/store-address", getAllStoreAddressForUserFn);

}