
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gift_product_order_transactions', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      order_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      order_amount: {
  allowNull: false,
  type: Sequelize.DOUBLE,
},
      payment_transaction_id: {
  allowNull: true,
  type: 'character varying',
},
      payment_status: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      payment_currency: {
  allowNull: true,
  type: 'character varying',
},
      payment_datetime: {
  allowNull: false,
  type: Sequelize.DATE,
},
      payment_source_type: {
  allowNull: true,
  type: 'character varying',
},
      payment_json: {
  allowNull: false,
  type: Sequelize.JSON,
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
    await queryInterface.dropTable('gift_product_order_transactions');
  }
};
