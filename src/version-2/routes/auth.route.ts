import { Router } from "express";
import {
  authenticate3dConfiguratorSystemUserFn,
  authenticateSystemUserFn,
  changeAnyUserPasswordFn,
  changePasswordFn,
  customerRegisterOtpVerifiedFn,
  forgotPasswordFn,
  loginOtpverificationConfigUserFn,
  otpvVeificationConfigUserFn,
  refreshAuthorizationTokenFn,
  registerCustomerUserFn,
  registerSystemUserFn,
  resendOtpVerificationFn,
  resetPasswordFn,
  testFn,
  updateProfileForCustomerFn,
} from "../controllers/auth.controller";
import {
  authorization,
  customerAuthorization,
} from "../../middlewares/authenticate";
import {
  reqMultiImageParser,
  reqSingleImageParser,
} from "../../middlewares/multipart-file-parser";
import {
  changeAnyUserPasswordValidator,
  changePasswordnValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerCustomerValidator,
  registerUserValidator,
  resetPasswordValidator,
} from "../../validators/auth/auth.validator";

export default (app: Router) => {
  app.post("/test", [reqSingleImageParser("image")], testFn);
  app.post("/register-user", [registerUserValidator], registerSystemUserFn);

  app.post("/login", [loginValidator], authenticateSystemUserFn);
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
  app.post("/reSend/Opt", resendOtpVerificationFn);

  app.put(
    "/customer/profile/edit",
    [customerAuthorization, reqSingleImageParser("image")],
    updateProfileForCustomerFn
  );

  app.post("/config/user/auth", authenticate3dConfiguratorSystemUserFn);

  app.post("/optVerified/config/user/auth", loginOtpverificationConfigUserFn);

  app.post("/optVerified/config", otpvVeificationConfigUserFn);
};
