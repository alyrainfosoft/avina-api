'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('offer_details', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      offer_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'offers',
          key: 'id',
        },
        onUpdate: 'NO ACTION',
        onDelete: 'CASCADE',
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      collection_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      style_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      lookbook_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      min_price: {
        type: Sequelize.DECIMAL(10, 2),
      },
      max_price: {
        type: Sequelize.DECIMAL(10, 2),
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
      condition: {
        type: Sequelize.STRING
      },
      company_info_id: {
        type: Sequelize.INTEGER,
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('offer_details');
  }
};
