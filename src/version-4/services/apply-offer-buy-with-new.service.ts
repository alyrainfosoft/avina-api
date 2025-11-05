import { Request } from "express";
import { ActiveStatus, condition, couponType, DeletedStatus, isCombined, offerType, userSegments } from "../../utils/app-enumeration";
import { getLocalDate, resSuccess, resUnknownError } from "../../utils/shared-functions";
import { QueryTypes } from "sequelize";
import { initModels } from "../model/index.model";
import app from "../../config/app";

export const applyOfferWithBuyNewOneGetOne = async (req: Request, cart_list: any, client_id: number) => {
  try {
    const cartItems = cart_list.cart_list.map((item: any) => {
      return {...item, dataValues: {...item.dataValues, product_price: Math.ceil(item.dataValues.product_price)}};
    });
    const activeOffers: any = await fetchActiveOffers(req);

    const productOffers = activeOffers.filter(
      (offer: any) => offer.offer_type === `${offerType.ProductType}`
    );
    const productBuyXGetYOffers = activeOffers.filter(
      (offer: any) => offer.offer_type === `${offerType.BuyXGetY}`
    );
    const orderOffers = activeOffers.filter(
      (offer: any) => offer.offer_type === `${offerType.OrderType}`
    );

    let updatedCart: any = [];
    const productDiscountedIds = new Set();

    if (!cartItems) {
      return resSuccess({ data: cartItems });
    }

    // --- 1. GROUP BuyXGetY OFFERS BY BUY/GET PRODUCT SET ---
    for (const offer of productBuyXGetYOffers) {
      offer._buyProductIds = offer.buys_offer_details.map((d: any) => d.product_id).sort();
      offer._getProductIds = offer.gets_offer_details.map((d: any) => d.product_id).sort();
      offer._groupKey = `${offer._buyProductIds.join(",")}|${offer._getProductIds.join(",")}`;
    }
    const uniqueGroupKeys = [...new Set(productBuyXGetYOffers.map(o => o._groupKey))];

    for (const groupKey of uniqueGroupKeys) {
      // All offers for this buy/get group
      const groupOffers = productBuyXGetYOffers.filter(o => o._groupKey === groupKey);

      // Find all eligible buy and get products in the cart for this group
      const buyProducts = cartItems.filter((item: any) =>
        groupOffers[0].buys_offer_details.some((d: any) => d.product_id === item.dataValues.product_id)
      );
      const getProducts = cartItems.filter((item: any) =>
        groupOffers[0].gets_offer_details.some((d: any) => d.product_id === item.dataValues.product_id)
      );
      if (!buyProducts.length || !getProducts.length) continue;
      const group = [...buyProducts, ...getProducts];
      if (group.some((item: any) => productDiscountedIds.has(item.dataValues.product_id))) continue;

      // --- For each BuyXGetY offer, calculate total discount ---
      let bxgyOfferResults: any[] = [];
      for (const offer of groupOffers) {
        let bxgyTotalDiscount = 0;
        let bxgyApplied: any[] = [];
        
        // Calculate total buy and get quantities
        const totalBuyQty = buyProducts.reduce((sum, item) => sum + (item.dataValues.quantity || 1), 0);
        const totalGetQty = getProducts.reduce((sum, item) => sum + (item.dataValues.quantity || 1), 0);

        if(!(totalBuyQty >= offer.bxgy_customer_buys_quantity &&
          totalGetQty >= offer.bxgy_customer_gets_quantity)) {
          continue; // Not enough quantity to apply this offer, skip it
        }
        // If buy and get product are the same, check combined quantity
        if (
          buyProducts.length === 1 &&
          getProducts.length === 1 &&
          buyProducts[0].dataValues.product_id === getProducts[0].dataValues.product_id
        ) {

          const combinedQty = totalBuyQty; // since buy and get are the same product
          if (!(combinedQty >= (offer.bxgy_customer_buys_quantity + offer.bxgy_customer_gets_quantity))) {
            continue; // Not enough quantity to apply the offer even once, skip this offer
          }
        }

        const cartProductIds = cartItems.map((item) => item.dataValues.product_id);
                const buyProductIds = offer._buyProductIds; // e.g., [A, B, C, D]
                const getProductIds = offer._getProductIds; // e.g., [W, X, Y, Z]
                // Step 1: Count matched buy products
                const matchedBuy = buyProductIds.filter(pid => cartProductIds.includes(pid));
                const unlockCount = matchedBuy.length;

                // Step 2: Find get products present in cart
                const getProductsInCart = cartItems.filter(item =>
                    getProductIds.includes(item.dataValues.product_id)
                );

                // Step 3: Sort get products in cart by price (ascending)
                const sortedGetProducts = getProductsInCart.sort(
                    (a, b) => a.dataValues.product_price - b.dataValues.product_price
                );
                
                // Step 4: Choose eligible get products to discount (lowest price first)
                const eligibleGetProductIds = sortedGetProducts
                    .slice(0, unlockCount)
                    .map(item => item.dataValues.product_id);

        for (const item of group) {
                    const productId = item.dataValues.product_id;
                    const isGetProduct = eligibleGetProductIds.includes(productId);
                    let discount = 0;

                    if (isGetProduct) {
                        discount = calculateDiscountOfBuyXGetY(item.dataValues, offer); // returns full price or % as per rule
                        bxgyTotalDiscount += discount;
                    }

                    bxgyApplied.push({
                        product_id: productId,
                        offer: {
                            offer_id: offer.offer_id,
                            offer_name: offer.offer_name,
                            description: offer.description,
                            discount_type: offer.bxgy_discount_value_type,
                            discount_value: offer.bxgy_discount_value,
                            discount: isGetProduct ? discount : 0,
                            bxgy_customer_buys_quantity: offer.bxgy_customer_buys_quantity,
                            bxgy_customer_gets_quantity: offer.bxgy_customer_gets_quantity,
                            is_bxgy: true,
                            
                        }
                    });
                }
        bxgyOfferResults.push({ offer, bxgyTotalDiscount, bxgyApplied });
      }

      // --- Pick the BuyXGetY offer with the highest total discount ---
      bxgyOfferResults.sort((a, b) => b.bxgyTotalDiscount - a.bxgyTotalDiscount);
      const bestBxgy = bxgyOfferResults[0];

      // --- Calculate best product offers scenario ---
      let productTotalDiscount = 0;
      let productApplied: any[] = [];

      // If best BuyXGetY is "free", only compare with buy product's best offer
      if (bestBxgy?.offer?.bxgy_discount_value_type === "3") {
        for (const item of buyProducts) {
          const applicableProductOffers: any = await getProductOffersForId(
            productOffers,
            item.dataValues.product_id,
            item.dataValues.product_price,
            req?.body?.session_res?.id_app_user,
            req
          );
          let bestProductOffer: any = null;
          let bestProductDiscount = 0;
          for (const prodOffer of applicableProductOffers) {
            const discount = calculateDiscountAmount(prodOffer, item.dataValues.product_price, );
            if (discount > bestProductDiscount) {
              bestProductDiscount = discount;
              bestProductOffer = prodOffer;
            }
          }
          if (bestProductOffer) {
            productTotalDiscount += bestProductDiscount;
            productApplied.push({
              product_id: item.dataValues.product_id,
              offer: {
                offer_id: bestProductOffer.offer_id,
                offer_name: bestProductOffer.offer_name,
                discount_type: bestProductOffer.discount_type,
                discount_value: bestProductOffer.discount,
                maximum_discount_amount: bestProductOffer.maximum_discount_amount,
                discount: bestProductDiscount,
                is_bxgy: false,
                description: bestProductOffer.description
              }
            });
          } else {
            productApplied.push({
              product_id: item.dataValues.product_id,
              offer: null
            });
          }
        }
        // For get products, no product offer is considered
        for (const item of getProducts) {
          productApplied.push({
            product_id: item.dataValues.product_id,
            offer: null
          });
        }
      } else {
        // Otherwise, consider best offer for both buy and get products
        for (const item of group) {
          const applicableProductOffers: any = await getProductOffersForId(
            productOffers,
            item.dataValues.product_id,
            item.dataValues.product_price,
            req?.body?.session_res?.id_app_user,
            req
          );
          let bestProductOffer: any = null;
          let bestProductDiscount = 0;
          for (const prodOffer of applicableProductOffers) {
            const discount = calculateDiscountAmount(prodOffer, item.dataValues.product_price);
            if (discount > bestProductDiscount) {
              bestProductDiscount = discount;
              bestProductOffer = prodOffer;
            }
          }
          if (bestProductOffer) {
            productTotalDiscount += bestProductDiscount;
            productApplied.push({
              product_id: item.dataValues.product_id,
              offer: {
                offer_id: bestProductOffer.offer_id,
                offer_name: bestProductOffer.offer_name,
                discount_type: bestProductOffer.discount_type,
                discount: bestProductDiscount,
                is_bxgy: false,
                discount_value: bestProductOffer.discount,
                maximum_discount_amount: bestProductOffer.maximum_discount_amount,
                description: bestProductOffer.description
              }
            });
          } else {
            productApplied.push({
              product_id: item.dataValues.product_id,
              offer: null
            });
          }
        }
      }

      // --- Decide which scenario to apply ---
      if (bestBxgy?.bxgyTotalDiscount >= productTotalDiscount) {
        // Apply best BuyXGetY
        for (const item of group) {
          const applied = bestBxgy.bxgyApplied.find(a => a.product_id === item.dataValues.product_id);
          item.dataValues.appliedOffers = applied && applied.offer ? [applied.offer] : [];
          item.dataValues.after_discount_product_price = item.dataValues.product_price - (applied?.offer?.discount || 0);
          if (applied?.offer?.discount) cart_list.sub_total -= Number(applied.offer.discount);
          productDiscountedIds.add(item.dataValues.product_id);
          updatedCart.push({ ...item.dataValues });
        }
      } else {
        // Apply best product offers
        for (const item of group) {
          const applied = productApplied.find(a => a.product_id === item.dataValues.product_id);
          item.dataValues.appliedOffers = applied && applied.offer ? [applied.offer] : [];
          item.dataValues.after_discount_product_price = item.dataValues.product_price - (applied?.offer?.discount || 0);
          if (applied?.offer?.discount) cart_list.sub_total -= Number(applied.offer.discount);
          productDiscountedIds.add(item.dataValues.product_id);
          updatedCart.push({ ...item.dataValues });
        }
      }
    }

    // --- 2. APPLY BEST PRODUCT OFFER TO REMAINING PRODUCTS ---
    for (const item of cartItems) {
      if (productDiscountedIds.has(item.dataValues.product_id)) continue;
      let appliedOffers: any = [];
      let totalDiscount = 0;
      const applicableProductOffers: any = await getProductOffersForId(
        productOffers,
        item.dataValues.product_id,
        item.dataValues.product_price,
        req?.body?.session_res?.id_app_user,
        req
      );
      let bestProductOffer: any = null;
      let bestProductDiscount = 0;
      for (const offer of applicableProductOffers) {
        const discount = calculateDiscountAmount(offer, item.dataValues.product_price);
        if (discount > bestProductDiscount) {
          bestProductDiscount = discount;
          bestProductOffer = offer;
        }
      }
      if (bestProductOffer) {
        appliedOffers.push({
          offer_id: bestProductOffer.offer_id,
          offer_name: bestProductOffer.offer_name,
          discount_type: bestProductOffer.discount_type,
          discount: bestProductDiscount,
          is_bxgy: false,
          discount_value: bestProductOffer.discount,
          maximum_discount_amount: bestProductOffer.maximum_discount_amount,
          description: bestProductOffer.description
        });
        totalDiscount = bestProductDiscount;
        productDiscountedIds.add(item.dataValues.product_id);
      }
      item.dataValues.after_discount_product_price = item.dataValues.product_price - totalDiscount;
      item.dataValues.appliedOffers = appliedOffers;
      cart_list.sub_total -= Number(totalDiscount);
      updatedCart.push({ ...item.dataValues });
    }

    // --- 3. ADD REMAINING PRODUCTS (NO PRODUCT DISCOUNT) ---
    for (const item of cartItems) {
      if (updatedCart.find((p: any) => p.product_id === item.dataValues.product_id)) continue;
      item.dataValues.after_discount_product_price = item.dataValues.product_price;
      item.dataValues.appliedOffers = [];
      updatedCart.push({ ...item.dataValues });
    }

    cart_list.cart_list = updatedCart;

    // --- 4. APPLY ORDER-LEVEL OFFERS ---
let cartSubtotal = cart_list.sub_total;
let cartTotalQuantity = cart_list.cart_total_quantity;

let bestOrderOffer = null;
let bestOrderDiscount = 0;

for (let j = 0; j < orderOffers.length; j++) {
  const offer = orderOffers[j];
  if (
    (offer.cart_total_amount && cartSubtotal < offer.cart_total_amount) ||
    (offer.cart_total_quantity && cartTotalQuantity < offer.cart_total_quantity)
  )
    continue;
  
  if (!isOfferValidByTime(offer, getLocalDate())) continue;
  if (!await isUserEligible(offer, req?.body?.session_res?.id_app_user, req)) continue;
  if (!await isUseageLimit(offer, req?.body?.session_res?.id_app_user, req)) continue;

  const discount = Number(calculateDiscountAmount(offer, cartSubtotal));
  if (discount > bestOrderDiscount && discount < cartSubtotal) {
    bestOrderDiscount = discount;
    bestOrderOffer = offer;
  }
}

let appliedOrderOffers = [];
if (bestOrderOffer) {
  appliedOrderOffers.push({
    offer_name: bestOrderOffer.offer_name,
    offer_id: bestOrderOffer.offer_id,
    discount_value: bestOrderOffer.discount,
    discount_type: bestOrderOffer.discount_type,
    discount: bestOrderDiscount,
    description: bestOrderOffer.description
  });
}
    // Remove full duplicates from updatedCart
    updatedCart = removeFullDuplicates(updatedCart);
    
    const finalOrderPrice = cartSubtotal - bestOrderDiscount;
    cart_list.cart_list = updatedCart;
    cart_list.orderDiscount = bestOrderDiscount;
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

// ...helper functions unchanged...
// Function to fetch all active offers
export const fetchActiveOffers = async (req: any) => {
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

function calculateDiscountOfBuyXGetY(product: any, offer: any) {
  let discount = 0;
  // If the product is part of the "buys" offer details, calculate discount based on "gets" products and quantity
  if (offer.bxgy_discount_value_type === "1") { // Percentage discount
    const perDiscount = (product.product_price / product.quantity * parseInt(offer.bxgy_discount_value)) / 100;
      discount = (perDiscount > offer.maximum_discount_amount ? offer.maximum_discount_amount : perDiscount) * offer.bxgy_customer_gets_quantity;
  } else if (offer.bxgy_discount_value_type === "2") { // Flat discount
      discount = parseInt(offer.bxgy_discount_value) * offer.bxgy_customer_gets_quantity
  } else if (offer.bxgy_discount_value_type === "3") { // free
      discount = (product.product_price / product.quantity) * offer.bxgy_customer_gets_quantity; 
  } 
  return discount;
}

export const getProductOffersForId = async (productOffers:any,productId:any,product_price:any,id_app_user:any, req:any) => {
  const applicableOffers = [];
  if (productOffers.length > 0) {
    for (let j = 0; j < productOffers.length; j++) {
      const offer = productOffers[j];
    if (!isOfferValidByTime(offer, getLocalDate())) continue;
    if (!isUserEligible(offer, id_app_user, req)) continue;
    if (!isUseageLimit(offer, id_app_user, req)) continue;
    const isEligible = await isProductEligible(offer, productId, req);
    if (!isEligible) continue;
    if ((offer.min_price && product_price < offer.min_price) || (offer.max_price && product_price > offer.max_price)) {
      continue;
    }
    applicableOffers.push(offer);
  }
  }

  return applicableOffers;
}

export function calculateDiscountAmount(offer: any, price: any) {
  return offer?.discount_type == couponType.FixedAmountDiscount ? offer?.discount : (price * offer?.discount) / 100 > offer?.maximum_discount_amount ? offer?.maximum_discount_amount : (price * offer?.discount) / 100;
}

const isUserEligible = async (offer: any, user_id: any, req: any): Promise<any> => {
  if (offer.all_user === isCombined.YES) {
    return true;
  } else if (offer.specific_user_segments === isCombined.YES) {
    for (const eligible_customer of offer.eligible_customers) {
      const isEligible = await isUserInSegment(user_id, eligible_customer, req);
      if (isEligible) {
        return true;
      }
    }
    return false;
  } else if (offer.specific_user === isCombined.YES) {
    for (const eligible_customer of offer.eligible_customers) {
      if (eligible_customer.user_id === user_id) {
        return true;
      }
    }
  }
  return false;
};

const isUserInSegment = async (user_id: any, eligible_customer: any, req: any): Promise<any> => {
  const userData = await getUserDataFromDB(user_id, req);
  if (!userData) {
    return false;
  }
  if (eligible_customer.user_segments === userSegments.New) {
    if (userData.user_status === 2) {
      return true;
    }
  }
  return false;
};

const getUserDataFromDB = async (user_id: any, req: any): Promise<any> => {
  const { AppUser } = initModels(req);
  const userDatabase = await AppUser.findAll({ where: { id: user_id } });
  return userDatabase.find((user: any) => user.id === user_id);
};

const isUseageLimit = async (offer: any, user_id: any, req): Promise<any> => {
  const totalUsage = await getTotalOfferUsageCount(offer.offer_id, req);
  if (offer.total_number_of_usage_limit !== null && totalUsage >= offer.total_number_of_usage_limit) {
    return false;
  }
  const userUsageCount = await getUserOfferUsageCount(user_id, offer.offer_id, req);
  if (offer.per_user_usage_limit !== null && userUsageCount >= offer.per_user_usage_limit) {
    return false;
  }
  return true;
};

const getTotalOfferUsageCount = async (offer_id: any, req: any): Promise<any> => {
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
  const totalUsage = orderDatabase.length;
  return totalUsage;
};

const getUserOfferUsageCount = async (user_id: any, offer_id: any, req:any): Promise<any> => {
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
    replacements: { user_id: user_id ? user_id : 207, offer_id: offer_id },
    type: QueryTypes.SELECT
  });
  const userUsage = orderDatabase.length;
  return userUsage;
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
  if (!productDetails.length) return false;
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


function removeFullDuplicates(cartList) {
  const seen = new Set();
  const uniqueCart = [];

  for (const item of cartList) {
    const str = JSON.stringify(item);

    if (!seen.has(str)) {
      seen.add(str);
      uniqueCart.push(item);
    }
  }

  return uniqueCart;
}

// Function for Time Validation
const isOfferValidByTime = (offer: any, currentDateTime: Date): boolean => {
  const currentUTCDateTime = new Date(currentDateTime).toISOString();
  const [h, m, s] = offer?.start_time?.split(':');
  const startDate = new Date(`${offer?.start_date}`).setUTCHours(h, m, s || 0, 0)
  const startDateTime = new Date(startDate).toISOString();
  // Handle weekly repetition (every_week_count)
  if (offer.every_week_count) {
    const weeksDifference = Math.floor((currentDateTime.getTime() - new Date(startDateTime).getTime()) / (1000 * 60 * 60 * 24 * 7));
    if (weeksDifference % offer?.every_week_count !== 0) return false; // Not the right week
  }

  // Check if today is one of the valid days (from the days array)
  const today = new Date(currentDateTime).getDay();

  if (offer?.days && !offer?.days.includes(today)) return false;

  // Check if the offer has expired (based on end date and end time)
  if (offer?.end_date) {
     const [eh, em, es] = offer?.end_time ? offer?.end_time?.split(':') : "00:00:00";
  const endDate = new Date(`${offer?.end_date}`).setUTCHours(eh, em, es || 0, 0)
  const endDateTime = new Date(endDate).toISOString();

  if (offer?.end_date && new Date(offer?.end_date) < currentDateTime) return false;
  if (offer?.end_time && endDateTime < currentUTCDateTime) return false;

  }

  return true;
};