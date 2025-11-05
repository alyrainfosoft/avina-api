import { Request } from "express";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
} from "../../utils/app-enumeration";
import { moveFileToS3ByType } from "../../helpers/file.helper";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  ERROR_NOT_FOUND,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../utils/app-messages";
import {
  addActivityLogs,
  createSlug,
  getCompanyIdBasedOnTheCompanyKey,
  getInitialPaginationFromQuery,
  getLocalDate,
  imageDeleteInDBAndS3,
  prepareMessageFromParams,
  resErrorDataExit,
  resNotFound,
  resSuccess,
} from "../../utils/shared-functions";
import { Op, Sequelize } from "sequelize";
import { initModels } from "../model/index.model";

export const addBlogs = async (req: Request) => {
  const {
    meta_title,
    meta_description,
    meta_keywords,
    name,
    description,
    author,
    publish_date,
    is_status,
    id_category = null,
    sort_des = null,
  } = req.body;
  const {BlogsData,Image} = initModels(req);
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let imagePath = null;
    let bannerImagePath = null;

    if (files["images"] != null) {
      const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
        files["images"][0],
        IMAGE_TYPE.blog,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    if (files["banner_image"] != null) {
      const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
        files["banner_image"][0],
        IMAGE_TYPE.blog,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      bannerImagePath = moveFileResult.data;
    }

    const trn = await (req.body.db_connection).transaction();

    try {
      let idImage = null;
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.blog,
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
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
            company_info_id :req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        bannerIdImage = imageResult.dataValues.id;
      }

      const nameExists = await BlogsData.findOne({
        where: { name: name, is_deleted: DeletedStatus.No },
      });
      const slug = createSlug(name);

      if (nameExists !== null) {
        await trn.rollback();
        return resErrorDataExit();
      }
      const bogsInfo = await BlogsData.create({
        id_image: idImage,
        id_banner_image: bannerIdImage,
        meta_title: meta_title,
        meta_description: meta_description,
        meta_keywords: meta_keywords,
        name: name,
        slug: slug,
        sort_des: sort_des,
        description: description,
        author: author,
        publish_date: publish_date,
        is_status: is_status,
        is_deleted: DeletedStatus.No,
        id_category: id_category,
        created_by: req.body.session_res.id_app_user,
        company_info_id :req?.body?.session_res?.client_id,
        created_date: getLocalDate(),
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          blog_id: bogsInfo?.dataValues?.id, data: {
            ...bogsInfo?.dataValues
          },
        }
      }], bogsInfo?.dataValues?.id, LogsActivityType.Add, LogsType.Blog, req?.body?.session_res?.id_app_user,trn)
      await trn.commit();
      
      return resSuccess({ data: bogsInfo });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (error) {
    throw error;
  }
};

