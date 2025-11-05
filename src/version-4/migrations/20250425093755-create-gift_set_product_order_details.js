
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gift_set_product_order_details', {
      order_id: {
  allowNull: false,
  primaryKey: true,
  type: Sequelize.INTEGER,
},
      product_id: {
  allowNull: false,
  primaryKey: true,
  type: Sequelize.INTEGER,
},
      quantity: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      sub_total: {
  allowNull: false,
  type: Sequelize.DOUBLE,
},
      product_tax: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      discount_amount: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      shipping_cost: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      shipping_method_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      delivery_status: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      payment_status: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      discount_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      refund_request_id: {
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
    await queryInterface.dropTable('gift_set_product_order_details');
  }
};
