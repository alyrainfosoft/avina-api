import { Router } from "express";
import {
  authenticateSystemUserFn,
  changeAnyUserPasswordFn,
  changePasswordFn,
  customerRegisterOtpVerifiedFn,
  forgotPasswordFn,
  refreshAuthorizationTokenFn,
  registerCustomerUserFn,
  registerSystemUserFn,
  resendOtpVerificationFn,
  resetPasswordFn,
  testFn,
  updateProfileForCustomerFn,
} from "../controllers/auth.controller";
import { authorization, customerAuthorization } from "../middlewares/authenticate";
import { reqMultiImageParser, reqSingleImageParser } from "../middlewares/multipart-file-parser";
import {
  changeAnyUserPasswordValidator,
  changePasswordnValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerCustomerValidator,
  registerUserValidator,
  resetPasswordValidator,
} from "../validators/auth/auth.validator";

export default (app: Router) => {
  app.use("/test/:id", [reqMultiImageParser(['image1', 'image2'])],testFn);
  app.post("/register-user", [registerUserValidator], registerSystemUserFn);

  app.post("/login", [loginValidator], authenticateSystemUserFn);
  app.post(
    "/refresh-authorization-token",
    [refreshTokenValidator],
    refreshAuthorizationTokenFn
  );
  app.post("/change-password", [customerAuthorization, changePasswordnValidator], changePasswordFn);
  app.post("/forgot-password", [forgotPasswordValidator], forgotPasswordFn);
  app.post("/reset-password", [resetPasswordValidator], resetPasswordFn);
  app.post(
    "/change-any-user-password",
    [authorization, changeAnyUserPasswordValidator],
    changeAnyUserPasswordFn
  );

  app.post("/registration/customer",[registerCustomerValidator], registerCustomerUserFn)
  app.post("/optVerified/customer", customerRegisterOtpVerifiedFn);
  app.post("/reSend/Opt", resendOtpVerificationFn);

  app.put("/customer/profile/edit",[authorization, customerAuthorization, reqSingleImageParser("image")], updateProfileForCustomerFn)
};
