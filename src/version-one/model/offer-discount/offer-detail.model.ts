import { ARRAY, DATE, DECIMAL, INTEGER, NOW, STRING, TEXT, TIME } from "sequelize";

export const OfferDetails = (dbContext: any) => {
   const offerDetails = dbContext.define('offer_details', {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  offer_id: {
    type: INTEGER,
    allowNull: false,
    references: {
      model: 'offers',
      key: 'id',
    },
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
  },
  product_id: {
    type: INTEGER,
    allowNull: true,
  },
  category_id: {
    type: INTEGER,
    allowNull: true,
  },
  collection_id: {
    type: INTEGER,
    allowNull: true,
  },
  style_id: {
    type: INTEGER,
    allowNull: true,
  },
  event_id: {
    type: INTEGER,
    allowNull: true,
  },
  lookbook_id: {
    type: INTEGER,
    allowNull: true,
  },
  min_price: {
    type: DECIMAL(10, 2),
  },
  max_price: {
    type: DECIMAL(10, 2),
  },
  created_at: {
    type: DATE,
    defaultValue: NOW,
  },
  updated_at: {
    type: DATE,
    defaultValue: NOW,
  },
  is_deleted: {
    type: STRING,
    defaultValue: '0',
  },
  created_by: {
    type: INTEGER,
  },
  updated_by: {
    type: INTEGER,
  },
  condition:{
    type:STRING
  },
  company_info_id: {
    type: INTEGER,
  }
  
}, {
  timestamps: false, // Disable automatic Sequelize timestamps
});

  return offerDetails;
}