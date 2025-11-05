'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("look_books", {
      id: {
        type: Sequelize.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      offer_id: {
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER
      },
      category_id: {
        type: Sequelize.INTEGER
      },
      collection_id: {
        type: Sequelize.INTEGER
      },
      style_id: {
        type: Sequelize.INTEGER
      },
      event_id: {
        type: Sequelize.INTEGER
      },
      lookbook_id: {
        type: Sequelize.INTEGER
      },
      min_price: {
        type: Sequelize.DOUBLE
      },
      max_price: {
        type: Sequelize.DOUBLE
      },
      is_deleted: {
        type: Sequelize.STRING,
        defaultValue: "0"
      },
      created_by: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_by: {
        type: Sequelize.INTEGER,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      condition: {
        type: 'character varying',
      },
      company_info_id: {
        type: Sequelize.INTEGER,
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("look_books");
  }
};
