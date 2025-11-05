import { Router } from "express";
import { getAllHomeAndAboutSectionFn } from "../controllers/Frontend/homePage.controller";
import { addAboutMainFn, addHomeAboutSubContentFn, deleteHomeAboutSubContentFn, getAllHomeAboutMainContentFn, getAllHomeAboutSubContentFn, getByIdHomeAboutSubContentFn, statusHomeAboutSubContentFn, updateAboutMainFn, updateHomeAboutSubContentFn } from "../controllers/homeAbout.controller";
import { reqSingleImageParser } from "../middlewares/multipart-file-parser";
import { getAllHomeAboutMainContent } from "../services/home_about.service";
import { statusUpdateMasterValidator } from "../validators/master/master.validator";
import { authorization } from "../middlewares/authenticate";

export default (app: Router) => {

    app.post("/about/main/add", addAboutMainFn);
    app.put("/about/main/edit", [authorization], updateAboutMainFn);
    app.get("/about/main", [authorization], getAllHomeAboutMainContentFn)

//////////////////---- home about sub Content section -----////////////////////////

app.post("/about/sub/add", [authorization, reqSingleImageParser("image")], addHomeAboutSubContentFn);
app.get("/about/sub", [authorization],  getAllHomeAboutSubContentFn)
app.get("/about/sub/:id", [authorization], getByIdHomeAboutSubContentFn);
app.put("/about/sub/edit",[authorization, reqSingleImageParser("image")], updateHomeAboutSubContentFn);
app.post("/about/sub/delete", [authorization], deleteHomeAboutSubContentFn);
app.put("/about/sub/status", [authorization, statusUpdateMasterValidator], statusHomeAboutSubContentFn);

};