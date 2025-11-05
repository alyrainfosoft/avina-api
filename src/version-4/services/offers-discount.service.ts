import { Request } from "express";
import { DEFAULT_STATUS_CODE_SUCCESS, END_DATE_TIME_AFTER_START_ERROR, INVALID_FIRST_FIELD_COMBINATION, INVALID_FIRST_FIELD_VALUE, MIN_LENGTH_ERROR_MESSAGE, START_DATE_TIME_FUTURE_ERROR } from "../../utils/app-messages";
import { combineDateTime, ensureArray, getInitialPaginationFromQuery, getLocalDate, prepareMessageFromParams, resBadRequest, resNotFound, resSuccess, resUnknownError, validateAndFormatTime, validateEnumValue } from "../../utils/shared-functions";
import { BigInt, condition, DaysOfWeek, DeletedStatus, discount_based_on, offerMethod, offerType, product_type } from "../../utils/app-enumeration";
import { Op, QueryTypes } from "sequelize";
import { COUPONCODEREGEX } from "../../utils/app-constants";
import { initModels } from "../model/index.model";

export const  generateCouponCode = async(req:Request) => {
  let length = 8;
  req?.body?.length? length =req?.body?.length :"";
  try {
    const { Offers } = initModels(req);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Uppercase letters and digits
    let couponCode = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        couponCode += characters[randomIndex];
    }

    // Query the database with the dynamically built whereConditions
    const offers = await Offers.findOne({ where: {coupon_code : couponCode,company_info_id : req?.body?.session_res?.client_id } });
    
    if(offers){
      generateCouponCode(req);
    }

    return resSuccess({data:couponCode});
  } catch (error) {
    return resUnknownError({data:error})
  }
}

export const handleDateValidation = (
  start_date: string,
  start_time: string,
  end_date: string,
  end_time: string,
  every_week_count?: number,
  days?: string[] | any,
  day_start_time?: string,
  day_end_time?: string
) => {
  try {
    // Combine the start date and time
    const start_date_and_time = combineDateTime(start_date, start_time);
    let end_date_and_time: any;

    // If combining start date and time fails, return error
    if (start_date_and_time.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return start_date_and_time;
    }

    // Get current date to validate the start time is not in the past

    const current_date = getLocalDate();
    if (start_date_and_time.data <= current_date.toISOString()) {
      return resBadRequest({ message: START_DATE_TIME_FUTURE_ERROR });
    }

    // Validate the every_week_count if provided
    if (every_week_count && every_week_count <= 0) {
      return resBadRequest({
        message: prepareMessageFromParams(MIN_LENGTH_ERROR_MESSAGE, [
          ["field_name", "every_week_count"],
          ["min", '1 or more than 1']
        ])
      });
    }

    // Validate days of the week if every_week_count is provided
    let daysValidationResult = null;
    if (every_week_count) {
      daysValidationResult = validateEnumValue(DaysOfWeek, days);
      if (daysValidationResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return daysValidationResult;
      }

      // Validate day start time if provided
      if (day_start_time) {
        const dayStartTimeResult = validateAndFormatTime(day_start_time);
        if (dayStartTimeResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return dayStartTimeResult;
        }
      }

      // Validate day end time if provided
      if (day_end_time) {
        const dayEndTimeResult = validateAndFormatTime(day_end_time);
        if (dayEndTimeResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return dayEndTimeResult;
        }
      }
    }

    // If end date is provided, combine it with the end time and validate
    if (end_date) {
      end_date_and_time = combineDateTime(end_date, end_time);
      if (end_date_and_time.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return end_date_and_time;
      }

      // Ensure the end date is after the start date
      if (end_date_and_time?.data.toISOString() <= start_date_and_time?.data.toISOString()) {
        return resBadRequest({ message: END_DATE_TIME_AFTER_START_ERROR });
      }
    }

    // Return all the data, including optional fields as null if they are not provided
    return resSuccess({
      data: {
        startDate: start_date || null,
        startTime: start_time || null,
        endTime: end_time || null,
        endDate: end_date || null,
        everyWeekCount: every_week_count || null,
        days: days || null,
        dayStartTime: day_start_time || null,
        dayEndTime: day_end_time || null
      }
    });

  } catch (error: any) {
    // Catch any errors that occur within the try block
    console.error("Error in handleDateValidation:", error);
    return resUnknownError({ message: error });
  }
};

