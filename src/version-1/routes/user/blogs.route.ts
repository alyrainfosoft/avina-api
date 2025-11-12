import { Router } from "express";
import {
  bolgDetailAPIFn,
  getBlogsDataUserFn,
} from "../../controllers/blogs.controller";

export default (app: Router) => {
 
  app.get("/blogs/list", getBlogsDataUserFn);
  
  app.post("/blogs/details", bolgDetailAPIFn);

};
