import { RequestHandler } from "express";
import {
  authenticateSystemUser,
  changeAnyUserPassword,
  changePassword,
  customerRegisterOtpVerified,
  forgotPassword,
  refreshAuthorizationToken,
  registerCustomerUser,
  registerSystemUser,
  resendOtpVerification,
  resetPassword,
  test,
  updateProfileForCustomer,
} from "../services/auth.service";
import { callServiceMethod } from "./base.controller";
import { authenticate3dConfiguratorSystemUser, loginOtpverificationConfigUser, otpvVeificationConfigUser } from "../services/3d-configurator/auth-log.service";

export const testFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, test(req), "registerSystemUserFn");
};

export const registerSystemUserFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, registerSystemUser(req), "registerSystemUserFn");
};

export const authenticateSystemUserFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    authenticateSystemUser(req),
    "authenticateSystemUserFn"
  );
};

export const refreshAuthorizationTokenFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    refreshAuthorizationToken(req),
    "refreshAuthorizationTokenFn"
  );
};

export const changePasswordFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, changePassword(req), "changePasswordFn");
};

export const forgotPasswordFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, forgotPassword(req), "forgotPasswordFn");
};

export const resetPasswordFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, resetPassword(req), "resetPasswordFn");
};

export const changeAnyUserPasswordFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    changeAnyUserPassword(req),
    "changeAnyUserPasswordFn"
  );
};

export const registerCustomerUserFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, registerCustomerUser(req), "registerCustomerUserFn");
};

export const customerRegisterOtpVerifiedFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, customerRegisterOtpVerified(req), "customerRegisterOtpVerifiedFn");
}

export const resendOtpVerificationFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, resendOtpVerification(req), "resendOtpVerificationFn");
}

export const updateProfileForCustomerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateProfileForCustomer(req), "updateProfileForCustomerFn");
}

export const authenticate3dConfiguratorSystemUserFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, authenticate3dConfiguratorSystemUser(req), "authenticate3dConfiguratorSystemUserFn");
};

export const loginOtpverificationConfigUserFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, loginOtpverificationConfigUser(req), "loginOtpverificationConfigUserFn");
};

export const otpvVeificationConfigUserFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, otpvVeificationConfigUser(req), "otpvVeificationConfigUserFn");
};