// Common function to create or edit an offer
export const handleOfferCreationOrUpdate = async (req: Request, isEdit: boolean = false) => {
  let trn;
    try {
      const { Offers} = initModels(req)
    const {
      offer_type,
      offer_name,
      coupon_code,
      method,
      cart_total_quantity = null,
      cart_total_amount = null,
      product_type = null,
      discount_based_on = null,
      description,
      discount = null,
      discount_type = null,
      start_date,
      start_time,
      every_week_count = null,
      days = null,
      day_start_time = null,
      day_end_time = null,
      end_date = null,
      end_time = null,
      per_user_usage_limit = null,
      total_number_of_usage_limit = null,
      product_type_offer_combination = null,
      order_type_offer_combination = null,
      all_user = null,
      specific_user_segments = null,
      user_segments = null,
      specific_user = null,
      user_ids = null,
      link,
      is_active,
      bxgy_customer_buys_quantity,
      bxgy_customer_gets_quantity,
      bxgy_discount_value_type,
      bxgy_discount_value,
      bxgy_allocation_limit,
      maximum_discount_amount = null,
      OfferDetailsData,
      OfferDetailsBuysData,
      OfferDetailsGetsData
    } = req.body;
    const image = req.file;
    let idImage: number | null | any = null;
    trn = await (req.body.db_connection).transaction();

    const methodResult = validateEnumValue(offerMethod, method,'method');
      if (methodResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      await trn.rollback();
      return methodResult
    }
    const result = validateEnumValue(offerType, offer_type,'offer_type');
      if (result.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      await trn.rollback();
      return result
    }
  

    if(method == offerMethod.manually){
      if (!coupon_code) {
        await trn.rollback();
        
        return resBadRequest({message:"coupon_code is requied"});
      }else{
        if (!COUPONCODEREGEX.test(coupon_code)) {
          await trn.rollback();
          return resBadRequest({data:coupon_code,message:"Coupon code contains invalid characters. It should only contain A-Z and 1-9."});
        } 
      }
      
      // Check if `offer_id` is provided
      const whereConditions:any = {
        is_deleted: DeletedStatus.No,
        coupon_code: coupon_code,
        company_info_id: req?.body?.session_res?.client_id
      };

      // Add the offer_id condition dynamically if it's provided
      if (req?.params?.offer_id) {
        whereConditions.id = { [Op.ne]: req?.params?.offer_id }; // Exclude the specific offer_id
      }

      // Query the database with the dynamically built whereConditions
      const offers = await Offers.findOne({ where: whereConditions });
      if (offers) {
      await trn.rollback();
        
        return resBadRequest({data:coupon_code,message:"this coupon code already exist!!"});
      }
    }

    // Validate and handle dates
    const dateValidationResult: any = handleDateValidation(start_date, start_time, end_date, end_time, every_week_count, days, day_start_time, day_end_time);
    if (dateValidationResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      await trn.rollback();
      return dateValidationResult;
    }

      const validateProductOfferResult = validateProductOffer({ discount_based_on, product_type, });
      console.log("validateProductOfferResult", validateProductOfferResult);
    if (validateProductOfferResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      await trn.rollback();
      return validateProductOfferResult;
    }

    const validateOrderOfferResult = validateOrderOffer({ offer_type, cart_total_amount, cart_total_quantity });
    if (validateOrderOfferResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      await trn.rollback();
      return validateOrderOfferResult;
    }

    // Example of using usageLimit function
    const response = usageLimit(per_user_usage_limit, total_number_of_usage_limit);
    if (response?.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      await trn.rollback();
      return response;
    }

    // // // Handle image upload
    // idImage = await handleImageUpload(image, trn, req?.body?.session_res?.id_app_user, ImageType.discount);
    // if (idImage.code !== DEFAULT_STATUS_CODE_SUCCESS) {
    //   return idImage;
    // }

    const daysArray = ensureArray(days);

    const enumValues = [
      { value: product_type_offer_combination, name: "product_type_offer_combination" },
      { value: order_type_offer_combination, name: "order_type_offer_combination" },
      { value: specific_user_segments, name: "specific_user_segments" },
      { value: specific_user, name: "specific_user" },
      { value: all_user, name: "all_user" }
    ];

      for (const { value, name } of enumValues) {
      const result = validateEnumValue(BigInt, value, name);
        if (result.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        console.log("name", name);
        await trn.rollback();
        return result;
      }
    }
    if ((all_user == specific_user_segments) && (specific_user_segments == specific_user)) {
      await trn.rollback();
      return resBadRequest({ message: `all_user , specific_user_segments and specific_user fields have the same value. Please provide at least one different value.` })
    }

    // Check if the offer already exists (for editing)
    let offer: any;
    if (isEdit) {
      const offerId = req.params.offer_id; // Assuming offer ID is passed in params for editing
      offer = await Offers.findByPk(offerId);

      if (!offer || (offer && offer.is_deleted == DeletedStatus.yes) || (offer && offer.company_info_id != req?.body?.session_res?.client_id)) {
      await trn.rollback();
        return resNotFound({ message: "Offer not found." });
      }

      
      // Update the offer
      await offer.update({
        offer_name,
        offer_type,
        coupon_code,
        cart_total_quantity: cart_total_quantity ? cart_total_quantity : null,
        cart_total_amount: cart_total_amount ? cart_total_amount : null,
        product_type,
        discount_based_on,
        description,
        discount: discount ? discount : null,
        discount_type,
        start_date: new Date(start_date).toISOString(),
        start_time,
        days: daysArray,
        every_week_count: every_week_count ? every_week_count : null,
        day_start_time: day_start_time ? day_start_time : null,
        day_end_time: day_end_time ? day_end_time : null,
        end_date: end_date ? new Date(end_date).toISOString() : null,
        end_time: end_time ? end_time : null,
        link,
        all_user,
        specific_user_segments,
        specific_user,
        image: idImage?.data,
        is_active,
        per_user_usage_limit,
        total_number_of_usage_limit,
        product_type_offer_combination,
        order_type_offer_combination,
        maximum_discount_amount: maximum_discount_amount ? maximum_discount_amount : null,
        bxgy_customer_buys_quantity,
        bxgy_customer_gets_quantity,
        bxgy_discount_value_type,
        bxgy_discount_value,
        bxgy_allocation_limit,
        updated_by: req?.body?.session_res?.id_app_user,
        updated_at: getLocalDate(),
      }, { transaction: trn });
    } else {
      // Create a new offer
      offer = await Offers.create({
        offer_name,
        offer_type,
        coupon_code,
        cart_total_quantity: cart_total_quantity ? cart_total_quantity : null,
        cart_total_amount: cart_total_amount ? cart_total_amount : null,
        product_type,
        discount_based_on,
        description,
        discount: discount ? discount : null,
        discount_type,
        start_date: new Date(start_date).toISOString(),
        start_time,
        days: daysArray,
        every_week_count: every_week_count ? every_week_count : null,
        day_start_time: day_start_time ? day_start_time : null,
        day_end_time: day_end_time ? day_end_time : null,
        end_date: end_date ? new Date(end_date).toISOString() : null,
        end_time: end_time ? end_time : null,
        link,
        all_user,
        specific_user_segments,
        specific_user,
        image: idImage?.data,
        is_active,
        per_user_usage_limit,
        total_number_of_usage_limit,
        product_type_offer_combination,
        order_type_offer_combination,
        maximum_discount_amount: maximum_discount_amount ? maximum_discount_amount : null,
        bxgy_customer_buys_quantity,
        bxgy_customer_gets_quantity,
        bxgy_discount_value_type,
        bxgy_discount_value,
        bxgy_allocation_limit,
        created_by: req?.body?.session_res?.id_app_user,
        created_at: getLocalDate(),
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      }, { transaction: trn });
    }

    if(OfferDetailsData && offerType.ProductType == offer_type ){
      // Handle Offer Details

      await handleOfferDetails(OfferDetailsData, offer.id,condition.productDirect, trn, req);
    }

    if(OfferDetailsBuysData && offerType.BuyXGetY == offer_type  ){
      // Handle Offer Details

      await handleOfferDetails(OfferDetailsBuysData, offer.id,condition.buys, trn, req);
      if(!OfferDetailsGetsData){
        await trn.rollback();
        
        return resBadRequest({ message: "At least one OfferDetailsGetsData is requiered" })
      }

      await handleOfferDetails(OfferDetailsGetsData, offer.id,condition.gets, trn, req);

    }

    // Handle Eligible Customers
    await handleEligibleCustomers(offer?.id, {
      specific_user_segments,
      user_segments,
      specific_user,
      user_ids,
    }, trn, req?.body?.session_res?.id_app_user,req);

    await trn.commit();

    return resSuccess({ data: offer });
  } catch (e) {
    console.error('Error during offer creation or update:', e);
    if (trn) await trn.rollback();
    throw e;
  }
};

