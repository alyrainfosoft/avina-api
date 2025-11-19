
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('our_stories', {
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
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
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
     is_active: {
      allowNull: true,
  type: 'bit(1)',
},
      is_deleted: {
      allowNull: true,
  type: 'bit(1)',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('our_stories');
  }
};
