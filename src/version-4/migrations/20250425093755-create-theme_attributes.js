
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('theme_attributes', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      id_theme: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
id_theme_attribute: {
  allowNull: true,
  type: 'character varying',
},
key_value:{
  allowNull: true,
  type: 'character varying',
},
      value: {
  allowNull: true,
  type: 'character varying',
},
      link: {
  allowNull: true,
  type: 'character varying',
},
      id_image: {
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
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_deleted: {
  default:'0',
  type: 'bit(1)',
},
      deleted_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      deleted_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      is_changeable: {
  default:'0',
  type: 'bit(1)',
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('theme_attributes');
  }
};