// Create Offer API
export const addOffersAndDiscount = async (req: Request) => {
  return await handleOfferCreationOrUpdate(req, false); // false means it's a create request
};

// Function to validate Product Type offer with dynamic conditions
export const validateProductOffer = (conditions: { [key: string]: any }) => {
  try {

    // Extract values directly from the conditions object
    const { discount_based_on, product_type } = conditions;

    // Validate fields for product-based offer
    if (discount_based_on && product_type) {
      const validation_result = validateFields(discount_based_on, product_type);
      if (validation_result.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return validation_result; // Return error response if validation fails
      }
    }

    return resSuccess(); // Return success if no validation issues
  } catch (error: any) {
    console.error("Error during product offer validation:", error);
    return resUnknownError({ message: `An unexpected error occurred during product offer validation${error}` });
  }
};

// Main validation function
export const validateFields = (discount_based_on_field: any, product_type_field: any): any => {
  try {

    // Define valid set of DiscountBasedOn values
    const validFirstEnumValues = Object.values(discount_based_on);

    // If product_type_field is DynamicSingleProduct or VariantSingleProduct, any discount_based_on is allowed
    if ([product_type.DynamicSingleProduct, product_type.VariantSingleProduct].includes(product_type_field)) {
      if (!validFirstEnumValues.includes(discount_based_on_field)) {
        const dynamicMessage = prepareMessageFromParams(INVALID_FIRST_FIELD_VALUE, [
          ['valid_values', validFirstEnumValues.join(', ')],
        ]);
        return resBadRequest({ message: dynamicMessage });
      }
      return resSuccess();
    }

    // For other product types, only "PriceRang" is allowed in discount_based_on
    if (discount_based_on_field !== discount_based_on.PriceRang) {
      const dynamicMessage = prepareMessageFromParams(INVALID_FIRST_FIELD_COMBINATION, [
        ['valid_value', discount_based_on.PriceRang],
      ]);
      return resBadRequest({ message: dynamicMessage });
    }

    return resSuccess();
  } catch (error: any) {
    return resUnknownError(error);
  }
};

