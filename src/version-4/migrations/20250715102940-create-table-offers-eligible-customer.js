'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('offer_eligible_customers', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        offer_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'offers',
            key: 'id',
          },
          onUpdate: 'NO ACTION',
          onDelete: 'CASCADE',
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        user_segments: {
          type: Sequelize.STRING,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        is_deleted: {
          type: Sequelize.STRING,
          defaultValue: '0',
        },
        created_by: {
            type: Sequelize.INTEGER,
          },
       updated_by: {
         type: Sequelize.INTEGER,
       },
      company_info_id: {
        type: Sequelize.INTEGER,
      }
      }, {
        timestamps: false, // Disable automatic Sequelize timestamps
      })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('offer_eligible_customers');
  }
};
