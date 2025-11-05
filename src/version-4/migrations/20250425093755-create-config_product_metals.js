
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('config_product_metals', {
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
      metal_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      metal_wt: {
  allowNull: true,
  type: Sequelize.DOUBLE,
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
      karat_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      metal_tone: {
  allowNull: true,
  type: 'character varying',
},
      head_shank_band: {
  allowNull: true,
  type: 'character varying',
},
      labor_charge: {
  allowNull: true,
  type: Sequelize.DOUBLE,
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
    await queryInterface.dropTable('config_product_metals');
  }
};
