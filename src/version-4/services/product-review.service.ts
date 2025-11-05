import { Request } from "express";
import { DEFAULT_STATUS_CODE_SUCCESS, PRODUCT_NOT_FOUND, RECORD_UPDATE_SUCCESSFULLY, USER_NOT_FOUND } from "../../utils/app-messages";
import { addActivityLogs, getCompanyIdBasedOnTheCompanyKey, getInitialPaginationFromQuery, getLocalDate, resNotFound, resSuccess, resUnknownError } from "../../utils/shared-functions";
import { moveFileToS3ByTypeAndLocation } from "../../helpers/file.helper";
import { PRODUCT_FILE_LOCATION } from "../../utils/app-constants";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { ActiveStatus, DeletedStatus, LogsActivityType, LogsType } from "../../utils/app-enumeration";
import { initModels } from "../model/index.model";

export const addProductReview =async (req:Request) => {
    const {user_id, product_id, rating, reviewer_name, comment} = req.body
  try {
        const {AppUser, Product, ProductReview, ReviewImages} = initModels(req);
        const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
        if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
          return company_info_id;
        }
        const userExit = await AppUser.findOne({where: {id: user_id, is_deleted: DeletedStatus.No,company_info_id:company_info_id?.data}});
        const productExit = await Product.findOne({where: {id: product_id, is_deleted: DeletedStatus.No,company_info_id:company_info_id?.data}});
        
        if (!(userExit && userExit.dataValues)) {
         return resNotFound({ message: USER_NOT_FOUND });
       }
       if (!(productExit && productExit.dataValues)) {
         return resNotFound({ message: PRODUCT_NOT_FOUND });
       }

       const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

    const trn = await (req.body.db_connection).transaction();
const imageLog=[];
    try {

        const productReview = await ProductReview.create(
            {
                reviewer_id: userExit.dataValues.id,
                product_id: productExit.dataValues.id,
                rating: parseFloat(rating),
                reviewer_name: reviewer_name,
                comment: comment,
                company_info_id:company_info_id?.data,
                is_approved: ActiveStatus.Active,
                modified_date: getLocalDate(),
                created_date: getLocalDate()
            },
            {transaction: trn}
        )

        if(files.images != undefined) {
          let imageFile;
          for (imageFile of files.images) {
            const resPRF = await moveFileToS3ByTypeAndLocation(req.body.db_connection,
              imageFile,
              `${PRODUCT_FILE_LOCATION}/${productExit.dataValues.sku}/review`,
              company_info_id?.data,
              req
            );
            if (resPRF.code !== DEFAULT_STATUS_CODE_SUCCESS) {
              await trn.rollback();
              return resPRF;
            }
    
            const reviewImage = await ReviewImages.create(
              {
                review_id: productReview.dataValues.id,
                image_path: resPRF.data,
                product_id: product_id,
                company_info_id:company_info_id?.data,
                created_date: getLocalDate(),
              },
              { transaction: trn }
            );
            imageLog.push({...reviewImage?.dataValues})
          }
        }
      await addActivityLogs(req,company_info_id?.data,[{
        old_data: null,
        new_data: {
          product_review_id: productReview?.dataValues?.id, data: {
            ...productReview?.dataValues
          },
          image_data:imageLog
        }
      }], productReview?.dataValues?.id, LogsActivityType.Add, LogsType.ProductReview, req?.body?.session_res?.id_app_user,trn)
    
       await trn.commit();
        return resSuccess();
    } catch (error) {
        await trn.rollback();
        return resUnknownError({ data: error });
    }


    } catch (error) {
        throw error
    }
}

