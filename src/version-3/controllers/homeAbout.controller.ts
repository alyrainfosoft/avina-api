import { RequestHandler } from "express";
import { addAboutMain, addHomeAboutSubContent, deleteHomeAboutSubContent, getAllHomeAboutMainContent, getAllHomeAboutSubContent, getByIdHomeAboutSubContent, statusUpdateHomeAboutSubContent, updateAboutMain, updateHomeAboutSubContent } from "../services/home_about.service";
import { callServiceMethod } from "./base.controller";

export const addAboutMainFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addAboutMain(req), "addAboutMainFn");
}

export const updateAboutMainFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateAboutMain(req), "updateAboutMainFn");
}

export const getAllHomeAboutMainContentFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllHomeAboutMainContent(req), "getAllHomeAboutMainContentFn");
}
//////////////////---- home about sub Content section -----////////////////////////

export const addHomeAboutSubContentFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addHomeAboutSubContent(req), "addHomeAboutSubContentFn");
}

export const updateHomeAboutSubContentFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateHomeAboutSubContent(req), "updateHomeAboutSubContentFn");
}

export const getAllHomeAboutSubContentFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllHomeAboutSubContent(req), "getAllHomeAboutSubContentFn");
}

export const getByIdHomeAboutSubContentFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getByIdHomeAboutSubContent(req), "getByIdHomeAboutSubContentFn");
}

export const deleteHomeAboutSubContentFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, deleteHomeAboutSubContent(req), "deleteHomeAboutSubContentFn");
}

export const statusHomeAboutSubContentFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, statusUpdateHomeAboutSubContent(req), "statusHomeAboutSubContentFn");
}

