import { Request } from "express";
import { Op, QueryTypes, Sequelize } from "sequelize";
import categoryData from "../../../model/category.model";
import Image from "../../../model/image.model";
import ClarityData from "../../../model/master/attributes/clarity.model";
import Colors from "../../../model/master/attributes/colors.model";
import CutsData from "../../../model/master/attributes/cuts.model";
import DiamondGroupMaster from "../../../model/master/attributes/diamond-group-master.model";
import DiamondShape from "../../../model/master/attributes/diamondShape.model";
import StoneData from "../../../model/master/attributes/gemstones.model";
import LengthData from "../../../model/master/attributes/item-length.model";
import SizeData from "../../../model/master/attributes/item-size.model";
import GoldKarat from "../../../model/master/attributes/metal/gold-karat.model";
import MetalGroupMaster from "../../../model/master/attributes/metal/metal-group-master.model";
import MetalMaster from "../../../model/master/attributes/metal/metal-master.model";
import MetalTone from "../../../model/master/attributes/metal/metalTone.model";
import MMSizeData from "../../../model/master/attributes/mmSize.model";
import SettingCaratWeight from "../../../model/master/attributes/settingCaratWeight.model";
import SettingTypeData from "../../../model/master/attributes/settingType.model";
import Tag from "../../../model/master/attributes/tag.model";
import {
  resSuccess,
  resUnknownError,
} from "../../../../utils/shared-functions";
import Orders from "../../../model/order.model";
import {
  ActiveStatus,
  AllProductTypes,
  ConfigStatus,
  ConfiguratorManageKeys,
  DeletedStatus,
  OrderStatus,
  PRODUCT_IMAGE_TYPE,
  PaymentStatus,
} from "../../../../utils/app-enumeration";
import OrdersDetails from "../../../model/order-details.model";
import Product from "../../../model/product.model";
import ProductImage from "../../../model/product-image.model";
import dbContext from "../../../../config/db-context";
import DiamondCaratSize from "../../../model/master/attributes/caratSize.model";
import HeadsData from "../../../model/master/attributes/heads.model";
import ShanksData from "../../../model/master/attributes/shanks.model";
import SideSettingStyles from "../../../model/master/attributes/side-setting-styles.model";
import SieveSizeData from "../../../model/master/attributes/seiveSize.model";
import { IMAGE_TYPE_LOCATION } from "../../../../utils/app-constants";
import { s3UploadObject } from "../../../../helpers/s3-client.helper";
import { DEFAULT_STATUS_CODE_SUCCESS } from "../../../../utils/app-messages";
import BirthStoneProduct from "../../../model/birth-stone-product/birth-stone-product.model";
import BrandData from "../../../model/master/attributes/brands.model";
import Collection from "../../../model/master/attributes/collection.model";
const { imageToWebp } = require("image-to-webp");
const fs = require("fs");
export const addProductDropdown = async (req: Request) => {
  try {
    let where = [{ is_deleted: "0" }, { is_active: "1" }];

    const categoryList = await categoryData.findAll({
      where,
      attributes: [
        "id",
        "parent_id",
        "category_name",
        "slug",
        "is_setting_style",
        "is_size",
        "is_length",
        [
          Sequelize.literal(
            `CASE WHEN "id_size" IS NULL THEN '{}'::int[] ELSE string_to_array("id_size", '|')::int[] END`
          ),
          "id_size",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_length" IS NULL THEN '{}'::int[] ELSE string_to_array("id_length", '|')::int[] END`
          ),
          "id_length",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
        "is_searchable",
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const keyWords = await Tag.findAll({
      where,
      attributes: ["id", "name"],
    });

    const setting_type_list = await SettingTypeData.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const item_size = await SizeData.findAll({
      where,
      attributes: ["id", "size", "slug"],
    });

    const item_length = await LengthData.findAll({
      where,
      attributes: ["id", "length", "slug"],
    });

    const metal_list = await MetalMaster.findAll({
      where,
      order: [["id", "ASC"]],
      attributes: ["id", "name", "metal_rate"],
    });

    const metal_karat = await GoldKarat.findAll({
      where,
      attributes: ["id", "name"],
    });
    const MM_Size = await MMSizeData.findAll({
      where,
      attributes: ["id", "value", "slug"],
    });
    const stone = await StoneData.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        "gemstone_type",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const stone_cut = await CutsData.findAll({
      where,
      attributes: ["id", "value", "slug"],
    });

    const stone_clarity = await ClarityData.findAll({
      where,
      attributes: ["id", "value", "name", "slug"],
    });

    const stone_color = await Colors.findAll({
      where,
      attributes: ["id", "value", "name", "slug"],
    });

    const stone_shape = await DiamondShape.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const stone_setting = await SettingCaratWeight.findAll({
      where,
      attributes: ["id", "value", "slug"],
    });

    const diamond_master = await DiamondGroupMaster.findAll({
      where,
      attributes: [
        "id",
        "name",
        "id_stone",
        "id_color",
        "id_shape",
        "id_mm_size",
        "id_clarity",
        "id_cuts",
        "rate",
      ],
    });

    const metal_tone = await MetalTone.findAll({
      where,
      attributes: ["id", "name", "id_metal"],
    });

    const carat_size = await DiamondCaratSize.findAll({
      where,
      attributes: ["id", ["value", "name"], "slug", "sort_code"],
    });

    const stone_seive = await SieveSizeData.findAll({
      where,
      attributes: ["id", ["value", "name"], "slug", "sort_code"],
    });

    const brands = await BrandData.findAll({
      where,
      attributes: ["id", "name", "slug"],
    });

    const collection = await Collection.findAll({
      where,
      attributes: ["id", "name", "slug"],
    });

    return resSuccess({
      data: {
        categoryList,
        keyWords,
        setting_type_list,
        item_size,
        item_length,
        metal_list,
        stone,
        metal_karat,
        stone_seive,
        stone_clarity,
        stone_color,
        stone_cut,
        stone_shape,
        diamond_master,
        stone_setting,
        MM_Size,
        metal_tone,
        carat_size,
        brands,
        collection,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const dashboardAPI = async (req: Request) => {
  try {
    const new_order = await Orders.count({
      where: { order_status: OrderStatus.Pendding },
    });

    const Confirm_order = await Orders.count({
      where: { order_status: OrderStatus.Confirmed },
    });

    const In_process_order = await Orders.count({
      where: { order_status: OrderStatus.Processing },
    });

    const out_of_delivery_order = await Orders.count({
      where: { order_status: OrderStatus.OutOfDeliver },
    });

    const delivery_order = await Orders.count({
      where: { order_status: OrderStatus.Delivered },
    });

    const cancel_order = await Orders.count({
      where: { order_status: OrderStatus.Canceled },
    });

    const return_order = await Orders.count({
      where: { order_status: OrderStatus.Returned },
    });

    const failed_order = await Orders.count({
      where: { order_status: OrderStatus.Failed },
    });

    const total_order = await Orders.count();

    const revenue = await dbContext.query(
      `SELECT sum(order_amount) AS total FROM order_transactions AS OT WHERE OT.payment_status = ${PaymentStatus.paid}`,
      { type: QueryTypes.SELECT }
    );

    const total_revenue = revenue[0];
    const top_selling_product = await dbContext.query(
      `SELECT OD.product_id, products.name, products.sku, products.slug, count(OD.product_id) AS 	order_count , (SELECT product_images.image_path FROM product_images WHERE product_images.id_product = OD.product_id AND product_images.image_type = ${PRODUCT_IMAGE_TYPE.Feature} ORDER BY product_images.id ASC LIMIT 1) FROM order_details as OD INNER JOIN products ON products.id = OD.product_id WHERE (OD.order_details_json ->> 'product_type') = '${AllProductTypes.Product}' AND products.is_active = '${ActiveStatus.Active}' AND products.is_deleted = '${DeletedStatus.No}' GROUP BY OD.product_id, products.name, products.sku, products.slug ORDER BY count(OD.product_id) DESC LIMIT 10`,
      { type: QueryTypes.SELECT }
    );

    const items = await dbContext.query(
      `SELECT sum(order_details.quantity) AS item FROM order_details`,
      { type: QueryTypes.SELECT }
    );

    const total_items = items[0];
    return resSuccess({
      data: {
        new_order,
        Confirm_order,
        In_process_order,
        out_of_delivery_order,
        delivery_order,
        cancel_order,
        return_order,
        failed_order,
        total_order,
        total_revenue,
        total_items,
        top_selling_product,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const configuratorDropDownData = async (req: Request) => {
  try {
    let where = [{ is_deleted: "0" }, { is_active: "1" }];
    let categoryName = "ring";
    const query: any = req.query;
    let whereConfig: any = [{ is_deleted: "0" }, { is_active: "1" }];

    if (query.is_config == "1") {
      categoryName = "ring";
      whereConfig = [...whereConfig, { is_config: query.is_config }];
    } else if (query.is_band == "1") {
      categoryName = "eternity band";
      whereConfig = [...whereConfig, { is_band: query.is_band }];
    } else if (query.is_three_stone == "1") {
      categoryName = "ring";
      whereConfig = [...whereConfig, { is_three_stone: query.is_three_stone }];
    } else if (query.is_bracelet == "1") {
      categoryName = "bracelet";
      whereConfig = [...whereConfig, { is_bracelet: query.is_bracelet }];
    } else if (query.is_pendant == "1") {
      categoryName = "pendant";
      whereConfig = [...whereConfig, { is_pendant: query.is_pendant }];
    } else if (query.is_earring == "1") {
      categoryName = "earring";
      whereConfig = [...whereConfig, { is_earring: query.is_earring }];
    } else {
      categoryName = "ring";
      whereConfig = [
        ...where,
        {
          [Op.or]: [
            { is_config: "1" },
            { is_band: "1" },
            { is_three_stone: "1" },
            { is_bracelet: "1" },
            { is_pendant: "1" },
            { is_earring: "1" },
          ],
        },
      ];
    }

    const gemstoneList = await StoneData.findAll({
      where: whereConfig,
      attributes: [
        "id",
        "name",
        "slug",
        "is_diamond",
        "sort_code",
        "gemstone_type",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const diamondShapeList = await DiamondShape.findAll({
      where: whereConfig,
      order: [
        Sequelize.literal(
          `CASE WHEN '${query.is_config}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int WHEN '${query.is_band}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.EternityBandConfigurator}')::int WHEN '${query.is_bracelet}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.BraceletConfigurator}')::int WHEN '${query.is_pendant}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.PendantConfigurator}')::int WHEN '${query.is_earring}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.EarringConfigurator}')::int WHEN '${query.is_three_stone}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.ThreeStoneConfigurator}')::int ELSE (sort_order::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int END ASC`
        ),
      ],
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [
          Sequelize.literal(
            `CASE WHEN '${query.is_config}' = '1' THEN string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.RingConfigurator}')), ',')::int[] WHEN '${query.is_band}' = '1' THEN string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.EternityBandConfigurator}')), ',')::int[] WHEN '${query.is_bracelet}' = '1' THEN string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.BraceletConfigurator}')), ',')::int[] WHEN '${query.is_pendant}' = '1' THEN string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.PendantConfigurator}')), ',')::int[] WHEN '${query.is_earring}' = '1' THEN string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.EarringConfigurator}')), ',')::int[] WHEN '${query.is_three_stone}' = '1' THEN string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.ThreeStoneConfigurator}')), ',')::int[] ELSE string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.RingConfigurator}')), ',')::int[] END`
          ),
          "diamond_size_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN '${query.is_config}' = '1' THEN (is_diamond::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int WHEN '${query.is_band}' = '1' THEN (is_diamond::json->> '${ConfiguratorManageKeys.EternityBandConfigurator}')::int WHEN '${query.is_bracelet}' = '1' THEN (is_diamond::json->> '${ConfiguratorManageKeys.BraceletConfigurator}')::int WHEN '${query.is_pendant}' = '1' THEN (is_diamond::json->> '${ConfiguratorManageKeys.PendantConfigurator}')::int WHEN '${query.is_earring}' = '1' THEN (is_diamond::json->> '${ConfiguratorManageKeys.EarringConfigurator}')::int WHEN '${query.is_three_stone}' = '1' THEN (is_diamond::json->> '${ConfiguratorManageKeys.ThreeStoneConfigurator}')::int ELSE (is_diamond::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int END`
          ),
          "is_diamond",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const caratSizeList = await DiamondCaratSize.findAll({
      where: whereConfig,
      order: [["value", "ASC"]],
      attributes: [
        "id",
        "value",
        "slug",
        "sort_code",
        [
          Sequelize.literal(
            `CASE WHEN '${query.is_config}' = '1' THEN (is_diamond::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int WHEN '${query.is_band}' = '1' THEN (is_diamond::json->> '${ConfiguratorManageKeys.EternityBandConfigurator}')::int WHEN '${query.is_bracelet}' = '1' THEN (is_diamond::json->> '${ConfiguratorManageKeys.BraceletConfigurator}')::int WHEN '${query.is_pendant}' = '1' THEN (is_diamond::json->> '${ConfiguratorManageKeys.PendantConfigurator}')::int WHEN '${query.is_earring}' = '1' THEN (is_diamond::json->> '${ConfiguratorManageKeys.EarringConfigurator}')::int WHEN '${query.is_three_stone}' = '1' THEN (is_diamond::json->> '${ConfiguratorManageKeys.ThreeStoneConfigurator}')::int ELSE (is_diamond::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int END`
          ),
          "is_diamond",
        ],
        "is_diamond_shape",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const headList = await HeadsData.findAll({
      where: whereConfig,
      order: [
        Sequelize.literal(
          `CASE WHEN '${query.is_config}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int WHEN '${query.is_band}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.EternityBandConfigurator}')::int WHEN '${query.is_bracelet}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.BraceletConfigurator}')::int WHEN '${query.is_pendant}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.PendantConfigurator}')::int WHEN '${query.is_earring}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.EarringConfigurator}')::int WHEN '${query.is_three_stone}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.ThreeStoneConfigurator}')::int ELSE (sort_order::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int END ASC`
        ),
      ],
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [
          Sequelize.literal(
            `CASE WHEN '${query.is_config}' = '1' THEN string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.RingConfigurator}')), ',')::int[] WHEN '${query.is_band}' = '1' THEN string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.EternityBandConfigurator}')), ',')::int[] WHEN '${query.is_bracelet}' = '1' THEN string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.BraceletConfigurator}')), ',')::int[] WHEN '${query.is_pendant}' = '1' THEN string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.PendantConfigurator}')), ',')::int[] WHEN '${query.is_earring}' = '1' THEN string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.EarringConfigurator}')), ',')::int[] WHEN '${query.is_three_stone}' = '1' THEN string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.ThreeStoneConfigurator}')), ',')::int[] ELSE string_to_array(trim(both '[]' from (diamond_size_id ->> '${ConfiguratorManageKeys.RingConfigurator}')), ',')::int[] END`
          ),
          "diamond_size_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN '${query.is_config}' = '1' THEN string_to_array(trim(both '[]' from (diamond_shape_id ->> '${ConfiguratorManageKeys.RingConfigurator}')), ',')::int[] WHEN '${query.is_band}' = '1' THEN string_to_array(trim(both '[]' from (diamond_shape_id ->> '${ConfiguratorManageKeys.EternityBandConfigurator}')), ',')::int[] WHEN '${query.is_bracelet}' = '1' THEN string_to_array(trim(both '[]' from (diamond_shape_id ->> '${ConfiguratorManageKeys.BraceletConfigurator}')), ',')::int[] WHEN '${query.is_pendant}' = '1' THEN string_to_array(trim(both '[]' from (diamond_shape_id ->> '${ConfiguratorManageKeys.PendantConfigurator}')), ',')::int[] WHEN '${query.is_earring}' = '1' THEN string_to_array(trim(both '[]' from (diamond_shape_id ->> '${ConfiguratorManageKeys.EarringConfigurator}')), ',')::int[] WHEN '${query.is_three_stone}' = '1' THEN string_to_array(trim(both '[]' from (diamond_shape_id ->> '${ConfiguratorManageKeys.ThreeStoneConfigurator}')), ',')::int[] ELSE string_to_array(trim(both '[]' from (diamond_shape_id ->> '${ConfiguratorManageKeys.RingConfigurator}')), ',')::int[] END`
          ),
          "diamond_shape_id",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const shankList = await ShanksData.findAll({
      where: whereConfig,
      order: [
        Sequelize.literal(
          `CASE WHEN '${query.is_config}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int WHEN '${query.is_band}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.EternityBandConfigurator}')::int WHEN '${query.is_bracelet}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.BraceletConfigurator}')::int WHEN '${query.is_pendant}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.PendantConfigurator}')::int WHEN '${query.is_earring}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.EarringConfigurator}')::int WHEN '${query.is_three_stone}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.ThreeStoneConfigurator}')::int ELSE (sort_order::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int END ASC`
        ),
      ],
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [
          Sequelize.literal(
            `CASE WHEN '${query.is_config}' = '1' THEN string_to_array(trim(both '[]' from (side_setting_id ->> '${ConfiguratorManageKeys.RingConfigurator}')), ',')::int[] WHEN '${query.is_band}' = '1' THEN string_to_array(trim(both '[]' from (side_setting_id ->> '${ConfiguratorManageKeys.EternityBandConfigurator}')), ',')::int[] WHEN '${query.is_bracelet}' = '1' THEN string_to_array(trim(both '[]' from (side_setting_id ->> '${ConfiguratorManageKeys.BraceletConfigurator}')), ',')::int[] WHEN '${query.is_pendant}' = '1' THEN string_to_array(trim(both '[]' from (side_setting_id ->> '${ConfiguratorManageKeys.PendantConfigurator}')), ',')::int[] WHEN '${query.is_earring}' = '1' THEN string_to_array(trim(both '[]' from (side_setting_id ->> '${ConfiguratorManageKeys.EarringConfigurator}')), ',')::int[] WHEN '${query.is_three_stone}' = '1' THEN string_to_array(trim(both '[]' from (side_setting_id ->> '${ConfiguratorManageKeys.ThreeStoneConfigurator}')), ',')::int[] ELSE string_to_array(trim(both '[]' from (side_setting_id ->> '${ConfiguratorManageKeys.RingConfigurator}')), ',')::int[] END`
          ),
          "side_setting_id",
        ],

        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const sideSettingStyle = await SideSettingStyles.findAll({
      where: whereConfig,
      order: [
        Sequelize.literal(
          `CASE WHEN '${query.is_config}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int WHEN '${query.is_band}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.EternityBandConfigurator}')::int WHEN '${query.is_bracelet}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.BraceletConfigurator}')::int WHEN '${query.is_pendant}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.PendantConfigurator}')::int WHEN '${query.is_earring}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.EarringConfigurator}')::int WHEN '${query.is_three_stone}' = '1' THEN (sort_order::json->> '${ConfiguratorManageKeys.ThreeStoneConfigurator}')::int ELSE (sort_order::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int END ASC`
        ),
      ],
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [
          Sequelize.literal(
            `CASE WHEN "id_shank" IS NULL THEN '{}'::int[] ELSE string_to_array("id_shank", '|')::int[] END`
          ),
          "id_shank",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const category = await categoryData.findOne({
      where: [
        { is_deleted: "0" },
        { is_active: "1" },
        { [Op.and]: [{ category_name: { [Op.iLike]: `${categoryName}%` } }] },
      ],
      attributes: [
        "id",
        "parent_id",
        "category_name",
        [
          Sequelize.literal(
            `CASE WHEN "id_size" IS NULL THEN '{}'::int[] ELSE string_to_array("id_size", '|')::int[] END`
          ),
          "id_size",
        ],
      ],
    });

    const metal = await MetalMaster.findAll({
      where: [...whereConfig, { id: { [Op.ne]: 1 } }],
      attributes: ["id", ["id", "id_metal"], "name", "slug", "metal_rate"],
    });

    const GoldKTList = await GoldKarat.findAll({
      where: whereConfig,
      order: [["name", "ASC"]],
      attributes: [
        "id",
        "name",
        "slug",
        ["id", "id_karat"],
        "id_metal",
        [Sequelize.literal("metal.name"), "metal_name"],
      ],
      include: [
        {
          model: MetalMaster,
          as: "metal",
          attributes: [],
          where: { is_active: "1", is_deleted: "0" },
        },
      ],
    });

    const metalToneList = await MetalTone.findAll({
      where: whereConfig,
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        "id_metal",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const cutsList = await CutsData.findAll({
      where: whereConfig,
      attributes: ["id", "value", "slug"],
    });

    const mm_size = await MMSizeData.findAll({
      where,
      attributes: ["id", "value", "slug"],
    });
    const item_size = await SizeData.findAll({
      where: [
        { is_deleted: "0" },
        { is_active: "1" },
        { id: { [Op.in]: category?.dataValues.id_size } },
      ],
      order: [
        [
          Sequelize.cast(
            Sequelize.fn(
              "regexp_replace",
              Sequelize.col("slug"),
              "^[^0-9.]+",
              ""
            ),
            "NUMERIC"
          ),
          "ASC",
        ],
      ],
      attributes: ["id", "size", "slug"],
    });
    const colorClarityList = await dbContext.query(
      `SELECT id_color, id_clarity, is_config, CASE WHEN '${query.is_config}' = '1' THEN (is_diamond_type::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int WHEN '${query.is_band}' = '1' THEN (is_diamond_type::json->> '${ConfiguratorManageKeys.EternityBandConfigurator}')::int WHEN '${query.is_bracelet}' = '1' THEN (is_diamond_type::json->> '${ConfiguratorManageKeys.BraceletConfigurator}')::int WHEN '${query.is_pendant}' = '1' THEN (is_diamond_type::json->> '${ConfiguratorManageKeys.PendantConfigurator}')::int WHEN '${query.is_earring}' = '1' THEN (is_diamond_type::json->> '${ConfiguratorManageKeys.EarringConfigurator}')::int WHEN '${query.is_three_stone}' = '1' THEN (is_diamond_type::json->> '${ConfiguratorManageKeys.ThreeStoneConfigurator}')::int ELSE (is_diamond_type::json->> '${ConfiguratorManageKeys.RingConfigurator}')::int END AS is_diamond_type, colors.name AS color_name, clarities.name AS clarity_name FROM diamond_group_masters AS DGM INNER JOIN colors ON colors.id = DGM.id_color INNER JOIN clarities ON clarities.id = DGM.id_clarity WHERE CASE WHEN '${query.is_config}' = '1' THEN  DGM.is_config = '1' WHEN '${query.is_three_stone}' = '1' THEN DGM.is_three_stone = '1' WHEN '${query.is_band}' = '1' THEN DGM.is_band = '1' WHEN '${query.is_bracelet}' = '1' THEN DGM.is_bracelet = '1' WHEN '${query.is_pendant}' = '1' THEN DGM.is_pendant = '1' WHEN '${query.is_earring}' = '1' THEN DGM.is_earring = '1' ELSE DGM.is_config = '1' END AND  DGM.is_deleted = '0'AND DGM.is_active = '1' GROUP BY DGM.id, colors.name, clarities.name`,
      { type: QueryTypes.SELECT }
    );

    const metalList = [...GoldKTList, ...metal];

    const eternityProductSizeList = await dbContext.query(
      `SELECT
    DISTINCT 
    ${query.is_band == "1" ? "product_size" : "product_length"},
    dia_shape_id,
    dia_cts,
    CASE
        WHEN (CAST(prod_dia_total_count as integer) % 2 = 0) THEN 'true'
        ELSE 'false'
    END AS is_alternate
FROM
    CONFIG_ETERNITY_PRODUCTS WHERE product_type ilike '${
      query.is_band === "1" ? "Eternity Band" : "Bracelet"
    }';`,
      { type: QueryTypes.SELECT }
    );

    return resSuccess({
      data: {
        gemstoneList,
        diamondShapeList,
        cutsList,
        caratSizeList,
        headList,
        shankList,
        sideSettingStyle,
        metalList,
        GoldKTList,
        metalToneList,
        colorClarityList,
        mm_size,
        item_size,
        eternityProductSizeList,
      },
    });
  } catch (error) {
    throw error;
  }
};
export const publicConfiguratorDropDownData = async (req: Request) => {
  try {
    let where = [{ is_deleted: "0" }, { is_active: "1" }];

    const gemstoneList = await StoneData.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        "is_diamond",
        "sort_code",
        "gemstone_type",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const diamondShapeList = await DiamondShape.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [
          Sequelize.literal(
            `CASE WHEN "diamond_size_id" IS NULL THEN '{}'::int[] ELSE string_to_array("diamond_size_id", '|')::int[] END`
          ),
          "diamond_size_id",
        ],
        "is_diamond",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const caratSizeList = await DiamondCaratSize.findAll({
      where: [{ is_deleted: "0" }, { is_active: "1" }, { is_config: "1" }],
      order: [["value", "ASC"]],
      attributes: [
        "id",
        "value",
        "slug",
        "sort_code",
        "is_diamond",
        [
          Sequelize.literal(
            `CASE WHEN "is_diamond_shape" IS NULL THEN '{}'::int[] ELSE string_to_array("is_diamond_shape", '|')::int[] END`
          ),
          "is_diamond_shape",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const headList = await HeadsData.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [
          Sequelize.literal(
            `CASE WHEN "diamond_size_id" IS NULL THEN '{}'::int[] ELSE string_to_array("diamond_size_id", '|')::int[] END`
          ),
          "diamond_size_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "diamond_shape_id" IS NULL THEN '{}'::int[] ELSE string_to_array("diamond_shape_id", '|')::int[] END`
          ),
          "diamond_shape_id",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const shankList = await ShanksData.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [
          Sequelize.literal(
            `CASE WHEN "side_setting_id" IS NULL THEN '{}'::int[] ELSE string_to_array("side_setting_id", '|')::int[] END`
          ),
          "side_setting_id",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const sideSettingStyle = await SideSettingStyles.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [
          Sequelize.literal(
            `CASE WHEN "id_shank" IS NULL THEN '{}'::int[] ELSE string_to_array("id_shank", '|')::int[] END`
          ),
          "id_shank",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const metal = await MetalMaster.findAll({
      where: [
        { is_active: ActiveStatus.Active },
        { is_deleted: "0" },
        { is_config: ConfigStatus.Yes },
        { id: { [Op.ne]: 1 } },
      ],
      attributes: ["id", ["id", "id_metal"], "name", "slug", "metal_rate"],
    });

    const GoldKTList = await GoldKarat.findAll({
      where: [{ is_deleted: "0" }, { is_active: "1" }, { is_config: "1" }],
      order: [["name", "ASC"]],
      attributes: [
        "id",
        "name",
        "slug",
        ["id", "id_karat"],
        "id_metal",
        [
          Sequelize.literal(
            '(SELECT metal_masters.name FROM metal_masters WHERE id = "id_metal")'
          ),
          "metal_name",
        ],
      ],
    });

    const metalToneList = await MetalTone.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        "id_metal",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const cutsList = await CutsData.findAll({
      where,
      attributes: ["id", "value", "slug"],
    });

    const mm_size = await MMSizeData.findAll({
      where,
      attributes: ["id", "value", "slug"],
    });
    const item_size = await SizeData.findAll({
      where,
      order: [
        [
          Sequelize.cast(
            Sequelize.fn(
              "regexp_replace",
              Sequelize.col("slug"),
              "^[^0-9.]+",
              ""
            ),
            "NUMERIC"
          ),
          "ASC",
        ],
      ],
      attributes: ["id", "size", "slug"],
    });
    const colorClarityList = await dbContext.query(
      "SELECT id_color, id_clarity, is_config, is_diamond_type, colors.name AS color_name, clarities.name AS clarity_name FROM diamond_group_masters AS DGM INNER JOIN colors ON colors.id = DGM.id_color INNER JOIN clarities ON clarities.id = DGM.id_clarity WHERE DGM.is_config = '1' AND  DGM.is_deleted = '0'AND DGM.is_active = '1' GROUP BY DGM.id, colors.name, clarities.name",
      { type: QueryTypes.SELECT }
    );

    const metalList = [...GoldKTList, ...metal];

    return resSuccess({
      data: {
        metal,
        gemstoneList,
        diamondShapeList,
        cutsList,
        caratSizeList,
        headList,
        shankList,
        sideSettingStyle,
        metalList,
        GoldKTList,
        metalToneList,
        colorClarityList,
        mm_size,
        item_size,
      },
    });
  } catch (error) {
    throw error;
  }
};
export const convertImageToWebpAPI = async (req: Request) => {
  try {
    let destinationPath = "demo" + "/" + req.file?.filename;
    const lastDotIndex = destinationPath.lastIndexOf(".");

    const prefix = destinationPath.substring(0, lastDotIndex);

    const webpImage = await imageToWebp(req.file?.path, 100);
    const fileStream = fs.readFileSync(webpImage);
    const data = await s3UploadObject(
      dbContext,
      fileStream,
      `${prefix}.webp`,
      "image/webp",
      null
    );
    fs.rmSync(req.file?.path);
    if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return data;
    }
    return resSuccess({ data: data });
    // const file = req.file?.path
    // console.log("file", file)
    // const webpImage = await imageToWebp(file, 30);
    // fs.copyFileSync(webpImage, "./public/images/demo.webp");
    // return resSuccess({data: { file, webpImage }})
  } catch (error) {
    resUnknownError({ data: error });
    throw error;
  }
};

export const updateBirthstoneProductTitleSlug = async (req: Request) => {
  const { product_details } = req.body;
  try {
    for (let index = 0; index < product_details.length; index++) {
      const element = product_details[index];
      const slug = element.name.toLowerCase().replaceAll(" ", "-");
      const birthStoneProduct = await BirthStoneProduct.update(
        {
          name: element.name,
          slug: slug,
        },
        { where: { style_no: element.style_no, is_deleted: "0" } }
      );
    }

    return resSuccess();
  } catch (error) {
    // throw error
    return resUnknownError({ data: error });
  }
};
