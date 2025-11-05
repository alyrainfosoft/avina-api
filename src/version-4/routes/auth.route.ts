import { Router } from "express";
import {
  addOrUpdateMenuItemWithPermissionFn,
  authenticate3dConfiguratorSystemUserFn,
  authenticateCustomerUserWithOTPFn,
  authenticateSystemUserFn,
  changeAnyUserPasswordFn,
  changePasswordFn,
  customerRegisterOtpVerifiedFn,
  deleteMenuItemFn,
  forgotPasswordFn,
  getMenuItemWithPermissionsFn,
  getProfileForCustomerFn,
  importMenuItemsWithPermissionFn,
  loginOtpverificationConfigUserFn,
  otpvVeificationConfigUserFn,
  refreshAuthorizationTokenFn,
  registerCustomerUserFn,
  registerSystemUserFn,
  registrationCustomerUserWithThirdPartyFn,
  resendOtpVerificationFn,
  resetPasswordFn,
  statusUpdateForMenuItemFn,
  superAdminOtpVerifiedFn,
  testFn,
  updateProfileForCustomerFn,
} from "../controllers/auth.controller";
import {
  authorization,
  customerAuthorization,
} from "../../middlewares/authenticate";
import {
  reqMultiImageParser,
  reqProductBulkUploadFileParser,
  reqSingleImageParser,
} from "../../middlewares/multipart-file-parser";
import {
  changeAnyUserPasswordValidator,
  changePasswordnValidator,
  customerLoginValidator,
  forgotPasswordValidator,
  refreshTokenValidator,
  registerCustomerValidator,
  registerCustomerWithThirdPartyValidator,
  registerUserValidator,
  resendOtpValidator,
  resetPasswordValidator,
  vFourloginValidator,
} from "../../validators/auth/auth.validator";
import { getUserAccessMenuItemsFn } from "../controllers/role.controller";
import { currencyMiddleware } from "../../middlewares/currency-rate-change";

export default (app: Router) => {
  app.post("/test", [currencyMiddleware], testFn);
  // app.post("/register-user", [registerUserValidator], registerSystemUserFn);

  app.post("/login", [vFourloginValidator], authenticateSystemUserFn);
  app.post(
    "/customer/login",
    [customerLoginValidator],
    authenticateCustomerUserWithOTPFn
  );

  app.post(
    "/refresh-authorization-token",
    [refreshTokenValidator],
    refreshAuthorizationTokenFn
  );
  app.post("/change-password", [changePasswordnValidator], changePasswordFn);
  app.post("/forgot-password", [forgotPasswordValidator], forgotPasswordFn);
  app.post("/reset-password", [resetPasswordValidator], resetPasswordFn);
  app.post(
    "/change-any-user-password",
    [authorization, changeAnyUserPasswordValidator],
    changeAnyUserPasswordFn
  );

  app.post(
    "/registration/customer",
    [registerCustomerValidator],
    registerCustomerUserFn
  );
  app.post("/optVerified/customer", customerRegisterOtpVerifiedFn);
  app.post("/reSend/Opt",[resendOtpValidator] ,resendOtpVerificationFn);

  app.put(
    "/customer/profile/edit",
    [customerAuthorization, reqSingleImageParser("image")],
    updateProfileForCustomerFn
  );
  app.get("/user-detail/:id", getProfileForCustomerFn);
  app.post("/config/user/auth", authenticate3dConfiguratorSystemUserFn);

  app.post("/optVerified/config/user/auth", loginOtpverificationConfigUserFn);

  app.post("/optVerified/config", otpvVeificationConfigUserFn);

  /* sing up with third party */

  app.post(
    "/customer/signup-third-party",
    [registerCustomerWithThirdPartyValidator],
    registrationCustomerUserWithThirdPartyFn
  );

  // Start Admin Panel Menu Access & Permission API Management
  app.post(
    "/menu-item-with-permission",
    [authorization],
    addOrUpdateMenuItemWithPermissionFn
  );

  app.get(
    "/menu-item-with-permission",
    [authorization],
    getMenuItemWithPermissionsFn
  );

  app.get(
    "/menu-item-with-permission/:id",
    [authorization],
    getMenuItemWithPermissionsFn
  );
  
  app.post(
    "/import-menu-item-with-permission",
    [authorization,reqProductBulkUploadFileParser("menu_item_with_permission")],
    importMenuItemsWithPermissionFn
  );

  app.delete(
    "/menu-item-with-permission/:id",
    [authorization],
    deleteMenuItemFn
  );

  app.patch(
    "/menu-item-with-permission/:id",
    [authorization],
    statusUpdateForMenuItemFn
  );

  app.post("/otp-verified/admin/:id", superAdminOtpVerifiedFn)
  // End Admin Panel Menu Access & Permission API Management

    app.get("/user-access-menu-items", [], getUserAccessMenuItemsFn);
  
};
