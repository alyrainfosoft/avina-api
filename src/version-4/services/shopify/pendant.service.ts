import axios from "axios";
import { SHOPIFY_STORE_KEY } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS } from "../../../utils/app-messages";
import { parseFormattedPrice, resSuccess, resUnknownError } from "../../../utils/shared-functions";
import { Request } from "express";
import { SHOPIFY_STORE } from "../../../utils/app-constants";

export const pendantProductAddToCartShopify = async (req: Request) => {
    try {
        let storefrontAccessToken;
        let shop;
        let pass;
        let apiKey;
        let collection;
        let publicationId;
        let collectionId;

        const app_name = SHOPIFY_STORE[req.query.company_key as keyof typeof SHOPIFY_STORE];

        if (app_name === SHOPIFY_STORE_KEY.THE_CADCO_APP) {
            storefrontAccessToken = '5a9b85a961f1370236d99614eea7869c';
            shop = 'quickstart-3c059c30.myshopify.com';
            pass = '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';
            apiKey = '3faeb2b987bba5ae420211b1fe70434e';
            collection = 'frontpage';
            publicationId = 181933474081;
            collectionId = 453287149857;
        } else if (SHOPIFY_STORE_KEY.ZAMELS_APP === app_name) {
            storefrontAccessToken = '8d1a60b3f2ff303d8a5ecc5ab149b7db';
            shop = 'zamels-development.myshopify.com';
            pass = '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';
            apiKey = 'a51c3ecfabfb08732339d02dc1631bcc';
            collection = 'configurator';
            publicationId = 107013243118;
            collectionId = 417273184494;
        } else if (SHOPIFY_STORE_KEY.MAZZUCCHELLIS_APP === app_name) {
            storefrontAccessToken = 'c2bb00218af687d56efbf79a0dee43db';
            shop = 'mazzucchellis-dev.myshopify.com';
            pass = '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';
            apiKey = '8ec3fa36ed982c19d4fc2359900953d6';
            collection = 'configurator';
            publicationId = 83920355394;
            collectionId = 268624887874;
        } else if (SHOPIFY_STORE_KEY.ZAMELS_STAGING_APP === app_name) {
            storefrontAccessToken = '2fbab26534961da014fa86b4991c828a';
            shop = 'zamels-sandbox.myshopify.com';
            pass = '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';
            apiKey = 'e4eb20490439bb669d7ac1521d29ee03';
            collection = 'configurator';
            publicationId = 111735767261;
            collectionId = 420593271005;
        } else if (SHOPIFY_STORE_KEY.ZAMELS_LIVE_APP === app_name) {
            storefrontAccessToken = 'd1f3720c9ed36faaf7ff4727a9d07a7f';
            shop = 'zamels-com-au.myshopify.com';
            pass = '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';
            apiKey = '303ee1c7accfd56e6e54135598adb174';
            collection = 'configurator';
            publicationId = 110863384793;
            collectionId = 414893867225;
        } else if (SHOPIFY_STORE_KEY.ZEGHANI_APP === app_name) {
            storefrontAccessToken = 'a1ba7232ae1b0f9db7d00d55e97fdb33';
            shop = 'zeghani-jewelry.myshopify.com';
            pass = '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';
            apiKey = '2f9d184e5a0e4bb7addb62524827c9ce';
            collection = 'configurator';
            publicationId = 138016096454;
            collectionId = 317406511302;
        }

        const baseSku = req.body.sku ? req.body.sku.trim() : "TCC-PENDANT";
        const sku = `${baseSku}${req.body.stone ? `-${req.body.stone}` : ''}${req.body.color ? `-${req.body.color}` : ''}${req.body.clarity ? `-${req.body.clarity}` : ''}${req.body.cut ? `-${req.body.cut}` : ''}${req.body.diamond_type ? `-${req.body.diamond_type}` : ''}${req.body.metal_tone ? `-${req.body.metal_tone}` : ''}`;

        const productFind = await searchProduct(
            shop,
            storefrontAccessToken,
            collection,
            sku
        );
        if (productFind.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return productFind;
        }

        if (productFind.code == DEFAULT_STATUS_CODE_SUCCESS) {
            if (productFind.data.data.collection.products.edges.length <= 0) {
                const data: any = await addProductInShopify(apiKey, pass, shop, req, sku);
                if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                    return data;
                }

                const publicProduct = await publicShopifyProductStatus(
                    shop,
                    pass,
                    data.data.product.variants[0].product_id,
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

                return resSuccess({
                    data: {
                        variant_id: data.data.product.variants[0].id,
                        product_id: data.data.product.variants[0].product_id,
                    },
                });
            } else {
                let variantsId = productFind.data.data.collection.products.edges[0].node.variants.edges[0];

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
        throw error;
    }
};

const searchProduct = async (
    shop: any,
    storefrontAccessToken: any,
    collection: any,
    sku: string
) => {
    const query = `query {
  collection(handle: "${collection}") {
    handle
    products(
      first: 10
      filters: [
        {
          productMetafield: {
            namespace: "tcc"
            key: "pendant_sku"
            value: "${sku}"
          }
        }
      ]
    ) {
      edges {
        node {
          handle
          id
          title
          variants(first: 5) {
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
}
`;

    const url = `https://${shop}/api/graphql`;

    const requestBody = JSON.stringify({
        query: query,
    });

    const data = await axios({
        url: url,
        method: 'POST',
        data: requestBody,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
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

const addProductInShopify = async (apiKey: any, pass: any, shop: any, req: any, sku: string) => {
    try {
        const url = `https://${apiKey}:${pass}@${shop}/admin/api/2023-07/products.json`;
        if (req.file) {
            const price = await parseFormattedPrice(req.body.price)
            const requestBody = JSON.stringify({
                product: {
                    title: req.body.product_title,
                    body_html: `
          <h3>${req.body.product_title}</h3>
          <ul>
          <li><b>Metal:</b> ${req.body.metal}</li>
          ${req.body.metal_tone && req.body.metal_tone != undefined && req.body.metal_tone != ''
                            ? `<li><b>Metal Tone:</b> ${req.body.metal_tone}</li>`
                            : ''
                        }
          ${req.body.karat && req.body.karat != undefined && req.body.karat != ''
                            ? `<li><b>Karat: </b> ${req.body.karat}</li>`
                            : ''
                        }
          ${req.body.stone && req.body.stone != undefined && req.body.stone != ''
                            ? `<li><b>Stone: </b> ${req.body.stone}</li>`
                            : ''
                        }
          ${req.body.color && req.body.color != undefined && req.body.color != ''
                            ? `<li><b>Diamond color: </b> ${req.body.color}</li>`
                            : ''
                        }
          ${req.body.clarity && req.body.clarity != undefined && req.body.clarity != ''
                            ? `<li><b>Diamond Clarity: </b> ${req.body.clarity}</li>`
                            : ''
                        }
          ${req.body.cut && req.body.cut != undefined && req.body.cut != ''
                            ? `<li><b>Diamond Cut: </b> ${req.body.cut}</li>`
                            : ''
                        }
          ${req.body.size && req.body.size != undefined && req.body.size != ''
                            ? `<li><b>Diamond Size: </b> ${req.body.size}</li>`
                            : ''
                        }
          ${req.body.diamond_type && req.body.diamond_type != undefined && req.body.diamond_type != ''
                            ? `<li><b>Diamond Type: </b> ${req.body.diamond_type}</li>`
                            : ''
                        }
          </ul>
          `,
                    vendor: 'TCC',
                    product_type: 'Pendant',
                    published: true,
                    channels: ['web', 'Configurator'],
                    published_scope: 'web',
                    variants: [
                        {
                            title: "Default Header",
                            price: price,
                            sku: sku,
                            inventory_management: 'shopify',
                            inventory_quantity: 100,
                            requires_shipping: true,
                            published: true,
                        },
                    ],
                    images: [
                        {
                            attachment: req.file.buffer.toString('base64'),
                            position: 1,
                        },
                    ],
                    metafields: [
                        {
                            namespace: 'tcc',
                            key: 'pendant_sku',
                            value: sku,
                            type: 'single_line_text_field',
                        },
                    ],
                },
            });

            const data = await axios({
                url: url,
                method: 'POST',
                data: requestBody,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Shopify-Access-Token': pass,
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
        throw error;
    }
};

const publicShopifyProductStatus = async (
    shop: any,
    pass: any,
    product_Id: any,
    publicationId: any
) => {
    const query = `mutation {
  publishablePublish(id: "gid://shopify/Product/${product_Id}", input: {
    publicationId: "gid://shopify/Publication/${publicationId}"
  }) {
    publishable {
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
        method: 'POST',
        data: requestBody,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Shopify-Access-Token': pass,
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
            method: 'POST',
            data: requestBody,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Shopify-Access-Token': pass,
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
        const variantId = variant_id.split('/');
        const productId = product_id.split('/');

        const url = `https://${apiKey}:${pass}@${shop}/admin/api/2023-07/variants/${variantId[4]}.json`;

        const data = await axios({
            url: url,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': pass,
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
                method: 'PUT',
                data: requestBody,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': pass,
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
                method: 'POST',
                data: JSON.stringify({
                    image: {
                        attachment: req.file.buffer.toString('base64'),
                        variant_ids: [variantId[4]],
                    },
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': pass,
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
                method: 'PUT',
                data: requestBody,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': pass,
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
        throw error;
    }
};