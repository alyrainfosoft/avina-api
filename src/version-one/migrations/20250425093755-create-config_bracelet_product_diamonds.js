
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('config_bracelet_product_diamonds', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      config_product_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      stone_type: {
  allowNull: false,
  type: 'character varying',
},
      id_stone: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      id_shape: {
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
      id_carat: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_wt: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      dia_count: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_diamond_group_master: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
     is_active: {
  default:'1',
  type: 'bit(1)',
},
      is_deleted: {
  default:'0',
  type: 'bit(1)',
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      alternate_stone: {
  allowNull: true,
  type: 'character varying',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('config_bracelet_product_diamonds');
  }
};
