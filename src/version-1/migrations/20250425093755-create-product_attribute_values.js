
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_attribute_values', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      id_product: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      attribute_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_attribute_value: {
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
    await queryInterface.dropTable('product_attribute_values');
  }
};
