import { Request } from "express";
import { QueryTypes, Sequelize } from "sequelize";
import categoryData from "../../../model/category.model";
import Image from "../../../model/image.model";
import ClarityData from "../../../model/master/attributes/clarity.model";
import Colors from "../../../model/master/attributes/colors.model";
import CutsData from "../../../model/master/attributes/cuts.model";
import DiamondGroupMaster from "../../../model/master/attributes/diamond-group-master.model";
import DiamondShape from "../../../model/master/attributes/diamondShape.model";
import Gemstones from "../../../model/master/attributes/gemstones.model";
import ItemLengthData from "../../../model/master/attributes/item-length.model";
import ItemSizeData from "../../../model/master/attributes/item-size.model";
import GoldKarat from "../../../model/master/attributes/metal/gold-karat.model";
import MetalGroupMaster from "../../../model/master/attributes/metal/metal-group-master.model";
import MetalMaster from "../../../model/master/attributes/metal/metal-master.model";
import MetalTone from "../../../model/master/attributes/metal/metalTone.model";
import MMSize from "../../../model/master/attributes/mmSize.model";
import SettingCaratWeight from "../../../model/master/attributes/settingCaratWeight.model";
import SettingType from "../../../model/master/attributes/settingType.model";
import Tag from "../../../model/master/attributes/tag.model";
import { resSuccess } from "../../../utils/shared-functions";
import Orders from "../../../model/order.model";
import {
  ActiveStatus,
  OrderStatus,
  PRODUCT_IMAGE_TYPE,
  PaymentStatus,
} from "../../../utils/app-enumeration";
import OrdersDetails from "../../../model/order-details.model";
import Product from "../../../model/product.model";
import ProductImage from "../../../model/product-image.model";
import dbContext from "../../../config/db-context";

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
        [Sequelize.literal("image.image_path"), "image_path"],
        "is_searchable",
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const keyWords = await Tag.findAll({
      where,
      attributes: ["id", "name"],
    });

    const setting_type_list = await SettingType.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const item_size = await ItemSizeData.findAll({
      where,
      attributes: ["id", "size", "slug"],
    });

    const item_length = await ItemLengthData.findAll({
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
    const MM_Size = await MMSize.findAll({
      where,
      attributes: ["id", "value", "slug"],
    });
    const stone = await Gemstones.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
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
        stone_clarity,
        stone_color,
        stone_cut,
        stone_shape,
        diamond_master,
        stone_setting,
        MM_Size,
        metal_tone,
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
      `SELECT OD.product_id, products.name, products.sku, products.slug, count(OD.product_id) AS 	order_count , (SELECT product_images.image_path FROM product_images WHERE product_images.id_product = OD.product_id AND product_images.image_type = ${PRODUCT_IMAGE_TYPE.Feature} LIMIT 1) FROM order_details as OD LEFT OUTER JOIN products ON products.id = OD.product_id GROUP BY OD.product_id, products.name, products.sku, products.slug ORDER BY count(OD.product_id) DESC LIMIT 10`,
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
