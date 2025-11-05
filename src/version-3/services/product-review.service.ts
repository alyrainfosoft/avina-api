import { Request } from "express";
import AppUser from "../model/app-user.model";
import Product from "../model/product.model";
import { DEFAULT_STATUS_CODE_SUCCESS, PRODUCT_NOT_FOUND, RECORD_UPDATE_SUCCESSFULLY, USER_NOT_FOUND } from "../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resNotFound, resSuccess, resUnknownError } from "../../utils/shared-functions";
import dbContext from "../../config/db-context";
import ProductReview from "../model/product-review.model";
import { moveFileToS3ByTypeAndLocation } from "../../helpers/file.helper";
import { PRODUCT_FILE_LOCATION } from "../../utils/app-constants";
import ReviewImages from "../model/review-images.model";
import { QueryTypes, Sequelize } from "sequelize";
import { ActiveStatus } from "../../utils/app-enumeration";

export const addProductReview =async (req:Request) => {
    const {user_id, product_id, rating, reviewer_name, comment} = req.body
    try {
        
        const userExit = await AppUser.findOne({where: {id: user_id, is_deleted: '0'}});
        const productExit = await Product.findOne({where: {id: product_id, is_deleted: '0'}});
        
        if (!(userExit && userExit.dataValues)) {
         return resNotFound({ message: USER_NOT_FOUND });
       }
       if (!(productExit && productExit.dataValues)) {
         return resNotFound({ message: PRODUCT_NOT_FOUND });
       }

       const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

    const trn = await dbContext.transaction();

    console.log(req.body)
    try {

        const productReview = await ProductReview.create(
            {
                reviewer_id: userExit.dataValues.id,
                product_id: productExit.dataValues.id,
                rating: parseFloat(rating),
                reviewer_name: reviewer_name,
                comment: comment,
                is_approved: ActiveStatus.Active,
                created_date: getLocalDate()
            },
            {transaction: trn}
        )

        if(files.images != undefined) {
          let imageFile;
          for (imageFile of files.images) {
            const resPRF = await moveFileToS3ByTypeAndLocation(dbContext,
              imageFile,
              `${PRODUCT_FILE_LOCATION}/${productExit.dataValues.sku}/review`,
              null
            );
            if (resPRF.code !== DEFAULT_STATUS_CODE_SUCCESS) {
              await trn.rollback();
              return resPRF;
            }
    
            await ReviewImages.create(
              {
                review_id: productReview.dataValues.id,
                image_path: resPRF.data,
                product_id: product_id,
                created_date: getLocalDate(),
              },
              { transaction: trn }
            );
          }
        }

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
    const {product_id} = req.body
    const productExit = await Product.findOne({where: {id: product_id, is_deleted: '0'}});
    if (!(productExit && productExit.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }
    const productReview = await dbContext.query(`SELECT id, reviewer_id, product_id, rating, reviewer_name, comment, modified_date ,
    (SELECT jsonb_agg(jsonb_build_object('image_path', review_images.image_path))
                                   FROM review_images
                                   WHERE review_images.product_id = product_reviews.product_id AND review_images.review_id = product_reviews.id 
                     
        ) AS product_images
    FROM product_reviews WHERE product_id = ${productExit.dataValues.id} AND is_approved = '1'`, {type: QueryTypes.SELECT})

    return resSuccess({data: productReview})
  } catch (error) {
    throw error
  }
}

export const statusUpdateforProductReview =async (req:Request) => {
  
  try {
    const {id, is_approved} = req.body

    const productReview = await ProductReview.findOne({where: {id: id}})

    if (!(productReview && productReview.dataValues)) {
      return resNotFound();
    }

    const upadteProductReview = await (ProductReview.update(
      {
          is_approved: is_approved,
          modified_date: getLocalDate(),
      },
      { where: { id: productReview.dataValues.id } }
  ));
  if (upadteProductReview) {
      return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
  } 

  } catch (error) {
    throw error
  }

}

export const getProductReviewListData =async (req:Request) => {
  try {
      let paginationProps = {};

      let pagination = {
        ...getInitialPaginationFromQuery(req.query),
        search_text: req.query.search_text,
      };
      let noPagination = req.query.no_pagination === "1";
  
  
      if (!noPagination) {
        const totalItems = await ProductReview.count({

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
          },
        ]

       })
  
      return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
      throw error
  }
}