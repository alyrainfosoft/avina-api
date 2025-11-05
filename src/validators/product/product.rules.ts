import { body } from "express-validator";
import {
  IProductCategory,
  IProductDiamondOptions,
  IProductMetalOptions,
} from "../../data/interfaces/common/common.interface";
import {
  DIAMOND_TYPE_FIELD_VALUES,
  PRODUCT_IMAGE_TYPE_LIST,
  PRODUCT_VIDEO_TYPE_LIST,
} from "../../utils/app-constants";
import { STONE_TYPE } from "../../utils/app-enumeration";
import {
  DIAMOND_TYPE_EXPECTED_TYPE,
  DUPLICATE_VALUE_ERROR_MESSAGE,
  ID_OR_METAL_TONE_REQUIRED,
  METAL_DATA_IS_REQUIRED,
  ONLY_ONE_VALUE_ERROR_MESSAGE,
  PRODUCT_IMAGE_EXPECTED_TYPE,
  PRODUCT_VIDEO_EXPECTED_TYPE,
  SUB_CATEGORY_REQUIRED_FOR_SUB_SUB_CATEGORY,
} from "../../utils/app-messages";
import { prepareMessageFromParams } from "../../utils/shared-functions";
import {
  fieldArrayChain,
  fieldBitChain,
  fieldFloatMinMaxChain,
  fieldFloatMinMaxOptionalChain,
  fieldIntegerChain,
  fieldIntegerOptionalChain,
  fieldStringChain,
  fieldStringMinMaxChain,
  fieldUniqueValueArrayChain,
  fieldUniqueValueArrayChainOptional,
} from "../common-validation-rules";

export const activeInactiveProductRule = [
  fieldIntegerChain("Product id", "id_product"),
  fieldBitChain("Is active", "is_active"),
];

export const featuredProductRule = [
  fieldIntegerChain("Product id", "id_product"),
  fieldBitChain("Is featured", "is_featured"),
];

export const trendingProductRule = [
  fieldIntegerChain("Product id", "id_product"),
  fieldBitChain("Is trending", "is_trending"),
];

export const deleteProductRule = [fieldIntegerChain("Id", "id")];

export const deleteProductAttributeValueRule = [fieldIntegerChain("Id", "id")];

const totalSameCategoryRecord = (
  categories: IProductCategory[],
  validCategory: IProductCategory
) => {
  let count = 0;
  for (const category of categories) {
    if (
      category.id_category === validCategory.id_category &&
      category.id_sub_category === validCategory.id_sub_category &&
      category.id_sub_sub_category === validCategory.id_sub_sub_category
    ) {
      count++;
    }
  }
  return count;
};

export const validateProductCategoryList = (input: IProductCategory[]) => {
  for (const category of input) {
    const count = totalSameCategoryRecord(input, category);
    if (count > 1) {
      return false;
    }
  }
  return true;
};

export const checkDuplicateMetalConfig = (
  input: Omit<IProductMetalOptions, "id_product">[]
) => {
  for (const [moIndex, metalOption] of input.entries()) {
    const duplicate = input.find(
      (item, index) =>
        item.id_metal_group === metalOption.id_metal_group && index !== moIndex
    );
    if (duplicate) {
      return false;
    }
  }
  return true;
};

export const checkMultipleDefaultMetalConfig = (
  input: Omit<IProductMetalOptions, "id_product">[]
) => {
  let defaultCount = 0;
  for (const [doIndex, metalOption] of input.entries()) {
    if (metalOption.is_default === "1") {
      defaultCount++;
    }
  }
  if (defaultCount !== 1) {
    return false;
  }

  return true;
};

export const checkDuplicateDiamondOptions = (
  input: Omit<IProductDiamondOptions, "id_product">[]
) => {
  // for (const [doIndex, diamondOption] of input.entries()) {
  //   const duplicate = input.find(
  //     (item, index) =>
  //       index !== doIndex &&
  //       item.id_gemstone === diamondOption.id_gemstone &&
  //       item.id_type === diamondOption.id_type &&
  //       item.id_cut === diamondOption.id_cut &&
  //       item.id_clarity === diamondOption.id_clarity &&
  //       item.id_color === diamondOption.id_color &&
  //       item.id_shape === diamondOption.id_shape &&
  //       item.id_setting === diamondOption.id_setting
  //   );
  //   if (duplicate) {
  //     return false;
  //   }
  // }
  return true;
};

export const checkMultipleDefaultDiamondConfig = (
  input: Omit<IProductDiamondOptions, "id_product">[]
) => {
  let defaultCenterCount = 0;
  let defaultSideCount = 0;
  for (const [doIndex, diamondOption] of input.entries()) {
    if (diamondOption.is_default === "1") {
      if (diamondOption.id_type === STONE_TYPE.Center) {
        defaultCenterCount++;
      } else if (diamondOption.id_type === STONE_TYPE.Side) {
        defaultSideCount++;
      }
    }
  }
  if (defaultCenterCount !== 1) {
    return false;
  }

  return true;
};

