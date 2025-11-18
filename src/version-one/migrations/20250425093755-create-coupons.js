
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('coupons', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      name: {
  allowNull: true,
  type: 'character varying',
},
      coupon_code: {
  allowNull: false,
  type: 'character varying',
},
      percentage_off: {
  allowNull: true,
  type: 'character varying',
},
      discount_amount_currency: {
  allowNull: true,
  type: 'character varying',
},
      duration: {
  allowNull: true,
  type: 'character varying',
},
      start_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      end_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      is_deleted: {
  allowNull: true,
  type: 'character varying',
},
      deleted_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      deleted_by: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      updated_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      updated_by: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      usage_limit: {
  allowNull: true,
  type: 'character varying',
},
      maximum_discount_amount: {
  allowNull: true,
  type: 'character varying',
},
      is_active: {
  allowNull: true,
  type: 'bit(1)',
},
      user_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      discount_type: {
  allowNull: false,
  type: 'character varying',
},
      discount_amount: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      min_total_amount: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      max_total_amount: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      description: {
  allowNull: true,
  type: 'character varying',
},
      user_limits: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('coupons');
  }
};
