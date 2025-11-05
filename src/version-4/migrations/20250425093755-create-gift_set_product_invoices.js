
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gift_set_product_invoices', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      invoice_number: {
  allowNull: false,
  type: 'character varying',
},
      invoice_date: {
  allowNull: false,
  type: Sequelize.DATE,
},
      invoice_amount: {
  allowNull: false,
  type: Sequelize.DOUBLE,
},
      billing_address: {
  allowNull: true,
  type: Sequelize.JSON,
},
      shipping_address: {
  allowNull: true,
  type: Sequelize.JSON,
},
      order_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      transaction_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
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
    await queryInterface.dropTable('gift_set_product_invoices');
  }
};
