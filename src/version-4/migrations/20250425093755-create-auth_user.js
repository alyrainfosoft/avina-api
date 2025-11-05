
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auth_user', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      password: {
  allowNull: false,
  type: 'character varying(128)',
},
      last_login: {
  allowNull: true,
  type: Sequelize.DATE,
},
      is_superuser: {
  allowNull: false,
  type: Sequelize.BOOLEAN,
},
      username: {
  allowNull: false,
  type: 'character varying(150)',
},
      first_name: {
  allowNull: false,
  type: 'character varying(150)',
},
      last_name: {
  allowNull: false,
  type: 'character varying(150)',
},
      email: {
  allowNull: false,
  type: 'character varying(254)',
},
      is_staff: {
  allowNull: false,
  type: Sequelize.BOOLEAN,
},
     is_active: {
  allowNull: false,
  type: Sequelize.BOOLEAN,
},
      date_joined: {
  allowNull: false,
  type: Sequelize.DATE,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('auth_user');
  }
};
