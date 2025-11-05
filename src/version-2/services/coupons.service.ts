import { Request } from "express";
import {
  ActiveStatus,
  COUPON_DISCOUNT_TYPE,
  COUPON_DURATION,
  DeletedStatus,
  Pagination,
} from "../../utils/app-enumeration";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
  statusUpdateValue,
} from "../../utils/shared-functions";
import {
  COUPON_CODE_EXISTS,
  COUPON_CURRENCY_MISMATCH_MESSAGE,
  COUPON_CURRENCY_REQUIRED_MESSAGE,
  COUPON_EXPIRED,
  COUPON_EXPIRED_MESSAGE,
  DEFAULT_STATUS_CODE_SUCCESS,
  ERROR_ALREADY_EXIST,
  ERROR_AMOUNT_INVALID,
  ERROR_AMOUNT_NEGATIVE,
  INVALID_COUPON_MESSAGE,
  INVALID_COUPON_TYPE_MESSAGE,
  MaX_REQUIRED_AMOUNT_ERROR,
  MIN_REQUIRED_AMOUNT_ERROR,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
  USER_APPLY_ONLY_ONE_TIME_ERROR,
} from "../../utils/app-messages";
import { Op, Sequelize } from "sequelize";
import AppUser from "../../model/app-user.model";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import Orders from "../model/order.model";
import couponData from "../model/coupon.model";

