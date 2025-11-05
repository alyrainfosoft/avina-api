import { Request } from "express";
import TemplateSixData from "../../model/template-six.model";
import {
  ActiveStatus,
  DeletedStatus,
  TemplateSixSectionType,
} from "../../../utils/app-enumeration";
import { getLocalDate, resSuccess } from "../../../utils/shared-functions";
import { RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";

export const getInstagramSection = async (req: Request) => {
  try {
    const data = await TemplateSixData.findOne({
      where: {
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
        section_type: TemplateSixSectionType.InstagramSection,
      },
      attributes: ["id", "title"],
    });

    return resSuccess({ data: data });
  } catch (error) {
    throw error;
  }
};

export const updateInstagramSection = async (req: Request) => {
  try {
    const findSection = await TemplateSixData.findOne({
      where: {
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
        section_type: TemplateSixSectionType.InstagramSection,
      },
    });
    if (!(findSection && findSection.dataValues)) {
      await TemplateSixData.create({
        title: req.body.title,
        section_type: TemplateSixSectionType.InstagramSection,
        created_by: req.body.session_res.id_app_user,
        created_date: getLocalDate(),
        is_active: ActiveStatus.Active,
        is_deleted: DeletedStatus.No,
      });
    } else {
      await TemplateSixData.update(
        { title: req.body.title },
        {
          where: {
            is_deleted: DeletedStatus.No,
            is_active: ActiveStatus.Active,
            id: findSection.dataValues.id,
          },
        }
      );
    }
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
