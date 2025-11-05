import { Request } from "express";
import { Sequelize, Op } from "sequelize";
import dbContext from "../config/db-context";
import { IQueryPagination } from "../data/interfaces/common/common.interface";
import { moveFileToS3ByType } from "../helpers/file.helper";
import HomeAboutMain from "../model/home-about/home-about-main.model";
import HomeAboutSub from "../model/home-about/home-about-sub.model";
import Image from "../model/image.model";
import { ActiveStatus, IMAGE_TYPE } from "../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess, resBadRequest } from "../utils/shared-functions";

export const addAboutMain = async (req: Request) => {
    const { sort_title, title, content, created_by, updated_by } = req.body
    try {
        const payload = {
            sort_title: sort_title,
            title: title,
            content: content,
            created_date: getLocalDate(),
            created_by: req.body.session_res.id_app_user,
        }

            await HomeAboutMain.create(payload)
            return resSuccess({data: payload});

    } catch (error) {
        throw (error)
    }
}

export const updateAboutMain = async (req: Request) => {
    const { id, sort_title, title, content, updated_by } = req.body
    try {

        const aboutMianId = await HomeAboutMain.findOne({where: {id: id}});
        if(aboutMianId) {
             await (HomeAboutMain.update(
                {
                    sort_title: sort_title,
                    title: title,
                    content: content,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user
                },
                { where: { id: id } }
              ));
              
                const CityInformation = await HomeAboutMain.findOne({ where: { id: id} })
                return resSuccess({data: CityInformation})
              
        } else {
          return  resNotFound();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllHomeAboutMainContent = async (req: Request) => {
  try {
    const mainContentData = await HomeAboutMain.findAll();
    
   return resSuccess({data: mainContentData})
  } catch (error) {
    throw error
  }
}

export const addHomeAboutSubContent = async (req: Request) => {
    try {
    const { title, content, target_link, button_name, main_content_id, created_by } = req.body
  
      let imagePath = null;
      if (req.file) {
        const moveFileResult = await moveFileToS3ByType(dbContext,
          req.file,
          IMAGE_TYPE.homeAbout,
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
              image_type: IMAGE_TYPE.homeAbout,
              created_by: req.body.session_res.id_app_user,
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
          id_image: idImage,
          sort_order: 1.00,
          id_home_main: main_content_id,
          is_active: ActiveStatus.Active,
          is_deleted: "0"
      }

        await HomeAboutSub.create(
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

  export const getAllHomeAboutSubContent = async (req: Request) => {
    try {

        let pagination: IQueryPagination = {
            ...getInitialPaginationFromQuery(req.query),
          };
      
          let where = [
            { is_deleted: "0" },
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
              "created_by"
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          });
        return resSuccess({ data: {pagination, result} })

    } catch (error) {
        throw error
    }

}

export const getByIdHomeAboutSubContent = async (req: Request) => {
    try {
      const HomeAboutSubContentInfo = await HomeAboutSub.findOne({ where: { id: req.params.id, is_deleted: "0" },  attributes: [
        "title",
        "content",
        "target_link",
        "button_name",
        "id_home_main",
        "sort_order",
        [Sequelize.literal("image.image_path"), "image_path"],
        "created_date",
        "is_active",
        "created_by"
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
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
    
        const homeId = await HomeAboutSub.findOne({ where: { id: id, is_deleted: "0" } })
      console.log(homeId)
      if (homeId == null) {
        return resErrorDataExit() 
      }

  let id_image = null;
  let imagePath = null;

  if (req.file) {
    const moveFileResult = await moveFileToS3ByType(dbContext,
      req.file,
      IMAGE_TYPE.homeAbout,
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
          image_type: IMAGE_TYPE.homeAbout,
          created_by: req.body.session_res.id_app_user,
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
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
    
    { where: { id: homeId.dataValues.id, is_deleted: "0" },  transaction: trn  }
  ));
  if (homeInfo) {
    const homeInformation = await HomeAboutSub.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
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
          id_image: id_image,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
    
    { where: { id: homeId.dataValues.id, is_deleted: "0" },  transaction: trn  }
  ));
  if (homeInfo) {
    const homeInformation = await HomeAboutSub.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
    await trn.commit();
    return resSuccess({data: homeInformation})

  } else {
    await trn.rollback();
    return resBadRequest()
}
    }


    await trn.commit();
    return resSuccess();
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
          const HomeAboutSubContentExists = await HomeAboutSub.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    
            if (!(HomeAboutSubContentExists && HomeAboutSubContentExists.dataValues)) {
              return resNotFound();
            }
            await HomeAboutSub.update(
              {
                is_deleted: "1",
                modified_by: req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
              },
              { where: { id: HomeAboutSubContentExists.dataValues.id } }
            );
        
            return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
      } catch (error) {
          throw error
      }
}
    
export const statusUpdateHomeAboutSubContent = async (req: Request) => {
    try {
      const HomeAboutSubContentExists = await HomeAboutSub.findOne({ where: { id: req.body.id, is_deleted: "0" } });
      if (HomeAboutSubContentExists) {
          const HomeAboutSubContentActionInfo = await (HomeAboutSub.update(
              {
                  is_active: req.body.is_active,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user
              },
              { where: { id: HomeAboutSubContentExists.dataValues.id } }
          ));
          if (HomeAboutSubContentActionInfo) {
              return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
          } 
      } else {
          return resNotFound();
      }
    } catch (error) {
      throw error
    }
}