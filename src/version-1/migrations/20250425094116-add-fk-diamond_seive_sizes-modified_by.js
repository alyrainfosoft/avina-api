
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('diamond_seive_sizes', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_diamond_seive_sizes_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('diamond_seive_sizes', 'fk_diamond_seive_sizes_modified_by');
  }
};
