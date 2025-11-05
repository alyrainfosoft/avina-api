import { QueryTypes } from "sequelize";
import dbContext from "../../../config/db-context";
import { resNotFound, resSuccess } from "../../../utils/shared-functions";
import { NOT_FOUND_MESSAGE } from "../../../utils/app-messages";
import { Request } from "express";


export const templateSelevensAllSectionListForUser = async (req: Request) => {
  try {
    const result = await dbContext.query(
      `(SELECT 
          template_seven.id,
          template_seven.title,
          template_seven.sub_title,
          template_seven.sub_title_one,
          template_seven.description,
          template_seven.sub_description,
          id_categories,
          category.category_name AS category_name,
          category.slug AS slug,
          template_seven.link,
          template_seven.button_name,
          template_seven.button_color,
          template_seven.button_text_color,
          template_seven.is_button_transparent,
          template_seven.button_hover_color,
          template_seven.button_text_hover_color,
          template_seven.section_type,
          id_title_image,
          title_image.image_path AS title_image_path,
          id_product_image,
          product_image.image_path AS product_image_path,
          id_offer_image,
          offer_image.image_path AS offer_image_path,
          id_bg_image,
          bg_image.image_path AS bg_image_path,
          sort_order,
               CASE
            WHEN "template_seven"."id_products" IS NULL or template_seven.section_type != 'category_and_products' THEN '{}'::json
            ELSE (
              SELECT json_agg(json_build_object('id', id, 'name', name, 'sku', sku, 'slug', slug, 'pmo', pmo, 'pdo', pdo, 'product_images', product_images))
              FROM product_list_view
              WHERE template_seven.section_type = 'category_and_products'
              And id IN (
                SELECT UNNEST(string_to_array("template_seven"."id_products", '|')::int[])
              )
            )
          END as category_and_products,
CASE
            WHEN "template_seven"."id_products" IS NULL or template_seven.section_type != 'category_and_products' THEN '{}'::json
            ELSE (
              SELECT json_agg(json_build_object('id', id, 'name', name, 'sku', sku, 'slug', slug, 'pmo', pmo, 'pdo', pdo, 'product_images', product_images))
              FROM product_list_view
              WHERE template_seven.section_type = 'category_and_products'
              And id IN (
                SELECT UNNEST(string_to_array("template_seven"."id_products", '|')::int[])
              )
            )
          END as category_and_products,
CASE
  WHEN template_seven.product_ids IS NULL THEN '{}'::json
  ELSE (
    SELECT json_agg(
      json_build_object(
        'id', plv.id,
        'name', plv.name,
        'sku', plv.sku,
        'slug', plv.slug,
        'pmo', plv.pmo,
        'pdo', plv.pdo,
        'product_images', plv.product_images
      )
      ORDER BY NULLIF(elem.json_obj->>'sort_order', '')::int NULLS LAST
    )
    FROM jsonb_array_elements(template_seven.product_ids::jsonb) WITH ORDINALITY AS elem(json_obj, ord)
    JOIN product_list_view plv ON plv.id = (elem.json_obj->>'id')::int
    WHERE template_seven.section_type = 'best_seller'
  )
END AS products,
         CASE
          WHEN "template_seven"."id_products" IS NULL THEN '{}'::json
            ELSE (
              SELECT json_agg(
                json_build_object(
                  'id', b.id,
                  'name', b.name,
                  'slug', b.slug,
                  'image', (
                    SELECT i.image_path
                    FROM images i
                    WHERE i.id = b.id_image
                  ),
                  'banner_image', (
                    SELECT i.image_path
                    FROM images i
                    WHERE i.id = b.id_banner_image
                  )
                )
              )
              FROM blogs b
              WHERE template_seven.section_type = 'new_and_blog'
              AND  b.id IN (
                SELECT UNNEST(string_to_array("template_seven"."id_products", '|')::int[])
              )
            )
          END as blogs
        FROM template_seven
        LEFT OUTER JOIN images AS title_image ON template_seven.id_title_image = title_image.id
        LEFT OUTER JOIN images AS product_image ON template_seven.id_product_image = product_image.id
        LEFT OUTER JOIN images AS offer_image ON template_seven.id_offer_image = offer_image.id
        LEFT OUTER JOIN images AS bg_image ON template_seven.id_bg_image = bg_image.id
        LEFT OUTER JOIN categories AS category ON template_seven.id_categories = category.id
        WHERE template_seven.is_active = '1' AND template_seven.is_deleted = '0'
        ORDER BY template_seven.sort_order ASC
      )`,
      { type: QueryTypes.SELECT }
    );
    

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};


export const templateSevensAllSectionDetailForUser = async (req: Request) => {
    try {
      const result = await dbContext.query(
        `(SELECT 
            template_seven.id,
            template_seven.title,
            template_seven.sub_title,
            template_seven.sub_title_one,
            template_seven.description,
            template_seven.sub_description,
            id_categories,
            category.category_name AS category_name,
            category.slug AS slug,
            template_seven.link,
            template_seven.button_name,
            template_seven.button_color,
            template_seven.button_text_color,
            template_seven.is_button_transparent,
            template_seven.button_hover_color,
            template_seven.button_text_hover_color,
            template_seven.section_type,
            id_title_image,
            title_image.image_path AS title_image_path,
            id_product_image,
            product_image.image_path AS product_image_path,
            id_offer_image,
            offer_image.image_path AS offer_image_path,
            id_bg_image,
            bg_image.image_path AS bg_image_path,
            sort_order,
                     CASE
            WHEN "template_seven"."id_products" IS NULL or template_seven.section_type != 'category_and_products' THEN '{}'::json
            ELSE (
              SELECT json_agg(json_build_object('id', id, 'name', name, 'sku', sku, 'slug', slug, 'pmo', pmo, 'pdo', pdo, 'product_images', product_images))
              FROM product_list_view
              WHERE template_seven.section_type = 'category_and_products'
              And id IN (
                SELECT UNNEST(string_to_array("template_seven"."id_products", '|')::int[])
              )
            )
          END as category_and_products,
CASE
            WHEN "template_seven"."id_products" IS NULL or template_seven.section_type != 'category_and_products' THEN '{}'::json
            ELSE (
              SELECT json_agg(json_build_object('id', id, 'name', name, 'sku', sku, 'slug', slug, 'pmo', pmo, 'pdo', pdo, 'product_images', product_images))
              FROM product_list_view
              WHERE template_seven.section_type = 'category_and_products'
              And id IN (
                SELECT UNNEST(string_to_array("template_seven"."id_products", '|')::int[])
              )
            )
          END as category_and_products,
CASE
  WHEN template_seven.product_ids IS NULL THEN '{}'::json
  ELSE (
    SELECT json_agg(
      json_build_object(
        'id', plv.id,
        'name', plv.name,
        'sku', plv.sku,
        'slug', plv.slug,
        'pmo', plv.pmo,
        'pdo', plv.pdo,
        'product_images', plv.product_images
      )
      ORDER BY NULLIF(elem.json_obj->>'sort_order', '')::int NULLS LAST
    )
    FROM jsonb_array_elements(template_seven.product_ids::jsonb) WITH ORDINALITY AS elem(json_obj, ord)
    JOIN product_list_view plv ON plv.id = (elem.json_obj->>'id')::int
    WHERE template_seven.section_type = 'best_seller'
  )
END AS products,
         CASE
          WHEN "template_seven"."id_products" IS NULL THEN '{}'::json
            ELSE (
              SELECT json_agg(
                json_build_object(
                  'id', b.id,
                  'name', b.name,
                  'slug', b.slug,
                  'image', (
                    SELECT i.image_path
                    FROM images i
                    WHERE i.id = b.id_image
                  ),
                  'banner_image', (
                    SELECT i.image_path
                    FROM images i
                    WHERE i.id = b.id_banner_image
                  )
                )
              )
              FROM blogs b
              WHERE template_seven.section_type = 'new_and_blog'
              AND  b.id IN (
                SELECT UNNEST(string_to_array("template_seven"."id_products", '|')::int[])
              )
            )
          END as blogs
          FROM template_seven
          LEFT OUTER JOIN images AS title_image ON template_seven.id_title_image = title_image.id
          LEFT OUTER JOIN images AS product_image ON template_seven.id_product_image = product_image.id
          LEFT OUTER JOIN images AS offer_image ON template_seven.id_offer_image = offer_image.id
          LEFT OUTER JOIN images AS bg_image ON template_seven.id_bg_image = bg_image.id
          LEFT OUTER JOIN categories AS category ON template_seven.id_categories = category.id
          WHERE template_seven.is_active = '1' AND template_seven.is_deleted = '0' AND template_seven.id = ${req.params.id} ORDER BY template_seven.sort_order ASC)`,
        { type: QueryTypes.SELECT }
      );
  
      console.log("result", result);
      if (!(result && result[0])) {
        return resNotFound({ message: NOT_FOUND_MESSAGE });
      }
      return resSuccess({ data: result[0] });
    } catch (error) {
      throw error;
    }
  };
  