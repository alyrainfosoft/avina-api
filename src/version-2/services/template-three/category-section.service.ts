import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import dbContext from "../../../config/db-context";
import Image from "../../model/image.model";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  TemplateFiveSectionType,
} from "../../../utils/app-enumeration";
import {
  BANNER_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  imageAddAndEditInDBAndS3,
  imageDeleteInDBAndS3,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../utils/shared-functions";
import TemplateThreeData from "../../model/template-three.model";
import categoryData from "../../model/category.model";

export const addCategorySection = async (req: Request) => {
  try {
    const {
      link,
      button_name,
      button_color,
      button_text_color,
      sort_order,
      id_category,
    } = req.body;
    const trn = await dbContext.transaction();
    try {
      let idImage = null;
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.category,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idImage = imageData.data;
      }
      await TemplateThreeData.create(
        {
          section_type: TemplateFiveSectionType.CategorySection,
          link: link,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          button_name: button_name,
          is_deleted: DeletedStatus.No,
          button_text_color: button_text_color,
          button_color: button_color,
          sort_order: sort_order,
          id_category: id_category,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const updateCategorySection = async (req: Request) => {
  try {
    const {
      link,
      button_name,
      button_color,
      button_text_color,
      sort_order,
      id_category,
      image_delete = "0",
    } = req.body;

    const findBanner = await TemplateThreeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findBanner && findBanner.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }

    const trn = await dbContext.transaction();
    try {
      let imageId = null;
      let findImage = null;
      if (findBanner.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findBanner.dataValues.id_image },
          transaction: trn,
        });
      }
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.category,
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
        await TemplateThreeData.update(
          {
            section_type: TemplateFiveSectionType.CategorySection,
            link: link,
            is_active: ActiveStatus.Active,
            id_image:
              image_delete && image_delete === "1"
                ? null
                : imageId || findBanner.dataValues.id_image,
            button_name: button_name,
            is_deleted: DeletedStatus.No,
            button_text_color: button_text_color,
            button_color: button_color,
            sort_order: sort_order,
            id_category: id_category,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: findBanner.dataValues.id }, transaction: trn }
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

export const deleteCategorySection = async (req: Request) => {
  try {
    const findBanner = await TemplateThreeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findBanner && findBanner.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }

    await TemplateThreeData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findBanner.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getCategorySection = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      { section_type: TemplateFiveSectionType.CategorySection },
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
      const totalItems = await TemplateThreeData.count({
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

    const result = await TemplateThreeData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "link",
        "is_active",
        "description",
        "button_name",
        "button_color",
        "button_text_color",
        "sort_order",
        "id_category",
        [Sequelize.literal("category.category_name"), "category_name"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: categoryData, as: "category", attributes: [] },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCategorySection = async (req: Request) => {
  try {
    const findBanner = await TemplateThreeData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateFiveSectionType.CategorySection },
        is_deleted: DeletedStatus.No,
      },
    });

    if (!(findBanner && findBanner.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }
    await TemplateThreeData.update(
      {
        is_active: statusUpdateValue(findBanner),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findBanner.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
