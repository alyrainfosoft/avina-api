import { Request } from "express";
import {
  getDecryptedText,
  getEncryptedText,
  prepareMessageFromParams,
  resBadRequest,
  resSuccess,
  resUnknownError,
  shopify,
} from "../../../utils/shared-functions";
import Shopify from "shopify-api-node";
import { config } from "dotenv";
import https from "https";
import axios from "axios";
import request from "request";
import fs from "fs";
import {
  BAD_REQUEST_CODE,
  DEFAULT_STATUS_CODE_SUCCESS,
  DEFAULT_STATUS_SUCCESS,
  REQUIRED_ERROR_MESSAGE,
} from "../../../utils/app-messages";

import crypto from "crypto";
import {
  CIPHER_ALGORITHM,
  SHOPIFY_STORE_KEY_LIST,
} from "../../../utils/app-constants";
import { CRYPTO_JS_IV } from "../../../config/env.var";
import {
  ECommerce_Type,
  SHOPIFY_STORE_KEY,
} from "../../../utils/app-enumeration";
import { WooCommerce } from "../wooCommerce/wooCommerce.service";
import { valigaraProductManage } from "../valigara/valigara.service";
const makeShopifyAPICall = async (
  shop: any,
  storefrontAccessToken: any,
  req: any,
  collection: any
) => {
  const query = `query  {

    collection(handle: "${collection}") {
  
      handle
  
      products(first: 10, filters: [
        {productMetafield: {namespace: "tcc", key: "center_stones", value: "${req.body.center_stone}"}},
        {productMetafield: {namespace: "tcc", key: "center_diamond_shape", value: "${req.body.center_stone_shape}"}},
        {productMetafield: {namespace: "tcc", key: "center_stone_size", value: "${req.body.center_stone_size}"}},
        {productMetafield: {namespace: "tcc", key: "center_stone_color", value: "${req.body.center_stone_color}"}},
        {productMetafield: {namespace: "tcc", key: "center_stone_clarity", value: "${req.body.center_stone_clarity}"}},
        {productMetafield: {namespace: "tcc", key: "product_head", value: "${req.body.head}"}},
        {productMetafield: {namespace: "tcc", key: "product_shank", value: "${req.body.shank}"}},
        {productMetafield: {namespace: "tcc", key: "product_metal", value: "${req.body.metal}"}},
        {productMetafield: {namespace: "tcc", key: "product_karat", value: "${req.body.karat}"}},
        {productMetafield: {namespace: "tcc", key: "is_band", value: "${req.body.is_band}"}},
        {productMetafield: {namespace: "tcc", key: "product_side_setting", value: "${req.body.side_setting}"}},
      ]
         )
  
             {
  
              edges {
  
               node {
  
                handle
                id
                title
               variants (first: 2) {
                edges {
                  cursor
                  node {
                    id
                    title    
                  }
                }
               }
  
             }
  
            }
  
           }
  
          }
  
         }`;
  const url = `https://${shop}/api/graphql`;

  const requestBody = JSON.stringify({
    query: query,
  });

  const data = await axios({
    url: url,
    method: "POST",
    data: requestBody,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
  })
    .then((response) => {
      console.log(response.data);
      return resSuccess({ data: response.data });
    })
    .catch((error) => {
      return resUnknownError({ data: error });
    });
  return data;
};

