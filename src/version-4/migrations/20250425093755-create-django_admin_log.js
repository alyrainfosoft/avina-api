
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('django_admin_log', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      action_time: {
  allowNull: false,
  type: Sequelize.DATE,
},
      object_id: {
  allowNull: true,
  type: Sequelize.TEXT,
},
      object_repr: {
  allowNull: false,
  type: 'character varying(200)',
},
      action_flag: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
      change_message: {
  allowNull: false,
  type: Sequelize.TEXT,
},
      content_type_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      user_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('django_admin_log');
  }
};
