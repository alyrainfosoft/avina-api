
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('template_banners', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_template_banners_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('template_banners', 'fk_template_banners_created_by');
  }
};