// Function to validate Order Type offer with dynamic conditions
export const validateOrderOffer = (conditions: { [key: string]: any }) => {
  try {
    // Extract values directly from the conditions object
    const { offer_type, cart_total_amount, cart_total_quantity } = conditions;

    // Only validate for OrderType offers
    if (offer_type === offerType.OrderType) {
      if (cart_total_amount !== null && cart_total_amount < 0) {
        return resBadRequest({ message: "cart_total_amount must be >= 0" });
      }
      if (cart_total_quantity !== null && cart_total_quantity < 0) {
        return resBadRequest({ message: "cart_total_quantity must be >= 0" });
      }
    }
    return resSuccess(); // Return success if no validation issues
  } catch (error: any) {
    console.error("Error during order offer validation:", error);
    return resUnknownError({ message: `An unexpected error occurred during order offer validation${error}` });
  }
};

// Utility function to handle usage limit validation with try-catch for error handling
export const usageLimit = (per_user_usage_limit: number, total_number_of_usage_limit: number) => {
  try {
    // Validate per_user_usage_limit
    if (per_user_usage_limit && per_user_usage_limit < 1) {
      return resBadRequest({
        message: prepareMessageFromParams(MIN_LENGTH_ERROR_MESSAGE, [
          ["field_name", "per_user_usage_limit"],
          ["min", '1 or more than 1']
        ])
      });
    }

    // Validate total_number_of_usage_limit
    if (total_number_of_usage_limit && total_number_of_usage_limit < 1) {
      return resBadRequest({
        message: prepareMessageFromParams(MIN_LENGTH_ERROR_MESSAGE, [
          ["field_name", "total_number_of_usage_limit"],
          ["min", '1 or more than 1']
        ])
      });
    }

    // If validation is successful, return null (no errors)
    return resSuccess();
  } catch (error: any) {
    // Catch any unexpected errors
    console.error("Error during usage limit validation:", error);
    return resUnknownError({ message: `An unexpected error occurred during usage limit validation. ${error}` });
  }
};

