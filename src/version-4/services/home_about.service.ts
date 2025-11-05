import { Request } from "express";
import { Sequelize, Op } from "sequelize";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import { moveFileToS3ByType } from "../../helpers/file.helper";
import { ActiveStatus, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType } from "../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess, resBadRequest, addActivityLogs } from "../../utils/shared-functions";
import { initModels } from "../model/index.model";

export const addAndUpdateAboutMain = async (req: Request) => {
    const { id, sort_title, title, content, updated_by } = req.body
  try {
      
      const {HomeAboutMain} = initModels(req);

        const aboutMianId = await HomeAboutMain.findOne({where: {id: id,company_info_id :req?.body?.session_res?.client_id}});
        if(aboutMianId) {
             await (HomeAboutMain.update(
                {
                    sort_title: sort_title,
                    title: title,
                    content: content,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user
                },
                { where: { id: id,company_info_id :req?.body?.session_res?.client_id } }
              ));
              
                const CityInformation = await HomeAboutMain.findOne({ where: { id: id,company_info_id :req?.body?.session_res?.client_id} })
                addActivityLogs(req,req?.body?.session_res?.client_id,[{
                  old_data: { home_about_main_id: aboutMianId?.dataValues?.id, data: {...aboutMianId?.dataValues}},
                  new_data: {
                    home_about_main_id: CityInformation?.dataValues?.id, data: { ...CityInformation?.dataValues }
                  }
                }], aboutMianId?.dataValues?.id,LogsActivityType.Edit, LogsType.HomeAboutMain, req?.body?.session_res?.id_app_user)
                  
                return resSuccess({data: CityInformation})
              
        } else {
          const payload = {
            sort_title: sort_title,
            title: title,
            content: content,
            created_date: getLocalDate(),
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id 
          }
          const homeAboutMain =  await HomeAboutMain.create(payload)
          await addActivityLogs(req,req?.body?.session_res?.client_id,[{
            old_data: null,
            new_data: {
              home_about_main_id: homeAboutMain?.dataValues?.id, data: {
                ...homeAboutMain?.dataValues
              }
            }
          }], homeAboutMain?.dataValues?.id, LogsActivityType.Add, LogsType.HomeAboutMain, req?.body?.session_res?.id_app_user)
        
            return resSuccess({data: payload});

        }
    } catch (error) {
        throw (error)
    }
}

export const getAllHomeAboutMainContent = async (req: Request) => {
  try {
    const {HomeAboutMain} = initModels(req);
    const mainContentData = await HomeAboutMain.findAll();
    
   return resSuccess({data: mainContentData})
  } catch (error) {
    throw error
  }
}

