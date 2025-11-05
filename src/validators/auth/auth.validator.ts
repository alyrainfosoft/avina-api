import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import {
  changeAnyUserPasswordValidationRule,
  changePasswordnValidationRule,
  customerLoginValidationRule,
  forgotPasswordValidationRule,
  loginValidationRule,
  refreshTokenValidationRule,
  registerCustomerValidationRule,
  registerCustomerWithThirdPartyValidationRule,
  registerUserValidationRule,
  resendOtpValidationRule,
  resetPasswordValidationRule,
  vfourloginValidationRule,
} from "./auth.rules";

export const registerUserValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, registerUserValidationRule);
};

export const registerCustomerValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, registerCustomerValidationRule);
};

export const registerCustomerWithThirdPartyValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(
    req,
    res,
    next,
    registerCustomerWithThirdPartyValidationRule
  );
};

export const loginValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, loginValidationRule);
};
export const vFourloginValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, vfourloginValidationRule);
};

export const customerLoginValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, customerLoginValidationRule);
};
export const resendOtpValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, resendOtpValidationRule);
};

export const refreshTokenValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, refreshTokenValidationRule);
};

export const changePasswordnValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, changePasswordnValidationRule);
};

export const forgotPasswordValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, forgotPasswordValidationRule);
};

export const resetPasswordValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, resetPasswordValidationRule);
};

export const changeAnyUserPasswordValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(
    req,
    res,
    next,
    changeAnyUserPasswordValidationRule
  );
};
