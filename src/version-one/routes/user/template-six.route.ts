import { Router } from "express";

import {
  productSKUListFn,
  templateSixAllSectionDetailForUserFn,
  templateSixAllSectionListForUserFn,
} from "../../controllers/template-six.controller";

export default (app: Router) => {
  
 
  app.get("/template-six", templateSixAllSectionListForUserFn);
  // app.get("/template-six/:id", templateSixAllSectionDetailForUserFn);

 
};
