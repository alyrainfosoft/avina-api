import { Router } from "express";
import {
  addFAQCategoryFn,
  addFAQQuestionAnswerFn,
  deleteFAQSectionFn,
  getAllFAQCategoryFn,
  getAllFAQQuestionAnswerFn,
  getAllFAQSectionForUserFn,
  getByIdFAQCategoryFn,
  getByIdFAQQuestionAnswerFn,
  statusUpdateForFAQSectionFn,
  updateFAQCategoryFn,
  updateFAQQuestionAnswerFn,
} from "../../controllers/faq-question-answer.controller";
import { authorization } from "../../../middlewares/authenticate";

export default (app: Router) => {
  app.get("/faq-category",[authorization], getAllFAQCategoryFn);
  app.get("/faq-category/:id",[authorization], getByIdFAQCategoryFn);
  app.post("/faq-category",[authorization], addFAQCategoryFn);
  app.put("/faq-category/:id",[authorization], updateFAQCategoryFn);
  app.delete("/faq-category/:id",[authorization], deleteFAQSectionFn);
  app.patch("/faq-category/:id",[authorization], statusUpdateForFAQSectionFn);
  app.get("/faq-question-answer",[authorization], getAllFAQQuestionAnswerFn);
  app.get("/faq-question-answer/:id",[authorization], getByIdFAQQuestionAnswerFn);
  app.post("/faq-question-answer",[authorization], addFAQQuestionAnswerFn);
  app.put("/faq-question-answer/:id",[authorization], updateFAQQuestionAnswerFn);
  app.delete("/faq-question-answer/:id",[authorization], deleteFAQSectionFn);
  app.patch("/faq-question-answer/:id",[authorization], statusUpdateForFAQSectionFn);
};
