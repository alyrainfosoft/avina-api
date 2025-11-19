import { Router } from "express";
import { addThemeFn, deleteFontStyleFileFn, getGeneralSettingFn, getThemeDataForUserFn, getThemesFn, getWebConfigSettingFn, updateAttributeValueFn, updateFontStyleFn, updateGeneralCompanyInfoFn, updateLogosFn, updateScriptsFn, updateSystemColorFn, updateThemeFn, updateWebConfigSettingFn } from "../../controllers/themes.controller";
import multer from "multer";
import { addThemeValidator, deleteFontFileValidator, generalCompanyInfoValidator, systemColorValidator, systemFontStyleValidator, updateThemeValidator } from "../../../validators/theme/theme.validator";
import { authorization } from "../../../middlewares/authenticate";
import { reqAnyTypeImageAnyFormat, reqArrayImageParser, reqMultiImageParser } from "../../../middlewares/multipart-file-parser";
import { getMetalTonesFn } from "../../controllers/masters/attributes.controller";
export default (app: Router) => {
    app.post("/theme/:section_type", [authorization, reqAnyTypeImageAnyFormat(), addThemeValidator], addThemeFn)
    app.get("/theme", [authorization], getThemesFn)
    app.put("/theme/:id", [authorization, reqAnyTypeImageAnyFormat(), updateThemeValidator], updateThemeFn)
    app.put("/theme-select/:id_theme", [authorization, reqAnyTypeImageAnyFormat()], updateAttributeValueFn)
    app.get("/general", [authorization], getGeneralSettingFn)
    app.put("/general/company-info", [authorization, generalCompanyInfoValidator], updateGeneralCompanyInfoFn)
    app.put("/general/logos", [authorization, reqMultiImageParser(["header_logo", "footer_logo", "favicon", "loader", "mail_tem_logo",
        "default_image", "page_not_found_image", "share_image", "product_not_found_image", "order_not_found_image"])], updateLogosFn)
    app.put("/general/script", [authorization], updateScriptsFn)
    app.put("/general/system-color", [authorization, systemColorValidator], updateSystemColorFn)
    app.put("/general/font-style", [authorization, reqArrayImageParser(["files"]), systemFontStyleValidator,], updateFontStyleFn)
    app.delete("/general/font-style-file/:font/:id", [authorization, deleteFontFileValidator], deleteFontStyleFileFn)
    app.delete("/general/font-style-files/:font", [authorization, deleteFontFileValidator], deleteFontStyleFileFn)

    app.put("/general/setting", [authorization], updateWebConfigSettingFn)
    app.get("/general/setting", [authorization], getWebConfigSettingFn)

    app.get("/frontend-setting/attribute/metal-tone", [authorization], getMetalTonesFn);

    app.put("/payment-gateway/general/setting", [authorization], updateWebConfigSettingFn)
    app.get("/payment-gateway/general/setting", [authorization], getWebConfigSettingFn)

}