export const productListShopifyProduct = async (req: Request) => {
  try {
    if (req.body.ecommerce_type == ECommerce_Type.Shopify) {
      let storefrontAccessToken;

      let shop;

      let pass;

      let apiKey;

      let collection;

      let publicationId;

      let collectionId;

      if (SHOPIFY_STORE_KEY.THE_CADCO_APP === req.body.app_name) {
        storefrontAccessToken = "5a9b85a961f1370236d99614eea7869c";
        shop = "quickstart-3c059c30.myshopify.com";
        pass = "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";
        apiKey = "3faeb2b987bba5ae420211b1fe70434e";
        collection = "frontpage";
        (publicationId = 181933474081), (collectionId = 453287149857);
      } else if (SHOPIFY_STORE_KEY.ZAMELS_APP === req.body.app_name) {
        storefrontAccessToken = "8d1a60b3f2ff303d8a5ecc5ab149b7db";
        shop = "zamels-development.myshopify.com";
        pass = "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";
        apiKey = "a51c3ecfabfb08732339d02dc1631bcc";
        collection = "configurator";
        publicationId = 107013243118;
        collectionId = 417273184494;
      } else if (SHOPIFY_STORE_KEY.MAZZUCCHELLIS_APP === req.body.app_name) {
        storefrontAccessToken = "c2bb00218af687d56efbf79a0dee43db";
        shop = "mazzucchellis-dev.myshopify.com";
        pass = "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";
        apiKey = "8ec3fa36ed982c19d4fc2359900953d6";
        collection = "configurator";
        publicationId = 83920355394;
        collectionId = 268624887874;
      }

      const productFind = await makeShopifyAPICall(
        shop,
        storefrontAccessToken,
        req,
        collection
      );

      if (productFind.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return productFind;
      }

      if (productFind.code == DEFAULT_STATUS_CODE_SUCCESS) {
        if (productFind.data.data.collection.products.edges.length <= 0) {
          const data: any = await addShopifyProductAllData(
            apiKey,
            pass,
            shop,
            req
          );
          if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return data;
          }

          const publicProduct = await publicShopifyProductStatus(
            shop,
            pass,
            data.data.product.variants[0].product_id,
            req,
            publicationId
          );
          if (publicProduct.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return publicProduct;
          }
          const productCollection = await addProductCollection(
            apiKey,
            pass,
            shop,
            data.data.product.id,
            collectionId
          );
          if (productCollection.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return productCollection;
          }

          // const productImage:any = await  addShopifyProductImages(apiKey, pass, shop, data.data.product.id, req)

          // if (productImage.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          //   return productImage;
          // }

          // const productMetafield:any = await addShopifyProductMetalField(apiKey, pass, shop, data.data.product.id, req)
          // if (productMetafield.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          //   return productMetafield;
          // }

          return resSuccess({
            data: {
              variant_id: data.data.product.variants[0].id,
              product_id: data.data.product.variants[0].product_id,
            },
          });
        } else {
          let variantsId =
            productFind.data.data.collection.products.edges[0].node.variants
              .edges[0].node.id;

          const variantUpdate = await updateShopifyProductPrice(
            apiKey,
            pass,
            shop,
            variantsId,
            productFind.data.data.collection.products.edges[0].node.id,
            req
          );

          if (variantUpdate.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return variantUpdate;
          }

          return resSuccess({
            data: {
              variant_id: variantUpdate.data.variant.id,
              product_id: variantUpdate.data.variant.product_id,
            },
          });
        }
      }
    } else if (req.body.ecommerce_type == ECommerce_Type.WooCommerce) {
      const data = await WooCommerce(req);
      return data;
    } else if (req.body.ecommerce_type == ECommerce_Type.Valigara) {
      const data = await valigaraProductManage(req);
      return data;
    } else {
      let storefrontAccessToken;

      let shop;

      let pass;

      let apiKey;

      let collection;

      let publicationId;

      let collectionId;

      if (SHOPIFY_STORE_KEY.THE_CADCO_APP === req.body.app_name) {
        storefrontAccessToken = "5a9b85a961f1370236d99614eea7869c";
        shop = "quickstart-3c059c30.myshopify.com";
        pass = "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";
        apiKey = "3faeb2b987bba5ae420211b1fe70434e";
        collection = "frontpage";
        (publicationId = 181933474081), (collectionId = 453287149857);
      } else if (SHOPIFY_STORE_KEY.ZAMELS_APP === req.body.app_name) {
        storefrontAccessToken = "8d1a60b3f2ff303d8a5ecc5ab149b7db";
        shop = "zamels-development.myshopify.com";
        pass = "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";
        apiKey = "a51c3ecfabfb08732339d02dc1631bcc";
        collection = "configurator";
        publicationId = 107013243118;
        collectionId = 417273184494;
      } else if (SHOPIFY_STORE_KEY.MAZZUCCHELLIS_APP === req.body.app_name) {
        storefrontAccessToken = "c2bb00218af687d56efbf79a0dee43db";
        shop = "mazzucchellis-dev.myshopify.com";
        pass = "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";
        apiKey = "8ec3fa36ed982c19d4fc2359900953d6";
        collection = "configurator";
        publicationId = 83920355394;
        collectionId = 268624887874;
      }

      const productFind = await makeShopifyAPICall(
        shop,
        storefrontAccessToken,
        req,
        collection
      );

      if (productFind.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return productFind;
      }

      if (productFind.code == DEFAULT_STATUS_CODE_SUCCESS) {
        if (productFind.data.data.collection.products.edges.length <= 0) {
          const data: any = await addShopifyProductAllData(
            apiKey,
            pass,
            shop,
            req
          );
          if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return data;
          }

          const publicProduct = await publicShopifyProductStatus(
            shop,
            pass,
            data.data.product.variants[0].product_id,
            req,
            publicationId
          );
          if (publicProduct.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return publicProduct;
          }
          const productCollection = await addProductCollection(
            apiKey,
            pass,
            shop,
            data.data.product.id,
            collectionId
          );
          if (productCollection.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return productCollection;
          }

          // const productImage:any = await  addShopifyProductImages(apiKey, pass, shop, data.data.product.id, req)

          // if (productImage.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          //   return productImage;
          // }

          // const productMetafield:any = await addShopifyProductMetalField(apiKey, pass, shop, data.data.product.id, req)
          // if (productMetafield.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          //   return productMetafield;
          // }

          return resSuccess({
            data: {
              variant_id: data.data.product.variants[0].id,
              product_id: data.data.product.variants[0].product_id,
            },
          });
        } else {
          let variantsId =
            productFind.data.data.collection.products.edges[0].node.variants
              .edges[0].node.id;

          const variantUpdate = await updateShopifyProductPrice(
            apiKey,
            pass,
            shop,
            variantsId,
            productFind.data.data.collection.products.edges[0].node.id,
            req
          );

          if (variantUpdate.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return variantUpdate;
          }

          return resSuccess({
            data: {
              variant_id: variantUpdate.data.variant.id,
              product_id: variantUpdate.data.variant.product_id,
            },
          });
        }
      }
    }
  } catch (error) {
    console.log("resp", error);
    throw error;
  }
};

