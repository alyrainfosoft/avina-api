
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('config_cart_products', {
      id: {
  allowNull: false,
  primaryKey: true,
  type: 'character varying',
},
      user_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      product_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      product_SKU: {
  allowNull: false,
  type: 'character varying',
},
      quantity: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      product_details: {
  allowNull: true,
  type: Sequelize.JSON,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('config_cart_products');
  }
};
