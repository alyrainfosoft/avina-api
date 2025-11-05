
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('metadata_details', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      title: {
  allowNull: true,
  type: 'character varying',
},
      description: {
  allowNull: true,
  type: 'character varying',
},
      key_word: {
  allowNull: true,
  type: 'character varying',
},
      is_active: {
  allowNull: true,
  type: 'bit(1)',
},
      id_page: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      is_deleted: {
  allowNull: true,
  type: 'bit(1)',
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
    await queryInterface.dropTable('metadata_details');
  }
};