export const addCoupon = async (req: Request) => {
  try {
    const {
      name,
      coupon_code,
      discount_type,
      description,
      percentage_off = null,
      discount_amount = null,
      discount_amount_currency = null,
      duration,
      start_date,
      end_date,
      max_total_amount = null,
      min_total_amount = 0,
      maximum_discount_amount,
      usage_limit,
      user_limits,
    } = req.body;

    const couponCode = coupon_code.toUpperCase().replace(/\s/g, "");

    let records: any = {
      name,
      description,
      coupon_code: couponCode,
      discount_type,
      percentage_off,
      discount_amount,
      discount_amount_currency,
      duration,
      usage_limit,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      max_total_amount,
      min_total_amount,
      maximum_discount_amount,
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_date: getLocalDate(),
      created_by: req.body?.session_res?.id,
      user_limits: user_limits,
    };

    const findCoupon = await couponData.findOne({
      where: { coupon_code: couponCode, is_deleted: DeletedStatus.No },
    });

    if (findCoupon && findCoupon.dataValues) {
      return resErrorDataExit({
        message: COUPON_CODE_EXISTS,
      });
    }
    await couponData.create(records);
    return resSuccess();
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const editCoupon = async (req: Request) => {
  try {
    const {
      name,
      coupon_code,
      discount_type,
      percentage_off = null,
      discount_amount = null,
      discount_amount_currency = null,
      duration,
      start_date,
      end_date,
      description,
      min_total_amount,
      max_total_amount = null,
      maximum_discount_amount,
      usage_limit,
      user_limits,
    } = req.body;
    const { id } = req.params;
    const findCoupon = await couponData.findOne({
      where: {
        id: id,
        is_deleted: DeletedStatus.No,
      },
    });

    if (!(findCoupon && findCoupon.dataValues)) {
      return resNotFound();
    }

    const couponCode = coupon_code.toUpperCase().replace(/\s/g, "");

    const findCouponCode = await couponData.findOne({
      where: {
        coupon_code: couponCode,
        is_deleted: DeletedStatus.No,
        id: { [Op.ne]: req.params.id },
      },
    });

    if (findCouponCode && findCouponCode.dataValues) {
      return resErrorDataExit({
        message: COUPON_CODE_EXISTS,
      });
    }

    let records: any = {
      name,
      coupon_code: couponCode,
      discount_type,
      percentage_off,
      discount_amount,
      discount_amount_currency,
      duration,
      usage_limit,
      start_date,
      end_date,
      description,
      min_total_amount,
      max_total_amount,
      maximum_discount_amount,
      user_limits,
      updated_date: getLocalDate(),
      updated_by: req.body?.session_res?.id,
    };

    await couponData.update(records, {
      where: {
        id: id,
      },
    });
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getCoupons = async (req: Request) => {
  try {
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      { is_deleted: DeletedStatus.No },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      {
        [Op.or]: [
          { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          { coupon_code: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          { description: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
        is_deleted: DeletedStatus.No,
      },
    ];
    if (!noPagination) {
      const totalItems = await couponData.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    }
    const result = await couponData.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "coupon_code",
        "description",
        "discount_type",
        "percentage_off",
        "discount_amount",
        "discount_amount_currency",
        "duration",
        "usage_limit",
        "min_total_amount",
        "max_total_amount",
        "maximum_discount_amount",
        "start_date",
        "end_date",
        "user_id",
        "is_active",
        "max_total_amount",
        "user_limits",
        [Sequelize.literal("created_user.username"), "created_user_name"],
      ],
      include: [{ model: AppUser, as: "created_user", attributes: [] }],
    });
    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const deleteCoupon = async (req: Request) => {
  try {
    const findCoupon = await couponData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findCoupon && findCoupon.dataValues)) {
      return resNotFound();
    }
    await couponData.update(
      {
        is_deleted: DeletedStatus.yes,
        deleted_by: req.body.session_res.id_app_user,
        deleted_date: getLocalDate(),
      },
      { where: { id: findCoupon.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCoupon = async (req: Request) => {
  try {
    const findCoupon = await couponData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findCoupon && findCoupon.dataValues)) {
      return resNotFound();
    }
    await couponData.update(
      {
        is_active: statusUpdateValue(findCoupon),
        updated_date: getLocalDate(),
        updated_by: req.body.session_res.id_app_user,
      },
      { where: { id: findCoupon.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const applyCoupon = async (req: Request) => {
  const { coupon_code, amount, currency } = req.body;
  // Function to apply coupon
  try {
    let discount = 0;
    let discountedAmount = 0;
    // Check if the coupon code exists
    const recordsExists: any = await couponData.findOne({
      where: {
        coupon_code: coupon_code,
        start_date: {
          [Op.lte]: getLocalDate(), // Start date should be less than or equal to now
        },
        end_date: {
          [Op.gte]: getLocalDate(), // End date should be greater than or equal to now
        },
      },
    });

    if (!(recordsExists && recordsExists.dataValues)) {
      return resNotFound({
        code: DEFAULT_STATUS_CODE_SUCCESS,
        message: COUPON_EXPIRED_MESSAGE,
      });
    }

    const validAmount = validateAmount(amount);
    if (validAmount.code != DEFAULT_STATUS_CODE_SUCCESS) {
      return validAmount;
    }

    if (recordsExists.dataValues.min_total_amount >= amount) {
      return resBadRequest({
        code: DEFAULT_STATUS_CODE_SUCCESS,
        data: amount,
        message: prepareMessageFromParams(MIN_REQUIRED_AMOUNT_ERROR, [
          ["ACTUAL_AMOUNT", `${amount}`],
          ["REQUIRED_AMOUNT", `${recordsExists.dataValues.min_total_amount}`],
        ]),
      }); //
    }

    if (recordsExists.dataValues.max_total_amount <= amount) {
      return resBadRequest({
        code: DEFAULT_STATUS_CODE_SUCCESS,
        data: amount,
        message: prepareMessageFromParams(MaX_REQUIRED_AMOUNT_ERROR, [
          ["ACTUAL_AMOUNT", `${amount}`],
          ["REQUIRED_AMOUNT", `${recordsExists.dataValues.max_total_amount}`],
        ]),
      }); //
    }

    if (
      recordsExists.dataValues.discount_type ==
      COUPON_DISCOUNT_TYPE.PercentageDiscount
    ) {
      // Calculate percentage discount
      discount = (recordsExists.dataValues.percentage_off / 100) * amount;
    } else if (
      recordsExists.dataValues.discount_type ==
      COUPON_DISCOUNT_TYPE.FixedAmountDiscount
    ) {
      if (!currency) {
        return resBadRequest({
          code: DEFAULT_STATUS_CODE_SUCCESS,
          data: COUPON_CURRENCY_REQUIRED_MESSAGE,
        });
      }

      if (recordsExists.dataValues.discount_amount_currency == currency) {
        // Flat discount
        discount = amount - recordsExists.dataValues.discount_amount;
      } else {
        return resBadRequest({
          code: DEFAULT_STATUS_CODE_SUCCESS,
          data: COUPON_CURRENCY_MISMATCH_MESSAGE,
        });
      }
    } else {
      return resNotFound({
        code: DEFAULT_STATUS_CODE_SUCCESS,
        data: INVALID_COUPON_TYPE_MESSAGE,
      });
    }

    // checkLimitationOfCoupon Function to check if usage limits are exceeded and handle coupon verification
    const result: any = await checkLimitationOfCoupon(
      recordsExists.dataValues,
      req.body.session_res.id_app_user
    );

    if (result && result.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return result;
    }

    // check if maximum discount amount is set and dicount amount is grater then maximum discount amount so, set discunt is maximum discount amount.
    if (
      recordsExists.dataValues.maximum_discount_amount &&
      recordsExists.dataValues.maximum_discount_amount < discount
    ) {
      discount = recordsExists.dataValues.maximum_discount_amount;
    }

    // Ensure discount does not exceed the amount
    discountedAmount = Math.max(amount - discount, 0);

    return {
      coupon_id: recordsExists.dataValues.id,
      original_amount: amount,
      discounted_amount: discountedAmount,
      discount_value: discount,
      currency: currency,
    };
  } catch (error) {
    return resUnknownError({
      code: DEFAULT_STATUS_CODE_SUCCESS,
      data: error,
    });
  }
};

export const validateAmount = (amount: number) => {
  // Check if the amount is a number and is not NaN
  if (typeof amount !== "number" || isNaN(amount)) {
    return resBadRequest({ data: amount, message: ERROR_AMOUNT_INVALID });
  }

  // Check if the amount is non-negative
  if (amount < 0) {
    return resBadRequest({ data: amount, message: ERROR_AMOUNT_NEGATIVE });
  }

  return resSuccess(); // No error
};

// Function to check if usage limits are exceeded and handle coupon verification
export const checkLimitationOfCoupon = async (
  couponData: any,
  user_id: any
) => {
  try {
    // Check the total count of times this coupon has been used
    const couponUsedByUserCount: any = await Orders.count({
      where: {
        coupon_id: couponData.id,
      },
      group: ["user_id", "coupon_id"],
    });
    // If the usage limit has been reached, mark the coupon as expired
    if (
      couponUsedByUserCount &&
      couponUsedByUserCount.length >= couponData.usage_limit
    ) {
      return resBadRequest({ message: COUPON_EXPIRED });
    }
    // If the coupon's usage limit is reached and the coupon type is 'Once', check if the user has used it; if so, expire the coupon for this user
    if (couponData.duration == COUPON_DURATION.Once) {
      const coupon: any = await Orders.findOne({
        where: {
          coupon_id: couponData.id,
          user_id: user_id,
        },
      });

      if (coupon) {
        return resBadRequest({
          message: prepareMessageFromParams(USER_APPLY_ONLY_ONE_TIME_ERROR, [
            ["field", "Once"],
          ]),
        });
      }
    } else {
      const findUser: any = await Orders.findAll({
        where: {
          coupon_id: couponData.id,
          user_id: user_id,
        },
      });
      if (findUser.length > couponData.user_limits) {
        return resBadRequest({
          message: prepareMessageFromParams(USER_APPLY_ONLY_ONE_TIME_ERROR, [
            ["field", findUser.length],
          ]),
        });
      }
    }
    return resSuccess();
  } catch (error) {
    resUnknownError({ data: error });
  }
};

export const couponDetails = async (req: Request) => {
  try {
    const { id } = req.params;

    const findCoupon = await couponData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
      attributes: [
        "id",
        "name",
        "coupon_code",
        "description",
        "discount_type",
        "percentage_off",
        "discount_amount",
        "discount_amount_currency",
        "duration",
        "usage_limit",
        "min_total_amount",
        "max_total_amount",
        "maximum_discount_amount",
        "start_date",
        "end_date",
        "user_id",
        "user_limits",
        "is_active",
        "max_total_amount",
        [Sequelize.literal("created_user.username"), "created_user_name"],
      ],
      include: [{ model: AppUser, as: "created_user", attributes: [] }],
    });
    if (!(findCoupon && findCoupon.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findCoupon.dataValues });
  } catch (error) {
    throw error;
  }
};
