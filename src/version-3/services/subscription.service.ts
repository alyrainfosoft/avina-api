import { Request } from "express";
import SubscriptionData from "../model/subscription.model";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  getLocationBasedOnIPAddress,
  resErrorDataExit,
  resNotFound,
  resSuccess,
} from "../../utils/shared-functions";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  EMAIL_IS_ALREADY_IN_SUBSCRIPTION_LIST,
  RECORD_UPDATE_SUCCESSFULLY,
  SUBSCRIPTION_NOT_FOUND,
  SUCCESS_SUBSCRIPTION_LIST,
} from "../../utils/app-messages";
import { SubscriptionStatus } from "../../utils/app-enumeration";
import { Op } from "sequelize";

export const addSubscriptions = async (req: Request) => {
  try {
    const emailExits = await SubscriptionData.findOne({
      where: { email: req.body.email },
    });

    if (emailExits && emailExits.dataValues) {
      return resErrorDataExit({
        message: EMAIL_IS_ALREADY_IN_SUBSCRIPTION_LIST,
      });
    }
      // get IP
      const IP = req.headers['x-forwarded-for']
      // get location based in IP
      const location = await getLocationBasedOnIPAddress(IP)
      let country = null
      let locationData = null 
      if(location && location.code == DEFAULT_STATUS_CODE_SUCCESS) {
        country = location.data.country
        locationData = location.data
      }
    const subscription = await SubscriptionData.create({
      email: req.body.email,
      is_subscribe: SubscriptionStatus.Subscribe,
      created_date: getLocalDate(),
      user_ip: IP,
      user_country: country,
      user_location: locationData
    });

    return resSuccess({
      data: subscription,
      message: SUCCESS_SUBSCRIPTION_LIST,
    });
  } catch (error) {
    throw error;
  }
};

export const getAllSubscriptionList = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      pagination.search_text
        ? {
            [Op.or]: [
              { email: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await SubscriptionData.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

      paginationProps = {
        limit: pagination.per_page_rows,
        offset: (pagination.current_page - 1) * pagination.per_page_rows,
      };
    }

    const result = await SubscriptionData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "email", "is_subscribe", "created_date"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const subscriptionStatusUpdate = async (req: Request) => {
  try {
    const { id, is_subscribe } = req.body;

    const emailExits = await SubscriptionData.findOne({ where: { id: id } });

    if (!(emailExits && emailExits.dataValues)) {
      return resNotFound({ message: SUBSCRIPTION_NOT_FOUND });
    }

    const subscribeInfo = await SubscriptionData.update(
      {
        is_subscribe: is_subscribe,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: emailExits.dataValues.id } }
    );
    if (subscribeInfo) {
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    }
  } catch (error) {
    throw error;
  }
};
