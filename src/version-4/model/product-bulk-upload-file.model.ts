import { DATE, INTEGER, JSON, STRING } from "sequelize";

export const ProductBulkUploadFile = (dbContext: any) => {
  let productBulkUploadFile = dbContext.define("product_bulk_upload_files", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  file_path: {
    type: STRING,
  },
  status: {
    type: INTEGER,
  },
  error: {
    type: JSON,
  },
  file_type: {
    type: INTEGER
  },
  created_by: {
    type: INTEGER,
  },
  created_date: {
    type: DATE,
  },
  modified_date: {
    type: DATE,
  },
  company_info_id :{ 
    type:INTEGER
  }
});
  return productBulkUploadFile;
}
