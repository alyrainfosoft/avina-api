import { Request } from "express";
import { Info_Key, LogsActivityType, LogsType } from "../../utils/app-enumeration";
import {
  getCompanyIdBasedOnTheCompanyKey,
  addActivityLogs,
  getLocalDate,
  resBadRequest,
  resSuccess,
} from "../../utils/shared-functions";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  INVALID_INFO_KEY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../utils/app-messages";
import { initModels } from "../model/index.model";

export const addUpdateInfoSection = async (req: Request) => {
  try {
    const {InfoSection} = initModels(req);
    const { info_key, title, description } = req.body;

    const key = Object.keys(Info_Key).find((t) => Info_Key[t] === info_key);

    if (!key) {
      return resBadRequest({ message: INVALID_INFO_KEY });
    }

    const infoData = await InfoSection.findOne({
      where: {
        key: Info_Key[key],
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (infoData && infoData.dataValues) {
      await InfoSection.update(
        {
          title,
          description,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        {
          where: {
            key: Info_Key[key],
            company_info_id :req?.body?.session_res?.client_id,
          },
        }
      );
      const afterUpdateInfoData = await InfoSection.findOne({
        where: {
          key: Info_Key[key],
        },
      });
      addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { info_section_id: infoData?.dataValues?.id, data: {...infoData?.dataValues}},
        new_data: {
          info_section_id: afterUpdateInfoData?.dataValues?.id, data: { ...afterUpdateInfoData?.dataValues }
        }
      }], infoData?.dataValues?.id,LogsActivityType.Edit, LogsType.InfoSection, req?.body?.session_res?.id_app_user)
        
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    }

    const infoSectiondata = await InfoSection.create({
      key: Info_Key[key],
      title,
      description,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
      created_at: getLocalDate(),
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        info_section_id: infoSectiondata?.dataValues?.id, data: {
          ...infoSectiondata?.dataValues
        }
      }
    }], infoSectiondata?.dataValues?.id, LogsActivityType.Add, LogsType.InfoSection, req?.body?.session_res?.id_app_user)
        
    return resSuccess();
  } catch (error) {
    throw error;
  }
};

export const getInfoSection = async (req: Request) => {
  try {
    const {InfoSection} = initModels(req);

    const { info_key } = req.params;

    if (!info_key) {
      const data = await InfoSection.findAll({
        attributes: ["id", "key", "title", "description"],
        where:{company_info_id :req?.body?.session_res?.client_id}
      });

      return resSuccess({ data });
    }

    const infoData = await InfoSection.findOne({
      where: {
        key: info_key,
        company_info_id :req?.body?.session_res?.client_id,
      },
      attributes: ["id", "key", "title", "description"],
    });

    if (!(infoData && infoData.dataValues)) {
      return resSuccess();
    }

    return resSuccess({ data: infoData.dataValues });
  } catch (error) {
    throw error;
  }
};

export const infoSectionListForUser = async (req: Request) => {
  try {
    const {InfoSection} = initModels(req);

    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const data = await InfoSection.findAll({
      attributes: ["id", "key", "title", "description"],
      where:{company_info_id :company_info_id?.data},
    });

    return resSuccess({ data });
  } catch (error) {
    throw error;
  }
};
