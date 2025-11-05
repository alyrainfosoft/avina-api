import { Request } from "express";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import { ActiveStatus, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType } from "../../../utils/app-enumeration";
import {  DEFAULT_STATUS_CODE_SUCCESS, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { addActivityLogs, getInitialPaginationFromQuery, getLocalDate, resNotFound, resSuccess } from "../../../utils/shared-functions";
import { Op, Sequelize } from "sequelize";
import { initModels } from "../../model/index.model";

export const addOurStory = async (req: Request) => {
    const { title, content  } = req.body
  try {
      const { Image, OurStory } = initModels(req);
      let imagePath = null;
      if (req.file) {
        const moveFileResult = await moveFileToS3ByType((req.body.db_connection),
          req.file,
          IMAGE_TYPE.OurStory,
          req?.body?.session_res?.client_id,
          req
        );
  
        if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return moveFileResult;
        }
  
        imagePath = moveFileResult.data;
      }
  
      const trn = await (req.body.db_connection).transaction();
      try {
        let idImage = null;
        if (imagePath) {
          const imageResult = await Image.create(
            {
              image_path: imagePath,
              image_type: IMAGE_TYPE.OurStory,
              created_by: req.body.session_res.id_app_user,
              company_info_id :req?.body?.session_res?.client_id,
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
            is_deleted: DeletedStatus.No,
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: null,
          new_data: {
            our_story_id: ourStory?.dataValues?.id, data: {
              ...ourStory?.dataValues
            }
          }
        }], ourStory?.dataValues?.id, LogsActivityType.Add, LogsType.OurStory, req?.body?.session_res?.id_app_user,trn)
        
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
      const { Image, OurStory } = initModels(req);
  
      let pagination = {
        ...getInitialPaginationFromQuery(req.query),
        search_text: req.query.search_text,
      };
      let noPagination = req.query.no_pagination === "1";
  
      let where = [
        { is_deleted: DeletedStatus.No },
        { company_info_id :req?.body?.session_res?.client_id },
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
        include: [{ model: Image, as: "image", attributes: [],where: { company_info_id :req?.body?.session_res?.client_id },required:false }],
      });
  
  
      return resSuccess({ data: noPagination ? result : { pagination, result } });
    } catch (error) {
      throw error;
    }
  
  }
  
  export const updateOurStory = async (req: Request) => {
    const { id, title, content} = req.body
  
    try {
      const { Image, OurStory } = initModels(req);
  
      const ourStoryId = await OurStory.findOne({ where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id  } })
  
      if (ourStoryId == null) {
        return resNotFound()
      }
  
      let id_image = null;
      let imagePath = null;
  
      if (req.file) {
        const moveFileResult = await moveFileToS3ByType((req.body.db_connection),
          req.file,
          IMAGE_TYPE.banner,
          req?.body?.session_res?.client_id,
          req
        );
  
        if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return moveFileResult;
        }
  
        imagePath = moveFileResult.data;
      }
  
      const trn = await (req.body.db_connection).transaction();
      try {
        if (imagePath) {
          const imageResult = await Image.create(
            {
              image_path: imagePath,
              image_type: IMAGE_TYPE.banner,
              created_by: req.body.session_res.id_app_user,
              company_info_id :req?.body?.session_res?.client_id,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
  
          id_image = imageResult.dataValues.id;
        }else{
          id_image = ourStoryId?.dataValues?.id_image
        }
          const ourStoryInfo = await (OurStory.update(
            {
                title: title,
                content: content,
              id_image: id_image ?? null,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: ourStoryId.dataValues.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id  }, transaction: trn }
          ));
  
          const ourStoryInformation = await OurStory.findOne({ where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id  }, transaction: trn })
  
          await addActivityLogs(req,req?.body?.session_res?.client_id,[{
              old_data: { our_story_id: ourStoryId?.dataValues?.id, data: {...ourStoryId?.dataValues} },
              new_data: {
                our_story_id: ourStoryInformation?.dataValues?.id, data: { ...ourStoryInformation?.dataValues }
              }
            }], ourStoryId?.dataValues?.id, LogsActivityType.Edit, LogsType.OurStory, req?.body?.session_res?.id_app_user,trn)
    
          await trn.commit();
          return resSuccess({ data: ourStoryInformation })
      
  
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
      const { OurStory } = initModels(req);

      const ourStoryExists = await OurStory.findOne({ where: { id: req.body.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id  } });
    
      if (!(ourStoryExists && ourStoryExists.dataValues)) {
        return resNotFound();
      }
      await OurStory.update(
        {
          is_deleted: DeletedStatus.yes,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        { where: { id: ourStoryExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { our_story_id: ourStoryExists?.dataValues?.id, data: {...ourStoryExists?.dataValues} },
        new_data: {
          our_story_id: ourStoryExists?.dataValues?.id, data: {
            ...ourStoryExists?.dataValues, is_deleted: DeletedStatus.yes,
            modified_by: req?.body?.session_res?.id_app_user,
            modified_date: getLocalDate(),
          }
        }
      }], ourStoryExists?.dataValues?.id, LogsActivityType.Delete, LogsType.OurStory, req?.body?.session_res?.id_app_user)
  
      return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
    } catch (error) {
      throw error
    }
  }
  
  export const statusUpdateOurStory = async (req: Request) => {
    try {
      const { OurStory } = initModels(req);

      const ourStoryExists = await OurStory.findOne({ where: { id: req.body.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } });
      if (ourStoryExists) {
        const ourStoryActionInfo = await (OurStory.update(
          {
            is_active: req.body.is_active,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: ourStoryExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
        ));
        if (ourStoryActionInfo) {

          await addActivityLogs(req,req?.body?.session_res?.client_id,[{
            old_data: { our_story_id: ourStoryExists?.dataValues?.id, data: {...ourStoryExists?.dataValues} },
            new_data: {
              our_story_id: ourStoryExists?.dataValues?.id, data: {
                ...ourStoryExists?.dataValues, is_active: req?.body?.is_active,
                modified_date: getLocalDate(),
                modified_by: req?.body?.session_res?.id_app_user,
              }
            }
          }], ourStoryExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.OurStory, req?.body?.session_res?.id_app_user)
      

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
      const { Image, OurStory } = initModels(req);

      const result = await OurStory.findOne({
        where: {
          is_deleted: DeletedStatus.No,
          id: req.params.id,
          company_info_id :req?.body?.session_res?.client_id 
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
        include: [{ model: Image, as: "image", attributes: [], where:{ company_info_id :req?.body?.session_res?.client_id},required:false}],
      });
  
      if(!(result && result.dataValues)) {
        return resNotFound()
      }
  
      return resSuccess({ data:  result  });
    } catch (error) {
      throw error;
    }
  
  }
