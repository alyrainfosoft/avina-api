
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wishlist_products', {
      created_date: {
  allowNull: false,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      product_type: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      product_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      variant_id: {
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
      id_metal: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_metal_tone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_head_metal_tone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_shank_metal_tone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_band: {
 default:'0',
  type: 'bit(1)',
},
      id_band_metal_tone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_karat: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      product_details: {
  allowNull: true,
  type: Sequelize.JSON,
},
      user_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('wishlist_products');
  }
};