export const addHomeAboutSubContent = async (req: Request) => {
  try {
    const {HomeAboutSub,Image} = initModels(req);
    const { title, content, target_link, button_name, main_content_id, created_by } = req.body
  
      let imagePath = null;
      if (req.file) {
        const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
          req.file,
          IMAGE_TYPE.homeAbout,
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
              image_type: IMAGE_TYPE.homeAbout,
              created_by: req.body.session_res.id_app_user,
              company_info_id :req?.body?.session_res?.client_id,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          idImage = imageResult.dataValues.id;
        }

        const payload = {
          title: title,
          content: content,
          target_link: target_link,
          button_name: button_name,
          created_date: getLocalDate(),
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          id_image: idImage,
          sort_order: 1.00,
          id_home_main: main_content_id,
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          title_color: req.body.title_color || null,
          description_color: req.body.description_color || null,
      }

        const homaAboutSubData = await HomeAboutSub.create(
          payload,
          { transaction: trn }
        );
  
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: null,
          new_data: {
            home_about_sub_content_id: homaAboutSubData?.dataValues?.id, data: {
              ...homaAboutSubData?.dataValues
            }
          }
        }], homaAboutSubData?.dataValues?.id, LogsActivityType.Add, LogsType.HomeAboutSubContent, req?.body?.session_res?.id_app_user,trn)
      
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

  export const getAllHomeAboutSubContent = async (req: Request) => {
    try {
      const {HomeAboutSub,Image} = initModels(req);
        let pagination: IQueryPagination = {
            ...getInitialPaginationFromQuery(req.query),
          };
      
          let where = [
            { is_deleted: DeletedStatus.No },
            {company_info_id :req?.body?.session_res?.client_id},
            {
              [Op.or]: [
                  { title: { [Op.iLike]: "%" + pagination.search_text  + "%" } },

              ],
              is_deleted : "0"
          }
          ];
      
          const totalItems = await HomeAboutSub.count({
            where,
          });
      
          if (totalItems === 0) {
            return resSuccess({ data: { pagination, result: [] } });
          }
          pagination.total_items = totalItems;
          pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

          const result = await HomeAboutSub.findAll({
            where,
            limit: pagination.per_page_rows,
            offset: (pagination.current_page - 1) * pagination.per_page_rows,
            order: [[pagination.sort_by, pagination.order_by]],
            attributes: [
              "id",
              "title",
              "content",
              "target_link",
              "button_name",
              "id_home_main",
              "sort_order",
              [Sequelize.literal("image.image_path"), "image_path"],
              "created_date",
              "is_active",
              "title_color",
              "description_color",
              "created_by"
            ],
            include: [{ model: Image, as: "image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
          });
        return resSuccess({ data: {pagination, result} })

    } catch (error) {
        throw error
    }

}

export const getByIdHomeAboutSubContent = async (req: Request) => {
  try {
    const {HomeAboutSub,Image} = initModels(req);
      const HomeAboutSubContentInfo = await HomeAboutSub.findOne({ where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },  attributes: [
        "title",
        "content",
        "target_link",
        "button_name",
        "id_home_main",
        "sort_order",
        "title_color",
        "description_color",
        [Sequelize.literal("image.image_path"), "image_path"],
        "created_date",
        "is_active",
        "created_by"
      ],
      include: [{ model: Image, as: "image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
    });
  
      if (!(HomeAboutSubContentInfo && HomeAboutSubContentInfo.dataValues)) {
          return resNotFound();
        }
  
  
    return resSuccess({data: HomeAboutSubContentInfo});
    } catch (error) {
      throw error
      
    }
  }
  
export const updateHomeAboutSubContent = async (req: Request) => {
      const {id, title, content, target_link, button_name, updated_by} = req.body
    
    try {
        const {HomeAboutSub,Image} = initModels(req);
        const homeId = await HomeAboutSub.findOne({ where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } })
      if (homeId == null) {
        return resErrorDataExit() 
      }

  let id_image = null;
  let imagePath = null;

  if (req.file) {
    const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
      req.file,
      IMAGE_TYPE.homeAbout,
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
          image_type: IMAGE_TYPE.homeAbout,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      id_image = imageResult.dataValues.id;

    }
    if (id_image === null && !id_image) {
      const homeInfo = await (HomeAboutSub.update(
        {
            title: title,
            content: content,
            target_link: target_link,
            button_name: button_name,
            title_color: req.body.title_color || null,
            description_color: req.body.description_color || null,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        },
    
    { where: { id: homeId.dataValues.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },  transaction: trn  }
  ));
  if (homeInfo) {
    const homeInformation = await HomeAboutSub.findOne({ where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id }, transaction: trn })
    addActivityLogs(req?.body?.session_res?.client_id,[{
      old_data: { home_about_sub_content_id: homeId?.dataValues?.id, data: {...homeId?.dataValues}},
      new_data: {
        home_about_sub_content_id: homeInformation?.dataValues?.id, data: { ...homeInformation?.dataValues }
      }
    }], homeId?.dataValues?.id,LogsActivityType.Edit, LogsType.HomeAboutSubContent, req?.body?.session_res?.id_app_user,trn)
      
    await trn.commit();
    return resSuccess({data: homeInformation})

  } else {
    await trn.rollback();
    return resBadRequest()
}
    } else {
      const homeInfo = await (HomeAboutSub.update(
        {
            title: title,
            content: content,
            target_link: target_link,
            button_name: button_name,
            title_color: req.body.title_color || null,
            description_color: req.body.description_color || null,
          id_image: id_image,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        },
    
    { where: { id: homeId.dataValues.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },  transaction: trn  }
  ));
  if (homeInfo) {
    const homeInformation = await HomeAboutSub.findOne({ where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id }, transaction: trn })
    await trn.commit();
    return resSuccess({data: homeInformation})

  } else {
    await trn.rollback();
    return resBadRequest()
}
    }
  } catch (e) {
    await trn.rollback();

    throw e;
  }
    } catch (error) {
    
      throw(error);
    }
}
  
  export const deleteHomeAboutSubContent = async (req: Request) => {
  
    try {
        const {HomeAboutSub} = initModels(req);
          const HomeAboutSubContentExists = await HomeAboutSub.findOne({ where: { id: req.body.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } });
    
            if (!(HomeAboutSubContentExists && HomeAboutSubContentExists.dataValues)) {
              return resNotFound();
            }
            await HomeAboutSub.update(
              {
                is_deleted: DeletedStatus.yes,
                modified_by: req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
              },
              { where: { id: HomeAboutSubContentExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
            );
            await addActivityLogs(req,req?.body?.session_res?.client_id,[{
              old_data: { home_about_sub_content_id: HomeAboutSubContentExists?.dataValues?.id, data: {...HomeAboutSubContentExists?.dataValues}},
              new_data: {
                home_about_sub_content_id: HomeAboutSubContentExists?.dataValues?.id, data: {
                  ...HomeAboutSubContentExists?.dataValues, is_deleted: DeletedStatus.yes,
                  modified_by: req?.body?.session_res?.id_app_user,
                  modified_date: getLocalDate(),
                }
              }
            }], HomeAboutSubContentExists?.dataValues?.id, LogsActivityType.Delete, LogsType.HomeAboutSubContent, req?.body?.session_res?.id_app_user)
            
            return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
      } catch (error) {
          throw error
      }
}
    
export const statusUpdateHomeAboutSubContent = async (req: Request) => {
  try {
    const {HomeAboutSub} = initModels(req);
      const HomeAboutSubContentExists = await HomeAboutSub.findOne({ where: { id: req.body.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } });
      if (HomeAboutSubContentExists) {
          const HomeAboutSubContentActionInfo = await (HomeAboutSub.update(
              {
                  is_active: req.body.is_active,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user
              },
              { where: { id: HomeAboutSubContentExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
          ));
          if (HomeAboutSubContentActionInfo) {
            await addActivityLogs(req,req?.body?.session_res?.client_id,[{
              old_data: { home_about_sub_content_id: HomeAboutSubContentExists?.dataValues?.id, data: {...HomeAboutSubContentExists?.dataValues}},
              new_data: {
                home_about_sub_content_id: HomeAboutSubContentExists?.dataValues?.id, data: {
                  ...HomeAboutSubContentExists?.dataValues, is_active: req.body.is_active,
                  modified_date: getLocalDate(),
                  modified_by: req?.body?.session_res?.id_app_user,
                }
              }
            }], HomeAboutSubContentExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.HomeAboutSubContent, req?.body?.session_res?.id_app_user)
                
              return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
          } 
      } else {
          return resNotFound();
      }
    } catch (error) {
      throw error
    }
}