
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('hook_types', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_hook_types_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('hook_types', 'fk_hook_types_id_image');
  }
};
