
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('app_users', {
      fields: ['id_role'],
      type: 'foreign key',
      name: 'fk_app_users_id_role',
      references: {
        table: 'roles',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('app_users', 'fk_app_users_id_role');
  }
};