export const saveProductBasicDetailsRule = [
  fieldIntegerChain("Id product", "id_product"),
  fieldStringMinMaxChain("Name", "name", 2, 200),
  fieldStringMinMaxChain("sku", "sku", 2, 200),
  // fieldStringMinMaxChain("Sort description", "sort_description", 4, 400),
  fieldStringMinMaxChain("Long description", "long_description", 20, 2000),
  fieldUniqueValueArrayChain("Tag", "tag", 0),
  fieldArrayChain("Prouct category list", "product_categories")
    .custom((input, meta) => {
      if (!input) {
        return true;
      }
      for (const category of input) {
        if (category.id_sub_sub_category) {
          if (!category.id_sub_category) {
            return false;
          }
        }
      }
      return true;
    })
    .withMessage(SUB_CATEGORY_REQUIRED_FOR_SUB_SUB_CATEGORY)
    .custom((input, meta) => {
      if (!input) {
        return true;
      }
      return validateProductCategoryList(input);
    })
    .withMessage(
      prepareMessageFromParams(DUPLICATE_VALUE_ERROR_MESSAGE, [
        ["field_name", "Category"],
      ])
    ),
  fieldIntegerChain("Id", "product_categories.*.id"),
  fieldIntegerChain("Id category", "product_categories.*.id_category"),
  fieldIntegerChain(
    "Id category",
    "product_categories.*.id_sub_category"
  ).optional(),
  fieldIntegerChain(
    "Id category",
    "product_categories.*.id_sub_sub_category"
  ).optional(),
  fieldFloatMinMaxChain("Making charge", "making_charge", 0, 9999999.999),
  fieldFloatMinMaxChain("Finding charge", "finding_charge", 0, 9999999.999),
  fieldFloatMinMaxChain("Other charge", "other_charge", 0, 9999999.999),
];

export const saveProductMetalDiamondDetailsRule = [
  fieldIntegerChain("Id product", "id_product"),
  fieldUniqueValueArrayChain("Setting style type", "setting_style_type", 1),
  fieldUniqueValueArrayChain("Size", "size", 0),
  fieldUniqueValueArrayChain("Length", "length", 0),
  fieldArrayChain("Product metal options", "product_metal_options")
    .custom((input, meta) => {
      if (!input) {
        return true;
      }
      return checkDuplicateMetalConfig(input);
    })
    .withMessage(
      prepareMessageFromParams(DUPLICATE_VALUE_ERROR_MESSAGE, [
        ["field_name", "Metal group"],
      ])
    )
    .custom((input, meta) => {
      if (!input) {
        return true;
      }
      return checkMultipleDefaultMetalConfig(input);
    })
    .withMessage(
      prepareMessageFromParams(ONLY_ONE_VALUE_ERROR_MESSAGE, [
        ["field_name", "Is default"],
        ["value", "1"],
      ])
    ),
  fieldIntegerChain("Id", "product_metal_options.*.id"),
  fieldIntegerChain("Id metal group", "product_metal_options.*.id_metal_group"),
  fieldIntegerChain("Metal weight", "product_metal_options.*.metal_weight"),
  fieldBitChain("Is default", "product_metal_options.*.is_default"),
  fieldArrayChain("Product diamond options", "product_diamond_options")
    .custom((input, meta) => {
      if (!input) {
        return true;
      }
      return checkDuplicateDiamondOptions(input);
    })
    .withMessage(
      prepareMessageFromParams(DUPLICATE_VALUE_ERROR_MESSAGE, [
        ["field_name", "Diamond option"],
      ])
    )
    .custom((input, meta) => {
      if (!input) {
        return true;
      }
      return checkMultipleDefaultDiamondConfig(input);
    })
    .withMessage(
      prepareMessageFromParams(ONLY_ONE_VALUE_ERROR_MESSAGE, [
        ["field_name", "Is default"],
        ["value", "1"],
      ])
    ),
  fieldIntegerChain("Id", "product_diamond_options.*.id"),
  fieldIntegerChain(
    "Id diamond group",
    "product_diamond_options.*.id_diamond_group"
  ),
  fieldIntegerChain("Id type", "product_diamond_options.*.id_type")
    .isIn(DIAMOND_TYPE_FIELD_VALUES)
    .withMessage(DIAMOND_TYPE_EXPECTED_TYPE),
  fieldIntegerChain("Id setting", "product_diamond_options.*.id_setting"),
  fieldFloatMinMaxChain(
    "Weight",
    "product_diamond_options.*.weight",
    0,
    99.999
  ),
  fieldIntegerChain("Count", "product_diamond_options.*.count"),
  fieldBitChain("Is default", "product_diamond_options.*.is_default"),
];

