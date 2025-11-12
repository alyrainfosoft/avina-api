
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('static_pages', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      page_title: {
  allowNull: false,
  type: 'character varying',
},
      slug: {
  allowNull: false,
  type: 'character varying',
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      content: {
  allowNull: false,
  type: 'character varying',
},
     is_active: {allowNull: true,
  type: 'bit(1)',
},
      is_deleted: {allowNull: true,
  type: 'bit(1)',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('static_pages');
  }
};
