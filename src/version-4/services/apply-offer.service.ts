import { QueryTypes } from "sequelize";
import { ActiveStatus, condition, couponType, DeletedStatus, isCombined, offerType, userSegments } from "../../utils/app-enumeration";
import { getLocalDate, resSuccess, resUnknownError } from "../../utils/shared-functions";
import { initModels } from "../model/index.model";

export const applyOffer = async (req: Request, cart_list: any, client_id: number) => {
  try {
    const cartItems = cart_list.cart_list;
    
    // Fetch active offers from the database
    const activeOffers: any = await fetchActiveOffers(req,client_id);
    
    // Dividing the offers based on the type of offer
    const productOffers = activeOffers.filter(
      (offer: any) => offer.offer_type === `${offerType.ProductType}`
    );
    const orderOffers = activeOffers.filter(
      (offer: any) => offer.offer_type === `${offerType.OrderType}`
    );

    // Set to track which offers have already been applied
    const appliedOffersSet = new Set(); // This set keeps track of applied offer IDs

    // To store the updated cart items with the applied offers
    const updatedCart = [];

    if (!cartItems) {
      return resSuccess({ data: cartItems });
    }

    // Step 1: Loop through each product and apply the best applicable offer
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i].dataValues;
      let appliedOffers: any = [];
      let totalDiscount = 0;
      
      // Track the best offer for the product
      let bestOffer: any = null;
      let bestDiscount = 0;  // Ensure that the discount starts at 0

      // Step 2: Collect all applicable product offers
      const applicableProductOffers = [];
      for (let j = 0; j < productOffers.length; j++) {
        const offer = productOffers[j];

        // // Skip if the offer has already been applied to another product
        // if (appliedOffersSet.has(offer.offer_id)) {
        //   continue;
        // }

         // Skip if the offer is not valid based on time conditions
        //  if (!isOfferValidByTime(offer, getLocalDate())) continue;

         // Skip if the user is not eligible for the offer
         if (!isUserEligible(offer,req)) continue;
 
         // Skip if the usage limit has been exceeded
         if (!isUseageLimit(offer,req)) continue;
 
         // Check if the product matches the offer criteria
        const isEligible = await isProductEligible(offer, item.product_id, req);
          if (!isEligible) {
            continue; // Skip this product if it's not eligible
          }
         if ((offer.min_price && item.price < offer.min_price) || (offer.max_price && item.price > offer.max_price)) continue;
 
        // Track applicable offers for this product
        applicableProductOffers.push(offer);
      }

      // Step 3: Calculate the best discount from the applicable offers
      if (applicableProductOffers.length > 0) {
        for (let k = 0; k < applicableProductOffers.length; k++) {
          const offer = applicableProductOffers[k];
          
          const discount = calculateDiscountAmount(offer, item.product_price);
          // Update the best offer if the current one gives a higher discount
          if (discount > bestDiscount) {
            bestDiscount = discount;
            bestOffer = offer;
          }
        }
        // Apply the best offer's discount to this item
        if (bestOffer) {
          totalDiscount = bestDiscount;
          appliedOffers.push(bestOffer);
          appliedOffersSet.add(bestOffer.offer_id); // Mark this offer as applied
        }
      }

      // Step 4: Calculate the final price after applying the best offer
      item.after_discount_product_price = item.product_price - totalDiscount;
      item.appliedOffers = appliedOffers; // Store the applied offers
      // Update cart totals
      cart_list.sub_total -= totalDiscount;

      updatedCart.push({
        ...item,
      });
    }

    // Step 5: Sort the products by total discount (highest to lowest) - Optional
    updatedCart.sort((a, b) => b.totalDiscount - a.totalDiscount);
    
    // Step 6: Calculate cartSubtotal and cartTotalQuantity manually without using .reduce()
    let cartSubtotal = 0;
    let cartTotalQuantity = 0;

    for (let i = 0; i < updatedCart.length; i++) {
      const item = updatedCart[i];
      cartSubtotal += item.after_discount_product_price * item.quantity;
      cartTotalQuantity += item.quantity;
    }

    // Step 7: Apply order-level offers
    let orderDiscount:any = 0;
    for (let j = 0; j < orderOffers.length; j++) {
      const offer = orderOffers[j];

      // Skip order offers that don't meet the criteria
      if (offer.cart_total_amount && cartSubtotal <= offer.cart_total_amount) continue;
      if (offer.cart_total_quantity && cartTotalQuantity <= offer.cart_total_quantity) continue;

      // Skip if the offer is not valid based on time conditions
      if (!isOfferValidByTime(offer, getLocalDate())) continue;


      // Skip if the user is not eligible for the offer
      if (!isUserEligible(offer, req)) continue;

      // Skip if the usage limit has been exceeded
      if (!isUseageLimit(offer, req)) continue;
      // Apply the discount for this order-level offer
      const orderDiscountValue = calculateDiscountAmount(offer, cartSubtotal);
      orderDiscount = (Number(orderDiscount) + Number(orderDiscountValue)) || 0;
    }

    // Step 8: Calculate the final order price
    const finalOrderPrice = cartSubtotal - orderDiscount;

    cart_list.cart_list = updatedCart;
    cart_list.orderDiscount = orderDiscount;
    cart_list.finalOrderPrice = finalOrderPrice > 0 ? finalOrderPrice : 0;
    // Step 9: Return the updated cart with applied offers
    return resSuccess({
      data: cart_list
    });
  } catch (error) {
    console.error('Error applying offers:', error);
    return resUnknownError({
      data: {
        success: false,
        message: 'An error occurred while applying offers.',
      },
    });
  }
};