// Helper function to handle OfferDetails update or creation with conflict checks
export const handleOfferDetails = async (
  OfferDetailsData: any[],
  offer_id: number,
  condition:any,
  trn: any,
  req: Request
) => {
   if (!OfferDetailsData) {
    return resSuccess();
    }
    const {OfferDetails} = initModels(req);
  for (const OfferDetailData of OfferDetailsData) {
    OfferDetailData.condition = condition
    // Destructure all the relevant fields from OfferDetailData
    const {
      product_id,
      category_id,
      collection_id,
      style_id,
      event_id,
      lookbook_id,
      min_price,
      max_price,
      brand_id,
    } = OfferDetailData;
    OfferDetailData
    // Validate offer details before proceeding
    const validationError = await validateOfferDetails(OfferDetailData, { dataValues: { id: offer_id, company_info_id: req.body?.session_res?.client_id } }, trn, req);
    if (validationError) {
      return validationError;  // Return validation error if any
    }

    // Validate price ranges if min_price or max_price is provided
    if ((min_price !== null && min_price < 0) || (max_price !== null && max_price < 0)) {
      return resBadRequest({ message: 'Price values must be greater than or equal to 0.' });
    }

    // Validate price range conflicts if both min_price and max_price are provided
    if (min_price !== null && max_price !== null && min_price > max_price) {
      return resBadRequest({ message: 'min_price should be less than or equal to max_price.' });
    }

    // Define where clause and identifier based on available fields
    let whereClause: any = { offer_id , condition };
    let identifierKey: string | undefined = undefined;

    // Add conditions to set the whereClause and identifierKey based on available fields
    if (product_id) {
      whereClause.product_id = product_id;
      identifierKey = 'product_id';
    } else if (collection_id) {
      whereClause.collection_id = collection_id;
      identifierKey = 'collection_id';
    } else if (brand_id) {
      whereClause.brand_id = brand_id;
      identifierKey = 'brand_id';
    } else if (event_id) {
      whereClause.event_id = event_id;
      identifierKey = 'event_id';
    } else if (category_id) {
      whereClause.category_id = category_id;
      identifierKey = 'category_id';
    } else if (style_id) {
      whereClause.style_id = style_id;
      identifierKey = 'style_id';
    } else if (lookbook_id) {
      whereClause.lookbook_id = lookbook_id;
      identifierKey = 'lookbook_id';
    }

    if (!identifierKey) {
      console.error("No valid identifier found in OfferDetailData");
      continue;
    }

    // Check if the offer detail already exists in the database
    const existingDetail: any = await OfferDetails.findOne({
      where: {...whereClause, company_info_id: req.body?.session_res?.client_id },
      transaction: trn,
    });

    if (existingDetail) {
      // If existing detail is the same as the request, skip the update
      if (JSON.stringify(existingDetail) === JSON.stringify(OfferDetailData)) {
        continue;
      }

      // Prepare data for update
      const updatedData: any = {
        ...OfferDetailData,
        updated_at: getLocalDate(),
      };

      // Handle price range conflict check and update
      if (min_price !== null || max_price !== null) {
        // If existing price conflicts with new one, return error
        if (
          (existingDetail.min_price !== null && existingDetail.min_price !== min_price) ||
          (existingDetail.max_price !== null && existingDetail.max_price !== max_price)
        ) {
          return resBadRequest({ message: 'Min or Max Price conflict with existing data.' });
        }
      }

      // Mark as deleted if identifier key does not match
      if (existingDetail[identifierKey] !== OfferDetailData[identifierKey]) {
        updatedData.is_deleted = DeletedStatus.yes;
      } else {
        updatedData.is_deleted = existingDetail.is_deleted;
      }

      // Update the existing offer detail
      await existingDetail.update(updatedData, { transaction: trn });
    } else {
      // Create new offer detail if it does not exist
      await OfferDetails.create(
        {
          ...OfferDetailData,
          offer_id,
          created_by: req?.body?.session_res?.id_app_user,
          created_at: getLocalDate(),
          company_info_id: req.body?.session_res?.client_id
        },
        { transaction: trn }
      );
    }
  }
};

// Validation function for OfferDetailData
export const validateOfferDetails = async (
  OfferDetailData: any,
  offers: any,
  trn: any,
  req: Request
) => {
  const {
    product_id,
    quantity,
    category_id,
    collection_id,
    style_id,
    event_id,
    lookbook_id,
    min_price,
    max_price,
  } = OfferDetailData;
  const { Product, ProductCategory, Collection, SettingTypeData, Tag, LookBook,  OfferDetails } = initModels(req);
  // Validate individual fields and return error if not found
  if (product_id) {
    const productData = await Product.findOne({ where: { id: product_id, is_deleted: DeletedStatus.No, company_info_id: req.body?.session_res?.client_id } });
    if (!productData) {
      return resNotFound({ message: `Product not found with Id: ${product_id}` });
    }
  }

  if (category_id) {
    const categoryData = await ProductCategory.findOne({ where: { id: category_id } });
    if (!categoryData) {
      return resNotFound({ message: `Category not found with Id: ${category_id}` });
    }
  }

  if (collection_id) {
    const collectionData = await Collection.findOne({ where: { id: collection_id, is_deleted: DeletedStatus.No, company_info_id: req.body?.session_res?.client_id } });
    if (!collectionData) {
      return resNotFound({ message: `Collection not found with Id: ${collection_id}` });
    }
  }

  if (style_id) {
    const styleData = await SettingTypeData.findOne({ where: { id: style_id, is_deleted: DeletedStatus.No, company_info_id: req.body?.session_res?.client_id } });
    if (!styleData) {
      return resNotFound({ message: `Style not found with Id: ${style_id}` });
    }
  }

  if (event_id) {
    const eventData = await Tag.findOne({ where: { id: event_id, is_deleted: DeletedStatus.No, company_info_id: req.body?.session_res?.client_id } });
    if (!eventData) {
      return resNotFound({ message: `Event not found with Id: ${event_id}` });
    }
  }

  if (lookbook_id) {
    const lookBookData = await LookBook.findOne({ where: { id: lookbook_id, is_deleted: DeletedStatus.No, company_info_id: req.body?.session_res?.client_id } });
    if (!lookBookData) {
      return resNotFound({ message: `LookBook not found with Id: ${lookbook_id}` });
    }
  }

  // Validate price constraints
  if (min_price !== null && min_price < 0) {
    return resBadRequest({ message: 'Min Price must be greater than 0.' });
  }

  if (max_price !== null && max_price < 0) {
    return resBadRequest({ message: 'Max Price must be greater than 0.' });
  }

  // Validate min_price and max_price relationship
  if (min_price !== null && max_price !== null && min_price > max_price) {
    return resBadRequest({ message: 'min_price should be less than or equal to max_price.' });
  }

  // Validate price conflict in the same offer
  if (min_price !== null || max_price !== null) {
    const existingOffer = await OfferDetails.findOne({
      where: {
        company_info_id: req.body?.session_res?.client_id,
        offer_id: offers?.dataValues?.id,
        ...(min_price !== null && max_price !== null && {
          [Op.or]: [
            { min_price: { [Op.lte]: max_price } },
            { max_price: { [Op.gte]: min_price } },
          ],
        }),
        ...(min_price !== null && max_price === null && { min_price: { [Op.lte]: min_price } }),
        ...(min_price === null && max_price !== null && { max_price: { [Op.gte]: max_price } }),
      },
      transaction: trn,
    });

    if (existingOffer) {
      return resBadRequest({ message: "Min/Max price conflict detected." });
    }
  }

  return null;  // Return null if no validation errors
};

