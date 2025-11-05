import { body } from "express-validator";
import { fieldStringChain } from "../../common-validation-rules";
import categoryData from "../../../version-3/model/category.model";
import { DeletedStatus } from "../../../utils/app-enumeration";
import { NOT_FOUND_MESSAGE } from "../../../utils/app-messages";
import { resNotFound } from "../../../utils/shared-functions";
import { error } from "console";

export const addJewellrycategoriesRules:any = [
   body('id_categories').custom(async(value) => {

      const findDiamondShapeSection = await categoryData.findOne({
         where: { id: value, is_deleted: DeletedStatus.No },
       });
       if (!(findDiamondShapeSection && findDiamondShapeSection.dataValues)) {
         throw new Error( NOT_FOUND_MESSAGE );
       }

      return true;
    }),
  ];

  export const updateJewellrycategoriesRules = [
   body('id_categories').custom(async(value) => {

      const findDiamondShapeSection = await categoryData.findOne({
         where: { id: value, is_deleted: DeletedStatus.No },
       });
   
       if (!(findDiamondShapeSection && findDiamondShapeSection.dataValues)) {
         throw new Error( NOT_FOUND_MESSAGE );
       }

      return true;
    }),
  ];