// Function to fetch all active offers
const fetchActiveOffers = async (req: any, client_id: number) => {

  const activeOffersQuery = `SELECT
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
       offers.is_active = '${ActiveStatus.Active}'
       AND offers.is_deleted = '${DeletedStatus.No}'
       AND offers.company_info_id = ${client_id}
      GROUP BY offers.id`;
  return await req.body.db_connection.query(activeOffersQuery, { type: QueryTypes.SELECT });
};

// // Simulate a database query function to get user data from the `app_user` table
const getUserDataFromDB = async (user_id: any, req: any): Promise<any> => {
    const { AppUser } = initModels(req);
  // Example: Replace with actual query to fetch the user data
  const userDatabase = await AppUser.findAll({ where: { id: user_id } });

  return userDatabase.find((user: any) => user.id === user_id);
};


// Helper function to check if the user belongs to a specific segment
const isUserInSegment = async (user_id: any, eligible_customer: any, req:any): Promise<boolean> => {

  // Fetch user data from the database
  const userData = await getUserDataFromDB(user_id, req); // Replace with actual DB query

  if (!userData) {
    return false; // User not found
  }

  // Check if the user’s segment matches the eligible customer’s segment
  if (eligible_customer.user_segments === userSegments.New) {
    // Example check: if the user's subscription status is active
    if (userData.user_status === 2) {
      return true; // User belongs to the valid segment and has an active subscription
    }
  }

  return false; // User doesn't match segment or subscription status
};

// Function to validate user eligibility for an offer
const isUserEligible = async (offer: any, req:any): Promise<boolean> => {
  // If the offer is available to all users, return true

  if (offer.all_user === isCombined.YES) {
    return true;
    // If the offer is available to specific user segments
  } else if (offer.specific_user_segments === isCombined.YES) {
    // Loop through the eligible customers to find matching user segments
    for (const eligible_customer of offer.eligible_customers) {
      // Check if the user is in a valid segment using the helper function
      const isEligible = await isUserInSegment(req?.body?.session_res?.id_app_user, eligible_customer, req);
      if (isEligible) {
        return true; // User is eligible for this segment
      }
    }
    return false; // No valid segment found for the user

    // If the offer is for a specific user (based on user_id)
  } else if (offer.specific_user === isCombined.YES) {
    // Check if the user's id matches any of the eligible customers
    for (const eligible_customer of offer.eligible_customers) {
      if (eligible_customer.user_id === req?.body?.session_res?.id_app_user) {
        return true; // User is eligible for this specific offer
      }
    }
  }

  // If none of the conditions matched, the user is not eligible
  return false;
};

// ------------------------------------------------ start Useage Limit -----------------------------------------//

// Simulate a database query function to count the total usage of the offer (by all users)
const getTotalOfferUsageCount = async (offer_id: any,req:any): Promise<number> => {
  // Select ordes query to count the total number of times the offer has been used
  const productDetailsQuery = `
    SELECT 
        o.offer_details->>'offer_id'
    FROM 
        orders o
    WHERE 
        (o.offer_details->>'offer_id')::int = :offer_id
  `;

  const orderDatabase: any = await req.body.db_connection.query(productDetailsQuery, {
    replacements: { offer_id: offer_id },
    type: QueryTypes.SELECT,
  });
  // Count the total number of times this offer has been used (by any user)
  const totalUsage = orderDatabase.length;
  return totalUsage;
};

// Simulate a database query function to count how many times a specific user has used the offer
const getUserOfferUsageCount = async (user_id: any, offer_id: any,req:any): Promise<number> => {
  // Select Orders query to count the number of times this specific user has used the offer

  const productDetailsQuery = `
  SELECT 
     o.user_id,
     o.offer_details->>'offer_id' as offer_details
  FROM 
      orders o
  WHERE 
      o.user_id = :user_id 
      AND (o.offer_details->>'offer_id')::int = :offer_id
`;

  const orderDatabase = await req.body.db_connection.query(productDetailsQuery, {
    replacements: { user_id: user_id ? user_id : 207, offer_id: offer_id },// need to remove befor uploaded
    type: QueryTypes.SELECT,
  });
  // Count the number of times the user has used this offer
  const userUsage = orderDatabase.length;
  return userUsage;
};