// Helper function to handle bulk creation for eligible customers and specific users
export const handleEligibleCustomers = async (
  offer_id: number,
  data: { [key: string]: any[] },
  trn: any,
  created_by: number,
  req: Request
) => {
  try {
    const { specific_user_segments, user_segments, specific_user, user_ids } = data;
    const { OfferEligibleCustomers } = initModels(req);
    const OfferEligibleCustomersData: any[] = []; // Array to hold all the records to be created

    // Process specific_user_segments
    if (specific_user_segments && user_segments) {
      for (const segment of user_segments) {
        // Check if the segment exists in the database
        const existingSegment = await OfferEligibleCustomers.findOne({
          where: { offer_id, user_segment: segment, company_info_id: req.body?.session_res?.client_id },
          transaction: trn,
        });

        if (existingSegment) {
          continue; // Do nothing if it exists
        }

        // Add new segment if it does not exist
        OfferEligibleCustomersData.push({
          offer_id,
          user_id: null, // No user ID for specific_user_segments
          user_segment: segment, // Add user segment data
          created_by,
          created_at: getLocalDate(),
        });
      }
    }

    // Process specific_user
    if (specific_user && user_ids) {
      for (const user of user_ids) {
        // Check if the user exists in the database
        const existingUser = await OfferEligibleCustomers.findOne({
          where: { offer_id, user_id: user, company_info_id: req.body?.session_res?.client_id },
          transaction: trn,
        });

        if (existingUser) {
          continue; // Do nothing if it exists
        }

        // Add new user if it does not exist
        OfferEligibleCustomersData.push({
          offer_id,
          user_id: user, // Add user ID
          user_segment: null, // No user segment for specific_user
          created_by,
          created_at: getLocalDate(),
        });
      }
    }

    // Mark existing data as deleted if not present in the request body
    if ((specific_user_segments && user_segments) || (specific_user && user_ids)) {
      const existingEligibleCustomers: any = await OfferEligibleCustomers.findAll({
        where: { offer_id, is_deleted: DeletedStatus.No, company_info_id: req.body?.session_res?.client_id },
        transaction: trn,
      });

      // Mark as deleted those not found in the request body
      for (const customer of existingEligibleCustomers) {
        const isCustomerInRequest =
          (specific_user_segments && user_segments && user_segments.includes(customer.user_segment)) ||
          (specific_user && user_ids && user_ids.includes(customer.user_id));

        if (!isCustomerInRequest) {
          await customer.update({ is_deleted: DeletedStatus.yes, updated_at: getLocalDate() }, { transaction: trn });
        }
      }
    }

    // Bulk create the eligible customers data
    if (OfferEligibleCustomersData.length > 0) {
      await OfferEligibleCustomers.bulkCreate(OfferEligibleCustomersData, { transaction: trn });
    }
    return resSuccess(); // Return success if no errors
  } catch (error: any) {
    console.error("Error during handling bulk create data for eligible customers and specific users:", error);
    return resUnknownError({ message: `An unexpected error occurred while handling bulk create data.${error}` });
  }
};

// Edit Offer API
export const editOfferAndDiscount = async (req: Request) => {
  return await handleOfferCreationOrUpdate(req, true); // true means it's an edit request
};