export const productListShopifyProductPublic = async (req: Request) => {
  try {
    let storefrontAccessToken;

    let shop;

    let pass;

    let apiKey;

    let collection;

    let publicationId;

    let collectionId;

    if (SHOPIFY_STORE_KEY.THE_CADCO_APP === req.body.app_name) {
      storefrontAccessToken = "5a9b85a961f1370236d99614eea7869c";
      shop = "quickstart-3c059c30.myshopify.com";
      pass = "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";
      apiKey = "3faeb2b987bba5ae420211b1fe70434e";
      collection = "frontpage";
      (publicationId = 181933474081), (collectionId = 453287149857);
    } else if (SHOPIFY_STORE_KEY.ZAMELS_APP === req.body.app_name) {
      storefrontAccessToken = "8d1a60b3f2ff303d8a5ecc5ab149b7db";
      shop = "zamels-development.myshopify.com";
      pass = "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";
      apiKey = "a51c3ecfabfb08732339d02dc1631bcc";
      collection = "configurator";
      publicationId = 107013243118;
      collectionId = 417273184494;
    } else if (SHOPIFY_STORE_KEY.MAZZUCCHELLIS_APP === req.body.app_name) {
      storefrontAccessToken = "c2bb00218af687d56efbf79a0dee43db";
      shop = "mazzucchellis-dev.myshopify.com";
      pass = "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";
      apiKey = "8ec3fa36ed982c19d4fc2359900953d6";
      collection = "configurator";
      publicationId = 83920355394;
      collectionId = 268624887874;
    }

    const productFind = await makeShopifyAPICall(
      shop,
      storefrontAccessToken,
      req,
      collection
    );

    if (productFind.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return productFind;
    }

    if (productFind.code == DEFAULT_STATUS_CODE_SUCCESS) {
      if (productFind.data.data.collection.products.edges.length <= 0) {
        const data: any = await addShopifyProductAllData(
          apiKey,
          pass,
          shop,
          req
        );

        if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return data;
        }

        const publicProduct = await publicShopifyProductStatus(
          shop,
          pass,
          data.data.product.variants[0].product_id,
          req,
          publicationId
        );
        if (publicProduct.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return publicProduct;
        }
        const productCollection = await addProductCollection(
          apiKey,
          pass,
          shop,
          data.data.product.id,
          collectionId
        );
        if (productCollection.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return productCollection;
        }

        // const productImage:any = await  addShopifyProductImages(apiKey, pass, shop, data.data.product.id, req)

        // if (productImage.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        //   return productImage;
        // }

        // const productMetafield:any = await addShopifyProductMetalField(apiKey, pass, shop, data.data.product.id, req)
        // if (productMetafield.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        //   return productMetafield;
        // }

        return resSuccess({
          data: {
            variant_id: data.data.product.variants[0].id,
            product_id: data.data.product.variants[0].product_id,
          },
        });
      } else {
        let variantsId =
          productFind.data.data.collection.products.edges[0].node.variants
            .edges[0].node.id;

        const variantUpdate = await updateShopifyProductPrice(
          apiKey,
          pass,
          shop,
          variantsId,
          productFind.data.data.collection.products.edges[0].node.id,
          req
        );

        if (variantUpdate.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return variantUpdate;
        }

        return resSuccess({
          data: {
            variant_id: variantUpdate.data.variant.id,
            product_id: variantUpdate.data.variant.product_id,
          },
        });
      }
    }
  } catch (error) {
    console.log("resp", error);
    throw error;
  }
};

const addShopifyProduct = async (
  apiKey: any,
  pass: any,
  shop: any,
  req: any
) => {
  try {
    const url = `https://${apiKey}:${pass}@${shop}/admin/api/2023-07/products.json`;

    const requestBody = JSON.stringify({
      product: {
        title: req.body.product_title,
        body_html: `<p><b>${req.body.sort_description}</b></p>`,
        vendor: "TCC",
        product_type: "Ring",
        publications: [
          { publicationId: "gid://shopify/Publication/177114677537" },
          { publicationId: "gid://shopify/Publication/177114808609" },
          { publicationId: "gid://shopify/Publication/181933474081" },
          { publicationId: "gid://shopify/Publication/177114710305" },
          { publicationId: "gid://shopify/Publication/177114743073" },
          { publicationId: "gid://shopify/Publication/177114841377" },
        ],
        variants: [
          {
            requires_shipping: true,
            price: req.body.price,
            sku: req.body.sku,
            inventory_quantity: 10,
          },
        ],
      },
    });

    const data = await axios({
      url: url,
      method: "POST",
      data: requestBody,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Shopify-Access-Token": pass,
      },
    })
      .then((response) => {
        return resSuccess({ data: response.data });
      })
      .catch((error) => {
        return resUnknownError({ data: error });
      });

    return data;
  } catch (error) {
    console.log("resp", error);
    throw error;
  }
};

