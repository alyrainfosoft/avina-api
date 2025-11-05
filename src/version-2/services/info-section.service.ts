import { Request } from "express";
import InfoSection from "../model/info-section.model";
import { Info_Key } from "../../utils/app-enumeration";
import {
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resNotFound,
  resSuccess,
} from "../../utils/shared-functions";
import {
  ERROR_NOT_FOUND,
  INVALID_INFO_KEY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../utils/app-messages";

export const addUpdateInfoSection = async (req: Request) => {
  try {
    const { info_key, title, description } = req.body;

    const key = Object.keys(Info_Key).find((t) => Info_Key[t] === info_key);

    if (!key) {
      return resBadRequest({ message: INVALID_INFO_KEY });
    }

    const infoData = await InfoSection.findOne({
      where: {
        key: Info_Key[key],
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
          },
        }
      );

      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    }

    await InfoSection.create({
      key: Info_Key[key],
      title,
      description,
      created_by: req.body.session_res.id_app_user,
      created_at: getLocalDate(),
    });

    return resSuccess();
  } catch (error) {
    throw error;
  }
};

export const getInfoSection = async (req: Request) => {
  try {
    const { info_key } = req.params;

    if (!info_key) {
      const data = await InfoSection.findAll({
        attributes: ["id", "key", "title", "description"],
      });

      return resSuccess({ data });
    }

    const infoData = await InfoSection.findOne({
      where: {
        key: info_key,
      },
      attributes: ["id", "key", "title", "description"],
    });

    if (!(infoData && infoData.dataValues)) {
      return resSuccess()
    }

    return resSuccess({ data: infoData.dataValues });
  } catch (error) {
    throw error;
  }
};
