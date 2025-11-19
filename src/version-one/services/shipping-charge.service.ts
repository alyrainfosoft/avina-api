import { Request } from "express";
import {
  AMOUNT_RANGE_CONFLICT_ERROR,
  DEFAULT_STATUS_CODE_SUCCESS,
  MIN_AMOUNT_LESS_THAN_MAX_AMOUNT,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../utils/app-messages";
import {
  getCompanyIdBasedOnTheCompanyKey,
  addActivityLogs,
  getInitialPaginationFromQuery,
  getLocalDate,
  resBadRequest,
  resNotFound,
  resSuccess,
  statusUpdateValue,
  resUnknownError,
} from "../../utils/shared-functions";
import { ActiveStatus, DeletedStatus, LogsActivityType, LogsType } from "../../utils/app-enumeration";
import { Op, QueryTypes } from "sequelize";
import { initModels } from "../model/index.model";

export const addSippingCharge = async (req: Request) => {
  let trn;
  try {
    const { ShippingCharge } = initModels(req);
    const { amount, min_amount, max_amount } = req.body;

    const response = await checkAmountConflict(min_amount, max_amount,null,req?.body?.session_res?.client_id, req);

    if (response.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return response;
    }

    // Create the venue owner record
    const result = await ShippingCharge.create({
      amount,
      min_amount,
      max_amount,
      is_active: ActiveStatus.Active,
      created_by: req?.body?.session_res?.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
      created_at: getLocalDate(),
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        shipping_charge_id: result?.dataValues?.id, data: {
          ...result?.dataValues
        }
      }
    }], result?.dataValues?.id, LogsActivityType.Add, LogsType.ShippingCharge, req?.body?.session_res?.id_app_user)
  
    return resSuccess({ data: response });
  } catch (e) {
    throw e;
  }
};

export const getShippingChargeByFilter = async (req: Request) => {
  try {
    const { ShippingCharge } = initModels(req);
    const pagination = getInitialPaginationFromQuery(req.query);
    let company_info_id: any = {};
    
    if (req?.body?.session_res?.client_id) {
      company_info_id.data = req.body.session_res.client_id;
    } else {
      const decrypted = await getCompanyIdBasedOnTheCompanyKey(req.query, req.body.db_connection);

      if (decrypted.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return decrypted;
      }

      company_info_id = decrypted;
    }
    // Initialize where condition for filtering shipping_charges
    let whereCondition = `shipping_charges.company_info_id = ${company_info_id?.data} AND shipping_charges.is_deleted = '${
      DeletedStatus.No
    }' AND shipping_charges.id != 0 ${
      pagination.search_text
        ? `AND (CAST(shipping_charges.amount as TEXT) = '${pagination.search_text}' OR CAST(shipping_charges.min_amount as TEXT) = '${pagination.search_text}' OR CAST(shipping_charges.max_amount as TEXT) = '${pagination.search_text}')`
        : ""
    }`;

    // If the `is_active` filter is passed, apply it
    if (pagination.is_active) {
      whereCondition += ` AND shipping_charges.is_active = :is_active ${
        pagination.search_text
          ? `AND (CAST(shipping_charges.amount as TEXT) = '${pagination.search_text}' OR CAST(shipping_charges.min_amount as TEXT) = '${pagination.search_text}' OR CAST(shipping_charges.max_amount as TEXT) = '${pagination.search_text}')`
          : ""
      }`;
    }

    // Check if `is_list` flag is present in the query
    if (req.query.is_list === "1") {
      whereCondition += ` AND shipping_charges.is_active = ${ActiveStatus.Active}`; // Only active shipping_charges
    }

    // Check if an ID is provided in the query parameters
    if (req.params.id) {
      whereCondition += ` AND shipping_charges.id = :id`;
    }

    // Calculating OFFSET and LIMIT for pagination
    const offset = (pagination.current_page - 1) * pagination.per_page_rows;

    // Main query to fetch shipping charges with user count and joins, and also calculating the total number of roles
    const query = `
              SELECT
                  shipping_charges.id,
                  shipping_charges.amount,
                  shipping_charges.min_amount,
                  shipping_charges.max_amount,
                  shipping_charges.is_active,
                  COUNT(shipping_charges.id) OVER() AS total_items
              FROM
                  shipping_charges
              WHERE
                  ${whereCondition}
              GROUP BY
                  shipping_charges.id
              ORDER BY
                  shipping_charges.${pagination.sort_by} ${pagination.order_by}
              LIMIT :per_page_rows OFFSET :offset
          `;

    // Execute the query with replacements for dynamic values
    const result: any = await req.body.db_connection.query(query, {
      replacements: {
        is_active: pagination.is_active || null,
        per_page_rows: pagination.per_page_rows,
        offset: offset,
        id: req.params.id || null, // Ensure the correct parameter for id
      },
      type: QueryTypes.SELECT,
    });

    // If a specific role ID is provided, return that role data as an object
    if (req.params.id) {
      if (result.length === 0) {
        return resNotFound({ message: "Shipping charge not found" });
      }
      return resSuccess({ data: result[0] }); // Return a single object
    }

    // If no specific shipping charge ID, return paginated data in array
    const totalItems = result.length > 0 ? result[0].total_items : 0;
    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

    return resSuccess({
      data: req.query.no_pagination === "1" ? result : { pagination, result },
    });
  } catch (e) {
    throw e;
  }
};