const addProductCollection = async (
  apiKey: any,
  pass: any,
  shop: any,
  product_id: any,
  collection_id: any
) => {
  try {
    const url = `https://${apiKey}:${pass}@${shop}/admin/api/2021-07/collects.json`;

    const requestBody = JSON.stringify({
      collect: {
        product_id: product_id,
        collection_id: collection_id,
      },
    });

    const data = await axios({
      url: url,
      method: "POST",
      data: requestBody,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Shopify-Access-Token": pass,
      },
    })
      .then((response) => {
        return resSuccess({ data: response.data });
      })
      .catch((error) => {
        return resUnknownError({ data: error });
      });

    return data;
  } catch (error) {
    console.log("resp", error);
    throw error;
  }
};

const addShopifyProductImages = async (
  apiKey: any,
  pass: any,
  shop: any,
  product_id: any,
  req: any
) => {
  try {
    let endpoint = "images";
    const url = `https://${apiKey}:${pass}@${shop}/admin/api/2023-07/products/${product_id}/${endpoint}.json`;

    if (req.file) {
      const data = await axios({
        url: url,
        method: "POST",
        data: {
          image: {
            attachment: fs.readFileSync(req.file?.path, {
              encoding: "base64",
            }),
            position: 1,
          },
        },
        headers: {
          "X-Shopify-Access-Token": pass,
        },
      })
        .then((response) => {
          return resSuccess({ data: response.data });
        })
        .catch((error) => {
          return resUnknownError({ data: error });
        });

      return data;
    }
  } catch (error) {
    console.log("resp", error);
    throw error;
  }
};

const addShopifyProductMetalField = async (
  apiKey: any,
  pass: any,
  shop: any,
  product_id: any,
  req: any
) => {
  try {
    const url = `https://${apiKey}:${pass}@${shop}/admin/api/2023-07/products/${product_id}.json`;

    const data = await axios({
      url: url,
      method: "PUT",
      data: {
        product: {
          metafields: [
            {
              namespace: "tcc",
              key: "center_stones",
              value: req.body.center_stone,
            },
            {
              namespace: "tcc",
              key: "center_diamond_shape",
              value: req.body.center_stone_shape,
            },
            {
              namespace: "tcc",
              key: "center_stone_size",
              value: req.body.center_stone_size,
            },
            {
              namespace: "tcc",
              key: "center_stone_color",
              value: req.body.center_stone_color,
            },
            {
              namespace: "tcc",
              key: "center_stone_clarity",
              value: req.body.center_stone_clarity,
            },
            { namespace: "tcc", key: "product_head", value: req.body.head },
            { namespace: "tcc", key: "product_shank", value: req.body.shank },
            { namespace: "tcc", key: "product_metal", value: req.body.metal },
            { namespace: "tcc", key: "product_karat", value: req.body.karat },
            { namespace: "tcc", key: "is_band", value: req.body.is_band },
            {
              namespace: "tcc",
              key: "product_side_setting",
              value: req.body.side_setting,
            },
          ],
        },
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((response) => {
        return resSuccess({ data: response.data });
      })
      .catch((error) => {
        return resUnknownError({ data: error });
      });

    return data;
  } catch (error) {
    throw error;
  }
};

const updateShopifyProductPrice = async (
  apiKey: any,
  pass: any,
  shop: any,
  variant_id: any,
  product_id: any,
  req: any
) => {
  try {
    const variantId = variant_id.split("/");
    const productId = product_id.split("/");

    const url = `https://${apiKey}:${pass}@${shop}/admin/api/2023-07/variants/${variantId[4]}.json`;

    const data = await axios({
      url: url,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": pass,
      },
    })
      .then((response) => {
        return resSuccess({ data: response.data });
      })
      .catch((error) => {
        return resUnknownError({ data: error });
      });

    if (
      data.data.variant.image_id &&
      data.data.variant.image_id != null &&
      data.data.variant.image_id != undefined
    ) {
      const requestBody = JSON.stringify({
        variant: {
          price: req.body.price,
        },
      });

      const data = await axios({
        url: url,
        method: "PUT",
        data: requestBody,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": pass,
        },
      })
        .then((response) => {
          return resSuccess({ data: response.data });
        })
        .catch((error) => {
          return resUnknownError({ data: error });
        });
      return data;
    } else {
      const createImageResponse = await axios({
        url: `https://${shop}/admin/api/2023-10/products/${productId[4]}/images.json`,
        method: "POST",
        data: JSON.stringify({
          image: {
            attachment: fs.readFileSync(req.file?.path, {
              encoding: "base64",
            }),
            variant_ids: [variantId[4]],
          },
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": pass,
        },
      })
        .then((response) => {
          return resSuccess({ data: response.data });
        })
        .catch((error) => {
          return resUnknownError({ data: error });
        });

      const requestBody = JSON.stringify({
        variant: {
          price: req.body.price,
          image_id: createImageResponse.data.image.id,
        },
      });

      const data = await axios({
        url: url,
        method: "PUT",
        data: requestBody,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": pass,
        },
      })
        .then((response) => {
          return resSuccess({ data: response.data });
        })
        .catch((error) => {
          return resUnknownError({ data: error });
        });
      return data;
    }

    // return data
  } catch (error) {
    console.log("resp", error);
    throw error;
  }
};

////////////////////////---add all data in one api -------------//////////////////////

const addShopifyProductAllData = async (
  apiKey: any,
  pass: any,
  shop: any,
  req: any
) => {
  try {
    const url = `https://${apiKey}:${pass}@${shop}/admin/api/2023-07/products.json`;
    if (req.file) {
      const requestBody = JSON.stringify({
        product: {
          title: req.body.product_title,
          body_html: `<p><b>${req.body.sort_description}</b></p>`,
          vendor: "TCC",
          product_type: "Ring",
          published: true,
          channels: ["web", "Configurator"],
          published_scope: "global",
          variants: [
            {
              title: "Default Title",
              price: req.body.price,
              sku: req.body.sku,
              inventory_management: "shopify",
              inventory_quantity: 100,
              requires_shipping: true,
              published: true,
            },
          ],
          images: [
            {
              attachment: fs.readFileSync(req.file?.path, {
                encoding: "base64",
              }),
              position: 1,
            },
          ],
          metafields: [
            {
              namespace: "tcc",
              key: "is_band",
              value: req.body.is_band,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "product_karat",
              value: req.body.karat,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "product_metal",
              value: req.body.metal,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "product_side_setting",
              value: req.body.side_setting,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "product_shank",
              value: req.body.shank,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "product_head",
              value: req.body.head,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "center_stone_clarity",
              value: req.body.center_stone_clarity,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "center_stone_color",
              value: req.body.center_stone_color,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "center_stone_size",
              value: req.body.center_stone_size,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "center_diamond_shape",
              value: req.body.center_stone_shape,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "center_stones",
              value: req.body.center_stone,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "ring_no",
              value: req.body.ring_no,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "shank_no",
              value: req.body.shank_no,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "head_no",
              value: req.body.head_no,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "band_no",
              value: req.body.band_no,
              type: "single_line_text_field",
            },
          ],
        },
      });

      const data = await axios({
        url: url,
        method: "POST",
        data: requestBody,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Shopify-Access-Token": pass,
        },
      })
        .then((response) => {
          return resSuccess({ data: response.data });
        })
        .catch((error) => {
          return resUnknownError({ data: error });
        });

      return data;
    } else {
      return resSuccess({
        code: BAD_REQUEST_CODE,
        message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
          ["field_name", "Image"],
        ]),
      });
    }
  } catch (error) {
    console.log("resp", error);
    throw error;
  }
};

