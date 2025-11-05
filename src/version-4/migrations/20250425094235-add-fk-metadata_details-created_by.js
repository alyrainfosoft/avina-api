
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('metadata_details', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_metadata_details_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('metadata_details', 'fk_metadata_details_created_by');
  }
};
