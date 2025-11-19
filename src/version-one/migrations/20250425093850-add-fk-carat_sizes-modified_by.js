
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('carat_sizes', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_carat_sizes_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('carat_sizes', 'fk_carat_sizes_modified_by');
  }
};
