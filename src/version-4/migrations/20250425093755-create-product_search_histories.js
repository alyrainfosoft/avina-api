
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_search_histories', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      value: {
  allowNull: false,
  type: 'character varying',
},
      user_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: false,
  type: Sequelize.DATE,
},
      modified_date: {
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
    await queryInterface.dropTable('product_search_histories');
  }
};
