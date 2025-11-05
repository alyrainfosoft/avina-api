import { Request } from "express";
import { ActiveStatus, condition, couponType, DeletedStatus, isCombined, offerType, userSegments } from "../../utils/app-enumeration";
import { getLocalDate, resSuccess, resUnknownError } from "../../utils/shared-functions";
import { QueryTypes } from "sequelize";
import { initModels } from "../model/index.model";
import app from "../../config/app";

export const applyOfferWithBuyOneGetOne = async (req: Request, cart_list: any, client_id: number) => {
  // const cart:any = req.body;
  try {
    const cartItems = cart_list.cart_list;
    // Fetch active offers
    const activeOffers: any = await fetchActiveOffers(req);
    // Separate product and order offers
    const productOffers = activeOffers.filter(
      (offer: any) => offer.offer_type === `${offerType.ProductType}` );
    const productBuyXGetYOffers = activeOffers.filter(
      (offer: any) => offer.offer_type === `${offerType.BuyXGetY}`
    );
    const orderOffers = activeOffers.filter(
      (offer: any) => offer.offer_type === `${offerType.OrderType}`
    );

    // Track applied offers
    const appliedOffersSet = new Set();
    let updatedCart: any = [];

    if (!cartItems) {
      return resSuccess({ data: cartItems });
    }

      // Apply the best offers to the cart and get the updated cart
     applyBestBuyXGetYOffersToCart(cartItems, productBuyXGetYOffers,cart_list.sub_total);

      // Step 1: Loop through each product to apply the best applicable offer
    for (let i = 0; i < cartItems.length; i++) {
      let item = cartItems[i].dataValues;
      let appliedOffers: any = [];
      let totalDiscount = 0;
      // Step 2: Get applicable product offers for this item
      const applicableProductOffers: any = await getProductOffersForId(
        productOffers,
        item.product_id,
        item.product_price,
        req?.body?.session_res?.id_app_user,
        req
      );

      let bestOffer: any = null;
      let bestDiscount = 0;

      // Step 3: Loop through the applicable offers and compare discounts
      for (let k = 0; k < applicableProductOffers.length; k++) {
        const offer = applicableProductOffers[k];

        // Check if the offer has already been applied to another product
        if (appliedOffersSet.has(offer.offer_id)) {

          // console.log(`Offer ID: ${offer.offer_id} has already been applied.`);

          // Find the other product with this offer applied
          const otherAppliedProduct = updatedCart.find((item: any) =>
            item.appliedOffers.some((appliedOffer: any) => appliedOffer.offer_id === offer.offer_id)
          );

          if (otherAppliedProduct) {
            
            const filteredOffers = productOffers.filter((offer1: any) => offer1.offer_id !== offer.offer_id);

            // Apply this offer if it hasn't been applied yet
            const currentProductWithSameOffer = calculateDiscountAmount(offer, item.product_price/item.quantity);
            const alreadyApplyProductWithSameOffer = calculateDiscountAmount(offer, otherAppliedProduct.product_price/otherAppliedProduct.quantity);

            // Compare offers between two products and select the best one
            let currentProductSecoundBestOffer = await getBestOfferForProduct(item, filteredOffers, req?.body?.session_res?.id_app_user,req);
            let alreadyApplyProductSecoundBestOffer = await getBestOfferForProduct(otherAppliedProduct, filteredOffers, req?.body?.session_res?.id_app_user, req);

            if(Number(currentProductWithSameOffer) + Number(alreadyApplyProductSecoundBestOffer.discount) > Number(currentProductSecoundBestOffer.discount) + Number(alreadyApplyProductWithSameOffer)){
            // Remove offer from the other product
            otherAppliedProduct.appliedOffers = otherAppliedProduct.appliedOffers.filter(
              (appliedOffer: any) => appliedOffer.offer_id !== offer.offer_id
            );
            
            bestDiscount = Number(currentProductWithSameOffer);
            bestOffer = {offer_name:offer.offer_name,offer_id:offer.offer_id,discount:offer.discount,discount_type:offer.discount_type};
            
              cart_list.sub_total -= Number(otherAppliedProduct.after_discount_product_price);
              otherAppliedProduct.after_discount_product_price = otherAppliedProduct.product_price - alreadyApplyProductSecoundBestOffer.discount
              otherAppliedProduct.appliedOffers.push({offer_name:alreadyApplyProductSecoundBestOffer.offer.offer_name,offer_id:alreadyApplyProductSecoundBestOffer.offer.offer_id,discount:alreadyApplyProductSecoundBestOffer.offer.discount,discount_type:alreadyApplyProductSecoundBestOffer.offer.discount_type});
              cart_list.sub_total += Number(otherAppliedProduct.after_discount_product_price);
            
            }else if(currentProductWithSameOffer + alreadyApplyProductSecoundBestOffer.discount < currentProductSecoundBestOffer.discount + alreadyApplyProductWithSameOffer){
              
              bestDiscount = Number(currentProductSecoundBestOffer.discount);
              bestOffer = {offer_name:currentProductSecoundBestOffer.offer.offer_name,offer_id:currentProductSecoundBestOffer.offer.offer_id,discount:currentProductSecoundBestOffer.offer.discount,discount_type:currentProductSecoundBestOffer.offer.discount_type};

            }
          }

        } else {
          // Apply this offer if it hasn't been applied yet
          const discount = calculateDiscountAmount(offer, item.product_price);
          if (discount > bestDiscount) {
            bestDiscount = Number(discount);
            bestOffer = {offer_name:offer.offer_name,offer_id:offer.offer_id,discount:offer.discount,discount_type:offer.discount_type};
          }
        }
      }
      // find the best BuyXGetY offer for this item
      item = await findBestBuyXGetYOffers(item)
      console.log("============bestDiscount", bestDiscount)
      console.log("============bestDiscount", bestOffer)

      // Apply the best offer's discount
      // If a best offer is found and its discount is greater than the BuyXGetY discount, apply the best offer
      if (bestOffer && Number(bestDiscount) > (item.appliedOffers[0]?.discount || 0)) {
        totalDiscount = Number(bestDiscount);
        appliedOffers.push(bestOffer);
        appliedOffersSet.add(bestOffer.offer_id); // Track this offer as applied
      } else {
        // Otherwise, use the BuyXGetY discount if present
        totalDiscount = item.product_price - item.after_by_get_discount_product_price;
        appliedOffers = item.appliedOffers || [];
        // Add existing offer IDs to the Set to avoid duplicates
        appliedOffers.forEach((offer: any) => appliedOffersSet.add(offer.offer_id));
      }
      // Update cart item with the applied discount
      item.after_discount_product_price = item.product_price - totalDiscount;
      item.appliedOffers = appliedOffers;
      cart_list.sub_total -= Number(totalDiscount);

      updatedCart.push({
        ...item,
      });
    }

    cart_list.cart_list = updatedCart;

    // Calculate the final cart totals
    let cartSubtotal = cart_list.sub_total;
    let cartTotalQuantity =cart_list.cart_total_quantity;

    // Apply order-level offers
    let orderDiscount = 0;
    let appliedOrderOffers = [];
    for (let j = 0; j < orderOffers.length; j++) {
      const offer = orderOffers[j];

      // Skip invalid order offers based on cart criteria
      if (
        (offer.cart_total_amount && cartSubtotal < offer.cart_total_amount) ||
        (offer.cart_total_quantity && cartTotalQuantity < offer.cart_total_quantity)
      )
        continue;
      // Skip offers based on time, eligibility, or usage limits

      if (!isOfferValidByTime(offer, getLocalDate())) continue;

      if (!isUserEligible(offer, req?.body?.session_res?.id_app_user, req)) continue;

      if (!isUseageLimit(offer, req?.body?.session_res?.id_app_user, req)) continue;

      // Apply discount for valid order offers
      orderDiscount += Number(calculateDiscountAmount(offer, cartSubtotal));

      appliedOrderOffers.push({offer_name:offer.offer_name,offer_id:offer.offer_id,discount:offer.discount,discount_type:offer.discount_type})
    }
    const finalOrderPrice = cartSubtotal - orderDiscount;
    cart_list.cart_list = updatedCart;
    cart_list.orderDiscount = orderDiscount;
    cart_list.appliedOrderOffers = appliedOrderOffers;
    cart_list.finalOrderPrice = finalOrderPrice > 0 ? finalOrderPrice : 0;
    return resSuccess({
      data: cart_list,
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
const fetchActiveOffers = async (req: any) => {
  // console.log('-----------------------------fetchActiveOffers is calling-------------------------');

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
      GROUP BY offers.id`;
  
  return await req.body.db_connection.query(activeOffersQuery, { type: QueryTypes.SELECT });
};

function applyBestBuyXGetYOffersToCart(cart: any, offers: any, sub_total: any) {
  let appliedOffers: any = {}; // To track how many times each offer has been applied

  // Loop through each offer in the offers array
  offers.forEach((offer: any) => {
    // If the offer is of type "buy_x_get_y"
    if (offer.offer_type === offerType.BuyXGetY) {
      
      // Initialize tracking for this offer if not already
      if (!appliedOffers[offer.offer_id]) {
        appliedOffers[offer.offer_id] = 0;
      }

      // Check if the offer has already reached its limit for application
      if (appliedOffers[offer.offer_id] >= offer.bxgy_allocation_limit) {
        return; // Skip this offer if it has reached the max allowed applications
      }

      // Find all matching "buy" products in the cart
      let buyProducts = cart.filter((product: any) =>
        offer.buys_offer_details.some((buyDetail: any) => product.dataValues.product_id === buyDetail.product_id)
      );


      
      // Find all matching "get" products in the cart
      let getProducts = cart.filter((product: any) =>
        offer.gets_offer_details.some((getDetail: any) => product.dataValues.product_id === getDetail.product_id)
      );


      // If there are no matching "buy" or "get" products, skip this offer
      if (buyProducts.length === 0 || getProducts.length === 0) {
        return;
      }

     
      // Sort buy products by price in descending order (higher price first)
      buyProducts.sort((a: any, b: any) => b.dataValues.product_price - a.dataValues.product_price);


      // Sort get products by price in ascending order (cheaper price first)
      getProducts.sort((a: any, b: any) => a.dataValues.product_price - b.dataValues.product_price);

      let appliedCount = 0;  // To track how many times we've applied the offer

      // Loop through each applicable buy product
      for (let i = 0; i < buyProducts.length; i++) {

        let buyProduct = buyProducts[i].dataValues;
        let remainingBuyQuantity = buyProduct.quantity;

        // Loop through each applicable get product
        for (let j = 0; j < getProducts.length; j++) {
          let getProduct = getProducts[j].dataValues;
          let remainingGetQuantity = getProduct.quantity;
            console.log("remainingGetQuantity", remainingBuyQuantity, offer.bxgy_customer_buys_quantity,remainingGetQuantity, offer.bxgy_customer_gets_quantity )

          // Apply the offer iteratively based on the buy and get product quantities
          while (
            remainingBuyQuantity >= offer.bxgy_customer_buys_quantity &&
            remainingGetQuantity >= offer.bxgy_customer_gets_quantity
          ) {

            if (getProduct.product_id == buyProduct.product_id) {
              if(!(remainingBuyQuantity >= (offer.bxgy_customer_buys_quantity + offer.bxgy_customer_gets_quantity)) ) {
                break // Stop applying the offer if the "get" product has less quantity than required
                
              }
            }

            // Only apply the offer if there are enough "get" products

            const discountAmount = calculateDiscountOfBuyXGetY(getProduct, offer);
            console.log("discountAmount", getProduct.product_price - discountAmount)

            // Reduce the price of the get product
            getProduct.after_by_get_discount_product_price = getProduct.after_by_get_discount_product_price && getProduct.after_by_get_discount_product_price != undefined
              ? getProduct.after_by_get_discount_product_price - discountAmount
              : getProduct.product_price - discountAmount;
            sub_total -= discountAmount;


            // Add the applied offer details to the "get" product
            if (!getProduct.appliedOffers) {
              getProduct.appliedOffers = [];
            }
            getProduct.appliedOffers.push({
              offer_id: offer.offer_id,
              offer_name: offer.offer_name,
              discount_type: offer.bxgy_discount_value_type,
              discount: discountAmount,
            });

            // Add the applied offer details to the "buy" product
            if (!buyProduct.appliedOffers) {
              buyProduct.appliedOffers = [];
            }
            // If the "buy" product matches the "get" product, apply the discount to the "buy" product
            if (getProduct.product_id == buyProduct.product_id) {
              buyProduct.after_by_get_discount_product_price = buyProduct.product_price - discountAmount;
            // If the "buy" product is different, keep its original price
            } else {
              buyProduct.after_by_get_discount_product_price = buyProduct.product_price;
            }
            buyProduct.appliedOffers.push({
              offer_id: offer.offer_id,
              offer_name: offer.offer_name,
              discount_type: offer.bxgy_discount_value_type,
              discount: discountAmount,
            });

            // Reduce the quantity of "Buy" and "Get" products
            remainingBuyQuantity -= offer.bxgy_customer_buys_quantity;
            remainingGetQuantity -= offer.bxgy_customer_gets_quantity;
            // Increment the applied offer count
            appliedCount++;


            // If we've reached the allocation limit, break the loop
            if (appliedCount >= offer.bxgy_allocation_limit) {
              break;
            }

          }

        }

        // If we've reached the allocation limit, break the loop
        if (appliedCount >= offer.bxgy_allocation_limit) {
          break;
        }

      }

      // Track that the offer has been applied
      appliedOffers[offer.offer_id]++;
    }
  });

  // Return the updated cart with the applied discounts
  return { updatedCart: cart, sub_total };
}

// Function to get applicable offers for a given product ID
async function getProductOffersForId(productOffers:any,productId:any,product_price:any,id_app_user:any, req:any) {
  const applicableOffers = [];

  // Step 1: Filter the offers based on different conditions
  for (let j = 0; j < productOffers.length; j++) {
    const offer = productOffers[j];
    // Skip if the offer is not valid based on time conditions
    // if (!isOfferValidByTime(offer, getLocalDate())) {
    //   continue;
    // }

    // Skip if the user is not eligible for the offer
    if (!isUserEligible(offer, id_app_user, req)) {
      continue;
    }

    // Skip if the usage limit has been exceeded
    if (!isUseageLimit(offer, id_app_user, req)) {
      continue;
    }

    // Check if the product matches the offer criteria (e.g., product category or ID)
    const isEligible = await isProductEligible(offer, productId, req);
    if (!isEligible) {
      // console.log(`Product ID: ${productId} is not eligible for Offer ID: ${offer.offer_id}`);
      continue; // Skip this offer if the product is not eligible
    }

    // Check if the product price is within the offer's allowed range
    if ((offer.min_price && product_price < offer.min_price) || (offer.max_price && product_price > offer.max_price)) {
      continue; // Skip this offer if the product price doesn't match the offer conditions
    }

    // If all conditions are met, add this offer to the applicable offers list
    applicableOffers.push(offer);
  }

  // Return the list of applicable offers for this product
  return applicableOffers;
}
// Function to calculate discount amount for a product
function calculateDiscountAmount(offer: any, price: any) {

  return offer.discount_type == couponType.FixedAmountDiscount ? offer.discount : (price * offer.discount) / 100;

}

// Helper function to get the best offer for a product
async function getBestOfferForProduct(item: any, productOffers: any, userId: any, req: any) {
  const applicableOffers = await getProductOffersForId(productOffers, item.product_id, item.product_price/item.quantity, userId, req);

  let bestOffer = null;
  let bestDiscount = 0;

  for (const offer of applicableOffers) {
    const discount = calculateDiscountAmount(offer, item.product_price/item.product_price/item.quantity);
    if (discount > bestDiscount) {
      bestDiscount = discount;
      bestOffer = offer;
    }
  }

  return { offer: bestOffer, discount: bestDiscount };
}
// Function to validate user eligibility for an offer
const isUserEligible = async (offer: any, user_id: any, req: any): Promise<any> => {
  // console.log('-----------------------------isUserEligible is calling-------------------------');
  // If the offer is available to all users, return true
  if (offer.all_user === isCombined.YES) {
    return true;

    // If the offer is available to specific user segments
  } else if (offer.specific_user_segments === isCombined.YES) {
    // Loop through the eligible customers to find matching user segments
    for (const eligible_customer of offer.eligible_customers) {
      // Check if the user is in a valid segment using the helper function
      const isEligible = await isUserInSegment(user_id, eligible_customer, req);
      if (isEligible) {
        return true; // User is eligible for this segment
      }
    }
    return false; // No valid segment found for the user

    // If the offer is for a specific user (based on user_id)
  } else if (offer.specific_user === isCombined.YES) {
    // Check if the user's id matches any of the eligible customers
    for (const eligible_customer of offer.eligible_customers) {
      if (eligible_customer.user_id === user_id) {
        return true; // User is eligible for this specific offer
      }
    }
  }

  // If none of the conditions matched, the user is not eligible
  return false;
};

// Helper function to check if the user belongs to a specific segment
const isUserInSegment = async (user_id: any, eligible_customer: any, req: any): Promise<any> => {

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

// Simulate a database query function to get user data from the `app_user` table
const getUserDataFromDB = async (user_id: any, req: any): Promise<any> => {
  const { AppUser } = initModels(req); // Assuming AppUser is the model for the app_user table
  // Example: Replace with actual query to fetch the user data
  const userDatabase = await AppUser.findAll({ where: { id: user_id } });

  return userDatabase.find((user: any) => user.id === user_id);
};

// Function to check if the user is eligible for the offer based on the usage limits
const isUseageLimit = async (offer: any, user_id: any, req): Promise<any> => {
  // console.log('-----------------------------isUseageLimit is calling-------------------------');

  // 1. Check total usage limit for the offer
  const totalUsage = await getTotalOfferUsageCount(offer.offer_id, req); // Replace with actual DB query

  // If the total usage exceeds the total usage limit, the offer is no longer valid
  if (offer.total_number_of_usage_limit !== null && totalUsage >= offer.total_number_of_usage_limit) {
    return false; // Offer has reached its total usage limit
  }

  // 2. Check user-specific usage limit
  const userUsageCount = await getUserOfferUsageCount(user_id, offer.offer_id, req); // Replace with actual DB query

  // If the user has exceeded the usage limit, they are not eligible
  if (offer.per_user_usage_limit !== null && userUsageCount >= offer.per_user_usage_limit) {
    return false; // User has exceeded the usage limit for this offer
  }

  // If both checks pass, the user is eligible for the offer
  return true;
};

// Simulate a database query function to count the total usage of the offer (by all users)
const getTotalOfferUsageCount = async (offer_id: any, req: any): Promise<any> => {
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
const getUserOfferUsageCount = async (user_id: any, offer_id: any, req:any): Promise<any> => {
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
    type: QueryTypes.SELECT
  });
  // Count the number of times the user has used this offer
  const userUsage = orderDatabase.length;
  return userUsage;
};

// Function to calculate the discount based on the type (percentage or flat value)

/**
 * Calculates the discount for a "Buy X Get Y" offer based on the product and offer details.
 *
 * @param product - The product object containing details such as `product_id`, `product_price`, and `quantity`.
 * @param offer - The offer object containing details about the "Buy X Get Y" promotion, including:
 *   - `buys_offer_details`: Array of products required to buy.
 *   - `gets_offer_details`: Array of products the customer gets.
 *   - `bxgy_discount_value_type`: Type of discount ("1" for percentage, "2" for flat, "3" for free).
 *   - `bxgy_discount_value`: The value of the discount (percentage or flat amount).
 *   - `bxgy_customer_gets_quantity`: The quantity of products the customer gets.
 *
 * The function checks if the product is present in the "buys" and/or "gets" details of the offer,
 * and applies the discount logic accordingly:
 * - Percentage discount: Applies a percentage off the product price, possibly multiplied by the quantity received.
 * - Flat discount: Applies a flat amount off, possibly multiplied by the quantity received.
 * - Free: Makes the product free for the quantity received.
 *
 * @returns The calculated discount amount for the given product and offer.
 */
function calculateDiscountOfBuyXGetY(product: any, offer: any) {

  let discount = 0;
  // If the product is part of the "buys" offer details, calculate discount based on "gets" products and quantity
  if (offer.bxgy_discount_value_type === "1") { // Percentage discount

      discount = (product.product_price / product.quantity * parseInt(offer.bxgy_discount_value)) / 100 * offer.bxgy_customer_gets_quantity;

  } else if (offer.bxgy_discount_value_type === "2") { // Flat discount

      discount = parseInt(offer.bxgy_discount_value) * offer.bxgy_customer_gets_quantity

  } else if (offer.bxgy_discount_value_type === "3") { // free
      discount = (product.product_price / product.quantity) * offer.bxgy_customer_gets_quantity; 
  } 
  return discount;
}

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


// find the best buy x get y offers and apply them to the cart
const findBestBuyXGetYOffers = async (item: any) => { 
 
  const data = item.appliedOffers?.reduce((max, offer) => {
    return offer.discount > (max?.discount ?? -Infinity) ? offer : max;
  }, null)

  console.log('Best BuyXGetY Offer:', data);
  return {
    ...item,
    appliedOffers: data ? [data] : [],
    after_by_get_discount_product_price: data && item.after_by_get_discount_product_price != item.product_price ? item.product_price - data.discount : item.product_price
  };

}