
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('cities', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_cities_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('cities', 'fk_cities_modified_by');
  }
};
