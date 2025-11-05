import { INTEGER, STRING, DATE, DOUBLE } from "sequelize";
import dbContext from "../../../../config/db-context";
import categoryData from "../../category.model";

const Collection = dbContext.define("collections", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: STRING,
    allowNull: false,
  },
  slug: {
    type: STRING,
    allowNull: false,
  },
  is_active: {
    type: STRING,
    allowNull: false,
  },
  created_date: {
    type: DATE,
    allowNull: false,
  },
  modified_date: {
    type: DATE,
  },
  created_by: {
    type: INTEGER,
    allowNull: false,
  },
  modified_by: {
    type: INTEGER,
  },
  is_deleted: {
    type: STRING,
  },
  id_category: {
    type: INTEGER,
  },
});

Collection.belongsTo(categoryData, {
  foreignKey: "id_category",
  as: "category",
});
export default Collection;
