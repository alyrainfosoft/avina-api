
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('config_product_diamonds', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      config_product_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_cts_individual: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      dia_count: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_cts: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_size: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      product_type: {
  allowNull: true,
  type: 'character varying',
},
      id_diamond_group: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_weight: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      dia_shape: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_stone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_color: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_mm_size: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_clarity: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_cuts: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_deleted: {
  allowNull: true,
  type: 'bit(1)',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('config_product_diamonds');
  }
};
