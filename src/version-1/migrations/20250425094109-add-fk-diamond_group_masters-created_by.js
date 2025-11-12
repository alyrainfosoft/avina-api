
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('diamond_group_masters', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_diamond_group_masters_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('diamond_group_masters', 'fk_diamond_group_masters_created_by');
  }
};
