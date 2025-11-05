
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('images', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_images_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('images', 'fk_images_created_by');
  }
};
