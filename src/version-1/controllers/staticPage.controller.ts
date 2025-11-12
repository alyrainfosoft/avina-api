import { RequestHandler } from "express";
import { addStaticPage, deleteStaticPage, getAllStaticPages, getByIdStaticPage, getByslugStaticPageUser, statusUpdateStaticPage, updateStaticPages } from "../services/static_page.service";
import { callServiceMethod } from "./base.controller";


export const addStaticPageFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addStaticPage(req), "addStaticPageFn");
}

export const getAllStaticPageFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllStaticPages(req), "getAllStaticPageFn");
}

export const getByIdStaticPageFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getByIdStaticPage(req), "getByIdStaticPageFn");
}

export const updateStaticPageFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateStaticPages(req), "updateStaticPageFn");
}

export const deleteStaticPageFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, deleteStaticPage(req), "deleteStaticPageFn");
}

export const statusUpdateStaticPageFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, statusUpdateStaticPage(req), "statusUpdateStaticPageFn")
}

export const getByslugStaticPageUserFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getByslugStaticPageUser(req), "getByslugStaticPageUserFn");
}