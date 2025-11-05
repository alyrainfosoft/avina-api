
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      order_number: {
  allowNull: false,
  type: 'character varying',
},
      user_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      shipping_method: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      pickup_store_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      coupon_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      sub_total: {
  allowNull: false,
  type: Sequelize.DOUBLE,
},
      shipping_cost: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      discount: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      total_tax: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      order_total: {
  allowNull: false,
  type: Sequelize.DOUBLE,
},
      payment_method: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      currency_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      currency_rate: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      order_status: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      payment_status: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      order_date: {
  allowNull: false,
  type: Sequelize.DATE,
},
      created_date: {
  allowNull: false,
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
      transaction_ref_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      order_type: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      order_note: {
  allowNull: true,
  type: 'character varying',
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      order_shipping_address: {
  allowNull: false,
  type: Sequelize.JSON,
},
      order_billing_address: {
  allowNull: false,
  type: Sequelize.JSON,
},
      order_taxs: {
  allowNull: true,
  type: Sequelize.JSON,
},
      email: {
  allowNull: true,
  type: 'character varying',
},
      coupon_discount: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      delivery_days: {
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
    await queryInterface.dropTable('orders');
  }
};