export const getAllBlogsData = async (req: Request) => {
  try {
  const {BlogsData,Image,BlogCategoryData} = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
      req.query.category && req.query.category != ""
        ? {
            id_category: req.query.category,
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
        "id_category",
        "is_default",
        "sort_des",
        [Sequelize.literal("blog_image.image_path"), "image_path"],
        [Sequelize.literal("category.name"), "category_name"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("banner_image.image_path"), "banner_image_path"],
      ],
      include: [
        { model: Image, as: "blog_image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: BlogCategoryData, as: "category", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: Image, as: "banner_image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdBlogsData = async (req: Request) => {
  try {
  const {BlogsData,Image, BlogCategoryData} = initModels(req);

    const result = await BlogsData.findOne({
      where: { is_deleted: DeletedStatus.No, id: req.body.id,company_info_id :req?.body?.session_res?.client_id },
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
        "id_category",
        "is_default",
        "sort_des",
        [Sequelize.literal("blog_image.image_path"), "image_path"],
        [Sequelize.literal("banner_image.image_path"), "banner_image_path"],
        [Sequelize.literal("category.name"), "category_name"],
        [Sequelize.literal("category.slug"), "category_slug"],
      ],
      include: [
        { model: Image, as: "blog_image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: BlogCategoryData, as: "category", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: Image, as: "banner_image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
      ],
    });

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const updateBlogs = async (req: Request) => {
  const {
    id,
    meta_title,
    meta_description,
    meta_keywords,
    name,
    description,
    author,
    publish_date,
    is_status,
    image_delete = "0",
    banner_image_delete = "0",
    id_category = null,
    sort_des = null,
  } = req.body;
  const {BlogsData,Image} = initModels(req);
  try {
    const blogInfo = await BlogsData.findOne({
      where: { id: id,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(blogInfo && blogInfo.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [
          ["field_name", "Blog"],
        ]),
      });
    }
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let imagePath = null;
    let bannerImagePath = null;

    if (files["images"] != null) {
      const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
        files["images"][0],
        IMAGE_TYPE.blog,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    if (files["banner_image"] != null) {
      const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
        files["banner_image"][0],
        IMAGE_TYPE.blog,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      bannerImagePath = moveFileResult.data;
    }

    const findImage = await Image.findOne({
      where: {
        id: blogInfo.dataValues.id_image,company_info_id :req?.body?.session_res?.client_id
      },
    });
    const findBannerImage = await Image.findOne({
      where: {
        id: blogInfo.dataValues.id_banner_image,company_info_id :req?.body?.session_res?.client_id
      },
    });
    const trn = await (req.body.db_connection).transaction();

    try {
      let idImage = null;
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.blog,
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
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
            company_info_id :req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        bannerIdImage = imageResult.dataValues.id;
      }

      const nameExists = await BlogsData.findOne({
        where: { name: name, id: { [Op.ne]: id }, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
      });

      const slug = createSlug(name);
      if (nameExists !== null) {
        trn.rollback();
        return resErrorDataExit();
      }

      if (idImage !== null && bannerIdImage !== null) {
        const blogUpdateInfo = await BlogsData.update(
          {
            id_image: image_delete == "1" ? null : idImage,
            id_banner_image: banner_image_delete == "1" ? null : bannerIdImage,
            meta_title: meta_title,
            meta_description: meta_description,
            meta_keywords: meta_keywords,
            name: name,
            slug: slug,
            id_category: id_category,
            description: description,
            author: author,
            publish_date: publish_date,
            is_status: is_status,
            sort_des: sort_des,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },

          { where: { id: blogInfo.dataValues.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
        );

        const updatedData = await BlogsData.findOne({
          where: { id: blogUpdateInfo,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });

        if (image_delete && image_delete == "1") {
          await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
        }
        if (banner_image_delete && banner_image_delete == "1") {
          await imageDeleteInDBAndS3(req,findBannerImage,req.body.session_res.client_id);
        }
  
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: { blog_id: blogInfo?.dataValues?.id, data:{...blogInfo?.dataValues}},
          new_data: {
            blog_id: updatedData?.dataValues?.id, data: { ...updatedData?.dataValues }
          }
        }], blogInfo?.dataValues?.id,LogsActivityType.Edit, LogsType.Blog, req?.body?.session_res?.id_app_user,trn)
        
        await trn.commit();
        return resSuccess({
          message: RECORD_UPDATE_SUCCESSFULLY,
          data: updatedData,
        });
      } else {
        if (idImage == null && bannerIdImage != null) {
          const blogUpdateInfo = await BlogsData.update(
            {
              id_image:
                image_delete == "1"
                  ? null
                  : idImage == null
                  ? findImage && findImage.dataValues && findImage.dataValues.id
                  : idImage,
              id_banner_image:
                banner_image_delete == "1"
                  ? null
                  : bannerIdImage == null
                  ? findBannerImage &&
                    findBannerImage.dataValues &&
                    findBannerImage.dataValues.id
                  : bannerIdImage,
              meta_title: meta_title,
              meta_description: meta_description,
              meta_keywords: meta_keywords,
              name: name,
              slug: slug,
              id_category: id_category,
              description: description,
              author: author,
              sort_des: sort_des,
              publish_date: publish_date,
              is_status: is_status,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },

            { where: { id: blogInfo.dataValues.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
          );

          if (image_delete && image_delete == "1") {
            await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
          }
          if (banner_image_delete && banner_image_delete == "1") {
            await imageDeleteInDBAndS3(req,findBannerImage,req.body.session_res.client_id);
          }
          const updatedData = await BlogsData.findOne({
            where: { id: blogUpdateInfo,company_info_id :req?.body?.session_res?.client_id },
            transaction: trn,
          });
          await addActivityLogs(req,req?.body?.session_res?.client_id,[{
            old_data: { blog_id: blogInfo?.dataValues?.id, data: {...blogInfo?.dataValues}},
            new_data: {
              blog_id: updatedData?.dataValues?.id, data: { ...updatedData?.dataValues }
            }
          }], blogInfo?.dataValues?.id,LogsActivityType.Edit, LogsType.Blog, req?.body?.session_res?.id_app_user,trn)
          
          await trn.commit();
          return resSuccess({
            message: RECORD_UPDATE_SUCCESSFULLY,
            data: updatedData,
          });
        }

        if (bannerIdImage == null && idImage != null) {
          const blogUpdateInfo = await BlogsData.update(
            {
              id_image:
                image_delete == "1"
                  ? null
                  : idImage == null
                  ? findImage.dataValues && findImage.dataValues.id
                  : idImage,
              id_banner_image:
                banner_image_delete == "1"
                  ? null
                  : bannerIdImage == null
                  ? findBannerImage && findBannerImage.dataValues
                    ? findBannerImage.dataValues.id
                    : null
                  : bannerIdImage,
              meta_title: meta_title,
              meta_description: meta_description,
              meta_keywords: meta_keywords,
              name: name,
              slug: slug,
              id_category: id_category,
              description: description,
              author: author,
              sort_des: sort_des,
              publish_date: publish_date,
              is_status: is_status,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },

            { where: { id: blogInfo.dataValues.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
          );
          const updatedData = await BlogsData.findOne({
            where: { id: blogUpdateInfo,company_info_id :req?.body?.session_res?.client_id },
            transaction: trn,
          });

          if (image_delete && image_delete == "1") {
            await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
          }
          if (banner_image_delete && banner_image_delete == "1") {
            await imageDeleteInDBAndS3(req,findBannerImage,req.body.session_res.client_id);
          }
          await addActivityLogs(req,req?.body?.session_res?.client_id,[{
            old_data: { blog_id: blogInfo?.dataValues?.id, data: {...blogInfo?.dataValues}},
            new_data: {
              blog_id: updatedData?.dataValues?.id, data: {...updatedData?.dataValues }
            }
          }], blogInfo?.dataValues?.id,LogsActivityType.Edit, LogsType.Blog, req?.body?.session_res?.id_app_user,trn)
          await trn.commit();
          return resSuccess({
            message: RECORD_UPDATE_SUCCESSFULLY,
            data: updatedData,
          });
        }

        if (idImage == null && bannerIdImage == null) {
          const blogUpdateInfo = await BlogsData.update(
            {
              id_image:
                image_delete == "1"
                  ? null
                  : idImage == null
                  ? findImage && findImage.dataValues
                    ? findImage.dataValues.id
                    : null
                  : idImage,
              id_banner_image:
                banner_image_delete == "1"
                  ? null
                  : bannerIdImage == null
                  ? findBannerImage && findBannerImage.dataValues
                    ? findBannerImage.dataValues.id
                    : null
                  : bannerIdImage,
              meta_title: meta_title,
              meta_description: meta_description,
              meta_keywords: meta_keywords,
              name: name,
              slug: slug,
              sort_des: sort_des,
              id_category: id_category,
              description: description,
              author: author,
              publish_date: publish_date,
              is_status: is_status,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },

            { where: { id: blogInfo.dataValues.id }, transaction: trn }
          );
          const updatedData = await BlogsData.findOne({
            where: { id: blogUpdateInfo,company_info_id :req?.body?.session_res?.client_id },
            transaction: trn,
          });
          if (image_delete && image_delete == "1") {
            await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
          }
          if (banner_image_delete && banner_image_delete == "1") {
            await imageDeleteInDBAndS3(req,findBannerImage,req.body.session_res.client_id);
          }

          await addActivityLogs(req,req?.body?.session_res?.client_id,[{
            old_data: { blog_id: blogInfo?.dataValues?.id, data: {...blogInfo?.dataValues}},
            new_data: {
              blog_id: updatedData?.dataValues?.id, data: { ...updatedData?.dataValues }
            }
          }], blogInfo?.dataValues?.id,LogsActivityType.Edit, LogsType.Blog, req?.body?.session_res?.id_app_user,trn)
          
          await trn.commit();
          return resSuccess({
            message: RECORD_UPDATE_SUCCESSFULLY,
            data: updatedData,
          });
        }
      }
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteBlogs = async (req: Request) => {
  try {
    const {BlogsData} = initModels(req);
    const blogExists = await BlogsData.findOne({
      where: { id: req.body.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    console.log(blogExists);

    if (!(blogExists && blogExists.dataValues)) {
      return resNotFound();
    }
    await BlogsData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: blogExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { blog_id: blogExists?.dataValues?.id, data: {...blogExists?.dataValues}},
      new_data: {
        blog_id: blogExists?.dataValues?.id, data: {
          ...blogExists?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], blogExists?.dataValues?.id, LogsActivityType.Delete, LogsType.Blog, req?.body?.session_res?.id_app_user)
    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getBlogsDataUser = async (req: Request) => {
  try {
    const {BlogsData,Image,BlogCategoryData} = initModels(req);

    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const blogsList = await BlogsData.findAll({
      order: [
        ["publish_date", "DESC"],
        [{ model: BlogCategoryData, as: "category" }, "sort_order", "ASC"],
      ],
      where: {
        is_deleted: DeletedStatus.No,
        is_status: "2",
        company_info_id:company_info_id?.data,
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
        "is_default",
        "sort_des",
        [Sequelize.literal("blog_image.image_path"), "image_path"],
        [Sequelize.literal("category.name"), "category_name"],
        [Sequelize.literal("category.sort_order"), "sort_order"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("banner_image.image_path"), "banner_image_path"],
      ],
      include: [
        { model: Image, as: "blog_image", attributes: [],where:{company_info_id:company_info_id?.data},required:false },
        {
          model: BlogCategoryData,
          as: "category",
          attributes: [],
          required:false,
          where: {
            is_deleted: DeletedStatus.No,
            is_active: ActiveStatus.Active,
            company_info_id:company_info_id?.data,
          },
        },
        { model: Image, as: "banner_image", attributes: [],where:{company_info_id:company_info_id?.data},required:false },
      ],
    });

    return resSuccess({ data: blogsList });
  } catch (error) {
    throw error;
  }
};

export const bolgDetailAPI = async (req: Request) => {
  try {
    const {BlogsData,Image,BlogCategoryData} = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const result = await BlogsData.findOne({
      where: { is_deleted: DeletedStatus.No, slug: req.body.slug,company_info_id :company_info_id?.data },
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
        "id_category",
        "is_default",
        "sort_des",
        [Sequelize.literal("blog_image.image_path"), "image_path"],
        [Sequelize.literal("category.name"), "category_name"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("banner_image.image_path"), "banner_image_path"],
      ],
      include: [
        { model: Image, as: "blog_image", attributes: [],where:{company_info_id :company_info_id?.data},required:false },
        { model: BlogCategoryData, as: "category", attributes: [],where:{company_info_id :company_info_id?.data},required:false },
        { model: Image, as: "banner_image", attributes: [],where:{company_info_id :company_info_id?.data},required:false },
      ],
    });

    return resSuccess({ data: result });
  } catch (error) {
    console.log("------------------", error)
    throw error;
  }
};

export const defaultBlogs = async (req: Request) => {
  try {
    const {BlogsData} = initModels(req);

    const blogExists = await BlogsData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    const defaultBlogsblogExists = await BlogsData.findOne({
      where: { is_default: "1",},
    });

    if (!(blogExists && blogExists.dataValues)) {
      return resNotFound();
    }

    await BlogsData.update(
      {
        is_default: "0",
      },
      { where: { id: { [Op.ne]: blogExists.dataValues.id },company_info_id :req?.body?.session_res?.client_id } }
    );

    await BlogsData.update(
      {
        is_default: "1",
      },
      { where: { id: blogExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    const afterupdateblogExists = await BlogsData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { blog_id: blogExists?.dataValues?.id, data: {...blogExists?.dataValues}},
      new_data: {
        blog_id: afterupdateblogExists?.dataValues?.id, data: {
          ...afterupdateblogExists?.dataValues
        },
      }
    }], afterupdateblogExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Blog, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
