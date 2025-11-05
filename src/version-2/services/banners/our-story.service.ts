import { Request } from "express";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import { ActiveStatus, IMAGE_TYPE } from "../../../utils/app-enumeration";
import { DATA_NOT_FOUND, DEFAULT_STATUS_CODE_SUCCESS, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import dbContext from "../../../config/db-context";
import Image from "../../model/image.model";
import { getInitialPaginationFromQuery, getLocalDate, resNotFound, resSuccess } from "../../../utils/shared-functions";
import OurStory from "../../model/our-stories.model";
import { Op, Sequelize } from "sequelize";

export const addOurStory = async (req: Request) => {
    const { title, content  } = req.body
    try {
      let imagePath = null;
      if (req.file) {
        const moveFileResult = await moveFileToS3ByType(dbContext,
          req.file,
          IMAGE_TYPE.OurStory,
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
              image_type: IMAGE_TYPE.OurStory,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          idImage = imageResult.dataValues.id;
        }
        const ourStory = await OurStory.create(
          {
            title: title,
            content: content,
            is_active: ActiveStatus.Active,
            id_image: idImage,
            is_deleted: '0',
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
  
        await trn.commit();
        return resSuccess({ data: ourStory });
      } catch (e) {
        await trn.rollback();
        throw e;
      }
    } catch (e) {
      throw e;
    }
  };
  
  export const getAllOurstory = async (req: Request) => {
    try {
      let paginationProps = {};
  
      let pagination = {
        ...getInitialPaginationFromQuery(req.query),
        search_text: req.query.search_text,
      };
      let noPagination = req.query.no_pagination === "1";
  
      let where = [
        { is_deleted: "0" },
        pagination.is_active ? { is_active: pagination.is_active } : {},
        pagination.search_text
          ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
          : {},
      ];
  
      if (!noPagination) {
        const totalItems = await OurStory.count({
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
  
      const result = await OurStory.findAll({
        ...paginationProps,
        where,
        order: [[pagination.sort_by, pagination.order_by]],
        attributes: [
          "id",
          "title",
          "content",
          "is_active",
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
  
  export const updateOurStory = async (req: Request) => {
    const { id, title, content} = req.body
  
    try {
  
      const ourStoryId = await OurStory.findOne({ where: { id: id, is_deleted: "0" } })
  
      console.log(ourStoryId)
      if (ourStoryId == null) {
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
          const ourStoryInfo = await (OurStory.update(
            {
              title: title,
              content: content,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: ourStoryId.dataValues.id, is_deleted: "0" }, transaction: trn }
          ));
  
          const ourStoryInformation = await OurStory.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
  
  
          await trn.commit();
          return resSuccess({ data: ourStoryInformation })
        } else {
          const ourStoryInfo = await (OurStory.update(
            {
                title: title,
                content: content,
              id_image: id_image,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: ourStoryId.dataValues.id, is_deleted: "0" }, transaction: trn }
          ));
  
          const ourStoryInformation = await OurStory.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
  
  
          await trn.commit();
          return resSuccess({ data: ourStoryInformation })
        }
  
      } catch (e) {
        await trn.rollback();
        throw e;
      }
  
    } catch (error) {
  
      throw (error);
    }
  }
  
  export const deleteOurStory = async (req: Request) => {
  
    try {
      const ourStoryExists = await OurStory.findOne({ where: { id: req.body.id, is_deleted: "0" } });
  
      console.log(ourStoryExists)
  
      if (!(ourStoryExists && ourStoryExists.dataValues)) {
        return resNotFound();
      }
      await OurStory.update(
        {
          is_deleted: "1",
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        { where: { id: ourStoryExists.dataValues.id } }
      );
  
      return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
    } catch (error) {
      throw error
    }
  }
  
  export const statusUpdateOurStory = async (req: Request) => {
    try {
      const ourStoryExists = await OurStory.findOne({ where: { id: req.body.id, is_deleted: "0" } });
      if (ourStoryExists) {
        const ourStoryActionInfo = await (OurStory.update(
          {
            is_active: req.body.is_active,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: ourStoryExists.dataValues.id } }
        ));
        if (ourStoryActionInfo) {
          return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
        }
      } else {
        return resNotFound();
      }
    } catch (error) {
      throw error
    }
  }

  export const getByIdOurstory = async (req: Request) => {
    try {

  
      const result = await OurStory.findOne({
        where: {
          is_deleted: '0',
          id: req.params.id
        },
        attributes: [
          "id",
          "title",
          "content",
          "is_active",
          "created_date",
          "created_by",
          [Sequelize.literal("image.image_path"), "image_path"],
        ],
        include: [{ model: Image, as: "image", attributes: [] }],
      });
  
      if(!(result && result.dataValues)) {
        return resNotFound()
      }
  
      return resSuccess({ data:  result  });
    } catch (error) {
      throw error;
    }
  
  }
