import { Router } from "express";
import {  addAndUpdateAboutMainFn, addHomeAboutSubContentFn, deleteHomeAboutSubContentFn, getAllHomeAboutMainContentFn, getAllHomeAboutSubContentFn, getByIdHomeAboutSubContentFn, statusHomeAboutSubContentFn, updateHomeAboutSubContentFn } from "../../controllers/homeAbout.controller";
import { reqSingleImageParser } from "../../../middlewares/multipart-file-parser";
import { getAllHomeAboutMainContent } from "../../services/home_about.service";
import { statusUpdateMasterValidator } from "../../../validators/master/master.validator";
import { authorization } from "../../../middlewares/authenticate";

export default (app: Router) => {

    app.post("/about/main/add",[authorization], addAndUpdateAboutMainFn);
    app.put("/about/main/edit", [authorization], addAndUpdateAboutMainFn);
    app.get("/about/main", [authorization], getAllHomeAboutMainContentFn)

//////////////////---- home about sub Content section -----////////////////////////

app.post("/about/sub/add", [authorization, reqSingleImageParser("image")], addHomeAboutSubContentFn);
app.get("/about/sub", [authorization],  getAllHomeAboutSubContentFn)
app.get("/about/sub/:id", [authorization], getByIdHomeAboutSubContentFn);
app.put("/about/sub/edit",[authorization, reqSingleImageParser("image")], updateHomeAboutSubContentFn);
app.post("/about/sub/delete", [authorization], deleteHomeAboutSubContentFn);
app.put("/about/sub/status", [authorization, statusUpdateMasterValidator], statusHomeAboutSubContentFn);

};