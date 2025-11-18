
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_details', {
      order_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      product_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      quantity: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      finding_charge: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      makring_charge: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      other_charge: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      diamond_count: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      diamond_rate: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      metal_rate: {
  allowNull: true,
  type: Sequelize.DOUBLE,
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
      order_details_json: {
  allowNull: true,
  type: Sequelize.JSON,
},
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      variant_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      product_details_json: {
  allowNull: true,
  type: Sequelize.JSON,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('order_details');
  }
};
