import { Request } from "express";
import { resSuccess, resUnknownError } from "../../../utils/shared-functions";
import axios from "axios";
import {
  IMAGE_PATH,
  VALIGARA_API_ACCESS_KEY,
  VALIGARA_API_URL,
} from "../../../config/env.var";
import { DEFAULT_STATUS_CODE_SUCCESS } from "../../../utils/app-messages";
import ConfigProduct from "../../model/config-product.model";
import { DeletedStatus, IMAGE_TYPE } from "../../../utils/app-enumeration";
import ConfigProductDiamonds from "../../model/config-product-diamonds.model";
import ConfigProductMetals from "../../model/config-product-metal.model";
import DiamondGroupMaster from "../../model/master/attributes/diamond-group-master.model";
import { Op, Sequelize } from "sequelize";
import DiamondShape from "../../model/master/attributes/diamondShape.model";
import Colors from "../../model/master/attributes/colors.model";
import ClarityData from "../../model/master/attributes/clarity.model";
import StoneData from "../../model/master/attributes/gemstones.model";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import dbContext from "../../../config/db-context";

const searchProduct = async (sku: string) => {
  const params = {
    sku: sku,
  };
  console.log(sku);
  const data = await axios({
    url: `${VALIGARA_API_URL}${VALIGARA_API_ACCESS_KEY}&action=product_search&data=${JSON.stringify(
      params
    )}`,
    method: "GET",
  })
    .then((response) => {
      console.log(response.data);
      return resSuccess({ data: response.data.data });
    })
    .catch((error) => {
      return resUnknownError({ data: error });
    });
  return data;
};

const addProduct = async (requestBody: any) => {
  const {
    sku,
    price,
    product_title,
    sort_description,
    is_band,
    karat,
    metal,
    center_stone_clarity,
    center_stone_color,
    center_stone_shape,
    center_stone_size,
    created_sku,
    image_path,
  } = requestBody;
  const product = await ConfigProduct.findOne({
    where: { sku: { [Op.iLike]: `${sku}` }, is_deleted: "0" },
    attributes: [
      "id",
      "head_no",
      "shank_no",
      "band_no",
      "ring_no",
      "style_no",
      "product_title",
      "product_sort_des",
      "product_long_des",
      "sku",
      "slug",
      "laber_charge",
      "product_type",
    ],
    include: [
      {
        model: DiamondGroupMaster,
        as: "cender_diamond",
        attributes: ["id_stone"],
      },
      {
        required: false,
        model: ConfigProductMetals,
        as: "CPMO",
        where:
          is_band == "NONE"
            ? { head_shank_band: { [Op.notILike]: "BAND" } }
            : {},
        attributes: [
          "id",
          "config_product_id",
          "metal_id",
          "karat_id",
          "metal_tone",
          "metal_wt",
          "head_shank_band",
          "labor_charge",
        ],
      },
      {
        required: false,
        model: ConfigProductDiamonds,
        as: "CPDO",
        where:
          is_band == "NONE" ? { product_type: { [Op.notILike]: "BAND" } } : {},
        attributes: [
          "id",
          "product_type",
          "dia_count",
          "dia_weight",
          "dia_shape",
          "dia_stone",
          "dia_color",
          "dia_mm_size",
          "dia_clarity",
          "dia_cuts",
          [Sequelize.literal(`"CPDO->shape"."name"`), "dia_shape"],
          [Sequelize.literal(`"CPDO->color"."name"`), "dia_color"],
          [Sequelize.literal(`"CPDO->clarity"."name"`), "dia_clarity"],
          [Sequelize.literal(`"CPDO->stone"."name"`), "dia_stone"],
        ],
        include: [
          {
            model: DiamondShape,
            as: "shape",
            attributes: [],
          },
          {
            model: Colors,
            as: "color",
            attributes: [],
          },
          {
            model: ClarityData,
            as: "clarity",
            attributes: [],
          },
          {
            model: StoneData,
            as: "stone",
            attributes: [],
          },
        ],
      },
    ],
  });
  let diamondList = [
    {
      name: "center stone",
      code: `center-${center_stone_shape}-${center_stone_size}-${center_stone_color}-${center_stone_clarity}`,
      type: 2,
      color: center_stone_color,
      clarity: center_stone_clarity,
      shape: center_stone_shape,
      carat: center_stone_size,
      quantity: 1,
    },
  ];
  for (const diamond of product.dataValues.CPDO) {
    diamondList.push({
      name: diamond.product_type,
      code: `${diamond.product_type}-${diamond.dia_shape}-${diamond.dia_color}-${diamond.dia_clarity}-${diamond.dia_weight}`,
      type: 2,
      color: diamond.dia_color,
      clarity: diamond.dia_clarity,
      shape: diamond.dia_shape,
      carat: diamond.dia_weight,
      quantity: diamond.dia_count,
    });
  }
  const payload = {
    product_type: "0",
    type: product.dataValues.product_type,
    title: product_title,
    description: sort_description,
    price: price,
    quantity: "100",
    catalog_code: created_sku,
    collection: "CONFIG",
    model: "CONFIG",
    not_for_sale: false,
    gemstones: diamondList,
    metals: [
      {
        name: metal,
        purity: karat,
        weight: product.dataValues.CPMO.reduce(
          (a, b) => a.metal_wt + b.metal_wt
        ),
      },
    ],
    images: [IMAGE_PATH + "/" + image_path],
  };

  const data = await axios({
    url: `${VALIGARA_API_URL}${VALIGARA_API_ACCESS_KEY}&action=product_import&data=${JSON.stringify(
      payload
    )}`,
    method: "GET",
  })
    .then((response) => {
      console.log(response.data);
      return resSuccess({ data: response.data.product });
    })
    .catch((error) => {
      return resUnknownError({ data: error });
    });
  return data;
};
const updateProduct = async (product_id: any, price: any) => {
  const payload = {
    product_id: product_id,
    price: price,
  };

  const data = await axios({
    url: `${VALIGARA_API_URL}${VALIGARA_API_ACCESS_KEY}&action=product_update&data=${JSON.stringify(
      payload
    )}`,
    method: "GET",
  })
    .then((response) => {
      console.log(response.data);
      return resSuccess({ data: response.data.product });
    })
    .catch((error) => {
      return resUnknownError({ data: error });
    });
  return data;
};
export const valigaraProductManage = async (req: Request) => {
  try {
    const { is_band, band_tone, head_tone, shank_tone, price } = req.body;
    let product_id;
    let sku;
    if (is_band === "NONE") {
      sku = `${req.body.sku}-H-${head_tone}-S-${shank_tone}`;
    } else {
      sku = `${req.body.sku}-H-${head_tone}-S-${shank_tone}-B-${band_tone}`;
    }

    const findValigaraProduct = await searchProduct(sku);

    if (findValigaraProduct.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return findValigaraProduct;
    }

    if (findValigaraProduct.data.length === 0) {
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
      const addValigaraProduct = await addProduct({
        ...req.body,
        created_sku: sku,
        image_path: imagePath,
      });

      if (addValigaraProduct.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return addValigaraProduct;
      }
      product_id = addValigaraProduct.data.id;
    } else {
      const updateValigaraProduct = await updateProduct(
        findValigaraProduct.data[0].product_id,
        price
      );

      if (updateValigaraProduct.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return updateValigaraProduct;
      }
      product_id = updateValigaraProduct.data.id;
    }

    return resSuccess({ data: { product_id, variant_id: null } });
  } catch (error) {
    throw error;
  }
};