////////////////-------- add public product-------------------/////////////////

const publicShopifyProductStatus = async (
  shop: any,
  pass: any,
  product_Id: any,
  req: any,
  publicationId: any
) => {
  const query = `mutation  {
    publishablePublish(id: "gid://shopify/Product/${product_Id}", input: {
      publicationId: "gid://shopify/Publication/${publicationId}"
    }) {
      publishable {
        availablePublicationCount
        publicationCount
      }
      shop {
        publicationCount
      }
      userErrors {
        field
        message
      }
    }
  }`;
  const url = `https://${shop}/admin/api/2023-07/graphql.json`;

  const requestBody = JSON.stringify({
    query: query,
  });

  const data = await axios({
    url: url,
    method: "POST",
    data: requestBody,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Shopify-Access-Token": pass,
    },
  })
    .then((response) => {
      return resSuccess({ data: response.data });
    })
    .catch((error) => {
      return resUnknownError({ data: error });
    });
  return data;
};

export const demoEncryptData = async (req: Request) => {
  const key = Buffer.from(
    "f3d92cb3d3f6446d20150ec4cab84bae78b348eec99837f752a7070e4adc2f4a",
    "hex"
  );
  const iv = Buffer.from("3e6927eeed3b279d654ef93a237df6d4", "hex");

  // Example of encryption and decryption using the custom key and IV
  function encrypt(text: any) {
    let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
  }

  function decrypt(text: any) {
    let encryptedText = Buffer.from(text, "hex");
    let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  const encryptData = encrypt(JSON.stringify({ id: 10, name: "khushi" }));

  const decryptData = decrypt(req.body.data);

  return resSuccess({ data: JSON.parse(decryptData) });
};

////////////------------ Birth stone product --------------------------//////////////////////

export const birthStonePtoductInShopify = async (req: Request) => {
  try {
    let storefrontAccessToken;

    let shop;

    let pass;

    let apiKey;

    let collection;

    let publicationId;

    let collectionId;

    if (SHOPIFY_STORE_KEY.THE_CADCO_APP === req.body.app_name) {
      storefrontAccessToken = "5a9b85a961f1370236d99614eea7869c";
      shop = "quickstart-3c059c30.myshopify.com";
      pass = "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";
      apiKey = "3faeb2b987bba5ae420211b1fe70434e";
      collection = "frontpage";
      (publicationId = 181933474081), (collectionId = 453287149857);
    } else if (SHOPIFY_STORE_KEY.ZAMELS_APP === req.body.app_name) {
      storefrontAccessToken = "8d1a60b3f2ff303d8a5ecc5ab149b7db";
      shop = "zamels-development.myshopify.com";
      pass = "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";
      apiKey = "a51c3ecfabfb08732339d02dc1631bcc";
      collection = "configurator";
      publicationId = 107013243118;
      collectionId = 417273184494;
    } else if (SHOPIFY_STORE_KEY.MAZZUCCHELLIS_APP === req.body.app_name) {
      storefrontAccessToken = "c2bb00218af687d56efbf79a0dee43db";
      shop = "mazzucchellis-dev.myshopify.com";
      pass = "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";
      apiKey = "8ec3fa36ed982c19d4fc2359900953d6";
      collection = "configurator";
      publicationId = 83920355394;
      collectionId = 268624887874;
    }

    const productFind = await searchBirthStoneProductShopify(
      shop,
      storefrontAccessToken,
      req,
      collection
    );

    if (productFind.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return productFind;
    }

    if (productFind.code == DEFAULT_STATUS_CODE_SUCCESS) {
      if (productFind.data.data.collection.products.edges.length <= 0) {
        const data: any = await addShopifyBirthStoneProductAllData(
          apiKey,
          pass,
          shop,
          req
        );
        if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return data;
        }

        const publicProduct = await publicShopifyProductStatus(
          shop,
          pass,
          data.data.product.variants[0].product_id,
          req,
          publicationId
        );
        if (publicProduct.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return publicProduct;
        }
        const productCollection = await addProductCollection(
          apiKey,
          pass,
          shop,
          data.data.product.id,
          collectionId
        );
        if (productCollection.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return productCollection;
        }

        // const productImage:any = await  addShopifyProductImages(apiKey, pass, shop, data.data.product.id, req)

        // if (productImage.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        //   return productImage;
        // }

        // const productMetafield:any = await addShopifyProductMetalField(apiKey, pass, shop, data.data.product.id, req)
        // if (productMetafield.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        //   return productMetafield;
        // }

        return resSuccess({
          data: {
            variant_id: data.data.product.variants[0].id,
            product_id: data.data.product.variants[0].product_id,
          },
        });
      } else {
        let variantsId =
          productFind.data.data.collection.products.edges[0].node.variants
            .edges[0].node.id;

        const variantUpdate = await updateShopifyProductPrice(
          apiKey,
          pass,
          shop,
          variantsId,
          productFind.data.data.collection.products.edges[0].node.id,
          req
        );

        if (variantUpdate.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return variantUpdate;
        }

        return resSuccess({
          data: {
            variant_id: variantUpdate.data.variant.id,
            product_id: variantUpdate.data.variant.product_id,
          },
        });
      }
    }
  } catch (error) {
    console.log("resp", error);
    throw error;
  }
};

