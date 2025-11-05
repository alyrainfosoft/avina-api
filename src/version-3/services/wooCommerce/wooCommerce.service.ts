import axios from "axios";
import {
  IMAGE_PATH,
  WOO_COMMERCE_CONSUMER_KEY,
  WOO_COMMERCE_CONSUMER_SECRET,
  WOO_COMMERCE_URL,
} from "../../../config/env.var";
import {
  WOO_COMMERCE_BAND_TONE,
  WOO_COMMERCE_CATEGORY,
  WOO_COMMERCE_HEAD_TONE,
  WOO_COMMERCE_PRODUCT_STATUS,
  WOO_COMMERCE_SHANK_TONE,
  WOO_COMMERCE_VERSION,
} from "../../../utils/app-constants";
import { resBadRequest, resSuccess } from "../../../utils/shared-functions";
import { Request, response } from "express";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import { IMAGE_TYPE } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS } from "../../../utils/app-messages";
import dbContext from "../../../config/db-context";

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const api = new WooCommerceRestApi({
  url: WOO_COMMERCE_URL,
  consumerKey: WOO_COMMERCE_CONSUMER_KEY,
  consumerSecret: WOO_COMMERCE_CONSUMER_SECRET,
  version: WOO_COMMERCE_VERSION, // Set the API version
});

const checkProduct = async (sku: string) => {
  let data;

  const params = {
    sku: sku,
  };

  await api
    .get("products", params)
    .then((response) => {
      data = response.data;
    })
    .catch((error) => {
      data = error.response;
    });

  return data;
};

const updateProduct = async (
  product_id: number,
  variant_id: any,
  data: any
) => {
  const response = await api
    .put(`products/${product_id}/variations/${variant_id}`, data)
    .then((response: any) => {
      return response.data;
    })
    .catch((error: any) => {
      return error.response.data;
    });

  return response.id;
};

const addProduct = async (data: any) => {
  const response = await api
    .post("products", data)
    .then((response: any) => {
      return response.data;
    })
    .catch((error: any) => {
      return error.response.data;
    });

  return response.id;
};

export const WooCommerce = async (req: Request) => {
  const {
    sku,
    price,
    product_title,
    sort_description,
    is_band,
    karat,
    metal,
    side_setting,
    shank,
    head,
    center_stone_clarity,
    center_stone_color,
    center_stone_shape,
    center_stone_size,
    center_stone,
    ring_no,
    shank_no,
    head_no,
    band_no,
    band_tone,
    head_tone,
    shank_tone,
  } = req.body;

  try {
    let imagePath = null;
    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        req.file,
        IMAGE_TYPE.ConfigProduct,
        null
      );
      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    const product = await checkProduct(sku);

    let product_Id;
    let variant_id: any;
    try {
      if (product.length > 0) {
        const variants = await api
          .get(`products/${product[0].id}/variations?per_page=100`)
          .then((response) => {
            return response.data;
          })
          .catch((error) => {
            return error.response.data;
          });

        const findSelectedVariant = variants.find(
          (t) =>
            t.attributes[0].option.toLowerCase() === band_tone.toLowerCase() &&
            t.attributes[1].option.toLowerCase() === head_tone.toLowerCase() &&
            t.attributes[2].option.toLowerCase() === shank_tone.toLowerCase()
        );

        const updateData = {
          regular_price: price,
          image: {
            src: IMAGE_PATH + "/" + imagePath,
          },
        };
        product_Id = product[0].id;
        await updateProduct(product[0].id, findSelectedVariant.id, updateData);
        variant_id = findSelectedVariant.id;
      } else {
        if (req.file) {
          const attributes = await api
            .get("products/attributes")
            .then((response) => {
              return response.data.filter(
                (t) =>
                  t.name.toLowerCase() === "bandtone" ||
                  t.name.toLowerCase() === "shanktone" ||
                  t.name.toLowerCase() === "headtone"
              );
            })
            .catch((error) => {
              return error;
            });

          const product = await addProduct({
            name: product_title,
            type: "variable",
            regular_price: price,
            description: sort_description,
            short_description: sort_description,
            stock_status: "instock",
            manage_stock: false,
            status: WOO_COMMERCE_PRODUCT_STATUS,
            sku: sku,
            attributes: attributes.map((t) => ({
              id: t.id,
              name: t.name,
              visible: true,
              variation: true,
              options:
                t.name.toLowerCase() === "bandtone"
                  ? WOO_COMMERCE_BAND_TONE
                  : WOO_COMMERCE_HEAD_TONE,
            })),
            categories: [
              {
                id: WOO_COMMERCE_CATEGORY,
              },
            ],
            images: [
              {
                src: IMAGE_PATH + "/" + imagePath,
              },
            ],
            catalog_visibility: "hidden",
            meta_data: [
              { key: "is_band", value: is_band },
              { key: "product_karat", value: karat },
              { key: "product_metal", value: metal },
              { key: "product_side_setting", value: side_setting },
              { key: "product_shank", value: shank },
              { key: "product_head", value: head },
              { key: "center_stone_clarity", value: center_stone_clarity },
              { key: "center_stone_color", value: center_stone_color },
              { key: "center_stone_size", value: center_stone_size },
              { key: "center_diamond_shape", value: center_stone_shape },
              { key: "center_stones", value: center_stone },
              { key: "ring_no", value: ring_no },
              { key: "shank_no", value: shank_no },
              { key: "head_no", value: head_no },
              { key: "band_no", value: band_no },
            ],
          });
          product_Id = product;
          function generateCombinations() {
            const combinations = [];
            for (let band of WOO_COMMERCE_BAND_TONE) {
              for (let head of WOO_COMMERCE_HEAD_TONE) {
                for (let shank of WOO_COMMERCE_SHANK_TONE) {
                  combinations.push({
                    regular_price: price,
                    attributes: [
                      { id: attributes[0].id, option: band },
                      { id: attributes[1].id, option: head },
                      { id: attributes[2].id, option: shank },
                    ],
                  });
                }
              }
            }

            return combinations;
          }
          if (product_Id) {
            const variations = generateCombinations();

            const createVariationRequests = variations.map(
              async (variation) => {
                const data = await api
                  .post(`products/${product_Id}/variations`, variation)
                  .then((response: any) => {
                    return response.data;
                  })
                  .catch((error: any) => {
                    return error;
                  });

                if (
                  variation.attributes[0].option.toLowerCase() ===
                    band_tone.toLowerCase() &&
                  variation.attributes[1].option.toLowerCase() ===
                    head_tone.toLowerCase() &&
                  variation.attributes[2].option.toLowerCase() ===
                    shank_tone.toLowerCase()
                ) {
                  variant_id = data.id;
                }
                return data;
              }
            );

            // Execute all requests concurrently
            await Promise.all(createVariationRequests);
          }
        }
      }
    } catch (error) {
      throw error;
    }

    return resSuccess({ data: { product_Id, variant_id } });
  } catch (error) {
    throw error;
  }
};
