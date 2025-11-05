import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import dbContext from "../../../config/db-context";
import { IQueryPagination } from "../../../data/interfaces/common/common.interface";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import Image from "../../model/image.model";
import { ActiveStatus, IMAGE_TYPE, TEMPLATE_2_BANNER_TYPE } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resNotFound, resSuccess } from "../../../utils/shared-functions";
import TemplateTwoBanner from "../../model/template-2-banner.model";

export const addTemplateTwoMarketingPopup = async (req: Request) => {
    const {name, expiry_date, created_by, button_name, active_date, content, target_url} = req.body
    try {
      let imagePath = null;
      if (req.file) {
        const moveFileResult = await moveFileToS3ByType(dbContext,
          req.file,
          IMAGE_TYPE.banner,
          null
        );
  
        if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return moveFileResult;
        }
  
        imagePath = moveFileResult.data;
      }
  
      const trn = await dbContext.transaction();
      try {
        let idImage = null;
        if (imagePath) {
          const imageResult = await Image.create(
            {
              image_path: imagePath,
              image_type: IMAGE_TYPE.banner,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          idImage = imageResult.dataValues.id;
        }
      const marketingPopup =  await TemplateTwoBanner.create(
          {
            name: name,
            active_date: active_date,
            expiry_date: expiry_date,
            is_active: ActiveStatus.Active,
            id_image: idImage,
            content: content,
            button_name: button_name,
            target_url: target_url,
            banner_type: TEMPLATE_2_BANNER_TYPE.marketing_popup,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
  
        await trn.commit();
        return resSuccess({data: marketingPopup});
      } catch (e) {
        await trn.rollback();
        throw e;
      }
    } catch (e) {
      throw e;
    }
};

export const getAllTemplateTwoMarketingPopup = async (req: Request) => {
    try {
      let paginationProps = {};
  
      let pagination = {
        ...getInitialPaginationFromQuery(req.query),
        search_text: req.query.search_text,
      };
      let noPagination = req.query.no_pagination === "1";
  
      let where = [
        { banner_type: TEMPLATE_2_BANNER_TYPE.marketing_popup },
        { is_deleted: "0" },
        pagination.is_active ? { is_active: pagination.is_active } : {},
        pagination.search_text
          ? {
            [Op.or]: [
                { name: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
                { target_url: { [Op.iLike]: "%" + pagination.search_text + "%" } },

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
            "target_url",
            "content",
            "button_name",
            "is_active",
            "active_date",
            "expiry_date",
            "created_date",
            "created_by",
            [Sequelize.literal("image.image_path"), "image_path"],
          ],
          include: [{ model: Image, as: "image", attributes: [] }],
      });
  
      return resSuccess({ data: noPagination ? result : { pagination, result } });
    } catch (error) {
      throw error;
    }
  
  }

export const updateTemplateTwoMarketingPopup = async (req: Request) => {
    const {id, name, content, active_date, button_name,  updated_by, expiry_date, target_url} = req.body
  
  try {
  
      const popupId = await TemplateTwoBanner.findOne({ where: { id: id, banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.marketing_popup }, is_deleted: "0" } })
    if (popupId == null) {
      return resNotFound() 
    }
  
    let id_image = null;
    let imagePath = null;
  
    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        req.file,
        IMAGE_TYPE.banner,
        null
      );
  
      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }
  
      imagePath = moveFileResult.data;
    }
  
    const trn = await dbContext.transaction();
    try {
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.banner,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
  
        id_image = imageResult.dataValues.id;
      }

      if (id_image === null) {
        const popupInfo = await (TemplateTwoBanner.update(
          {
            name: name,
            content: content,
            target_url: target_url,
            button_name: button_name,
            active_date: active_date,
            expiry_date: expiry_date,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: popupId.dataValues.id, is_deleted: "0" }, transaction: trn  }
        ));

          const popupInformation = await TemplateTwoBanner.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })

  
      await trn.commit();
      return resSuccess({data: popupInformation})
      } else {
        const popupInfo = await (TemplateTwoBanner.update(
          {
            name: name,
            content: content,
            target_url: target_url,
            button_name: button_name,
            active_date: active_date,
            expiry_date: expiry_date,
            id_image: id_image,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: popupId.dataValues.id, is_deleted: "0" }, transaction: trn  }
        ));

          const popupInformation = await TemplateTwoBanner.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })

  
      await trn.commit();
      return resSuccess({data: popupInformation})
      }

    } catch (e) {
      await trn.rollback();
      throw e;
    }
  
  } catch (error) {
  
    throw(error);
  }
}

export const deleteTemplateTwoMarketingPopup = async (req: Request) => {
  try {
    const marketingPopupExists = await TemplateTwoBanner.findOne({ where: { id: req.body.id,  banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.marketing_popup }, is_deleted: "0" } });
    if (marketingPopupExists) {
        const MarketingPopupInfo = await (TemplateTwoBanner.update(
            {
              is_deleted: "1",
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
            },
            { where: { id: marketingPopupExists.dataValues.id } }
        ));
        if (MarketingPopupInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
} catch (error) {
    throw error
}
 
}

export const statusUpdateTemplateTwoMarketingPopup = async (req: Request) => {
try {
    const marketingPopupExists = await TemplateTwoBanner.findOne({ where: { id: req.body.id,  banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.marketing_popup }, is_deleted: "0" } });
    if (marketingPopupExists) {
        const MarketingPopupInfo = await (TemplateTwoBanner.update(
            {
                is_active: req.body.is_active,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
            },
            { where: { id: marketingPopupExists.dataValues.id } }
        ));
        if (MarketingPopupInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
} catch (error) {
    throw error
}
}