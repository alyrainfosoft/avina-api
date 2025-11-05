import { Request } from "express";
import dbContext from "../../../config/db-context";
import { addActivityLogs, getLocalDate, imageAddAndEditInDBAndS3, imageDeleteInDBAndS3, resNotFound, resSuccess } from "../../../utils/shared-functions";
import { ActiveStatus, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import TemplateSevenData from "../../model/template-seven.model";
import Image from "../../model/image.model";
import { Op, QueryTypes, Sequelize } from "sequelize";

export const addTemplateSevenPoducts = async (req: Request) => {
    try {
        const { title, sub_title, description, products = [], section_type = 'best_seller' } = req.body

        const trn = await dbContext.transaction();
        try {
            let idImage = null;
                  if (req.file) {
                    const imageData = await imageAddAndEditInDBAndS3(req,
                      req.file,
                      IMAGE_TYPE.templateSeven,
                      req.body.session_res.id_app_user,
                      ""
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                      await trn.rollback();
                      return imageData;
                    }
                    idImage = imageData.data;
            }
            const data = await TemplateSevenData.create({
                section_type:section_type,
                title,
                sub_title,
                description,
                id_title_image: idImage,
                product_ids: products,
                created_by: req.body.session_res.id_app_user,
                created_date: getLocalDate(),
                is_deleted: DeletedStatus.No,
                is_active: ActiveStatus.Active,
                }, {transaction: trn})
           await trn.commit();
        return resSuccess()
        } catch (error) {
            await trn.rollback();
            throw error
        } 
    } catch (error) {
        throw error
    }
}

export const updateTemplateSevenProducts = async (req: Request) => {
    try {
        const { title, sub_title, description, products = [], section_type = 'best_seller',image_delete = "0" } = req.body

        const findSection = await TemplateSevenData.findOne({ where: { id: req.params.id, section_type: { [Op.eq]: section_type }, is_deleted: DeletedStatus.No } })

        if (!(findSection && findSection.dataValues)) {
            return resNotFound()
        }

        const trn = await dbContext.transaction();

        try {
            let imageId = null;
            let findImage = null;
            if (findSection.dataValues.id_title_image) {
              findImage = await Image.findOne({
                where: { id: findSection.dataValues.id_title_image },
                transaction: trn,
              });
            }
            if (req.file) {
              const imageData = await imageAddAndEditInDBAndS3(req,
                req.file,
                IMAGE_TYPE.caratSize,
                req.body.session_res.id_app_user,
                findImage
              );
      
              if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                await trn.rollback();
                return imageData;
              }
              imageId = imageData.data;
            } else {
              imageId = findSection.dataValues.id_title_image
            } 

            await TemplateSevenData.update({
                title,
                sub_title,
                description,
                id_title_image: imageId,
                product_ids: products,
                modified_by: req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
               is_active: ActiveStatus.Active
            }, { where: { id: req.params.id, section_type: { [Op.eq]: section_type }, is_deleted: DeletedStatus.No } })
            if (image_delete && image_delete === "1" && findImage.dataValues) {
                await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
            }

              await trn.commit()
            return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })

        } catch (error) {
            await trn.rollback();
            throw error
        }
    } catch (error) {
        throw error
    }
}

export const getALlTemplateSevenProducts = async (req: Request) => {
    try {

        const { section_type = "best_seller" } = req.params
        const data = await TemplateSevenData.findOne(
            {
                where: { is_deleted: DeletedStatus.No, section_type: section_type },

                attributes: [
                    "id",
                    "title",
                    "section_type",
                    "sub_title",
                    "description",
                    "product_ids",
                    [Sequelize.literal(`"title_image"."image_path"`), "image_path"]
                ],
                include: [
                    {
                        model: Image,
                        as: "title_image",
                        attributes: [],
                    }
                ]
            }
        )
        let products = []
        if ((data) && (data.dataValues) && (data.dataValues.product_ids)) {
        for (let index = 0; index < data.dataValues.product_ids.length; index++) {
            const element = data.dataValues.product_ids[index];
           const productData = await dbContext.query(`(SELECT id,name,slug,sku,product_type,product_images,pmo FROM product_list_view WHERE id = ${element?.id})`, { type: QueryTypes.SELECT })
            products.push({sort_order: element.sort_order, product: productData[0] })
        }
        }
        return resSuccess({ data: { section: data, products } })
    } catch (error) {
        throw error
    }
}