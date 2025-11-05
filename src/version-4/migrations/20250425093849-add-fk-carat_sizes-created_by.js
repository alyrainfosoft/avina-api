
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('carat_sizes', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_carat_sizes_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('carat_sizes', 'fk_carat_sizes_created_by');
  }
};