// The function to get all offers along with related offer details and master tables
export const getAllOfferAndDiscount = async (req: Request) => {
  try {
    const pagination = getInitialPaginationFromQuery(req.query);

    // Initialize the base where condition for filtering offers
    let whereCondition = `offers.is_deleted = '${DeletedStatus.No}' AND offers.id != 0 AND offers.company_info_id = ${req.body?.session_res?.client_id}`;

    // Apply filter for active status if provided
    if (pagination.is_active) {
      whereCondition += ` AND offers.is_active = :is_active`;
    }

    // Apply search text filter if provided
    if (pagination.search_text) {
      whereCondition += ` AND (
        offers.offer_name ILIKE :search_text OR
        offers.description ILIKE :search_text OR
        CAST(offers.discount AS VARCHAR) ILIKE :search_text OR
        offers.discount_type ILIKE :search_text OR
        CAST(offers.start_date AS VARCHAR) ILIKE :search_text OR
        CAST(offers.start_time AS VARCHAR) ILIKE :search_text
      )`;
    }

    // Calculate offset for pagination
    const offset = (pagination.current_page - 1) * pagination.per_page_rows;

    // Construct the main query with joins, filtering, sorting, and pagination
    const query = `
      SELECT
       offers.id AS offer_id,
        offers.discount, 
        offers.discount_type, 
        offers.maximum_discount_amount,
        offers.per_user_usage_limit,
        offers.total_number_of_usage_limit,
        offers.all_user,
        offers.specific_user_segments,
        offers.specific_user,
        offers.is_active, 
        offers.product_type_offer_combination,
        offers.order_type_offer_combination,
        offers.offer_type,
        offers.start_date,
        offers.start_time,
        offers.every_week_count,
        offers.day_start_time,
        offers.day_end_time,
        offers.days,
        offers.end_date,
        offers.end_time,
        offers.cart_total_amount,
        offers.cart_total_quantity,
        -- offers.discount_apply_on,
        -- offers.have_free_product,
        offers.offer_name,
        offers.offer_type,
        offers.description,
        offers.bxgy_customer_buys_quantity,
        offers.bxgy_customer_gets_quantity,
        offers.bxgy_discount_value_type,
        offers.bxgy_discount_value,
        offers.bxgy_allocation_limit,

        -- Aggregate OfferDetails into a JSON array
        json_agg(
           DISTINCT jsonb_build_object(
           'condition', offer_details.condition,
            'product_id', offer_details.product_id,
            'category_id', offer_details.category_id,
            'collection_id', offer_details.collection_id,
            'style_id', offer_details.style_id,
            'event_id', offer_details.event_id,
            'lookbook_id', offer_details.lookbook_id,
            'min_price', offer_details.min_price,
            'max_price', offer_details.max_price,
            'product_name', products.name,
            'category_name', categories.category_name,
            'collection_name', collections.name,
            'style_name', setting_styles.name,
            'event_name', tags.name
          )
        ) AS offer_details,

         -- Aggregate GetOfferDetails into a JSON array
        json_agg(
           DISTINCT jsonb_build_object(
           'condition', gets_offer_details.condition,
            'product_id', gets_offer_details.product_id,
            'category_id', gets_offer_details.category_id,
            'collection_id', gets_offer_details.collection_id,
            'style_id', gets_offer_details.style_id,
            'event_id', gets_offer_details.event_id,
            'lookbook_id', gets_offer_details.lookbook_id,
            'min_price', gets_offer_details.min_price,
            'max_price', gets_offer_details.max_price,
            'product_name', gets_products.name,
            'category_name', gets_categories.category_name,
            'collection_name', gets_collections.name,
            'style_name', gets_setting_styles.name,
            'event_name', gets_tags.name
          )
        ) AS gets_offer_details,

         -- Aggregate buysOfferDetails into a JSON array
        json_agg(
           DISTINCT jsonb_build_object(
           'condition', buys_offer_details.condition,
            'product_id', buys_offer_details.product_id,
            'category_id', buys_offer_details.category_id,
            'collection_id', buys_offer_details.collection_id,
            'style_id', buys_offer_details.style_id,
            'event_id', buys_offer_details.event_id,
            'lookbook_id', buys_offer_details.lookbook_id,
            'min_price', buys_offer_details.min_price,
            'max_price', buys_offer_details.max_price,
            'product_name', buys_products.name,
            'category_name', buys_categories.category_name,
            'collection_name', buys_collections.name,
            'style_name', buys_setting_styles.name,
            'event_name', buys_tags.name
          )
        ) AS buys_offer_details,

        -- Aggregate offer_eligible_customers into JSON array
        json_agg(
          DISTINCT jsonb_build_object(
            'user_id', offer_eligible_customers.user_id,
            'user_segments', offer_eligible_customers.user_segments
          )
        ) AS eligible_customers,

        -- Total items for pagination
        COUNT(offers.id) OVER() AS total_items
      FROM
        offers
      LEFT JOIN offer_details as offer_details
        ON offers.id = offer_details.offer_id AND offer_details.is_deleted = '${DeletedStatus.No}' AND offer_details.condition = '${condition.productDirect}'
      LEFT JOIN offer_details as gets_offer_details
        ON offers.id = gets_offer_details.offer_id AND gets_offer_details.is_deleted = '${DeletedStatus.No}' AND gets_offer_details.condition = '${condition.gets}'
      LEFT JOIN offer_details as buys_offer_details
        ON offers.id = buys_offer_details.offer_id AND buys_offer_details.is_deleted = '${DeletedStatus.No}' AND buys_offer_details.condition = '${condition.buys}'
      LEFT JOIN offer_eligible_customers
        ON offers.id = offer_eligible_customers.offer_id AND offer_eligible_customers.is_deleted = '${DeletedStatus.No}'
      LEFT JOIN products 
        ON offer_details.product_id = products.id
      LEFT JOIN categories 
        ON offer_details.category_id = categories.id
      LEFT JOIN collections 
        ON offer_details.collection_id = collections.id
      LEFT JOIN setting_styles 
        ON offer_details.style_id = setting_styles.id
      LEFT JOIN tags 
        ON offer_details.event_id = tags.id
         -- Aggregate buysOfferDetails into a JSON array
      LEFT JOIN products as buys_products
        ON buys_offer_details.product_id = buys_products.id
      LEFT JOIN categories as buys_categories
        ON buys_offer_details.category_id = buys_categories.id
      LEFT JOIN collections as buys_collections
        ON buys_offer_details.collection_id = buys_collections.id
      LEFT JOIN setting_styles as buys_setting_styles
        ON buys_offer_details.style_id = buys_setting_styles.id
      LEFT JOIN tags as buys_tags
        ON buys_offer_details.event_id = buys_tags.id
      LEFT JOIN products as gets_products
        ON gets_offer_details.product_id = gets_products.id
      LEFT JOIN categories as gets_categories
        ON gets_offer_details.category_id = gets_categories.id
      LEFT JOIN collections as gets_collections
        ON gets_offer_details.collection_id = gets_collections.id
      LEFT JOIN setting_styles as gets_setting_styles
        ON gets_offer_details.style_id = gets_setting_styles.id
      LEFT JOIN tags as gets_tags
        ON gets_offer_details.event_id = gets_tags.id
      WHERE
        ${whereCondition}
      GROUP BY
        offers.id
      ORDER BY
        offers.${pagination.sort_by} ${pagination.order_by}
      LIMIT :per_page_rows OFFSET :offset
    `;

    // Execute the query with dynamic replacements
    const result: any = await (req.body.db_connection).query(query, {
      replacements: {
        is_active: pagination.is_active || null,
        search_text: `%${pagination.search_text}%`, // Wrap search text with `%` for partial matches
        per_page_rows: pagination.per_page_rows,
        offset: offset,
      },
      type: QueryTypes.SELECT,
    });

    // Handle specific offer ID requests
    if (req.params.id) {
      if (result.length === 0) {
        return resBadRequest({ message: 'Offer not found' });
      }
      return resSuccess({ data: result[0] }); // Return a single offer object
    }

    // Handle paginated response
    const totalItems = result.length > 0 ? result[0].total_items : 0;
    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

    return resSuccess({
      data: req.query.no_pagination === '1' ? result : { pagination, result },
    });
  } catch (error) {
    // Log the error and return a generic error response
    console.error('Error occurred while fetching offers:', error);
    return resUnknownError({ message: 'Internal server error' });
  }
};

export const deleteOfferAndDiscount = async (req: Request) => {
  try {
    const { Offers } = initModels(req);
    const offerData = await Offers.findOne({
      where: { id: req.params.offer_id, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id },
    });

    if (!(offerData && offerData.dataValues)) {
      return resNotFound();
    }

    await offerData.update(
      {
        is_deleted: DeletedStatus.yes,
        updated_by: req?.body?.session_res?.id_app_user,
        updated_at: getLocalDate(),
      },
      { where: { id: offerData.dataValues.offer_id } }
    );

    return resSuccess();
  } catch (e) {
    console.log("=================", e)
    throw e;
  }
};

export const changeStatusOfferAndDiscount = async (req: Request) => {
  try {
    const { is_active } = req.body
    const { Offers } = initModels(req);

    const offerData = await Offers.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id },
    });

    if (!(offerData && offerData.dataValues)) {
      return resNotFound();
    }

    await offerData.update(
      {
        is_active: is_active,
        updated_by: req?.body?.session_res?.id_app_user,
        updated_at: getLocalDate(),
      },
      { where: { id: offerData.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    throw e;
  }
};