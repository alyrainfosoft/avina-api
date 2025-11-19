
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('home_subs', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      title: {
  allowNull: true,
  type: 'character varying',
},
      content: {
  allowNull: true,
  type: 'character varying',
},
      target_link: {
  allowNull: true,
  type: 'character varying',
},
      button_name: {
  allowNull: true,
  type: 'character varying',
},
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
     is_active: {
      allowNull: false,
      type: 'bit(1)',
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
        allowNull: false,
        type: 'bit(1)',
},
      id_home_main: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      sort_order: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('home_subs');
  }
};