export const addProductImagesRules = [
  fieldIntegerChain("Id product", "id_product"),
  fieldIntegerChain("Image type", "image_type")
    .isIn(PRODUCT_IMAGE_TYPE_LIST)
    .withMessage(PRODUCT_IMAGE_EXPECTED_TYPE),
];

export const addProductVideoRules = [
  fieldIntegerChain("Id product", "id_product"),
  fieldIntegerChain("Id metal tone", "id_metal_tone"),
  fieldIntegerChain("Video type", "video_type")
    .isIn(PRODUCT_VIDEO_TYPE_LIST)
    .withMessage(PRODUCT_VIDEO_EXPECTED_TYPE),
];

const deleteProductFileRules = [
  fieldIntegerChain("Id product", "id_product"),
  body("id")
    .custom((input, meta) => {
      if (!input) {
        if (!meta.req.body.id_metal_tone) {
          return false;
        }
      }
      return true;
    })
    .withMessage(ID_OR_METAL_TONE_REQUIRED),
  fieldIntegerChain("Id", "id").optional(),
  fieldIntegerChain("Id metal tone", "id_metal_tone").optional(),
];

export const deleteProductImageRules = [
  ...deleteProductFileRules,
  fieldIntegerChain("Image type", "image_type")
    .isIn(PRODUCT_IMAGE_TYPE_LIST)
    .withMessage(PRODUCT_IMAGE_EXPECTED_TYPE)
    .optional(),
];

export const deleteProductVideoRules = [
  ...deleteProductFileRules,
  fieldIntegerChain("Video type", "video_type")
    .isIn(PRODUCT_VIDEO_TYPE_LIST)
    .withMessage(PRODUCT_VIDEO_EXPECTED_TYPE)
    .optional(),
];

export const addProductWishListRules = [
  fieldIntegerChain("user id", "user_id"),
  fieldIntegerChain("product id", "product_id"),
];

export const birthstoneProductDetailRules = [
  fieldStringChain("slug", "slug"),
];

export const deleteCartProductRules = [fieldStringChain("Cart id", "cart_id")];

export const addProductCartListRules = [
  fieldIntegerChain("product id", "product_id"),
];

export const addProductWithVariantRules = [
  fieldIntegerChain("Id product", "id_product"),
  fieldStringMinMaxChain("Title", "title", 2, 200),
  fieldStringMinMaxChain("sku", "sku", 2, 200),
  // fieldStringMinMaxChain("Sort description", "Short_Description", 4, 400),
  fieldStringMinMaxChain("Long description", "long_description", 20, 2000),
  fieldUniqueValueArrayChain("Tag", "tag", 0),
  fieldUniqueValueArrayChainOptional("Collection", "collection"),
  fieldUniqueValueArrayChainOptional("Product size", "size"),
  fieldUniqueValueArrayChainOptional("product length", "length"),
  fieldArrayChain("Prouct category list", "product_categories")
    .custom((input, meta) => {
      if (!input) {
        return true;
      }
      for (const category of input) {
        if (category.id_sub_sub_category) {
          if (!category.id_sub_category) {
            return false;
          }
        }
      }
      return true;
    })
    .withMessage(SUB_CATEGORY_REQUIRED_FOR_SUB_SUB_CATEGORY)
    .custom((input, meta) => {
      if (!input) {
        return true;
      }
      return validateProductCategoryList(input);
    })
    .withMessage(
      prepareMessageFromParams(DUPLICATE_VALUE_ERROR_MESSAGE, [
        ["field_name", "Category"],
      ])
    ),
  fieldIntegerChain("Id", "product_categories.*.id"),
  fieldIntegerChain("Id category", "product_categories.*.id_category"),
  fieldIntegerChain(
    "Id category",
    "product_categories.*.id_sub_category"
  ).optional(),
  fieldIntegerChain(
    "Id category",
    "product_categories.*.id_sub_sub_category"
  ).optional(),
  fieldFloatMinMaxChain("Making charge", "making_charge", 0, 9999999.999),
  fieldFloatMinMaxChain("Finding charge", "finding_charge", 0, 9999999.999),
  fieldFloatMinMaxChain("Other charge", "other_charge", 0, 9999999.999),
  fieldArrayChain("Product Metal data", "product_metal_options")
    .custom((input) => {
      if (input.length > 0) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage(METAL_DATA_IS_REQUIRED),
  // fieldBitChain("Is choose setting", "is_choose_setting"),
  // fieldBitChain("Is single", "is_single"),
  fieldFloatMinMaxOptionalChain(
    "Product metal option center diamond price",
    "product_metal_options.*.center_diamond_price",
    0,
    9999999.999
  ),
  fieldUniqueValueArrayChainOptional(
    "Setting diamond shapes",
    "setting_diamond_shapes"
  ),
];
