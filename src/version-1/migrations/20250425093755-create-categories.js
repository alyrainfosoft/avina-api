
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      parent_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      slug: {
  allowNull: false,
  type: 'character varying(191)',
},
      position: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_searchable: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      is_deleted: {
        allowNull: false,
        type: 'bit(1)',
},
      category_name: {
  allowNull: false,
  type: 'character varying',
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
     is_active: {
      allowNull: false,
      type: 'bit(1)',
},
      is_setting_style: {
  allowNull: true,
    type: 'bit(1)',
},
      is_size: {
  allowNull: true,
    type: 'bit(1)',
},
      is_length: {
  allowNull: true,
    type: 'bit(1)',
},
      id_size: {
  allowNull: true,
  type: 'character varying',
},
      id_length: {
  allowNull: true,
  type: 'character varying',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('categories');
  }
};
