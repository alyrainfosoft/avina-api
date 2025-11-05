import { Request } from "express";
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  TemplateSixSectionType,
} from "../../../utils/app-enumeration";
import { addActivityLogs, getLocalDate, resSuccess } from "../../../utils/shared-functions";
import { RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { initModels } from "../../model/index.model";

export const getInstagramSection = async (req: Request) => {
  try {
    const { TemplateSixData } = initModels(req);
    const data = await  TemplateSixData.findOne({
      where: {
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
        section_type: TemplateSixSectionType.InstagramSection,
        company_info_id :req?.body?.session_res?.client_id
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
    const { TemplateSixData } = initModels(req);
    const findSection = await  TemplateSixData.findOne({
      where: {
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
        section_type: TemplateSixSectionType.InstagramSection,
        company_info_id :req?.body?.session_res?.client_id
      },
    });
    if (!(findSection && findSection.dataValues)) {
      const templateSixInstagram = await  TemplateSixData.create({
        title: req.body.title,
        section_type: TemplateSixSectionType.InstagramSection,
        created_by: req.body.session_res.id_app_user,
        company_info_id :req?.body?.session_res?.client_id,
        created_date: getLocalDate(),
        is_active: ActiveStatus.Active,
        is_deleted: DeletedStatus.No,
      }); 
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        template_six_instagram_id: templateSixInstagram?.dataValues?.id, data: {
          ...templateSixInstagram?.dataValues
        }
      }
    }], templateSixInstagram?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateSixInstagram, req?.body?.session_res?.id_app_user)
      
    } else {
      await  TemplateSixData.update(
        { title: req.body.title },
        {
          where: {
            is_deleted: DeletedStatus.No,
            is_active: ActiveStatus.Active,
            id: findSection.dataValues.id,
            company_info_id :req?.body?.session_res?.client_id,
          },
        }
      );
    }
    const AfterUpdatefindSection = await  TemplateSixData.findOne({
      where: {
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
        section_type: TemplateSixSectionType.InstagramSection,
      },
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_six_instagram_id: findSection?.dataValues?.id, data: {...findSection?.dataValues}
      },
      new_data: {
        template_six_instagram_id: AfterUpdatefindSection?.dataValues?.id, data: { ...AfterUpdatefindSection?.dataValues }
      }
    }], findSection?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateSixInstagram, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
