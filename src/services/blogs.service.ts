import { Request } from "express";
import { IMAGE_TYPE } from "../utils/app-enumeration";
import { moveFileToS3ByType } from "../helpers/file.helper";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../utils/app-messages";
import dbContext from "../config/db-context";
import Image from "../model/image.model";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../utils/shared-functions";
import BlogsData from "../model/blogs.model";
import { Op, Sequelize } from "sequelize";

export const addBlogs = async (req: Request) => {
    const {  meta_title, meta_description, meta_keywords, name,
         slug, description, author, publish_date,
      is_status} = req.body
  
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let imagePath = null;
      let bannerImagePath = null;
  
      if (files['images'] != null) {
        const moveFileResult = await moveFileToS3ByType(
          dbContext,
          files['images'][0],
          IMAGE_TYPE.blog,
          null
        );
  
        if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return moveFileResult;
        }
  
        imagePath = moveFileResult.data;
      }
  
      if (files['banner_image'] != null) {
        const moveFileResult = await moveFileToS3ByType(
          dbContext,
          files['banner_image'][0],
          IMAGE_TYPE.blog,
          null
        );
  
        if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return moveFileResult;
        }
  
        bannerImagePath = moveFileResult.data;
      }
  
      const trn = await dbContext.transaction();
  
      try {
        let idImage = null;
        if (imagePath) {
          const imageResult = await Image.create(
            {
              image_path: imagePath,
              image_type: IMAGE_TYPE.blog,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          idImage = imageResult.dataValues.id;
        }
  
        let bannerIdImage = null;
        if (bannerImagePath) {
          const imageResult = await Image.create(
            {
              image_path: bannerImagePath,
              image_type: IMAGE_TYPE.blog,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          bannerIdImage = imageResult.dataValues.id;
        }

        console.log("idImage", idImage)
        console.log("bannerIdImage", bannerIdImage);
        
        const nameExists = await BlogsData.findOne({ where: { name: name, is_deleted: "0" } });

        const slugExistes = await BlogsData.findOne({ where: { slug: slug, is_deleted: "0" } })
        if (nameExists !== null && slugExistes !== null) {
          await trn.rollback();
          return resErrorDataExit();
        }
          const bogsInfo = await BlogsData.create(
            {
              id_image: idImage,
              id_banner_image: bannerIdImage,
              meta_title: meta_title,
              meta_description: meta_description,
              meta_keywords: meta_keywords,
              name: name,
              slug: slug,
              description: description,
              author: author,
              publish_date: publish_date,
              is_status: is_status,
              is_deleted: '0',
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
          );
          await trn.commit();
          return resSuccess({ data: bogsInfo });

      } catch (e) {
        await trn.rollback();
        throw e;
      }
    } catch (error) {
      throw (error)
    }
}

export const getAllBlogsData =async (req: Request) => {
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
            { name: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
            { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await BlogsData.count({
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

    const result = await BlogsData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "meta_title",
        "meta_description",
        "meta_keywords",
        "slug",
        "name",
        "description",
        "author",
        "publish_date",
        "is_status",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("banner_image.image_path"), "banner_image_path"],


    ],
include: [{ model: Image, as: "image", attributes: [] }, { model: Image, as: "banner_image", attributes: [] }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
}

export const getByIdBlogsData =async (req:Request) => {
  try {
    const result = await BlogsData.findOne({
      where: {is_deleted: '0', id: req.body.id},
      attributes: [
        "id",
        "meta_title",
        "meta_description",
        "meta_keywords",
        "slug",
        "name",
        "description",
        "author",
        "publish_date",
        "is_status",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("banner_image.image_path"), "banner_image_path"],
  
  
    ],
  include: [{ model: Image, as: "image", attributes: [] }, { model: Image, as: "banner_image", attributes: [] }],
    });

    return resSuccess({data: result})
  } catch (error) {
    throw error
  }
}

export const updateBlogs = async (req: Request) => {
  const { id , meta_title, meta_description, meta_keywords, name,
    slug, description, author, publish_date,
 is_status} = req.body

  try {

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let imagePath = null;
    let bannerImagePath = null;

    if (files['images'] != null) {
      const moveFileResult = await moveFileToS3ByType(
        dbContext,
        files['images'][0],
        IMAGE_TYPE.blog,
        null
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    if (files['banner_image'] != null) {
      const moveFileResult = await moveFileToS3ByType(
        dbContext,
        files['banner_image'][0],
        IMAGE_TYPE.blog,
        null
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      bannerImagePath = moveFileResult.data;
    }

    const trn = await dbContext.transaction();

    try {
      let idImage = null;
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.blog,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        idImage = imageResult.dataValues.id;
      }

      let bannerIdImage = null;
      if (bannerImagePath) {
        const imageResult = await Image.create(
          {
            image_path: bannerImagePath,
            image_type: IMAGE_TYPE.blog,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        bannerIdImage = imageResult.dataValues.id;
      }

      const bloginfo = await BlogsData.findOne({ where: { id: id }, transaction: trn })
      if (bloginfo) {
      const nameExists = await BlogsData.findOne({ where: { name: name, id: { [Op.ne]: id }, is_deleted: "0" } });
      const slugExistes = await BlogsData.findOne({ where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" }});

      if(nameExists !== null && slugExistes !== null) {
        trn.rollback()
        return resErrorDataExit()
      }

        if (idImage !== null && bannerIdImage !== null) {
            const blogUpdateInfo = await (BlogsData.update(
              {
                id_image: idImage,
                id_banner_image: bannerIdImage,
                meta_title: meta_title,
                meta_description: meta_description,
                meta_keywords: meta_keywords,
                name: name,
                slug: slug,
                description: description,
                author: author,
                publish_date: publish_date,
                is_status: is_status,
                modified_by:req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
              },
  
              { where: { id: bloginfo.dataValues.id }, transaction: trn }
            ));
  
            const updatedData = await BlogsData.findOne({ where: { id: blogUpdateInfo }, transaction: trn })
            await trn.commit();
            return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY, data: updatedData });

        } else {

          if (idImage == null && bannerIdImage != null) {
              const blogUpdateInfo = await (BlogsData.update(
                {
                  // id_image: idImage,
                  id_banner_image: bannerIdImage,
                  meta_title: meta_title,
                  meta_description: meta_description,
                  meta_keywords: meta_keywords,
                  name: name,
                  slug: slug,
                  description: description,
                  author: author,
                  publish_date: publish_date,
                  is_status: is_status,
                  modified_by: req.body.session_res.id_app_user,
                  modified_date: getLocalDate(),
                },
  
                { where: { id: bloginfo.dataValues.id }, transaction: trn }
              ));
              const updatedData = await BlogsData.findOne({ where: { id: blogUpdateInfo }, transaction: trn })
              await trn.commit();
              return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY, data: updatedData });

          }

          if (bannerIdImage == null && idImage != null) {
            console.log("darkImage", idImage)
              const blogUpdateInfo = await (BlogsData.update(
                {
                  id_image: idImage,
                  // id_banner_image: bannerIdImage,
                  meta_title: meta_title,
                  meta_description: meta_description,
                  meta_keywords: meta_keywords,
                  name: name,
                  slug: slug,
                  description: description,
                  author: author,
                  publish_date: publish_date,
                  is_status: is_status,
                  modified_by: req.body.session_res.id_app_user,
                  modified_date: getLocalDate(),
                },
  
                { where: { id: bloginfo.dataValues.id }, transaction: trn }
              ));
              const updatedData = await BlogsData.findOne({ where: { id: blogUpdateInfo }, transaction: trn })
              await trn.commit();
              return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY, data: updatedData });

          }

          if (idImage == null && bannerIdImage == null) {
              const blogUpdateInfo = await (BlogsData.update(
                {
                  // id_image: idImage,
                  // id_banner_image: bannerIdImage,
                  meta_title: meta_title,
                  meta_description: meta_description,
                  meta_keywords: meta_keywords,
                  name: name,
                  slug: slug,
                  description: description,
                  author: author,
                  publish_date: publish_date,
                  is_status: is_status,
                  modified_by: req.body.session_res.id_app_user,
                  modified_date: getLocalDate(),
                },
  
                { where: { id: bloginfo.dataValues.id }, transaction: trn }
              ));
              const updatedData = await BlogsData.findOne({ where: { id: blogUpdateInfo }, transaction: trn })
              await trn.commit();
              return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY, data: updatedData }); 
          }

        }

      } else {
        await trn.rollback()
        return resNotFound();
      }
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (error) {

    throw (error)
  }

}

export const deleteBlogs = async (req: Request) => {

  try {
      const blogExists = await BlogsData.findOne({ where: { id: req.body.id, is_deleted: "0" } });

      console.log(blogExists)

        if (!(blogExists && blogExists.dataValues)) {
          return resNotFound();
        }
        await BlogsData.update(
          {
            is_deleted: "1",
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: blogExists.dataValues.id } }
        );
    
        return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
  } catch (error) {
      throw error
  }
}

export const getBlogsDataUser =async (req: Request) => {
    try {
        
        const blogsList = await BlogsData.findAll({
            where: {
                is_deleted: '0',
                is_status: '2'
            },
            attributes: [
                "id",
                "meta_title",
                "meta_description",
                "meta_keywords",
                "slug",
                ["name", "title"],
                "description",
                "author",
                "publish_date",
                [Sequelize.literal("image.image_path"), "image_path"],
                [Sequelize.literal("banner_image.image_path"), "banner_image_path"],


            ],
        include: [{ model: Image, as: "image", attributes: [] }, { model: Image, as: "banner_image", attributes: [] }],

        })

        return resSuccess({data: blogsList})

    } catch (error) {
      throw error  
    }
}

export const bolgDetailAPI =async (req:Request) => {
  try {
    const result = await BlogsData.findOne({
      where: {is_deleted: '0', slug: req.body.slug},
      attributes: [
        "id",
        "meta_title",
        "meta_description",
        "meta_keywords",
        "slug",
        "name",
        "description",
        "author",
        "publish_date",
        "is_status",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("banner_image.image_path"), "banner_image_path"],
  
  
    ],
  include: [{ model: Image, as: "image", attributes: [] }, { model: Image, as: "banner_image", attributes: [] }],
    });

    return resSuccess({data: result})
  } catch (error) {
    throw error
  }
}