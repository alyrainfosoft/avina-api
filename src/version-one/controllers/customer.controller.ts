import { RequestHandler } from "express";
import { addCustomers, deleteCustomers, getAllCustomer, getByIdCustomer, statusUpdateCustomers, updateCustomers } from "../services/customer.service";
import { callServiceMethod } from "./base.controller";

export const addCustomersFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addCustomers(req), "addCustomersFn");
}

export const getAllCustomersFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllCustomer(req), "getAllCustomersFn");
}

export const getByIdCustomersFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getByIdCustomer(req), "getByIdCustomersFn");
}

export const updateCustomersFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateCustomers(req), "updateCustomersFn");
}

export const deleteCustomersFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, deleteCustomers(req), "deleteCustomersFn");
  }
  
  export const statusUpdateCustomersFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, statusUpdateCustomers(req), "statusUpdateCustomersFn");
  }