// Function to check if the user is eligible for the offer based on the usage limits
const isUseageLimit = async (offer: any,req: any): Promise<boolean> => {

  // 1. Check total usage limit for the offer
  const totalUsage = await getTotalOfferUsageCount(offer.offer_id, req); // Replace with actual DB query

  // If the total usage exceeds the total usage limit, the offer is no longer valid
  if (offer.total_number_of_usage_limit !== null && totalUsage >= offer.total_number_of_usage_limit) {
    return false; // Offer has reached its total usage limit
  }

  // 2. Check user-specific usage limit
  const userUsageCount = await getUserOfferUsageCount(req?.body?.session_res?.id_app_user, offer.offer_id, req); // Replace with actual DB query

  // If the user has exceeded the usage limit, they are not eligible
  if (offer.per_user_usage_limit !== null && userUsageCount >= offer.per_user_usage_limit) {
    return false; // User has exceeded the usage limit for this offer
  }

  // If both checks pass, the user is eligible for the offer
  return true;
};

const isProductEligible = async (offer: any, product_id: any,req:any): Promise<boolean> => {
  const productDetailsQuery = `
    SELECT 
        p.id AS product_id,
        string_to_array(p.id_collection::text, '|')::int[] AS collection_ids,
        string_to_array(p.id_brand::text, '|')::int[] AS brand_ids,
        string_to_array(p.setting_style_type::text, '|')::int[] AS setting_style_type_ids,
        string_to_array(p.tag::text, '|')::int[] AS tag_ids,
        pc.id_category
    FROM 
        products p
    LEFT JOIN 
        product_categories pc ON p.id = pc.id_product
    WHERE 
        p.id = :product_id
  `;

  const productDetails: any = await req.body.db_connection.query(productDetailsQuery, {
    replacements: { product_id: product_id },
    type: QueryTypes.SELECT,
  });

  if (!productDetails.length) return false; // Product not found

  const product = productDetails[0];
  const details = offer.offer_details || [];

  const eligibleProducts = details.map((d: any) => d.product_id)
  .filter((id: any) => id)
  .flatMap((id: any) => (typeof id === 'string' ? id.split("|").map(Number) : [id]));

  const eligibleCategoryIds = details
    .map((d: any) => d.category_id)
    .filter((id: any) => id)
    .flatMap((id: any) => (typeof id === 'string' ? id.split("|").map(Number) : [id]));

  const eligibleCollectionIds = details
    .map((d: any) => d.collection_id)
    .filter((id: any) => id)
    .flatMap((id: any) => (typeof id === 'string' ? id.split("|").map(Number) : [id]));

  const eligibleBrandIds = details
    .map((d: any) => d.brand_id)
    .filter((id: any) => id)
    .flatMap((id: any) => (typeof id === 'string' ? id.split("|").map(Number) : [id]));

  const eligibleSettingStyleTypeIds = details
    .map((d: any) => d.style_id)
    .filter((id: any) => id)
    .flatMap((id: any) => (typeof id === 'string' ? id.split("|").map(Number) : [id]));

  const eligibletagIds = details
    .map((d: any) => d.event_id)
    .filter((id: any) => id)
    .flatMap((id: any) => (typeof id === 'string' ? id.split("|").map(Number) : [id]));

  const matchesProduct = eligibleProducts.includes(product.product_id);
  const matchesCategory = eligibleCategoryIds.includes(product.category_id);
  const matchesCollection = eligibleCollectionIds.some((id: number) =>
    product.collection_ids?.includes(id)
  );
  const matchesBrand = eligibleBrandIds.some((id: number) =>
    product.brand_ids?.includes(id)
  );
  const matchesSettingStyleType = eligibleSettingStyleTypeIds.some((id: number) =>
    product.setting_style_type_ids?.includes(id)
  );
  const matchesTag = eligibletagIds.some((id: number) =>
    product.tag_ids?.includes(id)
  );
  return matchesProduct || matchesCategory || matchesCollection || matchesBrand || matchesSettingStyleType || matchesTag;
};



// Function to calculate discount amount for a product
function calculateDiscountAmount(offer: any, price: any) {

  return offer.discount_type == couponType.FixedAmountDiscount ? offer.discount : (price * offer.discount) / 100;

}

// Function for Time Validation
const isOfferValidByTime = (offer: any, currentDateTime: Date): boolean => {
  const currentUTCDateTime = new Date(currentDateTime).toISOString();
  const [h, m, s] = offer.start_time.split(':');
  const startDate = new Date(`${offer.start_date}`).setUTCHours(h, m, s || 0, 0)
  const startDateTime = new Date(startDate).toISOString();
  // Handle weekly repetition (every_week_count)
  if (offer.every_week_count) {
    const weeksDifference = Math.floor((currentDateTime.getTime() - new Date(startDateTime).getTime()) / (1000 * 60 * 60 * 24 * 7));
    if (weeksDifference % offer.every_week_count !== 0) return false; // Not the right week
  }

  // Check if today is one of the valid days (from the days array)
  const today = new Date(currentDateTime).getDay();

  if (offer.days && !offer.days.includes(today)) return false;

  // Check if the offer has expired (based on end date and end time)
  if (offer.end_date && new Date(offer.end_date) < currentDateTime) return false;
  if (offer.end_time && new Date(`${offer.end_date} ${offer.end_time}`).toISOString() < currentUTCDateTime) return false;

  return true;
};