import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addStoreAddress, deleteStoreAddress, getAllStoreAddress, getAllStoreAddressForUser, statusUpdateForStoreAddress, updateStoreAddress } from "../services/store-address.service";

export const addStoreAddressFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addStoreAddress(req), "addStoreAddressFn");
}

export const getAllStoreAddressFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllStoreAddress(req), "getAllStoreAddressFn");
}

export const updateStoreAddressFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateStoreAddress(req), "updateStoreAddressFn");
}

export const deleteStoreAddressFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, deleteStoreAddress(req), "deleteStoreAddressFn");
}

export const statusUpdateForStoreAddressFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, statusUpdateForStoreAddress(req), "statusUpdateForStoreAddressFn");
}

export const getAllStoreAddressForUserFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllStoreAddressForUser(req), "getAllStoreAddressForUserFn");
}