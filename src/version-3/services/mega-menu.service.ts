import { Request } from "express";
import dbContext from "../../config/db-context";
import {
  columnValueLowerCase,
  getInitialPaginationFromQuery,
  getLocalDate,
  imageAddAndEditInDBAndS3,
  imageDeleteInDBAndS3,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../utils/shared-functions";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
  SAME_SLUG_ALREADY_EXIST,
} from "../../utils/app-messages";
import MegaMenu from "../model/mega_menu.model";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
} from "../../utils/app-enumeration";
import { Op, Sequelize } from "sequelize";
import Image from "../model/image.model";
import categoryData from "../model/category.model";
import SettingTypeData from "../model/master/attributes/settingType.model";
import Collection from "../model/master/attributes/collection.model";
import BrandData from "../model/master/attributes/brands.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import MetalTone from "../model/master/attributes/metal/metalTone.model";
import staticPageData from "../model/static_page.model";

export const addMegaMenu = async (req: Request) => {
  try {
    const {
      title,
      slug,
      url = null,
      sort_order = null,
      menu_type,
      target_type,
      id_parent = null,
      id_brand = null,
      id_category = null,
      id_collection = null,
      id_setting_type = null,
      id_diamond_shape = null,
      id_gender = null,
      id_metal_tone = null,
      id_metal = null,
      id_page = null,
    } = req.body;

    const menuType = await MegaMenu.findOne({
      where: [
        columnValueLowerCase("slug", slug.toString()),
        { is_deleted: DeletedStatus.No },
      ],
    });

    if (menuType && menuType.dataValues) {
      return resErrorDataExit({
        message: SAME_SLUG_ALREADY_EXIST,
      });
    }

    const trn = await dbContext.transaction();
    try {
      let idImage = null;
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.MegaMenu,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idImage = imageData.data;
      }

      await MegaMenu.create(
        {
          slug: slug,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          is_deleted: DeletedStatus.No,
          sort_order: sort_order,
          url: url,
          menu_type: menu_type,
          target_type: target_type,
          id_parent:
            id_parent && id_parent != "" && id_parent != undefined
              ? id_parent
              : null,
          id_brand: id_brand,
          id_setting_type: id_setting_type,
          id_category: id_category,
          id_collection: id_collection,
          id_diamond_shape: id_diamond_shape,
          title: title,
          id_gender: id_gender,
          id_metal_tone: id_metal_tone,
          id_metal: id_metal,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
          id_page,
        },
        { transaction: trn }
      );

      await trn.commit();
      return resSuccess();
    } catch (e) {
      console.log(e, "error");
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    console.log(e, "error");
    throw e;
  }
};

