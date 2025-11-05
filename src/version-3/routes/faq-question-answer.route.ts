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
} from "../controllers/faq-question-answer.controller";

export default (app: Router) => {
  app.get("/faq-category", getAllFAQCategoryFn);
  app.get("/faq-category/:id", getByIdFAQCategoryFn);
  app.post("/faq-category", addFAQCategoryFn);
  app.put("/faq-category/:id", updateFAQCategoryFn);
  app.delete("/faq-category/:id", deleteFAQSectionFn);
  app.patch("/faq-category/:id", statusUpdateForFAQSectionFn);
  app.get("/faq-question-answer", getAllFAQQuestionAnswerFn);
  app.get("/faq-question-answer/:id", getByIdFAQQuestionAnswerFn);
  app.post("/faq-question-answer", addFAQQuestionAnswerFn);
  app.put("/faq-question-answer/:id", updateFAQQuestionAnswerFn);
  app.delete("/faq-question-answer/:id", deleteFAQSectionFn);
  app.patch("/faq-question-answer/:id", statusUpdateForFAQSectionFn);
  app.get("/user/faq", getAllFAQSectionForUserFn);
};
