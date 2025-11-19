import { RequestHandler } from "express";
import { addtestimonial, deletetestimonial, getAllTestimonial, getByIdTestimonial, statusUpdateTestimonial, updateTestimonial } from "../services/testimonial.service";
import { callServiceMethod } from "./base.controller";

export const addTestimonialFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addtestimonial(req), "addTestimonialFn");
}

export const getAllTestimonialFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllTestimonial(req), "getAllTestimonialFn");
}

export const getByIdTestimonialFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getByIdTestimonial(req), "getByIdTestimonialFn");
}

export const updateTestimonialFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateTestimonial(req), "updateTestimonialFn");
}

export const deletetestimonialFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, deletetestimonial(req), "deletetestimonialFn");
  }
  
  export const statusUpdatetestimonialFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, statusUpdateTestimonial(req), "statusUpdatetestimonialFn");
  }