import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import { ActiveStatus, BANNER_TYPE, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType, TEMPLATE_2_BANNER_TYPE } from "../../../utils/app-enumeration";
import {
  BANNER_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import {
  addActivityLogs,
  getInitialPaginationFromQuery,
  getLocalDate,
  resNotFound,
  resSuccess,
} from "../../../utils/shared-functions";
import { initModels } from "../../model/index.model";

// Upsert (add/update/delete) multiple banners in one request
export const upsertTemplateTwoHomeAboutMarketingSections = async (req: Request) => {
  const { Image, TemplateTwoBanner } = initModels(req);
  const banners = req.body.banners || [];
  const clientId = req?.body?.session_res?.client_id;
  const userId = req.body.session_res.id_app_user;
  const db = req.body.db_connection;
  const bannerType = TEMPLATE_2_BANNER_TYPE.home_about_marketing_section;

  const trn = await db.transaction();
  try {

    // Fetch all existing banners for this section and company
    const existingBanners = await TemplateTwoBanner.findAll({
      where: { company_info_id: clientId, banner_type: bannerType, is_deleted: DeletedStatus.No },
      transaction: trn
    });
    const existingIds = existingBanners.map(b => Number(b.id));    
    const incomingIds = banners.filter(b => b.id).map(b => Number(b.id));
    // Soft-delete banners not present in incoming list
    const toDelete = existingIds.filter(id => !incomingIds.includes(id));
    if (toDelete.length > 0) {
      await TemplateTwoBanner.update(
        {
          is_deleted: DeletedStatus.yes,
          modified_by: userId,
          modified_date: getLocalDate(),
        },
        { where: { id: toDelete, company_info_id: clientId }, transaction: trn }
      );
    }

    // Add or update banners
    for (let i = 0; i < banners.length; i++) {
      const banner = banners[i];
      let idImage = banner.id_image || null;

      // Find the file for this banner (multer stores files by fieldname)
      const fileField = `banners[${i}][file]`;
      let file = null;
      if (req.files) {
        if (Array.isArray(req.files)) {
          // unlikely, but for completeness
          file = req.files.find(f => f.fieldname === fileField) || null;
        } else {
          file = req.files[fileField]?.[0] || req.files[fileField] || null;
        }
      }

      if (file) {
        const moveFileResult = await moveFileToS3ByType(db, file, IMAGE_TYPE.banner, clientId, req);
        if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return moveFileResult;
        }
        const imageResult = await Image.create({
          image_path: moveFileResult.data,
          image_type: IMAGE_TYPE.banner,
          created_by: userId,
          company_info_id: clientId,
          created_date: getLocalDate(),
        }, { transaction: trn });
        idImage = imageResult.dataValues.id;
      }

      const bannerData = {
        name: banner.title,
        content: banner.content,
        is_active: banner.is_active ?? ActiveStatus.Active,
        id_image: idImage,
        sort_order: banner.sort_order || null,
        title_color: banner.title_color ?? null,
        sub_title_color: banner.sub_title_color ?? null,
        description_color: banner.description_color ?? null,
        company_info_id: clientId,
        banner_type: bannerType,
        modified_by: userId,
        modified_date: getLocalDate(),
      };

      if (banner.id) {
        // Update
        await TemplateTwoBanner.update(bannerData, { where: { id: banner.id, company_info_id: clientId }, transaction: trn });
      } else {
        // Add
        await TemplateTwoBanner.create({
          ...bannerData,
          is_deleted: DeletedStatus.No,
          created_by: userId,
          created_date: getLocalDate(),
        }, { transaction: trn });
      }
    }

    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};

export const getAllTemplateTwoHomeAboutMarketingSection = async (req: Request) => {

  try {
    const {Image, TemplateTwoBanner} = initModels(req)

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      {banner_type: TEMPLATE_2_BANNER_TYPE.home_about_marketing_section},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
          [Op.or]: [
            { name: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
        ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await TemplateTwoBanner.count({
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

    const result = await TemplateTwoBanner.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "is_active",
        "content",
        "sort_order",
        "title_color",
        "sub_title_color",
        "description_color",
        [Sequelize.literal("image.id"), "id_image"],
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
    });


    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }

};

export const deleteTemplateTwoHomeAboutMarketingSection = async (req: Request) => {
  try {
    const {Image, TemplateTwoBanner} = initModels(req)

    const bannerToDelete = await TemplateTwoBanner.findOne({
      where: { id: req.body.id, is_deleted: DeletedStatus.No, banner_type: TEMPLATE_2_BANNER_TYPE.home_about_marketing_section,company_info_id :req?.body?.session_res?.client_id  },
    });

    if (!(bannerToDelete && bannerToDelete.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }

    await TemplateTwoBanner.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: bannerToDelete.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temap_two_marketing_id: bannerToDelete?.dataValues?.id, data: bannerToDelete?.dataValues,banner_type: TEMPLATE_2_BANNER_TYPE.home_about_marketing_section },
      new_data: {
        temap_two_marketing_id: bannerToDelete?.dataValues?.id, data: {
          ...bannerToDelete?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        },
        banner_type: TEMPLATE_2_BANNER_TYPE.home_about_marketing_section
      }
    }], bannerToDelete?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateTwoHomeAboutMarketing, req?.body?.session_res?.id_app_user)

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const statusUpdateTemapleTwoHomeAboutMarketingSection = async (req: Request) => {
  try {
    const {Image, TemplateTwoBanner} = initModels(req)

      const BannerExists = await TemplateTwoBanner.findOne({ where: { id: req.body.id,  banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.home_about_marketing_section }, is_deleted: DeletedStatus.No ,company_info_id :req?.body?.session_res?.client_id} });
      if (BannerExists) {
          const BannerActionInfo = await (TemplateTwoBanner.update(
              {
                  is_active: req.body.is_active,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user
              },
              { where: { id: BannerExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
          ));
          if (BannerActionInfo) {
            await addActivityLogs(req,req?.body?.session_res?.client_id,[{
              old_data: { temap_two_marketing_id: BannerExists?.dataValues?.id, data: BannerExists?.dataValues, banner_type: TEMPLATE_2_BANNER_TYPE.home_about_marketing_section},
              new_data: {
                temap_two_marketing_id: BannerExists?.dataValues?.id, data: {
                  ...BannerExists?.dataValues, is_active: req?.body?.is_active,
                  modified_date: getLocalDate(),
                  modified_by: req?.body?.session_res?.id_app_user,
                },
                banner_type: TEMPLATE_2_BANNER_TYPE.home_about_marketing_section
              }
            }], BannerExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateTwoHomeAboutMarketing, req?.body?.session_res?.id_app_user)
              
              return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
          } 
      } else {
          return resNotFound({message: BANNER_NOT_FOUND});
      }
  } catch (error) {
      throw error
  }
}