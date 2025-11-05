
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_bulk_upload_files', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      file_path: {
  allowNull: false,
  type: 'character varying(200)',
},
      status: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      error: {
  allowNull: true,
  type: Sequelize.JSON,
},
      file_type: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('product_bulk_upload_files');
  }
};
