import { Router } from "express";
import {
  getAllFAQSectionForUserFn,
} from "../../controllers/faq-question-answer.controller";

export default (app: Router) => {
  app.get("/faq", getAllFAQSectionForUserFn);
};
