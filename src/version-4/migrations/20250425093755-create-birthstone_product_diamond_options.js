
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('birthstone_product_diamond_options', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      id_product: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      id_type: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      weight: {
  allowNull: true,
  type: 'numeric(5,3)',
},
      count: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      is_deleted: {
  default:'0',
  type: 'bit(1)',
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      id_diamond_group: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_default: {
  allowNull: false,
  default:'0',
  type: 'bit(1)',
},
      id_stone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_shape: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_carat: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_mm_size: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_color: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_clarity: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_cut: {
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
    await queryInterface.dropTable('birthstone_product_diamond_options');
  }
};
