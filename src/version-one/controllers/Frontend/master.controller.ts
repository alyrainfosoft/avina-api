import { RequestHandler } from "express";
import { addUserAddress, deleteUserAddress, getUserAddress, updateUserAddress } from "../../services/frontend/address.service";
import { cityListCustomerSide, countryListCustomerSide, currencyListCustomerSide, mainCategoryList, stateListCustomerSide } from "../../services/frontend/master.service";
import { callServiceMethod } from "../base.controller";

export const countryListCustomerSideFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, countryListCustomerSide(req), "countryListCustomerSideFn");
}

export const stateListCustomerSideFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, stateListCustomerSide(req), "stateListCustomerSideFn");
}

export const cityListCustomerSideFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, cityListCustomerSide(req), "cityListCustomerSideFn");
}

export const currencyListCustomerSideFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, currencyListCustomerSide(req), "currencyListCustomerSideFn");
}

export const mainCategoryListFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, mainCategoryList(req), "cityListCustomerSideFn");
}

export const addUserAddressFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addUserAddress(req), "addUserAddressFn");
}

export const getUserAddressFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getUserAddress(req), "getUserAddressFn");
}

export const updateUserAddressFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateUserAddress(req), "updateUserAddressFn");
}

export const deleteUserAddressFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, deleteUserAddress(req), "deleteUserAddressFn");
}