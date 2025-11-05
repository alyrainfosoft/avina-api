
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_change_logs', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      product_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      variant_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      product_type: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      sku: {
  allowNull: false,
  type: 'character varying(200)',
},
      prev_quantity: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      new_quantity: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      transaction_type: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      changed_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      email: {
  allowNull: true,
  type: 'character varying(75)',
},
      change_date: {
  allowNull: false,
  type: Sequelize.DATE,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('stock_change_logs');
  }
};
