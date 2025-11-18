
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('testimonials', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_testimonials_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('testimonials', 'fk_testimonials_modified_by');
  }
};
