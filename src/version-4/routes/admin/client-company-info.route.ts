import { Router } from "express";
import {
  addSippingChargeFn,
  changeStatusShippingChargeFn,
  deleteShippingChargeFn,
  getShippingChargeByFilterFn,
  updatedShippingChargeFn,
} from "../../controllers/shipping-charge.controller";
import {
  addShippingChargeValidator,
  updateShippingChargeValidator,
} from "../../../validators/shipping-charge/shipping-charge.validator";
import { authorization } from "../../../middlewares/authenticate";
import { getCompanyInfoForAdminByClientFn, updateGeneralCompanyInfoByClientFn } from "../../controllers/client-company-info.controller.ts";
import { generalCompanyInfoValidator, systemColorValidator } from "../../../validators/theme/theme.validator";
import { reqMultiImageParser } from "../../../middlewares/multipart-file-parser";

export default (app: Router) => {
  app.get("/client-companyinfo",[authorization], getCompanyInfoForAdminByClientFn);
  app.put(
    "/client-companyinfo",
    [authorization,reqMultiImageParser(["header_logo", "footer_logo", "favicon", "loader", "mail_tem_logo",
            "default_image", "page_not_found_image", "share_image", "product_not_found_image", "order_not_found_image"])],
    updateGeneralCompanyInfoByClientFn
  );
};
