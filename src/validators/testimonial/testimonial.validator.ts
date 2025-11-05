import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import { addTestimonialValidationRule, updateTestimonialValidationRule } from "./testimonial.rules";

export const addTestimonialValidator: RequestHandler = async (req, res, next) => {
    return await modelValidator(req, res, next, addTestimonialValidationRule);
  };

export const updateTestimonialValidator: RequestHandler = async (req, res, next) => {
    return await modelValidator(req, res, next, updateTestimonialValidationRule);
}