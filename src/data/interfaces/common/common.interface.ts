import { Transaction } from "sequelize";
import { TAttributeType, TBitFieldValue } from "../../types/common/common.type";

export interface TResponseReturn {
  code: number;
  status: string;
  message: string;
  data: any;
}

export interface IQueryPagination {
  per_page_rows: number;
  current_page: number;
  order_by: string;
  sort_by: string;
  is_active?: TBitFieldValue;
  total_pages: number;
  total_items: number;
  search_text: string;
}

export interface IBannerQueryPagination extends IQueryPagination {
  is_active?: TBitFieldValue;
}

export interface IRolePermissionAccess {
  id_menu_item: number;
  access: number[];
}

export interface IPayloadValidateProductAttributeValue {
  attribute_type: TAttributeType;
  id_attribute_value: number;
}

export interface IProductMetalOptions {
  id: number;
  id_product: number;
  id_metal_group: number;
  metal_weight: number;
  is_default: string;
}

export interface IProductMetalGoldData {
  id: number;
  id_product: number;
  id_metal: number;
  metal_weight: number;
  id_metal_tone: [];
  id_karat: number;
  retail_price: any;
  compare_price: any;
  is_deleted: any;
  price: any;
  quantity: number;
  band_metal_weight: number;
}

export interface IProductMetalSilverData {
  id: number;
  id_product: number;
  id_metal: number;
  metal_weight: number;
  retail_price: any;
  compare_price: any;
  id_metal_tone: [];
  is_deleted: any;
  price: any;
  quantity: number;
  band_metal_weight: number;
}

export interface IProductVariantMetalData {
  id: number;
  id_size: any;
  id_length: any;
  id_metal: any;
  id_karat: any;
  quantity: number;
  side_dia_weight: any;
  side_dia_count: any;
  id_metal_tone: any;
  metal_weight: any;
  compare_price: any;
  is_deleted: any;
  retail_price: any;
  center_diamond_price?: number;
  metal_tone?: any;
  band_metal_price: number;
  band_metal_weight: number;
}

export interface IProductDiamondOptions {
  id: number;
  id_product: number;
  id_diamond_group: number;
  id_type: number;
  id_setting: number;
  weight: number;
  count: number;
  is_default: string;
}

export interface ISaveProductMetalOptionsPayload {
  idProduct: number;
  productMetalOptions: IProductMetalOptions[];
  idAppUser: number;
  trn: Transaction;
}

export interface ISaveSettingStyleTypePayload {
  settingStyleType: number[];
  oldSettingStyleType: string;
  idProduct: number;
  idAppUser: number;
  trn: Transaction;
}

export interface ISaveProductDiamondOptionsPayload {
  productDiamondOptions: IProductDiamondOptions[];
  idProduct: number;
  idAppUser: number;
  trn: Transaction;
}

export interface ISaveProductSizePayload {
  size: number[];
  oldSize: string;
  idProduct: number;
  idAppUser: number;
  trn: Transaction;
}

export interface ISaveProductLengthPayload {
  length: number[];
  oldLength: string;
  idProduct: number;
  idAppUser: number;
  trn: Transaction;
}

export interface IProductCategory {
  id: number;
  id_category: number;
  id_sub_category?: number;
  id_sub_sub_category?: number;
}

export interface IValidateProductTagPayload {
  tag: number[];
  oldTag: string;
}

export interface IValidateProductCollectionPayload {
  collection: number[];
  oldCollection: string;
}

export interface IValidateProductSizePayload {
  size: number[];
  oldSize: string;
}

export interface IValidateProductLengthPayload {
  length: number[];
  oldLength: string;
}

export interface IValidateDiamondShapesPayload {
  shapes: number[];
  oldShapes: string;
}

export interface IValidateProductCategoryPayload {
  categories: IProductCategory[];
  id_product: number | null;
}

export interface IMetalRate {
  id_metal: number;
  rate: number;
  formula: number;
}

export interface IMetalGroupRate {
  id_metal_config: number;
  rate: number;
}
