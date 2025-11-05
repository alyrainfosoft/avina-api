import { Request } from "express";
import { getInitialPaginationFromQuery, getLocalDate, resBadRequest, resNotFound, resSuccess } from "../utils/shared-functions";
import AppUser from "../model/app-user.model";
import Product from "../model/product.model";
import ProductWish from "../model/produc-wish-list.model";
import { INVALID_ID, PRODUCT_NOT_FOUND, RECORD_DELETE_SUCCESSFULLY, USER_NOT_FOUND } from "../utils/app-messages";
import { Sequelize } from "sequelize";
import ProductImage from "../model/product-image.model";
import { IMAGE_TYPE, PRODUCT_IMAGE_TYPE } from "../utils/app-enumeration";
import customerUser from "../model/customer-user.model";
export const addProductWishList =async (req: Request) => {
    try {
        const { user_id, product_id} = req.body

        const wishListproduct = {
            user_id: user_id,
            product_id: product_id,
            created_date: getLocalDate()
        }

       const userExit = await AppUser.findOne({where: {id: user_id, is_deleted: '0'}});
       const productExit = await Product.findOne({where: {id: product_id, is_deleted: '0'}});
       
       if (!(userExit && userExit.dataValues)) {
        return resNotFound({ message: USER_NOT_FOUND });
      }
      if (!(productExit && productExit.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }
       const addProductData = await ProductWish.create(
        wishListproduct
       )

       const wish_list_count = await ProductWish.count({
        where: {user_id: user_id}
       })

       return resSuccess({data: {wish_list_count,addProductData}})
    } catch (error) {
        throw error
    }
}

export const getProductWishListByUserId =async (req: Request) => {
    try {

    if (!req.body.user_id) return resBadRequest({ message: INVALID_ID });

        const userData = await AppUser.findOne({where: {id: req.body.user_id}}) ;
        if (!(userData && userData.dataValues)) {
            return resNotFound({ message: USER_NOT_FOUND });
          }

         const wishlistData =  await ProductWish.findAll({
          where: {user_id: userData.dataValues.id},
       })

       const productId = wishlistData.map((t: any) => t.product_id)

       const ProductList = await Product.findAll({
        where: {id: productId},
        attributes: ["id", "name", "sku", "slug",
        "sort_description", "long_description",
        ],
        include: [
          {
              required: false,
              model: ProductImage,
              as: "product_images",
              attributes: ["image_path", "id_metal_tone", "image_type"],
              where: [
                { is_deleted: "0", image_type: PRODUCT_IMAGE_TYPE.Feature }
              ]
            },
      ]
      },
        )

       return resSuccess({data: ProductList})
    } catch (error) {
       throw error 
    }
}

export const deleteProductWishList =async (req: Request) => {
    try {
        const {user_id, product_id} = req.body
        const userExit = await AppUser.findOne({where: {id: user_id, is_deleted: '0'}});
        const productExit = await Product.findOne({where: {id: product_id, is_deleted: '0'}});
        
        if (!(userExit && userExit.dataValues)) {
         return resNotFound({ message: USER_NOT_FOUND });
       }
       if (!(productExit && productExit.dataValues)) {
         return resNotFound({ message: PRODUCT_NOT_FOUND });
       }

          await ProductWish.destroy(

            { where: { user_id: userExit.dataValues.id, product_id: productExit.dataValues.id } }
          );
      
        const wish_list_count = await ProductWish.count({
          where: {user_id: user_id}
        })
          return resSuccess({message: RECORD_DELETE_SUCCESSFULLY, data: wish_list_count});
    } catch (error) {
        throw error
    }
}

export const getProductWishListData =async (req:Request) => {
    try {
        let paginationProps = {};

        let pagination = {
          ...getInitialPaginationFromQuery(req.query),
          search_text: req.query.search_text,
        };
        let noPagination = req.query.no_pagination === "1";
    
    
        if (!noPagination) {
          const totalItems = await ProductWish.count({
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
    
        const result = await ProductWish.findAll({
            attributes: [
                "user_id",
                [Sequelize.literal('"users->customer_user"."full_name"'), "user_name"]

            ],
            include: [
                {
                    required: false,
                    model: Product,
                    as: "product",
                    attributes: ["id", "name", "sku", "slug",
                    "sort_description", "long_description",
                ]
                },
                {
                  required: false,
                  model: AppUser,
                  as: "users",
                  attributes: [],
                  include: [
                      {
                          required: false,
                          model: customerUser,
                          as: "customer_user",
                          attributes: []
                      },
                  ]
              },
            ]
         })
    
        return resSuccess({ data: noPagination ? result : { pagination, result } });
    } catch (error) {
        throw error
    }
}