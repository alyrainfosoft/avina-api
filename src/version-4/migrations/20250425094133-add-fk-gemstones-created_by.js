
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gemstones', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_gemstones_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gemstones', 'fk_gemstones_created_by');
  }
};