export const updateMegaMenu = async (req: Request) => {
  try {
    const {
      title,
      slug,
      url = null,
      sort_order = null,
      menu_type,
      target_type,
      id_parent = null,
      id_brand = null,
      id_category = null,
      id_collection = null,
      id_setting_type = null,
      id_diamond_shape = null,
      id_gender = null,
      id_metal_tone = null,
      id_metal = null,
      id_page = null,
      image_delete = "0",
    } = req.body;

    const findMegaMenu = await MegaMenu.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findMegaMenu && findMegaMenu.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    const megaMenu = await MegaMenu.findOne({
      where: [
        columnValueLowerCase("slug", slug.toString()),
        { id: { [Op.ne]: findMegaMenu.dataValues.id } },
        { is_deleted: DeletedStatus.No },
      ],
    });

    if (megaMenu && megaMenu.dataValues) {
      return resErrorDataExit({
        message: SAME_SLUG_ALREADY_EXIST,
      });
    }
    const trn = await dbContext.transaction();
    try {
      let imageId = null;
      let findImage = null;
      if (findMegaMenu.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findMegaMenu.dataValues.id_image },
          transaction: trn,
        });
      }
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.MegaMenu,
          req.body.session_res.id_app_user,
          findImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageId = imageData.data;
      }
      {
        await MegaMenu.update(
          {
            slug: slug,
            id_image:
              image_delete && image_delete === "1"
                ? null
                : imageId || findMegaMenu.dataValues.id_image,
            sort_order: sort_order,
            url: url,
            menu_type: menu_type,
            target_type: target_type,
            id_parent:
              id_parent && id_parent != "" && id_parent != undefined
                ? id_parent
                : null,
            id_brand: id_brand,
            id_setting_type: id_setting_type,
            id_category: id_category,
            id_collection: id_collection,
            id_diamond_shape: id_diamond_shape,
            title: title,
            id_gender: id_gender,
            id_metal_tone: id_metal_tone,
            id_metal: id_metal,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
            id_page,
          },
          {
            where: { id: findMegaMenu.dataValues.id },
            transaction: trn,
          }
        );
      }
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage, null);
      }
      await trn.commit();
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const deleteMegaMenu = async (req: Request) => {
  try {
    const findMegaMenu = await MegaMenu.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findMegaMenu && findMegaMenu.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await MegaMenu.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findMegaMenu.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getMegaMenu = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              {
                description: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await MegaMenu.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

      paginationProps = {
        limit: pagination.per_page_rows,
        offset: (pagination.current_page - 1) * pagination.per_page_rows,
      };
    }

    const result = await MegaMenu.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "slug",
        "url",
        "menu_type",
        "target_type",
        "id_parent",
        "id_brand",
        "id_setting_type",
        "id_diamond_shape",
        "id_gender",
        "id_metal_tone",
        "id_metal",
        "id_page",
        "is_deleted",
        "created_by",
        "created_date",
        "modified_by",
        "modified_date",
        "sort_order",
        "id_image",
        "id_page",
        "id_category",
        "id_collection",
        "id_setting_type",
        "is_active",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("style.slug"), "style_slug"],
        [Sequelize.literal("brand.slug"), "brand_slug"],
        [Sequelize.literal("diamond_shape.slug"), "diamond_shape_slug"],
        [Sequelize.literal("metal.slug"), "metal_slug"],
        [Sequelize.literal("metal_tone.slug"), "metal_tone_slug"],
        [Sequelize.literal("page.slug"), "page_slug"],
        [Sequelize.literal("category.category_name"), "category_name"],
        [Sequelize.literal("collection.name"), "collection_name"],
        [Sequelize.literal("style.name"), "style_name"],
        [Sequelize.literal("brand.name"), "brand_name"],
        [Sequelize.literal("diamond_shape.name"), "diamond_shape_name"],
        [Sequelize.literal("metal.name"), "metal_name"],
        [Sequelize.literal("metal_tone.name"), "metal_tone_name"],
        [Sequelize.literal("page.page_title"), "page_name"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: categoryData, as: "category", attributes: [] },
        { model: SettingTypeData, as: "style", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
        { model: BrandData, as: "brand", attributes: [] },
        { model: DiamondShape, as: "diamond_shape", attributes: [] },
        { model: MetalMaster, as: "metal", attributes: [] },
        { model: MetalTone, as: "metal_tone", attributes: [] },
        { model: staticPageData, as: "page", attributes: [] },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForMegaMenu = async (req: Request) => {
  try {
    const findMegaMenu = await MegaMenu.findOne({
      where: {
        id: req.params.id,
        is_deleted: DeletedStatus.No,
      },
    });

    if (!(findMegaMenu && findMegaMenu.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await MegaMenu.update(
      {
        is_active: statusUpdateValue(findMegaMenu),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findMegaMenu.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getMegaMenuListForUser = async (req: Request) => {
  try {
    const result = await MegaMenu.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "slug",
        "url",
        "menu_type",
        "target_type",
        "id_parent",
        "id_brand",
        "id_setting_type",
        "id_diamond_shape",
        "id_gender",
        "id_metal_tone",
        "id_metal",
        "id_page",
        "is_deleted",
        "created_by",
        "created_date",
        "modified_by",
        "modified_date",
        "sort_order",
        "id_image",
        "id_page",
        "id_category",
        "id_collection",
        "id_setting_type",
        "is_active",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("style.slug"), "style_slug"],
        [Sequelize.literal("brand.slug"), "brand_slug"],
        [Sequelize.literal("diamond_shape.slug"), "diamond_shape_slug"],
        [Sequelize.literal("metal.slug"), "metal_slug"],
        [Sequelize.literal("metal_tone.slug"), "metal_tone_slug"],
        [Sequelize.literal("page.slug"), "page_slug"],
        [Sequelize.literal("category.category_name"), "category_name"],
        [Sequelize.literal("collection.name"), "collection_name"],
        [Sequelize.literal("style.name"), "style_name"],
        [Sequelize.literal("brand.name"), "brand_name"],
        [Sequelize.literal("diamond_shape.name"), "diamond_shape_name"],
        [Sequelize.literal("metal.name"), "metal_name"],
        [Sequelize.literal("metal_tone.name"), "metal_tone_name"],
        [Sequelize.literal("page.page_title"), "page_name"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: categoryData, as: "category", attributes: [] },
        { model: SettingTypeData, as: "style", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
        { model: BrandData, as: "brand", attributes: [] },
        { model: DiamondShape, as: "diamond_shape", attributes: [] },
        { model: MetalMaster, as: "metal", attributes: [] },
        { model: MetalTone, as: "metal_tone", attributes: [] },
        { model: staticPageData, as: "page", attributes: [] },
      ],
    });

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
