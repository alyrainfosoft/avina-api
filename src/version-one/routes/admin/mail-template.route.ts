import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import { addOrEditMailTemplateFn, deleteMailTemplateFn, getMailTemplateFn, statusUpdateForMailTemplateFn } from "../../controllers/mail-template.controller";
import { setEmailType } from "../../../middlewares/wrapper";


export default (app: Router) => {
 
  app.post("/email-template", [authorization, setEmailType(false)], addOrEditMailTemplateFn);
  app.put("/email-template/:id", [authorization, setEmailType(false)], addOrEditMailTemplateFn);
  app.get("/email-template/:id", [authorization, setEmailType(false)], getMailTemplateFn);
  app.get("/email-template", [authorization, setEmailType(false)], getMailTemplateFn);
  app.delete("/email-template/:id", [authorization], deleteMailTemplateFn);
  app.patch("/email-template/:id", [authorization], statusUpdateForMailTemplateFn);

  // Invoice specific routes
  app.post("/invoice/email-template", [authorization,setEmailType(true)], addOrEditMailTemplateFn);
  app.put("/invoice/email-template/:id", [authorization,setEmailType(true)], addOrEditMailTemplateFn);
  app.get("/invoice/email-template/:id", [authorization,setEmailType(true)], getMailTemplateFn);
  app.get("/invoice/email-template", [authorization,setEmailType(true)], getMailTemplateFn);
  app.delete("/invoice/email-template/:id", [authorization], deleteMailTemplateFn);
  app.patch("/invoice/email-template/:id", [authorization], statusUpdateForMailTemplateFn);
};
