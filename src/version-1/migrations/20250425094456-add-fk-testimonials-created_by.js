
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('testimonials', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_testimonials_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('testimonials', 'fk_testimonials_created_by');
  }
};
