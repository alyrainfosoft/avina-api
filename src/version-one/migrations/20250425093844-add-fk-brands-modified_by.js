
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('brands', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_brands_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('brands', 'fk_brands_modified_by');
  }
};
