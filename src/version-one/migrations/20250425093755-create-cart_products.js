
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cart_products', {
      id: {
  allowNull: false,
  primaryKey: true,
  type: 'character varying',
},
      user_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      product_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
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
      product_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      variant_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_metal: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_karat: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_metal_tone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_size: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_length: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_band: {
  allowNull: true,
  type: 'bit(1)',
},
      id_head_metal_tone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_shank_metal_tone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_band_metal_tone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_coupon: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('cart_products');
  }
};
