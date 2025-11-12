
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('config_eternity_product_metals', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      config_eternity_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      metal_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      metal_wt: {
  allowNull: false,
  type: Sequelize.DOUBLE,
},
      created_by: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: false,
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
      labour_charge: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      is_deleted: {
  allowNull: true,
  default:'0',
  type: 'bit(1)',
},
      metal_tone: {
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
    await queryInterface.dropTable('config_eternity_product_metals');
  }
};
