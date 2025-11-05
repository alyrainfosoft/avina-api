
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_price_histories', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      id_product: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      id_option: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      option_type: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      old_price: {
  allowNull: false,
  type: 'numeric(10,3)',
},
      new_price: {
  allowNull: false,
  type: 'numeric(10,3)',
},
      price_changed_date: {
  allowNull: false,
  type: Sequelize.DATE,
},
      changed_by: {
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
    await queryInterface.dropTable('product_price_histories');
  }
};