export const getProductReviewByProductID =async (req:Request) => {
  try {
    const {Product} = initModels(req);
    const {product_id} = req.body
    let company_info_id: any = {};
    if (req?.body?.session_res?.client_id) {
      company_info_id.code = DEFAULT_STATUS_CODE_SUCCESS;
      company_info_id.data = req.body.session_res.client_id;
    } else {
      const decrypted = await getCompanyIdBasedOnTheCompanyKey(req.query, req.body.db_connection);

      if (decrypted.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return decrypted;
      }

      company_info_id = decrypted;
    }
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }    
    const productExit = await Product.findOne({where: {id: product_id, is_deleted: DeletedStatus.No,company_info_id:company_info_id?.data}});
    if (!(productExit && productExit.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }
    const productReview = await req.body.db_connection.query(`SELECT id, reviewer_id, product_id, rating, reviewer_name, comment, created_date as modified_date ,
    (SELECT jsonb_agg(jsonb_build_object('image_path', review_images.image_path))
                                   FROM review_images
                                   WHERE review_images.product_id = product_reviews.product_id AND review_images.review_id = product_reviews.id 
                     
        ) AS product_images
    FROM product_reviews WHERE product_reviews.company_info_id = ${company_info_id?.data} AND product_id = ${productExit.dataValues.id} AND is_approved = '1'`, {type: QueryTypes.SELECT})

    return resSuccess({data: productReview})
  } catch (error) {
    throw error
  }
}

export const statusUpdateforProductReview =async (req:Request) => {
  
  try {
    const {ProductReview} = initModels(req);

    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const {id, is_approved} = req.body

    const productReview = await ProductReview.findOne({where: {id: id,company_info_id:company_info_id?.data}})

    if (!(productReview && productReview.dataValues)) {
      return resNotFound();
    }

    const upadteProductReview = await (ProductReview.update(
      {
          is_approved: is_approved,
          modified_date: getLocalDate(),
      },
      { where: { id: productReview.dataValues.id,company_info_id:company_info_id?.data } }
  ));
  if (upadteProductReview) {
     await addActivityLogs(req,company_info_id?.data,[{
          old_data: { product_review_id: productReview?.dataValues?.id, data: productReview?.dataValues},
          new_data: {
            product_review_id: productReview?.dataValues?.id, data: {
              ...productReview?.dataValues, is_approved: is_approved,
              modified_date: getLocalDate(),
              modified_by: req?.body?.session_res?.id_app_user,
            }
          }
        }], productReview?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.ProductReview, req?.body?.session_res?.id_app_user)
        
      return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
  } 

  } catch (error) {
    throw error
  }

}

export const getProductReviewListData =async (req:Request) => {
  try {
      let paginationProps = {};
      const {ProductReview, ReviewImages} = initModels(req);
      let pagination = {
        ...getInitialPaginationFromQuery(req.query),
        search_text: req.query.search_text,
      };
      let noPagination = req.query.no_pagination === "1";
      let where = [
        { company_info_id: req?.body?.session_res?.client_id },
        req.query.search_text ?
          {
            [Op.or]: [
              Sequelize.where(
                Sequelize.literal(`(SELECT name FROM products WHERE id = "product_id")`),
                { [Op.iLike]: `%${req.query.search_text}%` }
              ),
              Sequelize.where(
                Sequelize.literal(`(SELECT sku FROM products WHERE id = "product_id")`),
                { [Op.iLike]: `%${req.query.search_text}%` }
              ),
              { reviewer_name: { [Op.iLike]: `%${req.query.search_text}%` } },
              { comment: { [Op.iLike]: `%${req.query.search_text}%` } }
            ]
          }
          : {}
      ]
  
      if (!noPagination) {
        const totalItems = await ProductReview.count({
          where
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
  
      const result = await ProductReview.findAll({
        ...paginationProps,
        where,
        order: [[pagination.sort_by, pagination.order_by]],
        attributes: [
          "id",
          "reviewer_id",
          "product_id",
          "rating",
          "reviewer_name",
          "comment",
          "is_approved",
          [Sequelize.literal(`(SELECT products.name FROM products WHERE id = "product_id")`), "product_name"],
          [Sequelize.literal(`(SELECT products.sku FROM products WHERE id = "product_id")`), "product_sku"]

        ],
        include: [
          {
            required: false,
            model: ReviewImages,
            as: "product_images",
            attributes: ["image_path"],
            where:{company_info_id:req?.body?.session_res?.client_id}
          },
        ]

       })
  
      return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
      throw error
  }
}