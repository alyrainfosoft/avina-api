
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_enquiries', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      full_name: {
  allowNull: false,
  type: 'character varying',
},
      email: {
  allowNull: false,
  type: 'character varying',
},
      contact_number: {
  allowNull: true,
  type: 'character varying',
},
      message: {
  allowNull: true,
  type: 'character varying',
},
      product_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      product_json: {
  allowNull: true,
  type: Sequelize.JSON,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      admin_comments: {
  allowNull: true,
  type: 'character varying',
},
      admin_action: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      date: {
  allowNull: true,
  type: Sequelize.DATEONLY,
},
      time: {
  allowNull: true,
  type: Sequelize.TIME,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('product_enquiries');
  }
};