const searchBirthStoneProductShopify = async (
  shop: any,
  storefrontAccessToken: any,
  req: any,
  collection: any
) => {
  const query = `query  {

    collection(handle: "${collection}") {
  
      handle
  
      products(first: 10, filters: [
        {productMetafield: {namespace: "tcc", key: "product_type", value: "${req.body.product_type}"}},
        {productMetafield: {namespace: "tcc", key: "stone_1", value: "${req.body.stone_1}"}},
        {productMetafield: {namespace: "tcc", key: "stone_2", value: "${req.body.stone_2}"}},
        {productMetafield: {namespace: "tcc", key: "stone_3", value: "${req.body.stone_3}"}},
        {productMetafield: {namespace: "tcc", key: "stone_4", value: "${req.body.stone_4}"}},
        {productMetafield: {namespace: "tcc", key: "stone_5", value: "${req.body.stone_5}"}},
        {productMetafield: {namespace: "tcc", key: "metal", value: "${req.body.metal}"}},
        {productMetafield: {namespace: "tcc", key: "karat", value: "${req.body.karat}"}}
      ]
         )
  
             {
  
              edges {
  
               node {
  
                handle
                id
                title
               variants (first: 2) {
                edges {
                  cursor
                  node {
                    id
                    title    
                  }
                }
               }
  
             }
  
            }
  
           }
  
          }
  
         }`;
  const url = `https://${shop}/api/graphql`;

  const requestBody = JSON.stringify({
    query: query,
  });

  const data = await axios({
    url: url,
    method: "POST",
    data: requestBody,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
  })
    .then((response) => {
      console.log(response.data);
      return resSuccess({ data: response.data });
    })
    .catch((error) => {
      return resUnknownError({ data: error });
    });
  return data;
};

