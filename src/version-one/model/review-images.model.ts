import { DATE, INTEGER, STRING } from "sequelize";
import { ProductReview } from "./product-review.model";


export const ReviewImages = (dbContext: any) => {

  let reviewImages = dbContext.define("review_images", {
    review_id: {
      type: INTEGER,
      primaryKey: true,
    },
    image_path: {
      type: STRING
    },
    product_id: {
      type: INTEGER,
      primaryKey: true,
    },
    created_date: {
      type: DATE,
    },
    company_info_id: {
      type: INTEGER
    }
  });

  return reviewImages;
}
