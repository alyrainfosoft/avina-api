
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('django_session', {
      session_key: {
  allowNull: false,
  primaryKey: true,
  type: 'character varying(40)',
},
      session_data: {
  allowNull: false,
  type: Sequelize.TEXT,
},
      expire_date: {
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
    await queryInterface.dropTable('django_session');
  }
};