export const updatedShippingCharge = async (req: Request) => {
  try {
    const { ShippingCharge } = initModels(req);
    const { id }: any = req.params;
    const { amount, min_amount, max_amount, is_active } = req.body;

    const response = await checkAmountConflict(min_amount, max_amount, id,req?.body?.session_res?.client_id, req);
    if (response.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return response;
    }
    const  shippingData = await ShippingCharge.findOne({where:{ id: id } })
    const result = await ShippingCharge.update(
      {
        amount,
        min_amount,
        max_amount,
        is_active,
        updated_by: req?.body?.session_res?.id_app_user,
        updated_at: getLocalDate(),
      },
      { where: { id: id,company_info_id :req?.body?.session_res?.client_id } }
    );
    const  AfterupdateDhippingData = await ShippingCharge.findOne({where:{ id: id } })

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { shipping_charge_id: shippingData?.dataValues?.id, data: {...shippingData?.dataValues}},
      new_data: {
        shipping_charge_id: AfterupdateDhippingData?.dataValues?.id, data: { ...AfterupdateDhippingData?.dataValues }
      }
    }], shippingData?.dataValues?.id,LogsActivityType.Edit, LogsType.ShippingCharge, req?.body?.session_res?.id_app_user)
  
    return resSuccess({ data: result, message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (e) {
  return resUnknownError(e); // Consider returning a user-friendly error message
  }
};

export const deleteShippingCharge = async (req: Request) => {
  try {
    const { ShippingCharge } = initModels(req);
    const ShippingChargeData = await ShippingCharge.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(ShippingChargeData && ShippingChargeData.dataValues)) {
      return resNotFound();
    }

    await ShippingChargeData.update(
      {
        is_deleted: DeletedStatus.yes,
        updated_by: req?.body?.session_res?.id_app_user,
        updated_at: getLocalDate(),
      },
      { where: { id: ShippingChargeData.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { shipping_charge_id: ShippingChargeData?.dataValues?.id, data: {...ShippingChargeData?.dataValues}},
      new_data: {
        shipping_charge_id: ShippingChargeData?.dataValues?.id, data: {
          ...ShippingChargeData?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], ShippingChargeData?.dataValues?.id, LogsActivityType.Delete, LogsType.ShippingCharge, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const changeStatusShippingCharge = async (req: Request) => {
  try {
    const { ShippingCharge } = initModels(req);
    const ShippingChargeData = await ShippingCharge.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(ShippingChargeData && ShippingChargeData.dataValues)) {
      return resNotFound();
    }

    await ShippingChargeData.update(
      {
        is_active: statusUpdateValue(ShippingChargeData),
        updated_by: req?.body?.session_res?.id_app_user,
        updated_at: getLocalDate(),
      },
      { where: { id: ShippingChargeData.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { shipping_charge_id: ShippingChargeData?.dataValues?.id, data: {...ShippingChargeData?.dataValues}},
      new_data: {
        shipping_charge_id: ShippingChargeData?.dataValues?.id, data: {
          ...ShippingChargeData?.dataValues, is_active: statusUpdateValue(ShippingChargeData),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], ShippingChargeData?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.ShippingCharge, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const applySippingCharge = async (req: Request) => {
  try {
    const { ShippingCharge } = initModels(req);
    const { amount } = req.body;
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const shippingChargeData: any = await ShippingCharge.findOne({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                min_amount: {
                  [Op.lte]: amount,
                },
              },
              {
                max_amount: {
                  [Op.gte]: amount,
                },
              },
              { max_amount: null },
            ],
            [Op.and]: [
              {
                [Op.or]: [
                  {
                    min_amount: {
                      [Op.lte]: amount,
                    },
                  },
                  {
                    max_amount: {
                      [Op.gte]: amount,
                    },
                  },
                  { min_amount: null },
                ],
              },
            ],
          },
          { is_deleted: DeletedStatus.No },
          { is_active: ActiveStatus.Active },
          {company_info_id:company_info_id?.data}
        ],
      },
    });

    const beforShippinChargeAmount = amount;
    const afterShippinChargeAmount = amount + (shippingChargeData?.amount ?? 0);
    const sippingCharge = shippingChargeData?.amount ?? 0;

    return resSuccess({
      data: {
        before_shippin_charge_amount: beforShippinChargeAmount,
        after_shippin_charge_amount: afterShippinChargeAmount,
        sipping_charge: sippingCharge,
      },
    });
  } catch (error: any) {
    throw error;
  }
};

// Check if there is an overlap of min_amount and max_amount with existing records
export const checkAmountConflict = async (
  minAmount: number,
  maxAmount: number,
  excludeId: any = null,
  client_id: number,
  req: Request
) => {
  try {
    const { ShippingCharge } = initModels(req);
    // First check if min_amount is less than max_amount
    if (minAmount && maxAmount && minAmount >= maxAmount) {
      // If min_amount is not less than max_amount, return an error
      return resBadRequest({ message: MIN_AMOUNT_LESS_THAN_MAX_AMOUNT });
    }

    // Find conflicting records in the database
    const conflictingRecords = await ShippingCharge.findAll({
      where: {
        [Op.and]: [
          // Check if the new min_amount or max_amount is overlapping with any existing record's range
          minAmount && (!maxAmount || maxAmount == null)
            ? {
                [Op.or]: [
                  {
                    min_amount: {
                      [Op.gte]: minAmount, // New min_amount is <= existing max_amount
                    },
                  },
                  {
                    max_amount: {
                      [Op.gte]: minAmount, // New max_amount is >= existing min_amount
                    },
                  },
                  {
                    max_amount: null,
                  },
                ],
              }
            : maxAmount && (!minAmount || minAmount == null)
            ? {
                [Op.or]: [
                  {
                    [Op.and]: [
                      {
                        [Op.or]: [
                          {
                            max_amount: {
                              [Op.gte]: maxAmount,
                            },
                          },
                          {
                            max_amount: null,
                          },
                        ],
                      },
                      {
                        [Op.or]: [
                          {
                            min_amount: {
                              [Op.lte]: maxAmount,
                            },
                          },
                          {
                            min_amount: null,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    [Op.and]: [
                      {
                        [Op.or]: [
                          {
                            max_amount: {
                              [Op.lte]: maxAmount,
                            },
                          },
                          {
                            max_amount: null,
                          },
                        ],
                      },
                      {
                        [Op.or]: [
                          {
                            min_amount: {
                              [Op.lte]: maxAmount,
                            },
                          },
                          {
                            min_amount: null,
                          },
                        ],
                      },
                    ],
                  },
                ],
              }
            : {
                [Op.or]: [
                  {
                    [Op.and]: [
                      {
                        min_amount: { [Op.lte]: maxAmount || Number.MAX_VALUE },
                      },
                      {
                        [Op.or]: [
                          { max_amount: { [Op.gte]: minAmount || 0 } },
                          { max_amount: null }, // Open-ended existing range
                        ],
                      },
                    ],
                  },
                  {
                    [Op.and]: [
                      {
                        max_amount: { [Op.gte]: minAmount || Number.MAX_VALUE },
                      },
                      {
                        [Op.or]: [
                          { min_amount: { [Op.lte]: maxAmount || 0 } },
                          { min_amount: null }, // Open-ended existing range
                        ],
                      },
                    ],
                  },
                ],
              },
          { is_deleted: DeletedStatus.No }, // Ensure the record is not deleted
          {company_info_id :client_id}
        ],
        ...(excludeId && { id: { [Op.ne]: excludeId } }), // Exclude the current record during update
      },
    });

    if (conflictingRecords.length > 0) {
      return resBadRequest({ message: AMOUNT_RANGE_CONFLICT_ERROR });
    }

    return resSuccess();
  } catch (error: any) {
    throw error;
  }
};
