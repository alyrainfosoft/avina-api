import { Router } from "express";
import { addTestimonialFn, deletetestimonialFn, getAllTestimonialFn, getByIdTestimonialFn, statusUpdatetestimonialFn, updateTestimonialFn } from "../../controllers/testimonial.controller";
import { reqSingleImageParser } from "../../../middlewares/multipart-file-parser";
import { addTestimonialValidator, updateTestimonialValidator } from "../../../validators/testimonial/testimonial.validator";
import { authorization } from "../../../middlewares/authenticate";

export default (app: Router) => {

      app.post("/testimonial/add", [authorization, reqSingleImageParser("image") ,addTestimonialValidator], addTestimonialFn);
      app.get("/testimonial", [authorization], getAllTestimonialFn);
      app.get("/testimonial/:id", [authorization], getByIdTestimonialFn);
      app.put("/testimonial/edit", [authorization, reqSingleImageParser("image")], updateTestimonialFn);
      app.post("/testimonial/delete", [authorization], deletetestimonialFn);
      app.put("/testimonial/status", [authorization], statusUpdatetestimonialFn)
  };