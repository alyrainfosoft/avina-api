import { Request } from "express";
import { Sequelize, Op } from "sequelize";
import dbContext from "../../config/db-context";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import { moveFileToS3ByType } from "../../helpers/file.helper";
import Image from "../model/image.model";
import testimonialData from "../model/testimonial.model";
import { ActiveStatus, IMAGE_TYPE } from "../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, DEFAULT_STATUS_SUCCESS, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../utils/shared-functions";

export const addtestimonial = async (req: Request) => {
    try {
    const {designation ,name, text, created_by } = req.body
  
      let imagePath = null;
      if (req.file) {
        const moveFileResult = await moveFileToS3ByType(dbContext,
          req.file,
          IMAGE_TYPE.testimonial,
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
              image_type: IMAGE_TYPE.testimonial,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          idImage = imageResult.dataValues.id;
        }
        const payload = {
          person_name: name,
          designation: designation,
          text: text,
          created_date: getLocalDate(),
          created_by: req.body.session_res.id_app_user,
          id_image: idImage,
          is_active: ActiveStatus.Active,
          is_deleted: "0"
      }

        await testimonialData.create(
          payload,
          { transaction: trn }
        );
  
        await trn.commit();
          return resSuccess({data: payload});

      
      } catch (e) {
        await trn.rollback();
        throw e;
      }
    } catch (e) {
      throw e;
    }
  }

  export const getAllTestimonial = async (req: Request) => {
    try {

        let pagination: IQueryPagination = {
            ...getInitialPaginationFromQuery(req.query),
          };
      
          let where = [
            { is_deleted: "0" },
            {
              [Op.or]: [
                  { person_name: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
                  { designation: { [Op.iLike]: "%" + pagination.search_text + "%" } },

              ],
              is_deleted : "0"
          }
          ];
      
          const totalItems = await testimonialData.count({
            where,
          });
      
          if (totalItems === 0) {
            return resSuccess({ data: { pagination, result: [] } });
          }
          pagination.total_items = totalItems;
          pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

          const result = await testimonialData.findAll({
            where,
            limit: pagination.per_page_rows,
            offset: (pagination.current_page - 1) * pagination.per_page_rows,
            order: [[pagination.sort_by, pagination.order_by]],
            attributes: [
              "id",
              "person_name",
              "designation",
              "text",
              [Sequelize.literal("image.image_path"), "image_path"],
              "created_date",
              "is_active",
              "created_by"
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          });

        return resSuccess({ data: { pagination, result } })

    } catch (error) {
        throw error
    }

}

export const getByIdTestimonial = async (req: Request) => {
  try {
    const testimonialInfo = await testimonialData.findOne({ where: { id: req.params.id, is_deleted: "0" },  attributes: [
        "id",
        "person_name",
        "designation",
        "text",
        [Sequelize.literal("image.image_path"), "image_path"],
        "created_date",
        "is_active",
        "created_by"
      ],
      include: [{ model: Image, as: "image", attributes: [] }], });

    if (!(testimonialInfo && testimonialInfo.dataValues)) {
        return resNotFound();
      }


  return resSuccess({data: testimonialInfo});
  } catch (error) {
    throw error
    
  }
}

export const updateTestimonial = async (req: Request) => {
    const {id, name, designation, text, updated_by} = req.body
  
  try {
  
      const TestimonialId = await testimonialData.findOne({ where: { id: id, is_deleted: "0" } })
  
    if (TestimonialId == null) {
      return resErrorDataExit() 
    }
  
    let id_image = null;
    let imagePath = null;
  
    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        req.file,
        IMAGE_TYPE.testimonial,
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
            image_type: IMAGE_TYPE.testimonial,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
  
        id_image = imageResult.dataValues.id;
      }

        const TestimonialInfo = await (testimonialData.update(
          {
            person_name: name,
            designation: designation,
            text: text,
            id_image: id_image,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: id, is_deleted: "0" }, transaction: trn  }
        ));

          const TestimonialInformation = await testimonialData.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })

  
      await trn.commit();
      return resSuccess({data: TestimonialInformation})
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  
  } catch (error) {
  
    throw(error);
  }
}

export const deletetestimonial = async (req: Request) => {

    try {
        const testimonialExists = await testimonialData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
  
        console.log(testimonialExists)
  
          if (!(testimonialExists && testimonialExists.dataValues)) {
            return resNotFound();
          }
          await testimonialData.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: testimonialExists.dataValues.id } }
          );
      
          return resSuccess();
    } catch (error) {
        throw error
    }
  }
  
  export const statusUpdateTestimonial = async (req: Request) => {
  try {
    const testimonialExists = await testimonialData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    if (testimonialExists) {
        const testimonialActionInfo = await (testimonialData.update(
            {
                is_active: req.body.is_active,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
            },
            { where: { id: testimonialExists.dataValues.id } }
        ));
        if (testimonialActionInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
  } catch (error) {
    throw error
  }
  }