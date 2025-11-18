import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addClient, editClient, getAllClients, getClientDetail, statusUpdateForClient } from "../services/client-manage.service";

export const addClientFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addClient(req), "addClientFn");
};
export const getAllClientsFn: RequestHandler = (req, res) => {
      callServiceMethod(req, res, getAllClients(req), "getAllClientsFn");
};

export const editClientFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, editClient(req), "editClientFn");
};

export const getClientDetailFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getClientDetail(req), "getClientDetailFn");
};

export const statusUpdateForClientFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, statusUpdateForClient(req), "statusUpdateForClientFn");
};