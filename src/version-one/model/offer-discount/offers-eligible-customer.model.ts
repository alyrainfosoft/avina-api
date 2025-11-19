import { DATE, INTEGER, NOW, STRING } from "sequelize";

export const OfferEligibleCustomers = (dbContext: any) => {
   const offerEligibleCustomers = dbContext.define('offer_eligible_customers', {
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
    user_id: {
      type: INTEGER,
      allowNull: true,
    },
    user_segments: {
      type: STRING,
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
  company_info_id: {
    type: INTEGER,
  }
  }, {
    timestamps: false, // Disable automatic Sequelize timestamps
  });

  return offerEligibleCustomers;
}