
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('django_migrations', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      app: {
  allowNull: false,
  type: 'character varying(225)',
},
      name: {
  allowNull: false,
  type: 'character varying(225)',
},
      applied: {
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
    await queryInterface.dropTable('django_migrations');
  }
};