const addShopifyBirthStoneProductAllData = async (
  apiKey: any,
  pass: any,
  shop: any,
  req: any
) => {
  try {
    const url = `https://${apiKey}:${pass}@${shop}/admin/api/2023-07/products.json`;
    if (req.file) {
      const requestBody = JSON.stringify({
        product: {
          title: req.body.product_title,
          body_html: `<p><b>${req.body.sort_description}</b></p>`,
          vendor: "TCC",
          product_type: "Ring",
          published: true,
          channels: ["web", "Configurator"],
          published_scope: "global",
          variants: [
            {
              title: "Default Title",
              price: req.body.price,
              sku: req.body.price.sku,
              inventory_management: "shopify",
              inventory_quantity: 100,
              requires_shipping: true,
              published: true,
            },
          ],
          images: [
            {
              attachment: fs.readFileSync(req.file?.path, {
                encoding: "base64",
              }),
              position: 1,
            },
          ],
          metafields: [
            {
              namespace: "tcc",
              key: "product_type",
              value: req.body.product_type,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_1",
              value: req.body.stone_1,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_2",
              value: req.body.stone_2,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_3",
              value: req.body.stone_3,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_4",
              value: req.body.stone_4,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_5",
              value: req.body.stone_5,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "metal",
              value: req.body.metal,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "karat",
              value: req.body.karat,
              type: "single_line_text_field",
            },
          ],
        },
      });

      const data = await axios({
        url: url,
        method: "POST",
        data: requestBody,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Shopify-Access-Token": pass,
        },
      })
        .then((response) => {
          return resSuccess({ data: response.data });
        })
        .catch((error) => {
          return resUnknownError({ data: error });
        });

      return data;
    }
  } catch (error) {
    console.log("resp", error);
    throw error;
  }
};

export const birthStoneProductWithPriceInShopify = async (req: Request) => {
  try {
    let storefrontAccessToken;

    let shop;

    let pass;

    let apiKey;

    let collection;

    let publicationId;

    let collectionId;

    if (SHOPIFY_STORE_KEY.THE_CADCO_APP === req.body.app_name) {
      storefrontAccessToken = "5a9b85a961f1370236d99614eea7869c";
      shop = "quickstart-3c059c30.myshopify.com";
      pass = "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";
      apiKey = "3faeb2b987bba5ae420211b1fe70434e";
      collection = "frontpage";
      (publicationId = 181933474081), (collectionId = 453287149857);
    } else if (SHOPIFY_STORE_KEY.ZAMELS_APP === req.body.app_name) {
      storefrontAccessToken = "8d1a60b3f2ff303d8a5ecc5ab149b7db";
      shop = "zamels-development.myshopify.com";
      pass = "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";
      apiKey = "a51c3ecfabfb08732339d02dc1631bcc";
      collection = "configurator";
      publicationId = 107013243118;
      collectionId = 417273184494;
    } else if (SHOPIFY_STORE_KEY.MAZZUCCHELLIS_APP === req.body.app_name) {
      storefrontAccessToken = "c2bb00218af687d56efbf79a0dee43db";
      shop = "mazzucchellis-dev.myshopify.com";
      pass = "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";
      apiKey = "8ec3fa36ed982c19d4fc2359900953d6";
      collection = "configurator";
      publicationId = 83920355394;
      collectionId = 268624887874;
    } else if (SHOPIFY_STORE_KEY.ZAMELS_STAGING_APP === req.body.app_name) {
      storefrontAccessToken = "2fbab26534961da014fa86b4991c828a";
      shop = "zamels-sandbox.myshopify.com";
      pass = "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";
      apiKey = "e4eb20490439bb669d7ac1521d29ee03";
      collection = "configurator";
      publicationId = 111735767261;
      collectionId = 420593271005;
    } else if (SHOPIFY_STORE_KEY.ZAMELS_LIVE_APP === req.body.app_name) {
      storefrontAccessToken = "d1f3720c9ed36faaf7ff4727a9d07a7f";
      shop = "zamels-com-au.myshopify.com";
      pass = "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";
      apiKey = "303ee1c7accfd56e6e54135598adb174";
      collection = "configurator";
      publicationId = 110863384793;
      collectionId = 414893867225;
    }
    const productFind = await searchBirthStoneProductWithPriceShopify(
      shop,
      storefrontAccessToken,
      req,
      collection
    );

    if (productFind.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return productFind;
    }

    if (productFind.code == DEFAULT_STATUS_CODE_SUCCESS) {
      if (productFind.data.data.collection.products.edges.length <= 0) {
        const data: any = await addShopifyBirthStoneProductWithPriceData(
          apiKey,
          pass,
          shop,
          req
        );
        if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return data;
        }

        const publicProduct = await publicShopifyProductStatus(
          shop,
          pass,
          data.data.product.variants[0].product_id,
          req,
          publicationId
        );
        if (publicProduct.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return publicProduct;
        }
        const productCollection = await addProductCollection(
          apiKey,
          pass,
          shop,
          data.data.product.id,
          collectionId
        );
        if (productCollection.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return productCollection;
        }

        // const productImage:any = await  addShopifyProductImages(apiKey, pass, shop, data.data.product.id, req)

        // if (productImage.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        //   return productImage;
        // }

        // const productMetafield:any = await addShopifyProductMetalField(apiKey, pass, shop, data.data.product.id, req)
        // if (productMetafield.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        //   return productMetafield;
        // }
        const variantId = data.data.product.variants.find(
          (t: any) =>
            t.title.toLowerCase() == req.body.selected_metal.toLowerCase()
        );
        return resSuccess({
          data: {
            variant_id: variantId.id,
            product_id: data.data.product.variants[0].product_id,
          },
        });
      } else {
        let variantsId =
          productFind.data.data.collection.products.edges[0].node.variants.edges.find(
            (t: any) =>
              t.node.title.toLowerCase() ==
              req.body.selected_metal.toLowerCase()
          );

        const variantUpdate = await updateShopifyProductPrice(
          apiKey,
          pass,
          shop,
          variantsId?.node?.id,
          productFind.data.data.collection.products.edges[0].node.id,
          req
        );

        if (variantUpdate.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return variantUpdate;
        }

        return resSuccess({
          data: {
            variant_id: variantUpdate.data.variant.id,
            product_id: variantUpdate.data.variant.product_id,
            details: productFind.data.data.collection.products.edges[0].node.id,
          },
        });
      }
    }

    return resSuccess({ data: productFind.code });
  } catch (error) {
    console.log("resp", error);
    throw error;
  }
};

