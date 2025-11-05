
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('config_bracelet_product_metals', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      config_product_id: {
  allowNull: false,
  type: Sequelize.BIGINT,
},
      id_metal: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      id_karat: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      labour_charge: {
  allowNull: true,
  default:0,
  type: Sequelize.DOUBLE,
},
      metal_wt: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_by: {
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
    await queryInterface.dropTable('config_bracelet_product_metals');
  }
};
