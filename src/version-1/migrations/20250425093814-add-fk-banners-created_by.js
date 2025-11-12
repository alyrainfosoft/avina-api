
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('banners', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_banners_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('banners', 'fk_banners_created_by');
  }
};
