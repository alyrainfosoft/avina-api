
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('birthstone_product_categories', {
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
      id_category: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      id_sub_category: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_sub_sub_category: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_deleted: {
  default:'0',
  type: 'bit(1)',
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
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('birthstone_product_categories');
  }
};
