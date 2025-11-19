import { Router } from "express";
import {
  addBlogsFn,
  defaultBlogsFn,
  deleteBlogsFn,
  getAllBlogsDataFn,
  getByIdBlogsDataFn,
  updateBlogsFn,
} from "../../controllers/blogs.controller";
import { reqMultiImageParser } from "../../../middlewares/multipart-file-parser";
import { authorization } from "../../../middlewares/authenticate";
import {
  addBlogCategoryFn,
  deleteBlogCategoryFn,
  getBlogCategoryFn,
  getByIdBlogCategoryFn,
  statusUpdateForBlogCategoryFn,
  updateBlogCategoryFn,
} from "../../controllers/blog-category.controller";

export default (app: Router) => {
  app.post(
    "/blogs/add",
    [authorization, reqMultiImageParser(["images", "banner_image"])],
    addBlogsFn
  );
  app.get("/blog", [authorization], getAllBlogsDataFn);
  app.put(
    "/blog/edit",
    [authorization, reqMultiImageParser(["images", "banner_image"])],
    updateBlogsFn
  );
  app.post("/blog/delete", [authorization], deleteBlogsFn);
  app.post("/blog", [authorization], getByIdBlogsDataFn);
  app.patch("/default-blog/:id", [authorization], defaultBlogsFn);

  app.post("/blog-category", [authorization], addBlogCategoryFn);
  app.get("/blog-category", [authorization], getBlogCategoryFn);
  app.get("/blog-category/:id", [authorization], getByIdBlogCategoryFn);

  app.put("/blog-category/:id", [authorization], updateBlogCategoryFn);
  app.delete("/blog-category/:id", [authorization], deleteBlogCategoryFn);
  app.patch(
    "/blog-category/:id",
    [authorization],
    statusUpdateForBlogCategoryFn
  );
};