const searchBirthStoneProductWithPriceShopify = async (
  shop: any,
  storefrontAccessToken: any,
  req: any,
  collection: any
) => {
  const query = `query  {
  
      collection(handle: "${collection}") {
    
        handle
        products(first: 10,  filters:[
          {productMetafield: {namespace: "tcc", key: "style_no", value: "${req.body.style_no}"}},
          {productMetafield: {namespace: "tcc", key: "stone_1", value: "${req.body.stone_1}"}},
          {productMetafield: {namespace: "tcc", key: "stone_2", value: "${req.body.stone_2}"}},
          {productMetafield: {namespace: "tcc", key: "stone_3", value: "${req.body.stone_3}"}},
          {productMetafield: {namespace: "tcc", key: "stone_4", value: "${req.body.stone_4}"}},
          {productMetafield: {namespace: "tcc", key: "stone_5", value: "${req.body.stone_5}"}},
          {productMetafield: {namespace: "tcc", key: "stone_6", value: "${req.body.stone_6}"}},
          {productMetafield: {namespace: "tcc", key: "stone_7", value: "${req.body.stone_7}"}},
          {productMetafield: {namespace: "tcc", key: "stone_8", value: "${req.body.stone_8}"}},
          {productMetafield: {namespace: "tcc", key: "stone_9", value: "${req.body.stone_9}"}},
          {productMetafield: {namespace: "tcc", key: "stone_10", value: "${req.body.stone_10}"}},
        ]
           )
               {
    
                edges {
    
                 node {
    
                  handle
                  id
                  title
                 variants (first: 5) {
                  edges {
                    cursor
                    node {
                      id
                      title    
                    }
                  }
                 }
    
               }
    
              }
    
             }
    
            }
    
           }`;
  const url = `https://${shop}/api/graphql`;

  const requestBody = JSON.stringify({
    query: query,
  });

  const data = await axios({
    url: url,
    method: "POST",
    data: requestBody,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
  })
    .then((response) => {
      console.log(response.data);
      return resSuccess({ data: response.data });
    })
    .catch((error) => {
      return resUnknownError({ data: error });
    });
  return data;
};

const addShopifyBirthStoneProductWithPriceData = async (
  apiKey: any,
  pass: any,
  shop: any,
  req: any
) => {
  try {
    const url = `https://${apiKey}:${pass}@${shop}/admin/api/2023-07/products.json`;
    if (req.file) {
      const requestBody = JSON.stringify({
        product: {
          title: req.body.product_title,
          body_html: `<p><b>${req.body.sort_description}</b></p>`,
          product_type: "Birthstone",
          published: true,
          // channels: ["web", "Configurator"],
          published_scope: "global",
          variants: req.body.product_details,
          options: [
            {
              name: "Metal",
              values: [
                "sterling silver",
                "yellow gold",
                "rose gold",
                "white gold",
              ],
            },
          ],
          images: [
            {
              attachment: fs.readFileSync(req.file?.path, {
                encoding: "base64",
              }),
              position: 1,
            },
          ],
          metafields: [
            {
              namespace: "tcc",
              key: "style_no",
              value: req.body.style_no,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_1",
              value: req.body.stone_1,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_2",
              value: req.body.stone_2,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_3",
              value: req.body.stone_3,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_4",
              value: req.body.stone_4,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_5",
              value: req.body.stone_5,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_6",
              value: req.body.stone_6,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_7",
              value: req.body.stone_7,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_8",
              value: req.body.stone_8,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_9",
              value: req.body.stone_9,
              type: "single_line_text_field",
            },
            {
              namespace: "tcc",
              key: "stone_10",
              value: req.body.stone_10,
              type: "single_line_text_field",
            },
          ],
        },
      });

      const data = await axios({
        url: url,
        method: "POST",
        data: requestBody,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Shopify-Access-Token": pass,
        },
      })
        .then((response) => {
          return resSuccess({ data: response.data });
        })
        .catch((error) => {
          return resUnknownError({ data: error });
        });

      return data;
    }
  } catch (error) {
    console.log("resp", error);
    throw error;
  }
};
