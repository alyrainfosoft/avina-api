import { Router } from "express";
import { addBlogsFn, bolgDetailAPIFn, deleteBlogsFn, getAllBlogsDataFn, getBlogsDataUserFn, getByIdBlogsDataFn, updateBlogsFn } from "../controllers/blogs.controller";
import { reqMultiImageParser } from "../../middlewares/multipart-file-parser";
import { authorization } from "../../middlewares/authenticate";

export default (app: Router) => {
    
    app.post("/blogs/add", [authorization, reqMultiImageParser(['images', 'banner_image'])], addBlogsFn);
    app.get("/blog", [authorization], getAllBlogsDataFn);
    app.put("/blog/edit", [authorization, reqMultiImageParser(['images', 'banner_image'])], updateBlogsFn)
    app.post("/blog/delete", [authorization], deleteBlogsFn)
    app.post("/blog", [authorization], getByIdBlogsDataFn)
    app.get("/blogs/list", getBlogsDataUserFn)

    app.post("/blogs/details", bolgDetailAPIFn)

  };