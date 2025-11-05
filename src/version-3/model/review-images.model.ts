import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import ProductReview from "./product-review.model";

const ReviewImages = dbContext.define("review_images", {
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

});

ReviewImages.belongsTo(ProductReview, { foreignKey: "review_id", as: "product" });

ProductReview.hasMany(ReviewImages, {
  foreignKey: "review_id",
  as: "product_images",
});

export default ReviewImages;
