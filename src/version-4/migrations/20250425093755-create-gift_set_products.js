
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gift_set_products', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      product_title: {
  allowNull: false,
  type: 'character varying',
},
      sku: {
  allowNull: false,
  type: 'character varying',
},
      short_des: {
  allowNull: true,
  type: 'character varying',
},
      long_des: {
  allowNull: true,
  type: 'character varying',
},
      tags: {
  allowNull: true,
  type: 'character varying',
},
      gender: {
  allowNull: true,
  type: 'character varying',
},
      price: {
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
     is_active: {
      allowNull: false,
      type: 'bit(1)',
},
      is_deleted: {
        allowNull: false,
        type: 'bit(1)',
},
      slug: {
  allowNull: true,
  type: 'character varying',
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      brand_id: {
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
    await queryInterface.dropTable('gift_set_products');
  }
};
